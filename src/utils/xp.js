export function baseXPByType(type) {
    switch (type) {
        case "WF":
        case "AW":
        case "SENTINEL":
        case "DOG":
        case "CAT":
        case "MOA":
        case "MECH":
        case "KDRIVE":
            return 200;
        default:
            return 100;
    }
}

export function xpToMR(xp) {
    let mr = Math.floor(Math.sqrt(xp / 2500));
    if (mr >= 30) mr = 30 + Math.floor((xp - 2250000) / 147500);
    return mr;
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

export const totalMissions = 466;
export const totalMissionXP = 29002;
export const totalJunctions = 26;
export const totalIntrinsics = 40;