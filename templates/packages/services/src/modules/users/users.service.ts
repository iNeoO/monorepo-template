import { API_ERROR } from "@monorepo-template/common/constants";
import type { PrismaClient } from "@monorepo-template/prisma";
import type { CreateUserParams, UpdateUserParams } from "./users.type.js";

export class UsersService {
	constructor(private prisma: PrismaClient) {}

	async findUsers() {
		return await this.prisma.user.findMany();
	}

	async findUserById(userId: number) {
		return await this.prisma.user.findUnique({ where: { id: userId } });
	}

	async findUserByEmail(email: string) {
		return await this.prisma.user.findFirst({ where: { email } });
	}

	async createUser(payload: CreateUserParams) {
		const user = await this.findUserByEmail(payload.email);
		if (user) {
			return API_ERROR.EMAIL_ALREADY_EXISTS;
		}
		return await this.prisma.user.create({ data: payload });
	}

	async updateUser(userId: number, payload: UpdateUserParams) {
		const user = await this.findUserById(userId);
		if (!user) {
			return API_ERROR.USER_NOT_FOUND;
		}
		return await this.prisma.user.update({
			where: { id: userId },
			data: payload,
		});
	}

	async deleteUser(userId: number) {
		const user = await this.findUserById(userId);
		if (!user) {
			return API_ERROR.USER_NOT_FOUND;
		}
		return await this.prisma.user.delete({ where: { id: userId } });
	}
}
