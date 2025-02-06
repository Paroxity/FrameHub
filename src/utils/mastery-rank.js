export function xpFromItem(item, category, rank) {
	let xpPerRank;
	switch (category) {
		case "WF":
		case "AW":
		case "SENTINEL":
		case "DOG":
		case "INFESTED_DOG":
		case "CAT":
		case "INFESTED_CAT":
		case "MOA":
		case "MECH":
		case "KDRIVE":
		case "HOUND":
		case "PLEXUS":
			xpPerRank = 200;
			break;
		default:
			xpPerRank = 100;
			break;
	}
	return xpPerRank * (rank ?? item.maxLvl ?? 30);
}

export function xpToMR(xp) {
	let mr = Math.floor(Math.sqrt(xp / 2500));
	if (mr >= 30) mr = 30 + Math.floor((xp - 2250000) / 147500);
	return mr;
}

export function mrToXP(mr) {
	if (mr > 30) return 2250000 + 147500 * (mr - 30);
	return 2500 * Math.pow(mr, 2);
}

export function junctionsToXP(junctions) {
	return junctions * 1000;
}

export function intrinsicsToXP(intrinsics) {
	return intrinsics * 1500;
}

export function masteryRankName(mr) {
	if (mr > 30) {
		return `Legendary ${mr - 30}`;
	} else if (mr >= 28) {
		return mr === 28 ? "Master" : `${mr === 29 ? "Middle" : "True"} Master`;
	} else if (mr === 0) {
		return "Unranked";
	} else {
		const ranks = [
			"Unranked",
			"Initiate",
			"Novice",
			"Disciple",
			"Seeker",
			"Hunter",
			"Eagle",
			"Tiger",
			"Dragon",
			"Sage"
		];
		const rank = ranks[Math.ceil(mr / 3)];
		const tier = mr % 3;
		return tier === 1 ? rank : `${tier === 0 ? "Gold" : "Silver"} ${rank}`;
	}
}

export const totalRailjackIntrinsics = 50;
export const totalDrifterIntrinsics = 40;
