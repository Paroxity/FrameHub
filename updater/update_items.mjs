import FormData from "form-data";
import fs from "fs/promises";
import { colorize, diff } from "json-diff";
import lua from "lua-json";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { setOutput } from "@actions/core";
import { fetchEndpoint } from "./warframe_exports.mjs";
import { createHash } from "crypto";

const ITEM_ENDPOINTS = ["Warframes", "Weapons", "Sentinels"];
const WIKI_URL = "https://warframe.fandom.com/wiki";
const DROP_TABLE_URL = "https://www.warframe.com/droptables";

const OVERWRITES = {
	AMP: {
		"Mote Prism": {
			components: {
				"Cetus Wisp": { count: 1, hash: "0681ca5991" },
				"Tear Azurite": { count: 20, hash: "397c0a4ebc" },
				"Pyrotic Alloy": { count: 10, hash: "f0abc50ae0" },
				"Fish Oil": { count: 30, hash: "74fd9aeeac" }
			},
			buildTime: 600,
			buildPrice: 1000
		}
	},
	PRIMARY: {
		"Ax-52": {
			wiki: `${WIKI_URL}/AX-52`
		}
	},
	MELEE: {
		"Tenet Agendus": { components: undefined }
	},
	CAT: { Venari: {}, "Venari Prime": {} },
	PLEXUS: { Plexus: {} }
};
const BLACKLIST = [];

const SISTER_WEAPONS = [
	"Tenet Arca Plasmor",
	"Tenet Flux Rifle",
	"Tenet Glaxion",
	"Tenet Tetra",
	"Tenet Cycron",
	"Tenet Detron",
	"Tenet Plinx",
	"Tenet Envoy",
	"Tenet Diplos",
	"Tenet Spirex"
];
const HOLOKEY_WEAPONS = [
	"Tenet Agendus",
	"Tenet Exec",
	"Tenet Livia",
	"Tenet Grigori",
	"Tenet Ferrox"
];
const MARKET_WEAPONS = {};

class ItemUpdater {
	constructor(overwrites, blacklist) {
		this.overwrites = overwrites;
		this.blacklist = blacklist;
	}

	async run() {
		this.processedItems = {
			WF: {},
			PRIMARY: {},
			SECONDARY: {},
			KITGUN: {},
			MELEE: {},
			ZAW: {},
			SENTINEL: {},
			SENTINEL_WEAPON: {},
			AMP: {},
			AW: {},
			AW_GUN: {},
			AW_MELEE: {},
			DOG: {},
			INFESTED_DOG: {},
			CAT: {},
			INFESTED_CAT: {},
			MOA: {},
			HOUND: {},
			KDRIVE: {},
			MECH: {},
			PLEXUS: {}
		};

		await Promise.all([
			this.fetchBaroData(),
			this.fetchVaultStatus().then(() => this.fetchRelics()),
			this.fetchItems(),
			this.fetchResources(),
			this.fetchRecipes()
		]);

		this.mapItemNames(this.items, this.resources);
		this.processItems();
		this.processedItems = this.mergeObjects(
			this.processedItems,
			this.overwrites
		);
		this.orderItems();
	}

	orderItems() {
		this.processedItems = Object.entries(this.processedItems).reduce(
			(sortedCategories, [category, items]) => {
				sortedCategories[category] = Object.keys(items)
					.sort()
					.reduce((sortedItems, name) => {
						sortedItems[name] = items[name];
						return sortedItems;
					}, {});
				return sortedCategories;
			},
			{}
		);
	}

	mergeObjects(target, source) {
		const output = { ...target };
		Object.entries(source).forEach(([key, value]) => {
			if (
				value &&
				typeof value === "object" &&
				!Array.isArray(value) &&
				key in target
			)
				output[key] = this.mergeObjects(target[key], source[key]);
			else if (value === undefined) delete output[key];
			else Object.assign(output, { [key]: value });
		});
		return output;
	}

	processItems() {
		Object.values(this.items).forEach(item => {
			const type = this.categorizeItem(item);
			const name = this.processItemName(item.name);
			if (type && !this.blacklist.includes(name)) {
				const recipe = this.recipes[item.uniqueName];
				const processedItem = {
					maxLvl: type === "MECH" ? 40 : item.maxLevelCap,
					mr: item.masteryReq
				};
				if (recipe) {
					if (this.relics[recipe.uniqueName]) {
						processedItem.vaulted = Object.values(
							this.relics[recipe.uniqueName]
						).every(relic => relic.vaulted);
						processedItem.relics = {
							[`${name} Blueprint`]: this.relics[recipe.uniqueName]
						};
					}
					if (recipe.ingredients?.length > 0)
						processedItem.components = this.processRecipe(
							processedItem,
							recipe
						);
					processedItem.buildTime = recipe.buildTime;
					processedItem.buildPrice = recipe.buildPrice;
				} else if (name.startsWith("Dex "))
					processedItem.description = "Acquire from yearly anniversary alerts";
				else if (name.startsWith("Vaykor "))
					processedItem.description =
						"Purchase from Steel Meridian for 125,000 standing";
				else if (name.startsWith("Rakta "))
					processedItem.description =
						"Purchase from Red Veil for 125,000 standing";
				else if (name.startsWith("Secura "))
					processedItem.description =
						"Purchase from The Perrin Sequence for 125,000 standing";
				else if (name.startsWith("Sancti "))
					processedItem.description =
						"Purchase from New Loka for 125,000 standing";
				else if (name.startsWith("Telos "))
					processedItem.description =
						"Purchase from Arbiters of Hexis for 125,000 standing";

				if (name.startsWith("Kuva "))
					processedItem.description = "Acquire by vanquishing a Kuva Lich";
				else if (SISTER_WEAPONS.includes(name))
					processedItem.description =
						"Acquire by vanquishing a Sister of Parvos";
				else if (HOLOKEY_WEAPONS.includes(name))
					processedItem.description =
						"Purchase from Ergo Glast for 40 Corrupted Holokeys";

				if (name.startsWith("Mk1-"))
					processedItem.wiki = `${WIKI_URL}/${name.replace("Mk1-", "MK1-")}`;
				else if (type === "MOA" || type === "HOUND")
					processedItem.wiki = `${WIKI_URL}/Model#${name.substr(
						0,
						name.length - type.length - 1
					)}`;

				const baroData = this.baroData[name];
				if (baroData)
					processedItem.baro = [baroData.CreditCost, baroData.DucatCost];

				Object.entries(processedItem).forEach(([key, value]) => {
					if (!value) delete processedItem[key];
				});
				this.processedItems[type][name] = processedItem;
			}
		});
	}

	processRecipe(item, recipe, count = 1) {
		return recipe.ingredients.reduce((ingredients, ingredient) => {
			const ingredientRawName = ingredient.ItemType;
			const ingredientName = this.itemNames[ingredientRawName];
			if (!ingredients[ingredientName])
				ingredients[ingredientName] = {
					count: 0
				};
			const ingredientData = ingredients[ingredientName];
			ingredientData.count += ingredient.ItemCount * count;

			if (
				ingredientRawName.includes("WeaponParts") ||
				ingredientRawName.includes("WarframeRecipes") ||
				ingredientRawName.includes("ArchwingRecipes") ||
				ingredientRawName.includes("mechPart")
			) {
				// WFCD warframe-items has components for each archwing that are not generic but also do not include a hash
				if (ingredientRawName.includes("ArchwingRecipes")) {
					ingredientData.hash = null;
				} else {
					ingredientData.generic = true;
				}

				const relics =
					this.relics[ingredientRawName] ||
					this.relics[ingredientRawName.replace("Component", "Blueprint")];
				if (relics && item.relics) item.relics[ingredientName] = relics;
			} else if (
				// WFCD warframe-items does not include a hash for these components despite them being unique from other generic components
				ingredientRawName.includes("DamagedMechPart") ||
				ingredientRawName.includes("DamagedMechWeapon") ||
				ingredientName.startsWith("Cortege") ||
				ingredientName.startsWith("Morgha")
			) {
				ingredientData.hash = null;
			} else {
				const hash = createHash("sha256")
					.update(ingredient.ItemType)
					.digest("hex");
				ingredientData.hash = hash.slice(0, 10);
			}

			if (this.recipes[ingredientRawName]?.ingredients.length > 0) {
				if (
					!ingredientRawName.includes("MiscItems") ||
					ingredientRawName === "/Lotus/Types/Items/MiscItems/Forma"
				) {
					ingredientData.components = this.processRecipe(
						item,
						this.recipes[ingredientRawName],
						ingredients[ingredientName].count
					);
				}
			}

			return ingredients;
		}, {});
	}

	categorizeItem(item) {
		const uniqueName = item.uniqueName;
		let type;
		switch (item.productCategory) {
			case "Pistols":
				if (uniqueName.includes("ModularMelee")) {
					if (uniqueName.includes("Tip") && !uniqueName.includes("PvPVariant"))
						type = "ZAW";
					break;
				}
				if (
					uniqueName.includes("ModularPrimary") ||
					uniqueName.includes("ModularSecondary") ||
					uniqueName.includes("InfKitGun")
				) {
					if (uniqueName.includes("Barrel")) type = "KITGUN";
					break;
				}
				if (uniqueName.includes("OperatorAmplifiers")) {
					if (uniqueName.includes("Barrel")) type = "AMP";
					break;
				}
				if (uniqueName.includes("Hoverboard")) {
					if (uniqueName.includes("Deck")) type = "KDRIVE";
					break;
				}
				if (uniqueName.includes("MoaPets")) {
					if (uniqueName.includes("MoaPetHead")) type = "MOA";
					break;
				}
				if (uniqueName.includes("ZanukaPets")) {
					if (uniqueName.includes("ZanukaPetPartHead")) type = "HOUND";
					break;
				}
				if (item.slot === 0) type = "SECONDARY";
				break;
			case "KubrowPets":
				type = uniqueName.includes("InfestedCatbrow")
					? "INFESTED_CAT"
					: uniqueName.includes("Catbrow")
						? "CAT"
						: uniqueName.includes("PredatorKubrow")
							? "INFESTED_DOG"
							: "DOG";
				break;
			default:
				type = {
					SpaceMelee: "AW_MELEE",
					SpaceGuns: "AW_GUN",
					SpaceSuits: "AW",
					Suits: "WF",
					MechSuits: "MECH",
					LongGuns: "PRIMARY",
					Melee: "MELEE",
					Sentinels: "SENTINEL",
					SentinelWeapons: "SENTINEL_WEAPON",
					OperatorAmps: "AMP"
				}[item.productCategory];
		}
		return type;
	}

	mapItemNames() {
		this.itemNames = {};

		Object.values(Array.from(arguments)).forEach(items => {
			items.forEach(item => {
				if (item.uniqueName && item.name)
					this.itemNames[item.uniqueName] = this.processItemName(item.name);
			});
		});
	}

	processItemName(name) {
		return name
			.replace("<ARCHWING> ", "")
			.toLowerCase()
			.split(" ")
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ")
			.split("-")
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join("-");
	}

	async fetchRelics() {
		this.relics = {};
		(await fetchEndpoint("RelicArcane")).ExportRelicArcane.forEach(relic => {
			if (relic.relicRewards)
				relic.relicRewards.forEach(reward => {
					const processedRelic = {
						rarity:
							reward.rarity === "COMMON"
								? 0
								: reward.rarity === "UNCOMMON"
									? 1
									: 2
					};
					if (this.vaultedRelics.includes(relic.name))
						processedRelic.vaulted = true;

					const rewardName = reward.rewardName.replace("/StoreItems", "");
					if (!this.relics[rewardName]) this.relics[rewardName] = {};
					this.relics[rewardName][this.processItemName(relic.name)] =
						processedRelic;
				});
		});
	}

	async fetchRecipes() {
		this.recipes = (await fetchEndpoint("Recipes")).ExportRecipes.reduce(
			(recipes, recipe) => {
				const invalidBPs = [
					"/Lotus/Types/Recipes/Weapons/CorpusHandcannonBlueprint",
					"/Lotus/Types/Recipes/Weapons/GrineerCombatKnifeBlueprint"
				];
				if (
					!invalidBPs.includes(recipe.uniqueName) &&
					!recipes[recipe.resultType]
				)
					recipes[recipe.resultType] = recipe;
				return recipes;
			},
			{}
		);
	}

	async fetchItems() {
		const data = await Promise.all(
			ITEM_ENDPOINTS.map(async e => {
				return (await fetchEndpoint(e))[`Export${e}`];
			})
		);
		this.items = data.reduce((merged, d) => {
			return [...merged, ...d];
		}, []);
	}

	async fetchResources() {
		this.resources = (await fetchEndpoint("Resources")).ExportResources;
	}

	async fetchBaroData() {
		const luaTable = await (
			await fetch(
				"https://warframe.fandom.com/wiki/Module:Baro/data?action=raw"
			)
		).text();
		this.baroData = lua.parse(luaTable).Items;
	}

	async fetchVaultStatus() {
		const document = (await JSDOM.fromURL(DROP_TABLE_URL)).window.document;
		const relics = Array.from(document.querySelectorAll("th"))
			.filter(e => e.innerHTML.includes(" Relic (Intact)"))
			.map(e => e.innerHTML.replace(" (Intact)", ""));
		const unvaultedRelics = Array.from(document.querySelectorAll("td"))
			.map(e => e.innerHTML)
			.filter(i => i.includes(" Relic"));
		this.vaultedRelics = relics.filter(
			relic => !unvaultedRelics.includes(relic)
		);
	}
}

(async () => {
	const startTime = Date.now();

	let existingItems;
	try {
		existingItems = JSON.parse(await fs.readFile("items.json", "utf8"));
	} catch (e) {
		existingItems = await (
			await fetch(
				"https://firebasestorage.googleapis.com/v0/b/framehub-f9cfb.appspot.com/o/items.json?alt=media"
			)
		).json();
	}

	const updater = new ItemUpdater(OVERWRITES, BLACKLIST);
	await updater.run();

	const difference = diff(existingItems, updater.processedItems);
	if (difference || process.env.FORCE_UPLOAD === "true") {
		await fs.writeFile("items.json", JSON.stringify(updater.processedItems));
		console.log(colorize(difference));
		console.log(
			`File size: ${((await fs.stat("items.json")).size / 1024).toFixed(3)}KB`
		);

		if (process.env.DISCORD_WEBHOOK && process.env.DISCORD_ADMIN_IDS) {
			const form = new FormData();
			form.append(
				"content",
				process.env.DISCORD_ADMIN_IDS.split(",")
					.map(id => `<@${id}>`)
					.join(" ")
			);
			form.append("file", colorize(difference, { color: false }), "items.diff");
			form.submit(process.env.DISCORD_WEBHOOK, (err, res) => {
				if (err) {
					console.log("Discord webhook error: " + err);
					return;
				}
				console.log("Discord webhook message sent");
				res.resume();
			});
		}
	}
	console.log(`Completed in ${(Date.now() - startTime) / 1000} seconds.`);

	if (process.env.GITHUB_ACTION)
		setOutput(
			"updated",
			difference !== undefined || process.env.FORCE_UPLOAD === "true"
		);
})();
