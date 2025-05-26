const PROXY_URL = "https://wf-proxy.aericio.workers.dev";

export async function getGameProfile(accountId, platform) {
	// TODO: Support other platforms
	return (await fetch(`${PROXY_URL}/https://content.warframe.com/dynamic/getProfileViewingData.php?playerId=${accountId}`)).json();
}