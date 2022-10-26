var path = require("path");
const webpack = require('webpack');   

module.exports = {
  mode: "production",
  entry: "./tables.js",
  output: {
    path: path.resolve("dist"),
    libraryTarget: "umd",
    filename: 'index.js',
    chunkFilename: '[name].[chunkhash].js',
    publicPath: '/',
    path: path.join(__dirname, 'root'),
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/, exclude: /node_modules/
        , use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: "defaults" }, '@babel/preset-react'
              ]
            ],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }

      },
      {
        test: /\.(s*)css$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },

    ]
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  externals: {
    'react': 'react',
  },
};