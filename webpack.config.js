const path = require("path");
const webpack = require('webpack');

// Look at .env and add those environment variables
// to process.env
require('dotenv').config();

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
  },
  plugins: [
    // Allows us to use in the browser the values of the 
    // environment variables specified
    new webpack.EnvironmentPlugin(['REMOTE_DB_BASE_URL', 'MAPBOX_API_KEY'])
  ]
};
