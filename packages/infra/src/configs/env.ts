import { z } from "zod";

const envSchema = z.object({
	PG_DB: z.string(),
	PG_USER: z.string(),
	PG_PASSWORD: z.string(),
	PG_URL: z.string(),
	FRONTEND_URL: z.url(),
	OTEL_EXPORTER: z.coerce.boolean().optional().default(false),
	OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z.url().optional(),
});

export const env = envSchema.parse(process.env);
