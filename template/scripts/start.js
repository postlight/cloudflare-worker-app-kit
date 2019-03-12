const path = require("path");
const http = require("http");
const fetch = require("node-fetch");
const staticMiddleware = require("serve-static");
const Cloudworker = require("@dollarshaveclub/cloudworker");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const clientConfig = require("../config/webpack.client");
const workerConfig = require("../config/webpack.worker");
const metadata = require("./metadata");

// Static assets server and bundler
const staticPort = 3333;
const compiler = webpack([clientConfig(), workerConfig()]);
const serveWebpack = webpackDevMiddleware(compiler, {
  logLevel: "warn",
  publicPath: "/assets"
});
const serveStatic = staticMiddleware(path.join(__dirname, ".."));
http
  .createServer(assetsHandler(serveError, serveWebpack, serveStatic, notFound))
  .listen(staticPort);

function assetsHandler(errHandler, ...steps) {
  // Calling next send the request on to the next handler, unless an error is
  // passed. In that case, we go straight to the errHandler
  return (req, res) => {
    const queue = steps.slice().reverse();
    const next = err => {
      if (err) return errHandler(err, req, res);
      const middleware = queue.pop();
      if (middleware) {
        middleware(req, res, next);
      }
    };
    next();
  };
}

function serveError(err, req, res) {
  res.statusCode = err.status || 500;
  res.end(err.stack);
}

function notFound(req, res) {
  res.statusCode = 404;
  res.end(`${req.url} - Not found`);
}

// A local worker handles all requests. First the latest worker script bundle is
// fetched from the static asset server, then a cloudworker is initialized, the
// request is dispatched, and finally, the worker response is sent back.
const workerPort = 3030;
http
  .createServer(async (req, res) => {
    let script;
    let body;
    try {
      [script, body] = await Promise.all([
        getScript(`http://localhost:${staticPort}/assets/worker/worker.js`),
        parseBody(req)
      ]);
    } catch (err) {
      return console.error(
        "Unable to fetch script or parse request body:",
        err
      );
    }

    try {
      // Bindings are exposed as variables in the root of the worker script.
      const bindings = mapMetadataToBindings();
      const worker = new Cloudworker(script, { bindings });
      const workerReq = new Cloudworker.Request(
        `http://localhost:${staticPort}${req.url}`,
        {
          method: req.method,
          body
        }
      );
      const workerRes = await worker.dispatch(workerReq);
      const workerBuff = await workerRes.buffer();
      res.writeHead(
        workerRes.status,
        workerRes.statusText,
        workerRes.headers.raw()
      );
      res.write(workerBuff);
      res.end();
    } catch (err) {
      console.error(err);
    }
  })
  .listen(workerPort, err => {
    if (err) {
      return console.log("Server error", err);
    }
    console.log(`
-----------------------------------------
Dev server ready => http://localhost:${workerPort}
-----------------------------------------
`);
  });

async function parseBody(req) {
  if (req.method === "GET") return;
  try {
    return await getRawBody(req);
  } catch (err) {
    console.log("Error parsing body", err.message);
  }
}

async function getScript(url) {
  const response = await fetch(url);
  if (!response.ok) {
    response.statusMessage;
    throw new Error(`${res.statusCode}: ${res.statusMessage}`);
  }
  return response.text();
}

function mapMetadataToBindings() {
  const output = {};
  const data = metadata(["js/client.js"]);
  data.bindings.forEach(bind => {
    switch (bind.type) {
      case "secret_text":
        output[bind.name] = bind.text;
        break;
      case "kv_namespace":
        output[bind.name] = new Cloudworker.KeyValueStore();
        break;
    }
  });
  return output;
}
