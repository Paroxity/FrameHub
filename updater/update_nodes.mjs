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
	Höllvania: {},
	"Dark Refractory": {}
};

// ExportRegions has incorrect node names for Höllvania
const hollvaniaNodeNames = {
	SolNode850: "Köbinn West",
	SolNode851: "Mischta Ramparts",
	SolNode852: "Old Konderuk",
	SolNode853: "Mausoleum East",
	SolNode854: "Rhu Manor",
	SolNode855: "Lower Vehrvod",
	SolNode856: "Victory Plaza",
	SolNode857: "Vehrvod District",
	SolNode858: "Solstice Square"
};

// ExportRegions names for The Descendia/The Perita Rebellion nodes aren't great
const darkRefactoryNodeNames = {
	SolNode250: "The Perita Rebellion: Hunhullus",
	SolNode251: "The Perita Rebellion: Dactolyst",
	SolNode252: "The Perita Rebellion: Vanguard",
	SolNode257: "The Perita Rebellion: The Guilty",
	SolNode256: "The Descendia"
};

rawNodes.forEach(rawNode => {
	let planetName = rawNode.systemName;
	let nodeName = rawNode.name;
	const nodeId = rawNode.uniqueName;

	if (planetName === "Dark Refractory, Deimos") {
		planetName = "Dark Refractory";

		// Filter out the Descendia checkpoint nodes
		if (
			rawNode.uniqueName === "SolNode253" ||
			rawNode.uniqueName === "SolNode254" ||
			rawNode.uniqueName === "SolNode255"
		) {
			return;
		}

		nodeName = darkRefactoryNodeNames[nodeId];
	}
	if (planetName === "Höllvania") {
		nodeName = hollvaniaNodeNames[nodeId];
	}

	if (!newNodes[planetName]) {
		throw new Error("Unknown Planet: " + planetName);
	}
	if (!existingNodes[planetName]?.[nodeId]) {
		console.log("New Node: " + JSON.stringify(rawNode));
	}

	newNodes[planetName][nodeId] = {
		name: nodeName,
		type: rawNode.missionIndex,
		faction: rawNode.factionIndex,
		lvl: [rawNode.minEnemyLevel, rawNode.maxEnemyLevel],
		xp: existingNodes[planetName]?.[nodeId]?.xp
	};
});

await fs.writeFile(
	"src/resources/nodes.json",
	JSON.stringify(newNodes, undefined, "\t")
);
