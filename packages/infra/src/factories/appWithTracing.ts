import type { Span } from "@opentelemetry/api";
import { createFactory } from "hono/factory";
import type { LogsBindings } from "./appWithLogs.js";

export type TracingBindings = {
	Variables: {
		span: Span;
	} & LogsBindings["Variables"];
};

export const appWithTracing = createFactory<TracingBindings>();
