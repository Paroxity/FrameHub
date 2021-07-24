import Masonry from "react-masonry-css";
import shallow from "zustand/shallow";
import { useStore } from "../../../hooks/useStore";
import nodes from "../../../resources/nodes.json";
import { planetsWithJunctions } from "../../../utils/nodes";
import Planet from "./Planet";

function PlanetChecklist() {
	const visiblePlanets = useStore(
		state =>
			Object.keys(nodes).filter(planet => {
				return (
					!state.hideMastered ||
					!Object.keys(nodes[planet]).every(id =>
						state[
							state.displayingSteelPath
								? "steelPath"
								: "starChart"
						].includes(id)
					) ||
					(planetsWithJunctions.includes(planet) &&
						!state[
							(state.displayingSteelPath
								? "steelPath"
								: "starChart") + "Junctions"
						].includes(planet))
				);
			}),
		shallow
	);

	return (
		<Masonry
			columnClassName="masonry-grid_column"
			className="masonry-grid"
			breakpointCols={{
				default: 5,
				1533: 4,
				1348: 3,
				1152: 2,
				640: 1
			}}>
			{visiblePlanets.map(planet => {
				return <Planet key={planet} name={planet} />;
			})}
		</Masonry>
	);
}

export default PlanetChecklist;
