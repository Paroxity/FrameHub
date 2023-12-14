import fs from "fs/promises";
import { fetchEndpoint } from "./warframe_exports.mjs";

const existingNodes = JSON.parse(
	await fs.readFile("src/resources/nodes.json", "utf-8")
);

const rawNodes = (await fetchEndpoint("Regions")).ExportRegions;
const newNodes = {
	Earth: {},
	Venus: {},
	Mercury: {},
	Mars: {},
	Deimos: {},
	Phobos: {},
	Ceres: {},
	Jupiter: {},
	Europa: {},
	Saturn: {},
	Uranus: {},
	Neptune: {},
	Pluto: {},
	Eris: {},
	Sedna: {},
	Lua: {},
	"Kuva Fortress": {},
	Zariman: {},
	Duviri: {},
	Void: {}
};

rawNodes.forEach(rawNode => {
	if (!newNodes[rawNode.systemName]) {
		throw new Error("Unknown Planet: " + rawNode.systemName);
	}
	if (!existingNodes[rawNode.systemName]?.[rawNode.uniqueName]) {
		console.log("New Node: " + JSON.stringify(rawNode));
	}

	newNodes[rawNode.systemName][rawNode.uniqueName] = {
		name: rawNode.name,
		type: rawNode.missionIndex,
		faction: rawNode.factionIndex,
		lvl: [rawNode.minEnemyLevel, rawNode.maxEnemyLevel],
		xp: existingNodes[rawNode.systemName]?.[rawNode.uniqueName]?.xp
	};
});

//console.log(newNodes);
await fs.writeFile(
	"src/resources/nodes.json",
	JSON.stringify(newNodes, undefined, "\t")
);
