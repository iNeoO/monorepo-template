import { API_ERROR } from "@monorepo-template/common/constants";
import type { PrismaClient } from "@monorepo-template/prisma";
import type { CreatePostParams, UpdatePostParams } from "./posts.type.js";

export class PostsService {
	constructor(private prisma: PrismaClient) {}

	async findPosts() {
		return await this.prisma.post.findMany();
	}

	async findPostsByUser(userId: number) {
		return await this.prisma.post.findMany({ where: { authorId: userId } });
	}

	async findPostById(postId: number) {
		return await this.prisma.post.findUnique({ where: { id: postId } });
	}

	async createPost(payload: CreatePostParams) {
		return await this.prisma.post.create({ data: payload });
	}

	async updatePost(postId: number, payload: UpdatePostParams) {
		const post = await this.findPostById(postId);
		if (!post) {
			return API_ERROR.POST_NOT_FOUND;
		}
		return await this.prisma.post.update({
			where: { id: postId },
			data: payload,
		});
	}

	async deletePost(postId: number) {
		const post = await this.findPostById(postId);
		if (!post) {
			return API_ERROR.POST_NOT_FOUND;
		}
		return await this.prisma.post.delete({ where: { id: postId } });
	}
}
