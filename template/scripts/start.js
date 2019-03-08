const path = require("path");
const http = require("http");
const Bundler = require("parcel-bundler");
const staticMiddleware = require("serve-static");
const Cloudworker = require("@dollarshaveclub/cloudworker");

// Static assets server and bundler
const staticPort = 3333;
const entries = [
  path.join(__dirname, "../src", "client.tsx"),
  path.join(__dirname, "../src", "worker.tsx")
];
const bundler = new Bundler(entries, {
  publicUrl: "/assets/js",
  watch: true,
  minify: false,
  logLevel: 2,
  hmr: true
});
const serveBundle = bundler.middleware();
const serveStatic = staticMiddleware(path.join(__dirname, ".."));
http
  .createServer(assetsHandler(serveError, serveBundle, serveStatic, notFound))
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
const bindings = {};
http
  .createServer(async (req, res) => {
    let script;
    let body;
    try {
      [script, body] = await Promise.all([
        getScript(`http://localhost:${staticPort}/assets/js/worker.js`),
        parseBody(req)
      ]);
    } catch (err) {
      return console.error(err);
    }

    const worker = new Cloudworker(script, { bindings });
    const workerReq = new Cloudworker.Request(
      `http://localhost:${staticPort}${req.url}`,
      {
        method: req.method,
        body
      }
    );

    try {
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
    console.log(`Dev server: http://localhost:${workerPort}`);
  });

async function parseBody(req) {
  if (req.method === "GET") return;
  try {
    return await getRawBody(req);
  } catch (err) {
    console.log("Error parsing body", err.message);
  }
}

function getScript(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`${res.statusCode}: ${res.statusMessage}`));
      }
      res.setEncoding("utf8");
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => resolve(data));
    });
  });
}
