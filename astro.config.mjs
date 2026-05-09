import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
	site: "https://stoic-observer.charliewilco.workers.dev",
	output: "static",
	adapter: cloudflare({
		imageService: "compile",
	}),
	integrations: [sitemap()],
});
