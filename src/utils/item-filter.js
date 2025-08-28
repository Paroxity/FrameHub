import { foundersItems, itemIsPrime } from "./items";

export function isItemFiltered(
	itemName,
	item,
	{ itemsMastered, hideMastered, hideFounders, hidePrime }
) {
	if (itemsMastered.has(itemName)) {
		return hideMastered;
	}

	return (
		(hideFounders && foundersItems.includes(itemName)) ||
		(hidePrime && itemIsPrime(itemName))
	);
}

