// vue.config.js
const webpack = require('webpack');

module.exports = {
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'Catalogo Ahro',
    },
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(false),
      }),
    ],
  },
};
