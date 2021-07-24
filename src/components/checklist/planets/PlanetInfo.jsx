import PropTypes from "prop-types";
import shallow from "zustand/shallow";
import { useStore } from "../../../hooks/useStore";
import nodes from "../../../resources/nodes.json";
import BaseCategoryInfo from "../BaseCategoryInfo";

function PlanetInfo({ name }) {
	let masteredCount = 0;
	let masteredXP = 0;
	let totalCount = 0;
	let totalXP = 0;
	const itemsMastered = useStore(
		state =>
			state[state.displayingSteelPath ? "steelPath" : "starChart"].filter(
				id => nodes[name][id]
			),
		shallow
	);
	Object.entries(nodes[name]).forEach(([id, node]) => {
		totalCount++;
		totalXP += node.xp ?? 0;
		if (itemsMastered.includes(id)) {
			masteredCount++;
			masteredXP += node.xp ?? 0;
		}
	});

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
