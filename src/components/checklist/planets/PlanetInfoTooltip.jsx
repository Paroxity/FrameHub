import PropTypes from "prop-types";
import {
	factionIndexMap,
	missionIndexMap,
	nodeShape
} from "../../../utils/nodes";
import { PaginatedTooltipTitle } from "../../PaginatedTooltip";

const factionsGlyphName = {
	Grineer: "grineer-glyph-0232a16adc.png",
	Corpus: "corpus-glyph-b06a192ad6.png",
	Infested: "infestation-glyph-73b7bcff9f.png",
	Corrupted: "orokin-glyph-7450d4cdd6.png",
	Sentient: "",
	Murmur: "murmur-glyph-1f38d5ee0b.png",
	Scaldra: "scaldra-glyph-576f39c5a3.png",
	Techrot: "techrot-glyph-217caea674.png",
	Duviri: "",
	Tenno: "",

	"Kuva Grineer": "kuva-glyph-45551657e2.png",
	"Infested Deimos": "infested-deimos-glyph-3479ee333b.png",
	"Corpus Amalgam": "amalgam-glyph-6b4af31e25.png"
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

	return (
		<div className="item-tooltip">
			<PaginatedTooltipTitle title="General Information" />
			<span className="mission-info">
				Level {node.lvl.join("-")}{" "}
				{factionGlyph && (
					<img
						className="faction-icon"
						src={`https://cdn.warframestat.us/img/${factionGlyph}`}
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

