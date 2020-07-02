const path = require('path')
const os = require('os')

module.exports = {
  entry: './dist/index.js',
  node: {
    fs: "empty",
  },
  devtool: 'inline-source-map',
  output: {
    filename: 'css.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'var',
    library: 'CSSTechniques'
  },
  target: 'node-webkit',
}
