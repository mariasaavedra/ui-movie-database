const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const webpack = require('webpack'); //to access built-in plugins
const path = require('path');
// __dirname refers to the directory where this webpack.config.js lives, which in this case is the project root.

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: [
  path.resolve(__dirname, './src/client/index'),
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client'
  ],
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'src/client'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    rules: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
        { test: /\.scss$/, loaders: ['style-loader','css-loader', 'sass-loader'] },
        { test: /\.(png|jpg|svg)$/, loaders: ['file-loader?name=img/[name].[ext]'] },
        { test:/\.html$/, loaders: ['html-loader'] }
    ]
  },
  plugins: [
    // Create HTML file that includes reference to bundled JS.
    new HtmlWebpackPlugin({
      favicon: 'favicon.ico',
      template: 'src/client/index.html',
      inject: true
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: false,
      debug: true
    }),
    new webpack.HotModuleReplacementPlugin(),
  ]
};