import PropTypes from "prop-types";
import {
	factionIndexMap,
	missionIndexMap,
	nodeShape
} from "../../../utils/nodes";
import { PaginatedTooltipTitle } from "../../PaginatedTooltip";
import { getComponentImageUrl } from "../../../utils/items";

const factionsGlyphName = {
	Grineer: "/Lotus/Types/StoreItems/AvatarImages/Factions/GlyphFactionGrineer",
	Corpus: "/Lotus/Types/StoreItems/AvatarImages/Factions/GlyphFactionCorpus",
	Infested: "/Lotus/Types/StoreItems/AvatarImages/Factions/GlyphFactionInfested",
	Corrupted: "/Lotus/Types/StoreItems/AvatarImages/Factions/GlyphFactionOrokin",
	Sentient: "",
	Murmur: "/Lotus/Types/StoreItems/AvatarImages/Factions/GlyphFactionMurmur",
	Scaldra: "/Lotus/Types/StoreItems/AvatarImages/Factions/GlyphFactionScaldra",
	Techrot: "/Lotus/Types/StoreItems/AvatarImages/Factions/GlyphFactionTechrot",
	Duviri: "",
	Tenno: "",

	"Kuva Grineer": "/Lotus/Types/StoreItems/AvatarImages/Factions/GlyphFactionKuva",
	"Infested Deimos": "/Lotus/Types/StoreItems/AvatarImages/Factions/GlyphFactionDeimos",
	"Corpus Amalgam": "/Lotus/Types/StoreItems/AvatarImages/Factions/GlyphFactionAmalgam"
};

function PlanetInfoTooltip({ planet, node }) {
	const faction = factionIndexMap[node.faction];

	// Use a more specific faction term if possible, e.g. Kuva Grineer rather than Grineer
	let refinedFaction = faction;
	switch (planet) {
		case "Kuva Fortress":
			refinedFaction = "Kuva Grineer";
			break;
		case "Deimos":
			if (node.name === "Cambion Drift") {
				refinedFaction = "Infested Deimos";
			}
			break;
		case "Jupiter":
			// Exclude the Dark Sector, Corpus Ship, and Corpus Archwing nodes
			if (
				faction === "Corpus" &&
				node.name !== "Galilea" &&
				node.name !== "Adrastea"
			) {
				refinedFaction = "Corpus Amalgam";
			}
			break;
	}

	const factionGlyph = factionsGlyphName[refinedFaction];

	const [minLevel, maxLevel] = node.lvl;

	return (
		<div className="item-tooltip">
			<PaginatedTooltipTitle title="General Information" />
			<span className="mission-info">
				Level {minLevel === maxLevel ? minLevel : `${minLevel}-${maxLevel}`}{" "}
				{factionGlyph && (
					<img
						className="faction-icon"
						src={getComponentImageUrl(factionGlyph, 64)}
						alt=""
					/>
				)}
				{refinedFaction} {missionIndexMap[node.type]}
			</span>
			<span>{node.xp ?? 0} XP</span>
		</div>
	);
}

PlanetInfoTooltip.propTypes = {
	planet: PropTypes.string.isRequired,
	node: PropTypes.shape(nodeShape).isRequired
};

export default PlanetInfoTooltip;

