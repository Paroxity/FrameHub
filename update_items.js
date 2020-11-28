const Axios = require('axios');
const fs = require('fs');

let endpoints = ["Warframes", "Primary", "Secondary", "Melee", "Sentinels", "SentinelWeapons", "Archwing", "Arch-Gun", "Arch-Melee", "Pets", "Misc"];
let itemBlacklist = ["Prisma Machete"];

(async () => {
    let items = {"WF": {}, "PRIMARY": {}, "SECONDARY": {}, "KITGUN": {}, "MELEE": {}, "ZAW": {}, "SENTINEL": {}, "SENTINEL_WEAPON": {}, "AMP": {}, "AW": {}, "AW_GUN": {}, "AW_MELEE": {}, "DOG": {}, "CAT": {}, "MOA": {}, "KDRIVE": {}, "MECH": {}};
    for (let endpoint of endpoints) {
        try {
            let data = (await Axios.get("https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/" + endpoint + ".json")).data;
            data.forEach(entry => {
                if (itemBlacklist.includes(entry.name)) return;

                let type;

                switch (entry.productCategory) {
                    case "Pistols":
                        switch (entry.type) {
                            case "Kitgun Component":
                                if (entry.uniqueName.includes("Barrel")) type = "KITGUN";
                                break;
                            case "Melee":
                                if (entry.uniqueName.includes("Tip")) type = "ZAW";
                                break;
                            case "Amp":
                                if (entry.uniqueName.includes("Barrel")) type = "AMP";
                                break;
                            case "K-Drive Component":
                                if (entry.uniqueName.includes("Deck")) type = "KDRIVE";
                                break;
                            case "Pets":
                                if (entry.uniqueName.startsWith("/Lotus/Types/Friendly/Pets/MoaPets/MoaPetParts/MoaPetHead")) type = "MOA";
                                break;
                            default:
                                if (endpoint === "Secondary") type = "SECONDARY";
                                else if (endpoint === "Misc" && entry.type === "Pistol" && entry.uniqueName.includes("Barrel")) type = "KITGUN";
                                break;
                        }
                        break;
                    case "KubrowPets":
                        type = entry.uniqueName.includes("Catbrow") ? "CAT" : "DOG";
                        break;
                    default:
                        type = { "SpaceMelee": "AW_MELEE", "SpaceGuns": "AW_GUN", "SpaceSuits": "AW", "Suits": "WF", "MechSuits": "MECH", "LongGuns": "PRIMARY", "Melee": "MELEE", "Sentinels": "SENTINEL", "SentinelWeapons": "SENTINEL_WEAPON" }[entry.productCategory];
                        break;
                }
                if (type) {
                    if (!items[type]) items[type] = {};
                    if (!items[type][entry.name]) {
                        items[type][entry.name] = {}
                        if (entry.maxLevelCap) items[type][entry.name].maxLvl = entry.maxLevelCap;
                        if (entry.masteryReq) items[type][entry.name].minMR = entry.masteryReq;
                        if (entry.wikiaUrl && entry.wikiaUrl !== "http://warframe.fandom.com/wiki/" + entry.name.split(" ").join("_")) items[type][entry.name].wiki = entry.wikiaUrl;
                        if (entry.components) {
                            let components = {};
                            entry.components.filter(component => {
                                return component.name !== "Blueprint";
                            }).forEach(component => {
                                components[component.name] = {};
                                if (component.itemCount !== 1) components[component.name]["count"] = component.itemCount;
                                if (component.name.toLowerCase().split(" ").join("-") + ".png" !== component.imageName) components[component.name]["img"] = component.imageName.slice(0, -4);
                            });
                            if (Object.keys(components).length > 0) items[type][entry.name].components = components;
                        }
                        if (entry.buildTime) items[type][entry.name].buildTime = entry.buildTime;
                        if (entry.buildPrice) items[type][entry.name].buildPrice = entry.buildPrice;
                        if (entry.vaulted) items[type][entry.name].vaulted = entry.vaulted;
                    }
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
    items["AMP"]["Mote Prism"] = {};
    items["CAT"]["Venari"] = {};

    //TODO: Remove hacks
    items["MECH"]["Voidrig Necramech"].maxLvl = 40;
    items["MECH"]["Bonewidow Necramech"] = {"maxLvl": 40, "components": {"Bonewidow Capsule": {}, "Bonewidow Casing": {}, "Bonewidow Engine": {}, "Bonewidow Weapon Pod": {}}, "buildTime": 259200, "buildPrice": 25000, "wiki": "http://warframe.fandom.com/wiki/Bonewidow"}
    try {
        fs.writeFileSync('items.json', JSON.stringify(items));
    } catch (err) {
        console.error(err);
    }
})();