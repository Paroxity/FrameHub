import Masonry from "react-masonry-css";
import { useStore } from "../../hooks/useStore";
import { foundersItems } from "../../utils/items";
import Category from "./Category";

function Checklist() {
	const { items, itemsMastered, hideMastered, hideFounders } = useStore(
		state => ({
			items: state.items,
			itemsMastered: state.itemsMastered,
			hideMastered: state.hideMastered,
			hideFounders: state.hideFounders
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
			{Object.keys(items)
				.filter(category => {
					return (
						!hideMastered ||
						!Object.keys(items[category]).every(
							item =>
								itemsMastered.includes(item) ||
								(hideFounders && foundersItems.includes(item))
						)
					);
				})
				.map(category => {
					return <Category key={category} name={category} />;
				})}
		</Masonry>
	);
}

export default Checklist;
