import { type DrizzleDb, drizzleDb } from "@monorepo-template/drizzle";
import { type PrismaDb, prisma } from "@monorepo-template/prisma";

export type AppServices = {
	prisma: PrismaDb;
	drizzle: DrizzleDb;
};

export const createServices = (): AppServices => {
	return {
		drizzle: drizzleDb,
		prisma,
	};
};

export const services = createServices();
