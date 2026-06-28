import { API_ERROR } from "@monorepo-template/common/constants";
import type { PrismaClient } from "@monorepo-template/prisma";
import type { CreatePostParams, UpdatePostParams } from "./posts.type.js";

export class PostsService {
	constructor(private db: PrismaClient) {}

	async findPosts() {
		return await this.db.post.findMany();
	}

	async findPostsByUser(userId: number) {
		return await this.db.post.findMany({ where: { authorId: userId } });
	}

	async findPostById(postId: number) {
		return await this.db.post.findUnique({ where: { id: postId } });
	}

	async createPost(payload: CreatePostParams) {
		return await this.db.post.create({ data: payload });
	}

	async updatePost(postId: number, payload: UpdatePostParams) {
		const post = await this.findPostById(postId);
		if (!post) {
			return API_ERROR.POST_NOT_FOUND;
		}
		return await this.db.post.update({
			where: { id: postId },
			data: payload,
		});
	}

	async deletePost(postId: number) {
		const post = await this.findPostById(postId);
		if (!post) {
			return API_ERROR.POST_NOT_FOUND;
		}
		return await this.db.post.delete({ where: { id: postId } });
	}
}
