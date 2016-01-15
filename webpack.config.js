module.exports =
{
  entry: ['./src/index.js'],
  output: { filename: 'bundle.js' },
  devTool: 'eval',
  devServer: {
    stats: { colors: true }
  },
  module: {
    loaders: [{
      test: /src\/.*\.js$/,
      loader: 'babel',
      query: { 'presets': ['es2015'] }
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  }
}
