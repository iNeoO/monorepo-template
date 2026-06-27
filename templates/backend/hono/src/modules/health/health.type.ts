import type { ApiResponse } from "@monorepo-template/infra/types";
import type z from "zod";
import type { healthSchema } from "./health.schema.js";

type HealthResponse = z.infer<typeof healthSchema>;
export type HealTthResponseApi = ApiResponse<HealthResponse>;
