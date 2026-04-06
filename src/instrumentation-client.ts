import * as Sentry from "@sentry/nextjs";
import { clientEnv } from "@/lib/env.client";

const replaysSampleRate = parseFloat(
  process.env.NEXT_PUBLIC_SENTRY_REPLAY_SAMPLE_RATE ?? "0.1"
);

Sentry.init({
  dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: !!clientEnv.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysSessionSampleRate: Number.isFinite(replaysSampleRate) ? replaysSampleRate : 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
