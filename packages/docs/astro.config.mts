import { resolve } from "node:path";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const isBuild = process.argv.includes("build");

export default defineConfig({
	site: "https://koolcodez.com",
	base: "/projects/swipe-bar",
	output: "server",
	adapter: cloudflare(),
	integrations: [react(), sitemap()],
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				...(isBuild && { "react-dom/server": "react-dom/server.edge" }),
				"@luciodale/swipe-bar": resolve("../library/src"),
			},
		},
	},
});
