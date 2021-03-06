export function xpFromItem(item, category) {
	if (item.xp) return item.xp;

	switch (category) {
		case "WF":
		case "AW":
		case "SENTINEL":
		case "DOG":
		case "CAT":
		case "MOA":
		case "MECH":
		case "KDRIVE":
		case "HOUND":
			return 200 * (item.maxLvl || 30);
		default:
			return 100 * (item.maxLvl || 30);
	}
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

export function missionsToXP(missions) {
	return missions * (totalMissionXP / totalMissions);
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
		let ranks = [
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
		let rank = ranks[Math.ceil(mr / 3)];
		let tier = mr % 3;
		return tier === 1 ? rank : `${tier === 0 ? "Gold" : "Silver"} ${rank}`;
	}
}

export const totalMissions = 466;
export const totalMissionXP = 29002;
export const totalJunctions = 26;
export const totalIntrinsics = 50;
