import PropTypes from "prop-types";

export const ingredientSuffixes = ["Aegis", "Barrel", "Barrels", "Blade", "Blades", "Boot", "Carapace", "Chain", "Chassis", "Core", "Cerebrum", "Day Aspect", "Disc", "Gauntlet", "Grip", "Guard", "Handle", "Harness", "Head", "Heatsink", "Hilt", "Left Gauntlet", "Limbs", "Link", "Lower Limb", "Motor", "Neuroptics", "Night Aspect", "Ornament", "Pouch", "Receiver", "Receivers", "Right Gauntlet", "Rivet", "Stars", "Stock", "String", "Subcortex", "Systems", "Upper Limb", "Wings"];

export const foundersItems = ["Excalibur Prime", "Skana Prime", "Lato Prime"];

export function complexToSimpleList(complex) {
	let simple = [];
	Object.keys(complex).forEach(category => {
		let categoryItems = complex[category];
		Object.keys(categoryItems).forEach(itemName => {
			let item = categoryItems[itemName];
			item.name = itemName;
			item.type = category;
			simple.push(item);
		});
	});
	return simple;
}

export const itemShape = {
	"maxLvl": PropTypes.number,
	"mr": PropTypes.number,
	"wiki": PropTypes.string,
	"vaulted": PropTypes.bool,
	"components": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.number, PropTypes.shape({
		"img": PropTypes.string,
		"count": PropTypes.number
	})])),
	"buildTime": PropTypes.number,
	"buildPrice": PropTypes.number,
};