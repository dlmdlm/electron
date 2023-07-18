const { BrowserTracing } = require("@sentry/tracing");
const Sentry = require('@sentry/electron');
const { SENTRY_DSN } = require('./constants');

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [new BrowserTracing()],

  tracesSampleRate: 1.0,
});

