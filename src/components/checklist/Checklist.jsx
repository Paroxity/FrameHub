import Masonry from "react-masonry-css";
import { useStore } from "../../hooks/useStore";
import Category from "./Category";
import { isItemFiltered } from "../../utils/item-filter";

function Checklist() {
	const visibleColumns = useStore(state =>
		Object.keys(state.items).filter(category => {
			return (
				Object.entries(state.items[category]).some(
					([itemName, item]) => !isItemFiltered(itemName, item, state)
				)
			);
		})
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
			{visibleColumns.map(category => {
				return <Category key={category} name={category} />;
			})}
		</Masonry>
	);
}

export default Checklist;

