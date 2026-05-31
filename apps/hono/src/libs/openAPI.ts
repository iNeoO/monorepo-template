import { env } from "@monorepo-template/infra/configs";
import type { TracingBindings } from "@monorepo-template/infra/factories";
import { Scalar } from "@scalar/hono-api-reference";
import type { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";

export function setupOpenAPI(app: Hono<TracingBindings>) {
	app.get(
		"/openapi/spec",
		openAPIRouteHandler(app, {
			documentation: {
				info: {
					title: "Swagger",
					version: "1.0.0",
					description: "Swagger API",
				},
				servers: [
					{
						url: `${env.FRONTEND_URL}/api`,
						description: "API server",
					},
				],
			},
		}),
	);

	app.get(
		"/openapi/ui",
		Scalar({
			theme: "deepSpace",
			url: `/api/openapi/spec`,
		}),
	);
}
