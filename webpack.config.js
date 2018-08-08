const path = require("path");

const publicFolderPath = path.resolve(__dirname, "./public");

module.exports = {
  mode: process.env.MODE || "development",
  entry: {
    index: path.resolve(__dirname, "./src/js/index.js"),
    restaurant: path.resolve(__dirname, "./src/js/restaurant.js"),
    service_worker: path.resolve(__dirname, "./src/service_worker.js")
  },
  output: {
    filename: "[name].js",
    path: publicFolderPath
  }
};
