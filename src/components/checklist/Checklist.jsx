import Masonry from "react-masonry-css";
import { shallow } from "zustand/shallow";
import { useStore } from "../../hooks/useStore";
import { foundersItems } from "../../utils/items";
import Category from "./Category";

function Checklist() {
	const visibleColumns = useStore(
		state =>
			Object.keys(state.items).filter(category => {
				return (
					!state.hideMastered ||
					!Object.keys(state.items[category]).every(
						item =>
							state.itemsMastered.includes(item) ||
							(state.hideFounders && foundersItems.includes(item))
					)
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
			}}
		>
			{visibleColumns.map(category => {
				return <Category key={category} name={category} />;
			})}
		</Masonry>
	);
}

export default Checklist;
