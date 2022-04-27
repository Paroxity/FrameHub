module.exports = {
	globDirectory: "./build/",
	globPatterns: ["**/*.{html,js,css,png,jpeg,svg,md}"],
	swDest: "./build/sw.js",
	clientsClaim: true,
	skipWaiting: true
};