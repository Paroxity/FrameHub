import classNames from "classnames";
import PropTypes from "prop-types";
import { useStore } from "../../../hooks/useStore";
import checkmark from "../../../icons/checkmark.svg";
import { SHARED } from "../../../utils/checklist-types";
import { nodeShape } from "../../../utils/nodes";
import Button from "../../Button";
import PaginatedTooltip from "../../PaginatedTooltip";
import PlanetInfoTooltip from "./PlanetInfoTooltip";

function PlanetNode({ id, node }) {
	const { type, gameSyncUsername, displayingSteelPath, masterNode, mastered, hidden } =
		useStore(state => ({
			type: state.type,
			gameSyncUsername: state.gameSyncUsername,
			displayingSteelPath: state.displayingSteelPath,
			masterNode: state.masterNode,
			mastered:
				state[
					state.displayingSteelPath ? "steelPath" : "starChart"
				].has(id),
			hidden:
				state.hideMastered &&
				state[
					state.displayingSteelPath ? "steelPath" : "starChart"
				].has(id)
		}));

	return hidden ? null : (
		<PaginatedTooltip
			content={
				<>
					<PlanetInfoTooltip node={node} />
				</>
			}>
			<div
				className={classNames("item", {
					"item-mastered": mastered
				})}>
				<Button
					className="item-name"
					onClick={() => {
						if (type !== SHARED && !gameSyncUsername) {
							masterNode(id, displayingSteelPath, !mastered);
						}
					}}>
					{node.name}
					{mastered && (
						<img src={checkmark} className="checkmark" alt="" />
					)}
				</Button>
			</div>
		</PaginatedTooltip>
	);
}

PlanetNode.propTypes = {
	id: PropTypes.string.isRequired,
	node: PropTypes.shape(nodeShape).isRequired
};

export default PlanetNode;
