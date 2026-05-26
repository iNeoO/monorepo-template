import { env } from "@monorepo-template/infra/configs";

import { defineConfig } from "drizzle-kit";
export default defineConfig({
	out: "./drizzle",
	schema: "./src/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: env.PG_DRIZZLE_URL,
	},
});
