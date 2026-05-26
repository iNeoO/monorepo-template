import { env } from "@monorepo-template/infra/configs";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

export { schema };

export const db = drizzle(env.PG_DRIZZLE_URL, { schema });
export type Database = typeof db;
