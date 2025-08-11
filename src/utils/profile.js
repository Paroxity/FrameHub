const PROXY_URL = "https://proxy.framehub.app/?url=";

export async function getGameProfile(accountId, platform) {
	let domainSuffix = "";
	switch (platform) {
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

	const url = `${PROXY_URL}https://content${domainSuffix}.warframe.com/dynamic/getProfileViewingData.php?playerId=${encodeURIComponent(
		accountId
	)}`;
	const resp = await fetch(url, { cache: "no-cache" });

	if (!resp.ok) {
		const status = resp.status;
		let message;
		switch (status) {
			case 400:
				message =
					"Invalid request. Ensure the Account ID is valid and the correct platform is selected.";
				break;
			case 403:
				message = "We're experiencing issues getting profile data. Try again later.";
				break;
			case 409:
				message =
					"Account not found, check your account ID and platform";
				break;
			default:
				if (status >= 500) {
					message = "Internal server error. Please try again later.";
				} else {
					message = `Request failed (${status}).`;
				}
				break;
		}
		const error = new Error(message);
		error.status = status;
		throw error;
	}

	const json = await resp.json();
	if (!json?.Results || json.Results.length === 0) {
		const error = new Error(
			"Account not found, check your account ID and platform"
		);
		error.status = 409;
		throw error;
	}
	return json;
}
