export type CreatePostParams = {
	title: string;
	content?: string;
	authorId: number;
};

export type UpdatePostParams = {
	title?: string;
	content?: string;
};
