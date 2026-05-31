import { AsyncLocalStorage } from "node:async_hooks";
import type { Span } from "@opentelemetry/api";
import type { Logger } from "pino";
import { pinoLogger } from "./pino.js";

export const loggerStorage = new AsyncLocalStorage<Logger>();

export const getLoggerStore = () => {
	const logger = loggerStorage.getStore();
	if (!logger) {
		return pinoLogger;
	}
	return logger;
};

export const tracingStorage = new AsyncLocalStorage<Span>();

export const getTraceStore = () => {
	const trace = tracingStorage.getStore();
	if (!trace) {
		throw new Error("trace not found in tracingStorage");
	}
	return trace;
};
