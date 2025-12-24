import fetch from "node-fetch";
import lzma from "lzma";

const CONTENT_URL = "https://content.warframe.com";
const ORIGIN_URL =
	process.env.WARFRAME_ORIGIN_PROXY ?? "https://origin.warframe.com";

let endpointsPromise;

function parseDamagedJSON(json) {
	return JSON.parse(json.replace(/\\\"/g, "'").replace(/\n|\r|\\/g, ""));
}

async function fetchEndpoints() {
	const headers = {};

	if (process.env.X_PROXY_TOKEN) {
		headers["X-Proxy-Token"] = process.env.X_PROXY_TOKEN;
	}

	const response = await fetch(`${ORIGIN_URL}/PublicExport/index_en.txt.lzma`, {
		headers
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch endpoints: ${response.status} ${response.statusText}`
		);
	}

	return lzma
		.decompress(Buffer.from(await response.arrayBuffer()))
		.split("\n");
}

export async function fetchEndpoint(endpoint) {
	if (!endpointsPromise) {
		endpointsPromise = fetchEndpoints();
	}

	const endpoints = await endpointsPromise;

	return parseDamagedJSON(
		await (
			await fetch(
				`${CONTENT_URL}/PublicExport/Manifest/${endpoints.find(e =>
					e.startsWith(`Export${endpoint}`)
				)}`
			)
		).text()
	);
}
