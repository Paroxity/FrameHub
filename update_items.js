const overwriteItems = require("./update_items_overwrite");

const Axios = require("axios");
const lzma = require("lzma");
const fs = require("fs");
const util = require("util");

const API_URL = "https://content.warframe.com/";
const WIKI_URL = "https://warframe.fandom.com/wiki/";
const VAULTED_DATA_URL =
	"https://oggtechnologies.com/api/ducatsorplat/v2/MainItemData.json";

const requiredEndpoints = [
	"Warframes",
	"Weapons",
	"Sentinels",
	"Recipes",
	"Resources",
	"MiscItems"
];

(async () => {
	let startTime = Date.now();

	let data = (
		await Axios.get(`${API_URL}PublicExport/index_en.txt.lzma`, {
			responseType: "arraybuffer"
		})
	).data;
	let endpoints = lzma.decompress(data).split("\n");

	let oldItems = fs.existsSync("items.json")
		? JSON.parse(fs.readFileSync("items.json", "utf8"))
		: (
			await Axios.get(
				"https://firebasestorage.googleapis.com/v0/b/framehub-f9cfb.appspot.com/o/items.json?alt=media"
			)
		).data;
	let newItems = {
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
		CAT: {},
		MOA: {},
		KDRIVE: {},
		MECH: {},
		MISC: {}
	};

	let itemNames = {};
	let recipes = {};

	function processIngredients(item, category, recipe, count = 1) {
		return Object.entries(
			recipe.ingredients.reduce((ingredients, ingredient) => {
				let ingredientRawName = ingredient.ItemType;
				let ingredientName = itemNames[ingredientRawName];
				if (!ingredients[ingredientName])
					ingredients[ingredientName] = {
						count: 0
					};
				let ingredientData = ingredients[ingredientName];
				ingredientData.count += ingredient.ItemCount * count;

				if (
					ingredientRawName.includes("WeaponParts") ||
					ingredientRawName.includes("WarframeRecipes")
				)
					ingredients[ingredientName].generic = true;

				if (recipes[ingredientRawName]?.ingredients.length > 0) {
					if (
						!ingredientRawName.includes("Items") &&
						(!ingredientRawName.includes("Gameplay") ||
							ingredientRawName.includes("Mechs"))
					) {
						ingredientData.components = processIngredients(
							item,
							category,
							recipes[ingredientRawName],
							ingredients[ingredientName].count
						);
					}
				}

				return ingredients;
			}, {})
		).reduce((ingredients, [ingredientName, ingredient]) => {
			ingredients[ingredientName] =
				Object.keys(ingredient).length <= 1
					? ingredient.count
					: ingredient;
			return ingredients;
		}, {});
	}

	let vaulted = (await Axios.get(VAULTED_DATA_URL)).data.data
		.filter(primeItem => primeItem.Vaulted)
		.map(primeItem => primeItem.Name);

	await Promise.all(
		endpoints
			.filter(endpoint =>
				requiredEndpoints.includes(filterEndpointName(endpoint))
			)
			.map(endpoint => {
				return (async () => {
					let baseCategory = filterEndpointName(endpoint);

					let data = (
						await Axios.get(
							`${API_URL}PublicExport/Manifest/${endpoint}`
						)
					).data;
					if (typeof data !== "object")
						data = JSON.parse(data.replace(/\\r|\r?\n/g, ""));
					data = data[`Export${baseCategory}`];

					Object.values(data).forEach(baseItem => {
						if (baseCategory === "Recipes") {
							let invalidBPs = [
								"/Lotus/Types/Recipes/Weapons/CorpusHandcannonBlueprint",
								"/Lotus/Types/Recipes/Weapons/GrineerCombatKnifeBlueprint"
							];
							if (invalidBPs.includes(baseItem.uniqueName))
								return;
							if (!recipes[baseItem.resultType])
								recipes[baseItem.resultType] = baseItem;
							return;
						}

						let uniqueName = baseItem.uniqueName;

						baseItem.name = baseItem.name
							.replace("<ARCHWING> ", "")
							.toLowerCase()
							.split(" ")
							.map(
								word =>
									word.charAt(0).toUpperCase() + word.slice(1)
							)
							.join(" ")
							.split("-")
							.map(
								word =>
									word.charAt(0).toUpperCase() + word.slice(1)
							)
							.join("-");
						if (baseItem.name.startsWith("Mk1-"))
							baseItem.name =
								baseItem.name.slice(0, 4) +
								baseItem.name.charAt(4).toUpperCase() +
								baseItem.name.slice(5);
						itemNames[uniqueName] = baseItem.name;

						if (
							filterEndpointName(endpoint) === "Resources" ||
							filterEndpointName(endpoint) === "MiscItems"
						)
							return;

						let type;
						switch (baseItem.productCategory) {
							case "Pistols":
								if (uniqueName.includes("ModularMelee")) {
									if (
										uniqueName.includes("Tip") &&
										!uniqueName.includes("PvPVariant")
									)
										type = "ZAW";
									break;
								}
								if (
									uniqueName.includes("ModularPrimary") ||
									uniqueName.includes("ModularSecondary") ||
									uniqueName.includes("InfKitGun")
								) {
									if (uniqueName.includes("Barrel"))
										type = "KITGUN";
									break;
								}
								if (uniqueName.includes("OperatorAmplifiers")) {
									if (uniqueName.includes("Barrel"))
										type = "AMP";
									break;
								}
								if (uniqueName.includes("Hoverboard")) {
									if (uniqueName.includes("Deck"))
										type = "KDRIVE";
									break;
								}
								if (uniqueName.includes("MoaPets")) {
									if (uniqueName.includes("MoaPetHead"))
										type = "MOA";
									break;
								}
								if (baseItem.slot === 0) type = "SECONDARY";
								break;
							case "KubrowPets":
								type = uniqueName.includes("Catbrow")
									? "CAT"
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
									SentinelWeapons: "SENTINEL_WEAPON"
								}[baseItem.productCategory];
						}

						if (type) {
							if (!newItems[type]) newItems[type] = {};

							let newItem = { uniqueName: baseItem.uniqueName };
							newItems[type][baseItem.name] = newItem;

							if (type === "MECH") newItem.maxLvl = 40; //TODO: Remove if mobile endpoint sets maxLevelCap to 40
							if (baseItem.maxLevelCap)
								newItem.maxLvl = baseItem.maxLevelCap;
							if (baseItem.masteryReq)
								newItem.mr = baseItem.masteryReq;
							if (baseItem.name.includes("Mk1-"))
								newItem.wiki =
									WIKI_URL +
									baseItem.name.replace("Mk1-", "MK1-");
							if (vaulted.includes(baseItem.name))
								newItem.vaulted = true;
						}
					});
				})();
			})
	);
	newItems = overwriteItems(newItems);

	let additions = [];
	let deletions = [];
	let changes = [];
	Object.keys(oldItems).forEach(category => {
		Object.keys(oldItems[category]).forEach(key => {
			if (!newItems[category][key]) {
				deletions.push(`Removed item \`${key}\``);
			}
		});
	});
	Object.keys(newItems).forEach(category => {
		let ordered = {};
		Object.keys(newItems[category])
			.sort()
			.forEach(item => {
				let finalItem = newItems[category][item];
				if (recipes[finalItem.uniqueName]) {
					let recipe = recipes[finalItem.uniqueName];
					if (recipe.ingredients?.length > 0)
						finalItem.components = processIngredients(
							item,
							category,
							recipe
						);
					if (recipe.buildTime)
						finalItem.buildTime = recipe.buildTime;
					if (recipe.buildPrice)
						finalItem.buildPrice = recipe.buildPrice;
				}
				delete finalItem.uniqueName;

				ordered[item] = finalItem;

				if (!oldItems[category]) {
					additions.push(
						`New item \`${item}\` added in new category with properties \`${JSON.stringify(
							finalItem
						)}\``
					);
					return;
				}
				if (!oldItems[category][item]) {
					additions.push(
						`New item \`${item}\` added with properties \`${JSON.stringify(
							finalItem
						)}\``
					);
					return;
				}
				Object.keys(finalItem).forEach(key => {
					let oldValue = oldItems[category][item][key];
					let newValue = finalItem[key];
					if (oldValue !== undefined) {
						if (!util.isDeepStrictEqual(oldValue, newValue)) {
							changes.push(
								`Property \`${key}\` changed in item \`${item}\` (\`${JSON.stringify(
									oldValue
								)}\` -> \`${JSON.stringify(newValue)}\`)`
							);
						}
					} else {
						changes.push(
							`New property \`${key}\` added with value \`${JSON.stringify(
								newValue
							)}\` in item \`${item}\``
						);
					}
				});
			});
		newItems[category] = ordered;
	});

	let differences = [...additions, ...deletions, ...changes];
	if (differences.length > 0) {
		if (process.env.DISCORD_WEBHOOK && process.env.DISCORD_ADMIN_IDS) {
			if (deletions.length > 1) {
				Axios.post(process.env.DISCORD_WEBHOOK, {
					content: `${process.env.DISCORD_ADMIN_IDS.split(",")
						.map(id => `<@${id}>`)
						.join(
							" "
						)} More than 1 item deletion detected. Review and deploy items.json manually.`
				});
			} else if (additions.length > 25) {
				Axios.post(process.env.DISCORD_WEBHOOK, {
					content: `${process.env.DISCORD_ADMIN_IDS.split(",")
						.map(id => `<@${id}>`)
						.join(
							" "
						)} More than 25 item additions detected. Review and deploy items.json manually.`
				});
			} else {
				let requests = [];
				let baseMessage = `${process.env.DISCORD_ADMIN_IDS.split(",")
					.map(id => `<@${id}>`)
					.join(" ")} items.json updated! Changes:`;
				differences.forEach(difference => {
					let newMessage = `${baseMessage}\n- ${difference}`;
					if (newMessage.length <= 2000) {
						baseMessage = newMessage;
					} else {
						requests.push({ content: baseMessage });
						baseMessage = difference;
					}
				});
				requests.push({ content: baseMessage });

				for (let request of requests)
					await Axios.post(process.env.DISCORD_WEBHOOK, request);
			}
		}

		fs.writeFileSync("items.json", JSON.stringify(newItems));
		console.log(
			`Updated items.json in ${
				(Date.now() - startTime) / 1000
			} seconds with size of ${(
				fs.statSync("items.json").size / 1024
			).toFixed(3)}KB`
		);
		console.log("\nChanges:\n");
		console.log(differences.map(change => `- ${change}`).join("\n"));
		process.stdout.write(
			`::set-output name=updated::${
				deletions.length <= 1 && additions.length <= 25
			}`
		);
		return;
	}
	console.log("No differences detected");
	process.stdout.write("::set-output name=updated::false");
})();

function filterEndpointName(endpoint) {
	return endpoint
		.replace("Export", "")
		.replace(/_[a-z]{2}\.json.*/, "")
		.replace(/\.json.*/, "")
		.trim();
}
