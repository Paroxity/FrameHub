const Axios = require('axios');
const fs = require('fs');
const util = require("util");

let endpoints = ["Warframes", "Primary", "Secondary", "Melee", "Sentinels", "SentinelWeapons", "Archwing", "Arch-Gun", "Arch-Melee", "Pets", "Misc"];
let itemBlacklist = ["Prisma Machete"];

(async () => {
    let oldData = fs.existsSync("items.json") ? JSON.parse(fs.readFileSync("items.json", "utf8")) : (await Axios.get("https://firebasestorage.googleapis.com/v0/b/framehub-f9cfb.appspot.com/o/items.json?alt=media")).data;

    let items = {
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
    let startTime = Date.now();

    await Promise.all(endpoints.map(endpoint => {
        return (async () => {
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
                                if (entry.uniqueName.includes("Tip") && !entry.uniqueName.includes("PvPVariant")) type = "ZAW";
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
                        }[entry.productCategory];
                        break;
                }
                if (type) {
                    if (!items[type]) items[type] = {};
                    if (!items[type][entry.name]) {
                        items[type][entry.name] = {}
                        if (entry.maxLevelCap) items[type][entry.name].maxLvl = entry.maxLevelCap;
                        if (entry.masteryReq) items[type][entry.name].mr = entry.masteryReq;
                        if (entry.wikiaUrl && entry.wikiaUrl !== "http://warframe.fandom.com/wiki/" + entry.name.split(" ").join("_")) items[type][entry.name].wiki = entry.wikiaUrl;
                        if (entry.components) {
                            let components = {};
                            entry.components.filter(component => {
                                return component.name !== "Blueprint";
                            }).forEach(component => {
                                if (!components[component.name]) components[component.name] = {"count": 0};
                                components[component.name]["count"] += component.itemCount;
                                if (component.name.toLowerCase().split(" ").join("-") + ".png" !== component.imageName) components[component.name]["img"] = component.imageName.slice(0, -4);
                            });
                            Object.keys(components).forEach(key => {
                                if (Object.keys(components[key]).length <= 1 && components[key].count) {
                                    components[key] = components[key].count;
                                } else if (components[key].count === 1) {
                                    delete components[key].count;
                                }
                            });
                            if (Object.keys(components).length > 0) items[type][entry.name].components = components;
                        }
                        if (entry.buildTime) items[type][entry.name].buildTime = entry.buildTime;
                        if (entry.buildPrice) items[type][entry.name].buildPrice = entry.buildPrice;
                        if (entry.vaulted) items[type][entry.name].vaulted = entry.vaulted;
                    }
                }
            });
        })();
    }));

    items["AMP"]["Mote Prism"] = {
        "components": {
            "Cetus Wisp": 1,
            "Tear Azurite": 20,
            "Pyrotic Alloy": 10,
            "Fish Oil": 30
        },
        "buildTime": 600,
        "buildPrice": 1000
    };
    items["CAT"]["Venari"] = {};

    //TODO: Remove hacks
    items["MECH"]["Voidrig Necramech"].maxLvl = 40;
    items["MECH"]["Bonewidow Necramech"] = {
        "maxLvl": 40,
        "components": {
            "Bonewidow Capsule": 1,
            "Bonewidow Casing": 1,
            "Bonewidow Engine": 1,
            "Bonewidow Weapon Pod": 1
        },
        "buildTime": 259200,
        "buildPrice": 25000,
        "wiki": "http://warframe.fandom.com/wiki/Bonewidow"
    };

    Object.keys(oldData).forEach(category => {
        Object.keys(oldData[category]).forEach(key => {
            if (!items[category][key]) {
                console.log("- Removed item \"" + key + "\"");
            }
        });
    });

    Object.keys(items).forEach(category => {
        let ordered = {};
        Object.keys(items[category]).sort().forEach(item => {
            ordered[item] = items[category][item];

            if (oldData[category]) {
                if (oldData[category][item]) {
                    Object.keys(items[category][item]).forEach(key => {
                        let oldValue = oldData[category][item][key];
                        let newValue = items[category][item][key];
                        if (oldValue !== undefined) {
                            if (!util.isDeepStrictEqual(oldValue, newValue)) {
                                console.log("- Property \"" + key + "\" changed in item \"" + item + "\" (" + JSON.stringify(oldValue) + " -> " + JSON.stringify(newValue) + ")");
                            }
                        } else {
                            console.log("- New property \"" + key + "\" added with value \"" + JSON.stringify(newValue) + "\" in item \"" + item + "\"");
                        }
                    });
                } else {
                    console.log("- New item \"" + item + "\" added with properties " + JSON.stringify(items[category][item]));
                }
            } else {
                console.log("- New item \"" + item + "\" added in new category with properties " + JSON.stringify(items[category][item]));
            }
        });
        items[category] = ordered;
    });

    let encodedItems = JSON.stringify(items);
    fs.writeFileSync('items.json', encodedItems);
    console.log("Updated items.json in " + ((Date.now() - startTime) / 1000) + " seconds with size of " + (Buffer.byteLength(encodedItems, "utf8") / 1000) + "KB");
})();