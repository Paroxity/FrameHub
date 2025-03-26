import fetch from "node-fetch";
import lzma from "lzma";

const CONTENT_URL = "https://content.warframe.com";
const ORIGIN_URL = process.env.PROXY_AUTH
	? "https://wf-origin-proxy.aericio.workers.dev"
	: "https://origin.warframe.com";

let endpoints;

function parseDamagedJSON(json) {
	return JSON.parse(json.replace(/\\\"/g, "'").replace(/\n|\r|\\/g, ""));
}

async function fetchEndpoints() {
	endpoints = lzma
		.decompress(
			Buffer.from(
				await (
					await fetch(`${ORIGIN_URL}/PublicExport/index_en.txt.lzma`, {
						headers: {
							Authentication: process.env.PROXY_AUTH
						}
					})
				).arrayBuffer()
			)
		)
		.split("\n");
}

export async function fetchEndpoint(endpoint) {
	if (!endpoints) {
		await fetchEndpoints();
	}

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
