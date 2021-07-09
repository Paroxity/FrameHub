import PropTypes from "prop-types";
import shallow from "zustand/shallow";
import { useStore } from "../../hooks/useStore";
import { foundersItems } from "../../utils/items";
import { xpFromItem } from "../../utils/mastery-rank";

const fancyCategoryNames = {
	WF: "Warframe",
	SENTINEL_WEAPON: "Sentinel Weapons",
	AW: "Archwing",
	AW_GUN: "Archwing Primary",
	AW_MELEE: "Archwing Melee",
	DOG: "Kubrow",
	CAT: "Kavat",
	MOA: "MOA",
	MECH: "Necramech",
	KDRIVE: "K-Drive",
	MISC: "Miscellaneous"
};

function CategoryItem({ name }) {
	const { categoryItems, hideFounders } = useStore(
		state => ({
			categoryItems: state.items[name],
			hideFounders: state.hideFounders
		}),
		shallow
	);
	const itemsMastered = useStore(
		state => state.itemsMastered.filter(item => categoryItems[item]),
		shallow
	);

	let masteredCount = 0;
	let masteredXP = 0;
	let totalCount = 0;
	let totalXP = 0;
	Object.entries(categoryItems).forEach(([itemName, item]) => {
		if (
			hideFounders &&
			foundersItems.includes(itemName) &&
			!itemsMastered.includes(itemName)
		)
			return;
		totalCount++;
		totalXP += xpFromItem(item, name);
		if (itemsMastered.includes(itemName)) {
			masteredCount++;
			masteredXP += xpFromItem(item, name);
		}
	});

	return (
		<div className="category-info">
			<span className="category-name">
				{fancyCategoryNames[name] ||
					name
						.split(" ")
						.map(
							word =>
								word.charAt(0).toUpperCase() +
								word.slice(1).toLowerCase()
						)
						.join(" ")}
			</span>
			<br />
			<span>
				{masteredCount}/{totalCount}
			</span>
			<br />
			<span className="category-xp">
				{masteredXP.toLocaleString()}/{totalXP.toLocaleString()} XP
			</span>
		</div>
	);
}

CategoryItem.propTypes = {
	name: PropTypes.string.isRequired
};

export default CategoryItem;
