const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const path = require('path');

const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const { SENTRY_DSN } = require('./constants');
const common = require('./index')

const app = express()
const port = 3124

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    // Enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // Enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  tracesSampleRate: 1.0,
});
let Inventory = {
  wrench: 0,
  nails: 0,
  hammer: 1
};
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(bodyParser.json());
app.use(cors());

app.all('*', function (req, res, next) {
  let transactionId = req.header('X-Transaction-ID'),
    sessionId = req.header("X-Session-ID"),
    order = req.body;

  if (transactionId) {
    Sentry.configureScope(scope => {
      scope.setTag("transaction_id", transactionId);
    });
  }
  if (sessionId) {
    Sentry.configureScope(scope => {
      scope.setTag("session_id", sessionId);
    });
  }
  if (order.email) {
    Sentry.configureScope(scope => {
      scope.setUser({ email: order.email });
    });
  }
  Sentry.configureScope(scope => {
    scope.setExtra("inventory", JSON.stringify(Inventory));
  });
  next();
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/index.html'));
})
app.get('/capture-message', function (req, res) {
  Sentry.captureMessage('Custom Message', { extra: { port, versions: common.versions } });
  setTimeout(() => { res.send('Success'); }, 500);
});

app.get('/syntax', function (req, res) {
  common.syntaxError();
});
app.get('/unhandled', function (req, res) {
  common.notAFunctionError();
});
app.get('/renderer', function (req, res) {
  common.errorRenderer();
});

app.get('/handled', function (req, res) {
  try {
    common.notAFunctionError();
    res.send('Success');
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).send("Something broke");
  }
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use(Sentry.Handlers.errorHandler());
app.use(express.static(__dirname + '/'));
app.use(express.static(path.resolve(__dirname, '..')));
app.listen(process.env.PORT || port, function () {
  console.log(`CORS-enabled web server listening on port ${port}`);
});

module.exports = app;
