import { type DrizzleDb, drizzleSql } from "@monorepo-template/drizzle";
import { getLoggerStore, getTraceStore } from "@monorepo-template/infra/libs";
import type { PrismaDb } from "@monorepo-template/prisma";

export class HealthService {
	constructor(
		private prisma: PrismaDb,
		private drizzle: DrizzleDb,
	) {}

	async getPrismaHealth() {
		try {
			await this.prisma.$queryRaw`SELECT 1`;
			return "OK";
		} catch (err) {
			const logger = getLoggerStore();
			logger.error({ err });
			return "NOT OK";
		}
	}

	async getDrizzleHealth() {
		try {
			await this.drizzle.execute(drizzleSql`SELECT 1`);
			return "OK";
		} catch (err) {
			const logger = getLoggerStore();
			logger.error({ err });
			return "NOT OK";
		}
	}

	async getHealth() {
		const span = getTraceStore();
		span.addEvent("health.service.started");

		const result = await Promise.all([
			this.getPrismaHealth(),
			this.getDrizzleHealth(),
		]);

		span.addEvent("health.service.completed");

		return {
			prisma: result[0],
			drizzle: result[1],
		};
	}
}
