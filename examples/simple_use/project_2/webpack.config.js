const path = require('path');
const webpack = require('webpack');
module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: {
    app: './scripts/index.js',
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: [/node_modules/],
      use: [{
        loader: 'babel-loader',
        options: { presets: ['es2015'] }
      }],
    },{
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    },{
      test: /\.html$/,
      exclude: /node_modules/,
      use: {
        loader: 'file-loader',
        query: {
          name: '[name].[ext]'
        },
      },
    }]
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'scripts/[name].bundle.js',
  },
};