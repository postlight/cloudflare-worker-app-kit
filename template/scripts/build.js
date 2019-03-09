const webpack = require("webpack");
const clientConfig = require("../config/webpack.client");
const workerConfig = require("../config/webpack.worker");

console.time("Build complete");

webpack([clientConfig(true), workerConfig(true)], (err, stats) => {
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

function assetResult(asset) {
  const size =
    asset.size > 1024
      ? `${Math.round(asset.size / 1024)} KB`
      : `${asset.size} B`;
  console.log(`* ${asset.name} - ${size}`);
}
