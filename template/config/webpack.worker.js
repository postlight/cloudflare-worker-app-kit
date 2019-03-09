const path = require("path");

module.exports = isProduction => ({
  mode: isProduction ? "production" : "development",
  entry: {
    worker: path.resolve(__dirname, "../src/worker.tsx")
  },
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "worker/[name].js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [path.resolve(__dirname, "../src")],
        use: ["ts-loader"]
      },
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, "../src")],
        use: ["null-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }
});
