import { defineConfig } from "drizzle-kit";

const url = process.env.PG_URL;

if (!url) {
	throw new Error("Missing PG_URL");
}

export default defineConfig({
	out: "./drizzle",
	schema: "./src/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url,
	},
});
