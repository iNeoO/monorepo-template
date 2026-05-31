import { SpanStatusCode, trace } from "@opentelemetry/api";
import { createFactory } from "hono/factory";
import type { TracingBindings } from "../factories/appWithTracing.js";
import { tracingStorage } from "../libs/asyncLocalStorage.js";

const factory = createFactory<TracingBindings>();
const tracer = trace.getTracer("@monorepo-template/hono");

export const tracingMiddleware = factory.createMiddleware(async (c, next) => {
	return tracer.startActiveSpan(
		`${c.req.method} ${c.req.path}`,
		async (span) => {
			span.setAttributes({
				"http.request.method": c.req.method,
				"url.path": c.req.path,
				"url.full": c.req.url,
			});
			c.set("span", span);

			await tracingStorage.run(span, async () => {
				await next();
			});

			span.setAttribute("http.response.status_code", c.res.status);
			if (c.error) {
				span.recordException(c.error);
				span.setStatus({
					code: SpanStatusCode.ERROR,
					message: c.error.message,
				});
			} else if (c.res.status >= 500) {
				span.setStatus({ code: SpanStatusCode.ERROR });
			}

			span.end();
			return c.res;
		},
	);
});
