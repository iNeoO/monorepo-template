import { type PrismaClient, prisma } from "@monorepo-template/prisma";
import { PostsService, UsersService } from "@monorepo-template/services";

export type AppServices = {
	prisma: PrismaClient;
	posts: PostsService;
	users: UsersService;
};

export const createServices = (): AppServices => {
	return {
		prisma,
		posts: new PostsService(prisma),
		users: new UsersService(prisma),
	};
};

export const services = createServices();
