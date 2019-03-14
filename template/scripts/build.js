const webpack = require("webpack");
const clientConfig = require("../webpack.client");
const workerConfig = require("../webpack.worker");

console.time("Build complete");

const compiler = webpack([clientConfig(true), workerConfig(true)]);
function cliBuild() {
  compiler.run((err, stats) => {
    if (err) {
      return console.error(err.stack || err, err.details || "");
    }

    const info = stats.toJson({
      all: false,
      errors: true,
      warnings: true,
      assets: true
    });
    if (stats.hasErrors()) {
      return console.error(info.errors);
    }
    if (stats.hasWarnings()) {
      return console.warn(info.warnings);
    }

    console.timeEnd("Build complete");
    const [clientStats, workerStats] = info.children;
    console.log("-----------------------------------------");
    clientStats.assets.forEach(assetResult);
    workerStats.assets.forEach(assetResult);
    console.log("");
  });
}

function assetResult(asset) {
  const size =
    asset.size > 1024
      ? `${Math.round(asset.size / 1024)} KB`
      : `${asset.size} B`;
  console.log(`* ${asset.name} - ${size}`);
}

// Runs if called from CLI, like `node build.js`
if (require.main === module) {
  cliBuild();
}

// Expose the build as an async function to be used by other scripts
module.exports = () =>
  new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      const info = stats.toJson({
        all: false,
        errors: true,
        warnings: true,
        assets: true
      });

      if (stats.hasErrors()) {
        return reject(
          new Error(`${info.errors.map(err => `${err}`)}`).join("\n\n")
        );
      }
      if (stats.hasWarnings()) {
        console.warn(info.warnings);
      }
      const [clientStats, workerStats] = info.children;
      resolve({
        client: clientStats.assets.map(asset => asset.name),
        worker: workerStats.assets.map(asset => asset.name)
      });
    });
  });
