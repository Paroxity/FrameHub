import { useState } from "react";
import Masonry from "react-masonry-css";
import { useStore } from "../../hooks/useStore";
import { LabeledToggle } from "../Toggle";

function MissingIngredients() {
	const [visible, setVisible] = useState(false);
	const ingredients = useStore(state => state.ingredients);
	const formaCost = useStore(state => state.formaCost);

	return (
		<>
			<LabeledToggle
				label="Show Crafting Components"
				toggled={visible}
				onToggle={setVisible}
			/>
			{visible && (
				<Masonry
					columnClassName="masonry-grid_column"
					className="masonry-grid foundry"
					breakpointCols={{
						default: 5,
						1533: 4,
						1348: 3,
						1152: 2,
						640: 1
					}}>
					{Object.entries(ingredients)
						.sort(([nameA, countA], [nameB, countB]) =>
							countA > countB
								? -1
								: countA < countB
								? 1
								: nameA.localeCompare(nameB)
						)
						.map(([name, count]) => {
							return (
								<div key={name}>
									<img
										className="component-image"
										src={`https://cdn.warframestat.us/img/${name
											.toLowerCase()
											.split(" ")
											.join("-")}.png`}
										alt=""
										width="24px"
										onDragStart={e => e.preventDefault()}
									/>
									<span className="component-name">
										{count.toLocaleString()}x {name}
									</span>
								</div>
							);
						})}
				</Masonry>
			)}
			<p>Forma Required for Max Rank: {formaCost}</p>
		</>
	);
}

export default MissingIngredients;
