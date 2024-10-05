import { produce } from "immer";
import PropTypes from "prop-types";
import nodes from "../resources/nodes.json";

export const flattenedNodes = Object.entries(nodes).reduce(
	(flattenedNodes, [planet, planetNodes]) => {
		Object.entries(planetNodes).reduce((flattenedNodes, [id, node]) => {
			flattenedNodes[id] = produce(node, draftNode => {
				draftNode.planet = planet;
			});
			return flattenedNodes;
		}, flattenedNodes);
		return flattenedNodes;
	},
	{}
);

export const planetsWithJunctions = [
	"Venus",
	"Mercury",
	"Mars",
	"Phobos",
	"Ceres",
	"Jupiter",
	"Europa",
	"Saturn",
	"Uranus",
	"Neptune",
	"Pluto",
	"Eris",
	"Sedna"
];

export const missionIndexMap = [
	"Assasination",
	"Exterminate",
	"Survival",
	"Rescue",
	"Sabotage",
	"Capture",
	undefined,
	"Spy",
	"Defense",
	"Mobile Defense",
	undefined,
	undefined,
	undefined,
	"Interception",
	"Hijack",
	"Hive",
	undefined,
	"Excavation",
	undefined,
	undefined,
	undefined,
	"Infested Salvage",
	"Arena",
	undefined,
	"Pursuit (Archwing)",
	"Rush (Archwing)",
	"Assault",
	"Defection",
	"Free Roam",
	undefined,
	undefined,
	undefined,
	undefined,
	"Disruption",
	"Void Flood",
	"Void Cascade",
	"Void Armageddon",
	undefined,
	"Alchemy",
	undefined,
	undefined,
	"Shrine Defense"
];

export const factionIndexMap = [
	"Grineer",
	"Corpus",
	"Infested",
	"Corrupted",
	undefined,
	"Sentient",
	undefined,
	"Murmur"
];

export const nodeShape = {
	name: PropTypes.string.isRequired,
	type: PropTypes.number.isRequired,
	faction: PropTypes.number.isRequired,
	lvl: PropTypes.arrayOf(PropTypes.number).isRequired,
	xp: PropTypes.number
};
