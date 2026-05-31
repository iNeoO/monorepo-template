import { env } from "@monorepo-template/infra/configs";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql as drizzleSql } from "drizzle-orm/sql/sql";
import * as drizzleSchema from "../drizzle/schema.js";

export { drizzleSchema, drizzleSql };

export const drizzleDb = drizzle(env.PG_URL, { schema: drizzleSchema });
export type DrizzleDb = typeof drizzleDb;
