const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = isProduction => ({
  devtool: isProduction ? "source-map" : "eval",
  mode: isProduction ? "production" : "development",
  entry: {
    client: path.resolve(__dirname, "src/client.tsx")
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/assets/",
    filename: isProduction ? "js/[name].[chunkhash:10].js" : "js/[name].js"
  },
  plugins: isProduction && [
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash:10].css"
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [path.resolve(__dirname, "src")],
        use: ["ts-loader"]
      },
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, "src")],
        use: [
          isProduction ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader"
        ]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }
});
