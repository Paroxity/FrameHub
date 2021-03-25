import { useState } from "react";
import Masonry from "react-masonry-css";
import { useStore } from "../../hooks/useStore";
import { LabeledToggle } from "../Toggle";

function MissingIngredients() {
	const [visible, setVisible] = useState(false);
	const ingredients = useStore(state => state.ingredients);

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
					className="masonry-grid"
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
								<div id={name} key={name}>
									<img
										className="component-image"
										src={`https://raw.githubusercontent.com/WFCD/warframe-items/development/data/img/${name
											.toLowerCase()
											.split(" ")
											.join("-")}.png`}
										alt=""
										width="30px"
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
		</>
	);
}

export default MissingIngredients;
