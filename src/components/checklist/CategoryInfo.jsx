import PropTypes from "prop-types";
import { useStore } from "../../hooks/useStore";
import { xpFromItem } from "../../utils/mastery-rank";
import BaseCategoryInfo from "./BaseCategoryInfo";
import { isItemFiltered } from "../../utils/item-filter";

const fancyCategoryNames = {
	WF: "Warframe",
	SENTINEL_WEAPON: "Sentinel Weapons",
	AW: "Archwing",
	AW_GUN: "Archwing Primary",
	AW_MELEE: "Archwing Melee",
	DOG: "Kubrow",
	INFESTED_DOG: "Predasite",
	CAT: "Kavat",
	INFESTED_CAT: "Vulpaphyla",
	MOA: "MOA",
	MECH: "Necramech",
	KDRIVE: "K-Drive"
};

function CategoryItem({ name }) {
	const { masteredCount, masteredXP, totalCount, totalXP } = useStore(
		state => {
			const { itemsMastered, partiallyMasteredItems } = state;
			const categoryItems = state.items[name];

			let masteredCount = 0;
			let masteredXP = 0;
			// There is an extra "Amp" item in the amp category in the
			// in-game profile.
			let totalCount = name === "AMP" ? 1 : 0;
			let totalXP = 0;

			Object.entries(categoryItems).forEach(([itemName, item]) => {
				if (
					isItemFiltered(itemName, item, {
						...state,
						hideMastered: false
					})
				)
					return;

				totalCount++;
				totalXP += xpFromItem(item, name);
				if (itemsMastered.has(itemName)) {
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

			// Assume the ghost "Amp" item is mastered if there are any mastered amps.
			if (name === "AMP" && masteredCount > 0) masteredCount++;

			return { masteredCount, masteredXP, totalCount, totalXP };
		}
	);

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

