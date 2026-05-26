import { env } from "@monorepo-template/infra/configs";

import { defineConfig } from "@prisma-next/postgres/config";

export default defineConfig({
	contract: "./prisma/contract.prisma",
	db: {
		connection: env.PG_PRISMA_URL,
	},
});
