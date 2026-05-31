import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { env } from "../configs/env.js";

let sdk: NodeSDK | undefined;

export const setupInstrumentation = () => {
	if (sdk) {
		return;
	}

	sdk = new NodeSDK({
		serviceName: "monorepo-template-hono",
		traceExporter: env.OTEL_EXPORTER
			? new OTLPTraceExporter({
					url: env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
				})
			: undefined,
		instrumentations: [getNodeAutoInstrumentations()],
	});

	sdk.start();
};

export const shutdownInstrumentation = async () => {
	if (!sdk) {
		return;
	}

	await sdk.shutdown();
	sdk = undefined;
};
