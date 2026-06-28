import { type Database, sql } from "@monorepo-template/drizzle";
import { getLoggerStore } from "@monorepo-template/infra/libs";

export class HealthService {
	constructor(private db: Database) {}

	async getDbHealth(): Promise<"OK" | "NOT OK"> {
		try {
			await this.db.execute(sql`SELECT 1`);
			return "OK";
		} catch (err) {
			const logger = getLoggerStore();
			logger.error({ err });
			return "NOT OK";
		}
	}

	async getHealth() {
		const db = await this.getDbHealth();
		return { db };
	}
}
