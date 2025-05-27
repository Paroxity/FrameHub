import PropTypes from "prop-types";

export const SCHEMA_VERSION = 3;

export const foundersItems = ["Excalibur Prime", "Skana Prime", "Lato Prime"];

export function itemIsPrime(name) {
	return (
		(name.endsWith(" Prime") || name.startsWith("Prime ")) &&
		!foundersItems.includes(name)
	);
}

export function getComponentImageUrl(id) {
	return (
		"https://cdn.jsdelivr.net/gh/Aericio/warframe-exports-data/image/32x32/" +
		id.slice(1).replaceAll("/", ".") +
		".png"
	);
}

export const relicTiers = ["Lith", "Meso", "Neo", "Axi", "Requiem"];
export const relicRarity = ["Common", "Uncommon", "Rare"];

export const itemShape = {
	maxLvl: PropTypes.number,
	mr: PropTypes.number,
	wiki: PropTypes.string,
	vaulted: PropTypes.bool,
	relics: PropTypes.objectOf(
		PropTypes.objectOf(
			PropTypes.shape({
				vaulted: PropTypes.bool,
				rarity: PropTypes.number.isRequired
			})
		)
	),
	baro: PropTypes.arrayOf(PropTypes.number),
	description: PropTypes.string
};

