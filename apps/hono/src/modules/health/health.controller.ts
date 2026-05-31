import { appWithTracing } from "@monorepo-template/infra/factories";
import type { HealthService } from "@monorepo-template/services";
import { GetHealthRoute } from "./health.route.js";
import type { HealTthResponseApi } from "./health.type.js";

export const createHealthController = (healthService: HealthService) => {
	return appWithTracing.createApp().get("/", GetHealthRoute, async (c) => {
		const span = c.get("span");
		span.setAttribute("app.controller", "health");
		span.addEvent("health.controller.started");
		const status = await healthService.getHealth();
		const response: HealTthResponseApi = { data: status };
		span.addEvent("health.controller.completed");

		return c.json(response, 200);
	});
};
