import produce from "immer";
import PropTypes from "prop-types";
import shallow from "zustand/shallow";
import { useStore } from "../../hooks/useStore";
import { foundersItems } from "../../utils/items";
import { xpFromItem } from "../../utils/mastery-rank";
import BaseCategoryInfo from "./BaseCategoryInfo";

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
	const partiallyMasteredItems = useStore(
		state =>
			produce(state.partiallyMasteredItems, draftState => {
				Object.keys(draftState).forEach(item => {
					if (!categoryItems[item]) delete draftState[item];
				});
			}),
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
		} else if (partiallyMasteredItems[itemName]) {
			masteredXP += xpFromItem(
				item,
				name,
				partiallyMasteredItems[itemName]
			);
		}
	});

	return (
		<BaseCategoryInfo
			name={
				fancyCategoryNames[name] ||
				name
					.split(" ")
					.map(
						word =>
							word.charAt(0).toUpperCase() +
							word.slice(1).toLowerCase()
					)
					.join(" ")
			}
			mastered={masteredCount}
			total={totalCount}
			masteredXP={masteredXP}
			totalXP={totalXP}
		/>
	);
}

CategoryItem.propTypes = {
	name: PropTypes.string.isRequired
};

export default CategoryItem;
