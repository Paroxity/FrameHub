const overwrites = {
	AMP: {
		"Mote Prism": {
			components: {
				"Cetus Wisp": 1,
				"Tear Azurite": 20,
				"Pyrotic Alloy": 10,
				"Fish Oil": 30
			},
			buildTime: 600,
			buildPrice: 1000
		}
	},
	AW_GUN: {
		"Prisma Dual Decurions": { mr: 10 }
	},
	CAT: { Venari: {} },
	MISC: { Plexus: { xp: 6000 } }
};
const blacklist = ["Prisma Machete"];

function merge(target, source) {
	let output = { ...target };
	Object.entries(source).forEach(([key, value]) => {
		if (
			value &&
			typeof value === "object" &&
			!Array.isArray(value) &&
			key in target
		)
			output[key] = merge(target[key], source[key]);
		else Object.assign(output, { [key]: value });
	});
	return output;
}

module.exports = function overwriteItems(items) {
	Object.values(items).forEach(category => {
		Object.keys(category).forEach(itemName => {
			if (blacklist.includes(itemName)) delete category[itemName];
		});
	});
	return merge(items, overwrites);
};
