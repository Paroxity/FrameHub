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
	Void: {},
	"Höllvania": {}
};

// ExportRegions has incorrect node names for Höllvania
const hollvaniaNodeNames = {
	"SolNode850": "Köbinn West",
	"SolNode851": "Mischta Ramparts",
	"SolNode852": "Old Konderuk",
	"SolNode853": "Mausoleum East",
	"SolNode854": "Rhu Manor",
	"SolNode855": "Lower Vehrvod",
	"SolNode856": "Victory Plaza",
	"SolNode857": "Vehrvod District",
}

rawNodes.forEach(rawNode => {
	if (!newNodes[rawNode.systemName]) {
		throw new Error("Unknown Planet: " + rawNode.systemName);
	}
	if (!existingNodes[rawNode.systemName]?.[rawNode.uniqueName]) {
		console.log("New Node: " + JSON.stringify(rawNode));
	}

	newNodes[rawNode.systemName][rawNode.uniqueName] = {
		name: hollvaniaNodeNames[rawNode.uniqueName] ?? rawNode.name,
		type: rawNode.missionIndex,
		faction: rawNode.factionIndex,
		lvl: [rawNode.minEnemyLevel, rawNode.maxEnemyLevel],
		xp: existingNodes[rawNode.systemName]?.[rawNode.uniqueName]?.xp
	};
});

await fs.writeFile(
	"src/resources/nodes.json",
	JSON.stringify(newNodes, undefined, "\t")
);
