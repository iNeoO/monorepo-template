import { env } from "@monorepo-template/infra/configs";
import postgres from "@prisma-next/postgres/runtime";
import type { Contract } from "../prisma/contract.js";
import contractJson from "../prisma/contract.json" with { type: "json" };

export const db = postgres<Contract>({
	contractJson,
	url: env.PG_PRISMA_URL,
});
