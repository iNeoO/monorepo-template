import type { TracingBindings } from "@monorepo-template/infra/factories";
import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorHandler: ErrorHandler<TracingBindings> = (err, c) => {
	if (err instanceof HTTPException) {
		return err.getResponse();
	}

	const logger = c.get("logger");
	logger.error({ err }, "Internal server error");

	return c.json({ message: "Internal server error" }, 500);
};
