import PropTypes from "prop-types";
import { useStore } from "../../hooks/useStore";
import CategoryInfo from "./CategoryInfo";
import CategoryItem from "./CategoryItem";

function Category({ name }) {
	const { categoryItems } = useStore(state => ({
		categoryItems: state.items[name]
	}));

	return (
		<div className="category">
			<CategoryInfo name={name} />
			{Object.entries(categoryItems).map(([itemName, item]) => {
				return <CategoryItem key={itemName} name={itemName} item={item} />;
			})}
		</div>
	);
}

Category.propTypes = {
	name: PropTypes.string.isRequired
};

export default Category;
