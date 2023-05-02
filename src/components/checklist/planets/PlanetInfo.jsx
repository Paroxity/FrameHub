import PropTypes from "prop-types";
import { shallow } from "zustand/shallow";
import { useStore } from "../../../hooks/useStore";
import nodes from "../../../resources/nodes.json";
import { junctionsToXP } from "../../../utils/mastery-rank";
import { planetsWithJunctions } from "../../../utils/nodes";
import BaseCategoryInfo from "../BaseCategoryInfo";

function PlanetInfo({ name }) {
	const hasJunction = planetsWithJunctions.includes(name);

	let masteredCount = 0;
	let masteredXP = 0;
	let totalCount = hasJunction ? 1 : 0;
	let totalXP = hasJunction ? junctionsToXP(1) : 0;

	const { nodesMastered, junctionMastered } = useStore(
		state => ({
			nodesMastered: state[
				state.displayingSteelPath ? "steelPath" : "starChart"
			].filter(id => nodes[name][id]),
			junctionMastered:
				hasJunction &&
				state[
					(state.displayingSteelPath ? "steelPath" : "starChart") +
						"Junctions"
				].includes(name)
		}),
		shallow
	);
	Object.entries(nodes[name]).forEach(([id, node]) => {
		totalCount++;
		totalXP += node.xp ?? 0;
		if (nodesMastered.includes(id)) {
			masteredCount++;
			masteredXP += node.xp ?? 0;
		}
	});
	if (junctionMastered) {
		masteredCount++;
		masteredXP += junctionsToXP(1);
	}

	return (
		<BaseCategoryInfo
			name={name}
			mastered={masteredCount}
			total={totalCount}
			masteredXP={masteredXP}
			totalXP={totalXP}
		/>
	);
}

PlanetInfo.propTypes = {
	name: PropTypes.string.isRequired
};

export default PlanetInfo;
