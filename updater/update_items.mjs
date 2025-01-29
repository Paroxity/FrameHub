import FormData from "form-data";
import fs from "fs/promises";
import { colorize, diff } from "json-diff";
import lua from "lua-json";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { setOutput } from "@actions/core";
import { fetchEndpoint } from "./warframe_exports.mjs";
import { createHash } from "crypto";

const SCHEMA_VERSION = 2;

const ITEM_ENDPOINTS = ["Warframes", "Weapons", "Sentinels"];
const WIKI_URL = "https://warframe.fandom.com/wiki";
const DROP_TABLE_URL = "https://www.warframe.com/droptables";

const ITEM_OVERWRITES = {
	AMP: {
		"Mote Prism": {}
	},
	PRIMARY: {
		"Ax-52": {
			wiki: `${WIKI_URL}/AX-52`
		}
	},
	CAT: { Venari: {}, "Venari Prime": {} },
	PLEXUS: { Plexus: {} }
};
const RECIPE_OVERWRITES = {
	"Mote Prism": {
		components: {
			"Cetus Wisp": 1,
			"Tear Azurite": 20,
			"Pyrotic Alloy": 10,
			"Fish Oil": 30
		},
		count: 1,
		time: 600,
		price: 1000
	},
	"Tenet Agendus": undefined
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
	constructor(itemOverwrites, recipeOverwrites, blacklist) {
		this.itemOverwrites = itemOverwrites;
		this.recipeOverwrites = recipeOverwrites;
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
		this.processedRecipes = {};
		this.ingredientHashes = {};

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
			this.itemOverwrites
		);
		this.processedRecipes = this.mergeObjects(
			this.processedRecipes,
			this.recipeOverwrites
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
					this.processRecipe(processedItem, name, recipe);
				}

				const description = this.describeItem(name);
				if (description) processedItem.description = description;

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

	processRecipe(parentItem, itemName, recipe) {
		if (this.processedRecipes[itemName]) return;

		const processedRecipe = {
			count: recipe.num,
			time: recipe.buildTime,
			price: recipe.buildPrice
		};
		if (recipe.ingredients?.length > 0) {
			processedRecipe.components = {};

			recipe.ingredients.forEach(ingredient => {
				const ingredientRawName = ingredient.ItemType;
				const ingredientName = this.itemNames[ingredientRawName];

				if (
					this.recipes[ingredientRawName] &&
					(!ingredientRawName.includes("MiscItems") ||
						ingredientRawName === "/Lotus/Types/Items/MiscItems/Forma")
				) {
					this.processRecipe(
						parentItem,
						ingredientName,
						this.recipes[ingredientRawName]
					);
				}

				processedRecipe.components[ingredientName] =
					(processedRecipe.components[ingredientName] ?? 0) +
					ingredient.ItemCount;
				if (!this.ingredientHashes[ingredientName])
					this.ingredientHashes[ingredientName] = this.createIngredientHash(
						ingredientName,
						ingredientRawName
					);

				const relics =
					this.relics[ingredientRawName] ||
					this.relics[ingredientRawName.replace("Component", "Blueprint")];
				if (relics && parentItem.relics)
					parentItem.relics[ingredientName] = relics;
			});
		}
		this.processedRecipes[itemName] = processedRecipe;
	}

	createIngredientHash(name, rawName) {
		if (
			rawName.includes("WeaponParts") ||
			rawName.includes("WarframeRecipes") ||
			rawName.includes("ArchwingRecipes") ||
			rawName.includes("mechPart")
		) {
			// WFCD warframe-items has components for each archwing that are not generic but also do not include a hash
			if (rawName.includes("ArchwingRecipes")) {
				return null;
			}
			return "generic";
		}
		// WFCD warframe-items does not include a hash for these components despite them being unique from other generic components
		if (
			rawName.includes("DamagedMechPart") ||
			rawName.includes("DamagedMechWeapon") ||
			name.startsWith("Cortege") ||
			name.startsWith("Morgha")
		) {
			return null;
		}
		return createHash("sha256").update(rawName).digest("hex").slice(0, 10);
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

	describeItem(itemName) {
		const prefix = itemName.split(" ")[0];
		switch (prefix) {
			case "Dex":
				return "Acquire from yearly anniversary alerts";
			case "Vaykor":
				return "Purchase from Steel Meridian for 125,000 standing";
			case "Rakta":
				return "Purchase from Red Veil for 125,000 standing";
			case "Secura":
				return "Purchase from The Perrin Sequence for 125,000 standing";
			case "Sancti":
				return "Purchase from New Loka for 125,000 standing";
			case "Telos":
				return "Purchase from Arbiters of Hexis for 125,000 standing";
			case "Kuva":
				return "Acquire by vanquishing a Kuva Lich";
			case "Tenet":
				if (SISTER_WEAPONS.includes(itemName))
					return "Acquire by vanquishing a Sister of Parvos";
				if (HOLOKEY_WEAPONS.includes(itemName))
					return "Purchase from Ergo Glast for 40 Corrupted Holokeys";
		}
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

	let existingData;
	try {
		existingData = JSON.parse(await fs.readFile("items.json", "utf8"));
	} catch (e) {
		existingData = await (
			await fetch(
				"https://firebasestorage.googleapis.com/v0/b/framehub-f9cfb.appspot.com/o/items.json?alt=media"
			)
		).json();
	}

	const updater = new ItemUpdater(
		ITEM_OVERWRITES,
		RECIPE_OVERWRITES,
		BLACKLIST
	);
	await updater.run();

	const data = {
		schema_version: SCHEMA_VERSION,
		items: updater.processedItems,
		recipes: updater.processedRecipes,
		ingredient_hashes: updater.ingredientHashes
	};
	const difference = diff(existingData, data);
	if (difference || process.env.FORCE_UPLOAD === "true") {
		await fs.writeFile("items.json", JSON.stringify(data));
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
