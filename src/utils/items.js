import produce from "immer";
import PropTypes from "prop-types";

export const ingredientSuffixes = [
	"Aegis",
	"Barrel",
	"Barrels",
	"Blade",
	"Blades",
	"Boot",
	"Carapace",
	"Chain",
	"Chassis",
	"Core",
	"Cerebrum",
	"Day Aspect",
	"Disc",
	"Gauntlet",
	"Grip",
	"Guard",
	"Handle",
	"Harness",
	"Head",
	"Heatsink",
	"Hilt",
	"Left Gauntlet",
	"Limbs",
	"Link",
	"Lower Limb",
	"Motor",
	"Neuroptics",
	"Night Aspect",
	"Ornament",
	"Pouch",
	"Receiver",
	"Receivers",
	"Right Gauntlet",
	"Rivet",
	"Stars",
	"Stock",
	"String",
	"Subcortex",
	"Systems",
	"Upper Limb",
	"Wings"
];
export const foundersItems = ["Excalibur Prime", "Skana Prime", "Lato Prime"];

export const itemShape = {
	maxLvl: PropTypes.number,
	mr: PropTypes.number,
	wiki: PropTypes.string,
	vaulted: PropTypes.bool,
	components: PropTypes.objectOf(
		PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.shape({
				img: PropTypes.string,
				count: PropTypes.number
			})
		])
	),
	buildTime: PropTypes.number,
	buildPrice: PropTypes.number
};

export function itemsAsArray(items) {
	return Object.entries(items).reduce(
		(finalItems, [categoryName, category]) => {
			Object.entries(category).reduce((finalItems, [itemName, item]) => {
				finalItems.push(
					produce(item, draftItem => {
						draftItem.name = itemName;
						draftItem.type = categoryName;
					})
				);
				return finalItems;
			}, finalItems);
			return finalItems;
		},
		[]
	);
}
