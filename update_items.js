const Axios = require("axios");
const lzma = require("lzma");
const fs = require("fs");
const util = require("util");

const API_URL = "https://content.warframe.com/";
const WIKI_URL = "https://warframe.fandom.com/wiki/";
const VAULTED_DATA_URL = "https://oggtechnologies.com/api/ducatsorplat/v2/MainItemData.json";

const requiredEndpoints = ["Warframes", "Weapons", "Sentinels", "Recipes", "Resources"];
const itemBlacklist = ["Prisma Machete"];

(async () => {
	let data = (await Axios.get(`${API_URL}PublicExport/index_en.txt.lzma`, {responseType: "arraybuffer"})).data;
	let endpoints = lzma.decompress(data).split("\n");

	let oldItems = fs.existsSync("items.json") ? JSON.parse(fs.readFileSync("items.json", "utf8")) : (await Axios.get("https://firebasestorage.googleapis.com/v0/b/framehub-f9cfb.appspot.com/o/items.json?alt=media")).data;
	let newItems = {
		"WF": {},
		"PRIMARY": {},
		"SECONDARY": {},
		"KITGUN": {},
		"MELEE": {},
		"ZAW": {},
		"SENTINEL": {},
		"SENTINEL_WEAPON": {},
		"AMP": {},
		"AW": {},
		"AW_GUN": {},
		"AW_MELEE": {},
		"DOG": {},
		"CAT": {},
		"MOA": {},
		"KDRIVE": {},
		"MECH": {}
	};
	let recipes = {};
	let itemNames = {};

	let startTime = Date.now();

	let vaulted = [];
	(await Axios.get(VAULTED_DATA_URL)).data.data.forEach(vaultedItem => {
		if (vaultedItem.Vaulted) vaulted.push(vaultedItem.Name);
	});

	await Promise.all(endpoints.filter(endpoint => requiredEndpoints.includes(filterEndpointName(endpoint))).map(endpoint => {
		return (async () => {
			let baseCategory = filterEndpointName(endpoint);

			let data = (await Axios.get(`${API_URL}PublicExport/Manifest/${endpoint}`)).data;
			if (typeof data !== "object") data = JSON.parse(data.replace(/\\r|\r?\n/g, ""));
			data = data[`Export${baseCategory}`];

			Object.values(data).forEach(baseItem => {
				if (baseCategory === "Recipes") {
					let invalidBPs = [
						"/Lotus/Types/Recipes/Weapons/CorpusHandcannonBlueprint",
						"/Lotus/Types/Recipes/Weapons/GrineerCombatKnifeBlueprint"
					];
					if (invalidBPs.includes(baseItem.uniqueName)) return;
					if (!recipes[baseItem.resultType]) recipes[baseItem.resultType] = baseItem;
					return;
				}

				let uniqueName = baseItem.uniqueName;

				baseItem.name = baseItem.name.replace("<ARCHWING> ", "").toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ").split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join("-");
				if (baseItem.name.startsWith("Mk1-")) baseItem.name = baseItem.name.slice(0, 4) + baseItem.name.charAt(4).toUpperCase() + baseItem.name.slice(5);
				itemNames[uniqueName] = baseItem.name;

				if (filterEndpointName(endpoint) === "Resources") return;

				let type;
				switch (baseItem.productCategory) {
					case "Pistols":
						if (uniqueName.includes("ModularMelee")) {
							if (uniqueName.includes("Tip") && !uniqueName.includes("PvPVariant")) type = "ZAW";
							break;
						}
						if (uniqueName.includes("ModularPrimary") || uniqueName.includes("ModularSecondary") || uniqueName.includes("InfKitGun")) {
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
						if (baseItem.slot === 0) type = "SECONDARY";
						break;
					case "KubrowPets":
						type = uniqueName.includes("Catbrow") ? "CAT" : "DOG";
						break;
					default:
						type = {
							"SpaceMelee": "AW_MELEE",
							"SpaceGuns": "AW_GUN",
							"SpaceSuits": "AW",
							"Suits": "WF",
							"MechSuits": "MECH",
							"LongGuns": "PRIMARY",
							"Melee": "MELEE",
							"Sentinels": "SENTINEL",
							"SentinelWeapons": "SENTINEL_WEAPON"
						}[baseItem.productCategory];
				}

				if (type && !itemBlacklist.includes(baseItem.name)) {
					if (!newItems[type]) newItems[type] = {};
					if (!newItems[type][baseItem.name]) newItems[type][baseItem.name] = {};

					let newItem = {"uniqueName": baseItem.uniqueName};
					newItems[type][baseItem.name] = newItem;

					if (baseItem.maxLevelCap) newItem.maxLvl = baseItem.maxLevelCap;
					if (baseItem.masteryReq) newItem.mr = baseItem.masteryReq;
					if (baseItem.name.includes("Mk1-")) newItem.wiki = WIKI_URL + baseItem.name.replace("Mk1-", "MK1-");
					if (vaulted.includes(baseItem.name)) newItem.vaulted = true;
				}
			});
		})();
	}));

	newItems["AMP"]["Mote Prism"] = {
		"components": {
			"Cetus Wisp": 1,
			"Tear Azurite": 20,
			"Pyrotic Alloy": 10,
			"Fish Oil": 30
		},
		"buildTime": 600,
		"buildPrice": 1000
	};
	newItems["CAT"]["Venari"] = {};

	//TODO: Remove this
	if (!newItems["AW_GUN"]["Prisma Dual Decurions"]) newItems["AW_GUN"]["Prisma Dual Decurions"] = {"mr": 1};

	//TODO: Remove hacks
	newItems["MECH"]["Voidrig Necramech"].maxLvl = 40;
	newItems["MECH"]["Bonewidow Necramech"] = {
		...newItems["MECH"]["Bonewidow"],
		"maxLvl": 40,
		"wiki": WIKI_URL + "Bonewidow"
	};
	delete newItems["MECH"]["Bonewidow"];

	let differences = [];
	Object.keys(oldItems).forEach(category => {
		Object.keys(oldItems[category]).forEach(key => {
			if (!newItems[category][key]) {
				differences.push(`Removed item \`${key}\``);
			}
		});
	});
	Object.keys(newItems).forEach(category => {
		let ordered = {};
		Object.keys(newItems[category]).sort().forEach(item => {
			let finalItem = newItems[category][item];
			if (recipes[finalItem.uniqueName]) {
				let recipe = recipes[finalItem.uniqueName];
				if (recipe.ingredients) {
					let ingredients = {};
					recipe.ingredients.forEach(ingredient => {
						let originalIngredientName = itemNames[ingredient.ItemType];
						let ingredientName = ingredient.ItemType.includes("/Recipes/") ? originalIngredientName.replace(item + " ", "") : originalIngredientName;
						if (!ingredients[ingredientName]) ingredients[ingredientName] = {"count": 0};

						ingredients[ingredientName].count += ingredient.ItemCount;
						if (originalIngredientName !== ingredientName) {
							if (category.startsWith("AW")) ingredients[ingredientName].img = originalIngredientName.toLowerCase().split(" ").join("-");
							if (item.endsWith(" Prime")) ingredients[ingredientName].img = `prime-${(ingredients[ingredientName].img || ingredientName.toLowerCase().split(" ").join("-"))}`;
						}
					});
					Object.keys(ingredients).forEach(key => {
						if (Object.keys(ingredients[key]).length <= 1 && ingredients[key].count) {
							ingredients[key] = ingredients[key].count;
						} else if (ingredients[key].count === 1) {
							delete ingredients[key].count;
						}
					});
					if (Object.keys(ingredients).length > 0) finalItem.components = ingredients;
				}
				if (recipe.buildTime) finalItem.buildTime = recipe.buildTime;
				if (recipe.buildPrice) finalItem.buildPrice = recipe.buildPrice;
			}
			delete finalItem.uniqueName;

			ordered[item] = finalItem;

			if (!oldItems[category]) {
				differences.push(`New item \`${item}\` added in new category with properties \`${JSON.stringify(finalItem)}\``);
				return;
			}
			if (!oldItems[category][item]) {
				differences.push(`New item \`${item}\` added with properties \`${JSON.stringify(finalItem)}\``);
				return;
			}
			Object.keys(finalItem).forEach(key => {
				let oldValue = oldItems[category][item][key];
				let newValue = finalItem[key];
				if (oldValue !== undefined) {
					if (!util.isDeepStrictEqual(oldValue, newValue)) {
						differences.push(`Property \`${key}\` changed in item \`${item}\` (\`${JSON.stringify(oldValue)}\` -> \`${JSON.stringify(newValue)}\`)`);
					}
				} else {
					differences.push(`New property \`${key}\` added with value \`${JSON.stringify(newValue)}\` in item \`${item}\``);
				}
			});
		});
		newItems[category] = ordered;
	});

	if (differences.length > 0) {
		if (process.env.DISCORD_WEBHOOK && process.env.DISCORD_ADMIN_IDS) {
			let requests = [];
			let baseMessage = `${process.env.DISCORD_ADMIN_IDS.split(",").map(id => `< @${id} >`).join(" ")} items.json updated! Changes:`;
			differences.forEach(difference => {
				let newMessage = `${baseMessage}\n- ${difference}`;
				if (newMessage.length <= 2000) {
					baseMessage = newMessage;
				} else {
					requests.push({"content": baseMessage});
					baseMessage = difference;
				}
			});
			requests.push({"content": baseMessage});

			for (let request of requests) {
				await Axios.post(process.env.DISCORD_WEBHOOK, request);
			}
		}

		fs.writeFileSync("items.json", JSON.stringify(newItems));
		console.log(`Updated items.json in ${(Date.now() - startTime) / 1000} seconds with size of ${(fs.statSync("items.json").size / 1024).toFixed(3)}KB`);
		console.log("\nChanges:\n");
		console.log(differences.map(change => `- ${change}`).join("\n"));
		process.stdout.write("::set-output name=updated::true");
		return;
	}
	console.log("No differences detected");
	process.stdout.write("::set-output name=updated::false");
})();

function filterEndpointName(endpoint) {
	return endpoint.replace("Export", "").replace(/_[a-z]{2}\.json.*/, "").replace(/\.json.*/, "").trim();
}
