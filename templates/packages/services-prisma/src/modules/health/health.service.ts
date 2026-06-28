import { getLoggerStore } from "@monorepo-template/infra/libs";
import type { PrismaDb } from "@monorepo-template/prisma";

export class HealthService {
	constructor(private db: PrismaDb) {}

	async getDbHealth(): Promise<"OK" | "NOT OK"> {
		try {
			await this.db.$queryRaw`SELECT 1`;
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
