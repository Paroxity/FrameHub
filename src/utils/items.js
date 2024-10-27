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
	"Hook",
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
	"Wings",
	"Casing",
	"Engine",
	"Capsule",
	"Weapon Pod"
];
export const foundersItems = ["Excalibur Prime", "Skana Prime", "Lato Prime"];

export const relicTiers = ["Lith", "Meso", "Neo", "Axi", "Requiem"];
export const relicRarity = ["Common", "Uncommon", "Rare"];

export const itemShape = {
	maxLvl: PropTypes.number,
	mr: PropTypes.number,
	wiki: PropTypes.string,
	vaulted: PropTypes.bool,
	components: PropTypes.objectOf(
		PropTypes.shape({
			generic: PropTypes.bool,
			hash: PropTypes.string,
			count: PropTypes.number
		})
	),
	relics: PropTypes.objectOf(
		PropTypes.objectOf(
			PropTypes.shape({
				vaulted: PropTypes.bool,
				rarity: PropTypes.number.isRequired
			})
		)
	),
	buildTime: PropTypes.number,
	buildPrice: PropTypes.number
};
