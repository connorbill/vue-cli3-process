// vue.config.js
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const CompressionWebpackPlugin = require('compression-webpack-plugin');

// 假设 http://localhost:5000 为 cdn 域名
const cdnUrl = 'http://192.168.60.20:5000';
const publicPath = process.env.NODE_ENV === 'production' ? cdnUrl : '/';
// 是否使用gzip
const productionGzip = true;
// 需要gzip压缩的文件后缀
const productionGzipExtensions = ['js', 'css'];

// <script src="//shadow.elemecdn.com/npm/vue@2.5.16/dist/vue.runtime<%= process.env.NODE_ENV === 'production' ? '.min.js' : '.js' %>" crossorigin="anonymous"></script>
//   <script src="//shadow.elemecdn.com/npm/vue-router@3.0.1/dist/vue-router<%= process.env.NODE_ENV === 'production' ? '.min.js' : '.js' %>" crossorigin="anonymous"></script>
//   <script src="//unpkg.com/vuex@3.1.1/dist/vuex<%= process.env.NODE_ENV === 'production' ? '.min.js' : '.js' %>" crossorigin="anonymous"></script>

// CDN外链，会插入到index.html中
const cdn = {
  // 开发环境
  dev: {
    css: [],
    js: [
      // '//cdn.jsdelivr.net/npm/vue/dist/vue.js',
      // '//unpkg.com/vue-router@3.1.3/dist/vue-router.js',
      // '//unpkg.com/vuex@3.1.1/dist/vuex.js',
      '/static/js/vue.js',
      '/static/js/vue-router.js',
      '/static/js/vuex.js'
    ]
  },
  // 生产环境
  build: {
    css: [],
    js: [
      // '//cdn.jsdelivr.net/npm/vue/dist/vue.min.js',
      // '//unpkg.com/vue-router@3.1.3/dist/vue-router.min.js',
      // '//unpkg.com/vuex@3.1.1/dist/vuex.min.js'
      publicPath + '/static/js/vue.min.js',
      publicPath + '/static/js/vue-router.min.js',
      publicPath + '/static/js/vuex.min.js'
    ]
  }
};
console.log(publicPath)
module.exports = {
  publicPath: publicPath,
  productionSourceMap: false,
  devServer: {
    open: true
  },
  chainWebpack: config => {
    // 所有组件中导入一些文件，不用每个组件都引入一个东西，估计用的少
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal'];
    types.forEach(type =>
      addStyleResource(config.module.rule('scss').oneOf(type))
    );
    // svg-loader
    const svgRule = config.module.rule('svg');
    // 清除已有的所有 loader。
    // 如果你不这样做，接下来的 loader 会附加在该规则现有的 loader 之后。
    svgRule.uses.clear();
    // 添加要替换的 loader
    svgRule.use('vue-svg-loader').loader('vue-svg-loader');

    /**
     * 添加CDN参数到htmlWebpackPlugin配置中
     */
    config.plugin('html').tap(args => {
      if (process.env.NODE_ENV === 'production') {
        args[0].cdn = cdn.build;
      }
      if (process.env.NODE_ENV === 'development') {
        args[0].cdn = cdn.dev;
      }
      return args;
    });
  },
  css: {
    loaderOptions: {
      // 默认情况下 `sass` 选项会同时对 `sass` 和 `scss` 语法同时生效
      // 因为 `scss` 语法在内部也是由 sass-loader 处理的
      // 但是在配置 `data` 选项的时候
      // `scss` 语法会要求语句结尾必须有分号，`sass` 则要求必须没有分号
      // 在这种情况下，我们可以使用 `scss` 选项，对 `scss` 语法进行单独配置
      scss: {
        // @/ 是 src/ 的别名
        // 所以这里假设你有 `src/variables.sass` 这个文件
        data: `@import "~@/assets/styles/variables.scss";`
      }
    }
  },
  configureWebpack: () => {
    var myConfig = {
      plugins: [],
      externals: {}
    };
    // 执行 --mode analysis 命令时，显示打包图
    if (process.env.VUE_APP_TYPE === 'analysis') {
      myConfig.plugins.push(new BundleAnalyzerPlugin());
    }
    // 将公用库抽离出去，并将链接放入index.html
    myConfig.externals = {
      vue: 'window.Vue',
      'vue-router': 'window.VueRouter',
      vuex: 'window.Vuex'
      // 其他三方库 ...
    };
    productionGzip &&
      myConfig.plugins.push(
        new CompressionWebpackPlugin({
          test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
          threshold: 8192,
          minRatio: 0.8
        })
      );
    return myConfig;
  }
};

function addStyleResource(rule) {
  rule
    .use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [path.resolve(__dirname, './src/assets/styles/imports.scss')]
    });
}
