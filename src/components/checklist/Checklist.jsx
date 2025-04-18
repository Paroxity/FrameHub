import Masonry from "react-masonry-css";
import { useStore } from "../../hooks/useStore";
import { foundersItems, itemIsPrime } from "../../utils/items";
import Category from "./Category";

function Checklist() {
	const visibleColumns = useStore(state =>
		Object.keys(state.items).filter(category => {
			return (
				!state.hideMastered ||
				!Object.keys(state.items[category]).every(
					item =>
						state.itemsMastered.has(item) ||
						(state.hideFounders && foundersItems.includes(item)) ||
						(state.hidePrime && itemIsPrime(item))
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

