import PropTypes from "prop-types";
import { useState } from "react";
import { useStore } from "../../hooks/useStore";
import Toggle from "../Toggle";
import CategoryInfo from "./CategoryInfo";
import CategoryItem from "./CategoryItem";

function Category({ name }) {
	const [visible, setVisible] = useState(
		localStorage.getItem("categoryShown")
			? JSON.parse(localStorage.getItem("categoryShown"))[name] ?? true
			: true
	);
	const categoryItems = useStore(state => state.items[name]);

	return (
		<div className="category">
			<CategoryInfo name={name} />
			<Toggle
				toggled={visible}
				onToggle={value => {
					const categoryShown =
						JSON.parse(localStorage.getItem("categoryShown")) || {};
					categoryShown[name] = value;
					localStorage.setItem(
						"categoryShown",
						JSON.stringify(categoryShown)
					);
					setVisible(value);
				}}
			/>
			{visible &&
				Object.entries(categoryItems).map(([itemName, item]) => {
					return (
						<CategoryItem
							key={itemName}
							name={itemName}
							item={item}
						/>
					);
				})}
		</div>
	);
}

Category.propTypes = {
	name: PropTypes.string.isRequired
};

export default Category;
