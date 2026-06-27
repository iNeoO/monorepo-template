import { getLoggerStore } from "@monorepo-template/infra/libs";
import type { PrismaDb } from "@monorepo-template/prisma";

export class HealthService {
	constructor(private prisma: PrismaDb) {}

	async getPrismaHealth(): Promise<"OK" | "NOT OK"> {
		try {
			await this.prisma.$queryRaw`SELECT 1`;
			return "OK";
		} catch (err) {
			const logger = getLoggerStore();
			logger.error({ err });
			return "NOT OK";
		}
	}

	async getHealth() {
		const prisma = await this.getPrismaHealth();

		return {
			prisma,
		};
	}
}
