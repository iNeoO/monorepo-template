import { z } from "zod";

export const healthSchema = z.object({
	prisma: z.enum(["OK", "NOT OK"]),
});
