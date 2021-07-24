import PropTypes from "prop-types";
import {
	factionIndexMap,
	missionIndexMap,
	nodeShape
} from "../../../utils/nodes";
import { PaginatedTooltipTitle } from "../../PaginatedTooltip";

function PlanetInfoTooltip({ node }) {
	return (
		<div className="item-tooltip">
			<PaginatedTooltipTitle title="General Information" />
			<span className="mission-info">
				Level {node.lvl.join("-")}{" "}
				<img
					className="faction-icon"
					src={`https://raw.githubusercontent.com/WFCD/warframe-hub/dev/src/assets/img/factions/${factionIndexMap[
						node.faction
					].toLowerCase()}.svg`}
				/>
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
