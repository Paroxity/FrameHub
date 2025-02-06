const PROXY_URL = "https://proxy.framehub.app/?url=";

export async function getGameProfile(accountId, platform) {
	let domainSuffix = "";
	switch(platform) {
		case "psn":
			domainSuffix = "-ps4";
			break;
		case "xbox":
			domainSuffix = "-xb1";
			break;
		case "switch":
			domainSuffix = "-swi";
			break;
		case "mobile":
			domainSuffix = "-mob";
			break;
		default:
			break;
	}

	return (await fetch(`${PROXY_URL}https://content${domainSuffix}.warframe.com/dynamic/getProfileViewingData.php?playerId=${accountId}`, { cache: "no-cache" })).json();
}
