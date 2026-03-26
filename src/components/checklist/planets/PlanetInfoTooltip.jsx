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
	Tenno: ""
};

function PlanetInfoTooltip({ node }) {
	const factionGlyph = factionsGlyphName[factionIndexMap[node.faction]];

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
				{factionIndexMap[node.faction]} {missionIndexMap[node.type]}
			</span>
			<span>{node.xp ?? 0} XP</span>
		</div>
	);
}

PlanetInfoTooltip.propTypes = {
	node: PropTypes.shape(nodeShape).isRequired
};

export default PlanetInfoTooltip;

