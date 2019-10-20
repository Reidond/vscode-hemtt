//@ts-check

"use strict";

const path = require("path");

/**@type {import('webpack').Configuration}*/
const config = {
  target: "node",

  entry: "./src/extension.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]"
  },
  devtool: "source-map",
  externals: {
    vscode: "commonjs vscode"
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@src": path.resolve(__dirname, "./src"),
      "@commands": path.resolve(__dirname, "./src/commands"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@views": path.resolve(__dirname, "./src/views")
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader"
          }
        ]
      }
    ]
  }
};
module.exports = config;
