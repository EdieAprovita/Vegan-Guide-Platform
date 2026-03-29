/**
 * Next.js instrumentation hook — runs once when the server starts.
 *
 * OpenTelemetry packages are optional runtime dependencies. We guard every
 * require with a try/catch so the build and server still start cleanly when
 * the packages are not installed. Install them before enabling tracing:
 *
 *   npm install @opentelemetry/sdk-node \
 *               @opentelemetry/auto-instrumentations-node \
 *               @opentelemetry/exporter-trace-otlp-http \
 *               @opentelemetry/resources \
 *               @opentelemetry/semantic-conventions
 */
export async function register() {
  // Only initialise tracing in the Node.js runtime (not Edge).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { NodeSDK } = require("@opentelemetry/sdk-node");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { resourceFromAttributes } = require("@opentelemetry/resources");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const {
      ATTR_SERVICE_NAME,
      ATTR_SERVICE_VERSION,
    } = require("@opentelemetry/semantic-conventions");

    const isProduction = process.env.NODE_ENV === "production";

    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: "vegan-guide-platform",
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? "0.1.0",
    });

    const instrumentations = [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
        "@opentelemetry/instrumentation-dns": { enabled: false },
      }),
    ];

    const sdk = isProduction
      ? new NodeSDK({
          resource,
          instrumentations,
          traceExporter: new OTLPTraceExporter({
            url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318/v1/traces",
          }),
        })
      : new NodeSDK({ resource, instrumentations });

    sdk.start();

    process.on("SIGTERM", () => {
      sdk
        .shutdown()
        .then(() => console.log("OpenTelemetry SDK shut down"))
        .catch((error: unknown) => console.error("Error shutting down OpenTelemetry SDK", error))
        .finally(() => process.exit(0));
    });
  } catch {
    // OTel packages not installed — tracing disabled, server continues normally.
  }
}
