import { z } from "zod";

const envSchema = z.object({
	PG_PRISMA_DB: z.string(),
	PG_PRISMA_USER: z.string(),
	PG_PRISMA_PASSWORD: z.string(),
	PG_PRISMA_URL: z.string(),
	PG_DRIZZLE_DB: z.string(),
	PG_DRIZZLE_USER: z.string(),
	PG_DRIZZLE_PASSWORD: z.string(),
	PG_DRIZZLE_URL: z.string(),
});

export const env = envSchema.parse(process.env);
