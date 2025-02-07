import classNames from "classnames";
import PropTypes from "prop-types";
import { useStore } from "../../../hooks/useStore";
import checkmark from "../../../icons/checkmark.svg";
import { SHARED } from "../../../utils/checklist-types";
import Button from "../../Button";

function PlanetJunction({ planet }) {
	const { type, gameSyncUsername, displayingSteelPath, masterJunction, mastered, hidden } =
		useStore(state => ({
			type: state.type,
			gameSyncUsername: state.gameSyncUsername,
			displayingSteelPath: state.displayingSteelPath,
			masterJunction: state.masterJunction,
			mastered:
				state[
					(state.displayingSteelPath ? "steelPath" : "starChart") +
						"Junctions"
				].has(planet),
			hidden:
				state.hideMastered &&
				state[
					(state.displayingSteelPath ? "steelPath" : "starChart") +
						"Junctions"
				].has(planet)
		}));
	return hidden ? null : (
		<div
			className={classNames("item", {
				"item-mastered": mastered
			})}>
			<Button
				className="item-name"
				onClick={() => {
					if (type !== SHARED && !gameSyncUsername) {
						masterJunction(planet, displayingSteelPath, !mastered);
					}
				}}>
				Junction
				{mastered && (
					<img src={checkmark} className="checkmark" alt="" />
				)}
			</Button>
		</div>
	);
}

PlanetJunction.propTypes = {
	planet: PropTypes.string.isRequired
};

export default PlanetJunction;
