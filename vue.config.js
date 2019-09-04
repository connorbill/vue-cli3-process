const path = require("path");
const chalk = require("chalk");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const PrerenderSPAPlugin = require("prerender-spa-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const publicPath = process.env.NODE_ENV === "production" ? "/" : "/";
// 存放build结果的文件夹(主要是为了填prerender在配置了baseUrl后带来的坑,下面会说)
const DIST_ROOT = "dist";
// 项目部署在服务器里的绝对路径，默认'/'，参考https://cli.vuejs.org/zh/config/#baseurl
const BASE_URL = "/";
// 是否使用预渲染
const productionPrerender = true;
// 需要预渲染的路由
const prerenderRoutes = ["/"];
// 是否使用gzip
const productionGzip = true;
// 需要gzip压缩的文件后缀
const productionGzipExtensions = ["js", "css"];
// 转为CND外链方式的npm包，键名是import的npm包名，键值是该库暴露的全局变量，参考https://webpack.js.org/configuration/externals/#src/components/Sidebar/Sidebar.jsx
const externals = {
  vue: "Vue",
  "vue-router": "VueRouter",
  vuex: "Vuex",
  axios: "axios",
  "element-ui": "ELEMENT"
};
// CDN外链，会插入到index.html中
const cdn = {
  // 开发环境
  dev: {
    css: [publicPath + "static/element-index.css"],
    js: []
  },
  // 生产环境
  build: {
    css: [publicPath + "static/element-index.css"],
    js: [
      publicPath + "static/vue.min.js",
      publicPath + "static/vue-router.min.js",
      publicPath + "static/vuex.min.js",
      publicPath + "static/axios.min.js",
      publicPath + "static/element-index.js"
    ]
  }
};
module.exports = {
  publicPath: publicPath,
  productionSourceMap: false,
  chainWebpack: config => {
    const types = ["vue-modules", "vue", "normal-modules", "normal"];
    types.forEach(type =>
      addStyleResource(config.module.rule("scss").oneOf(type))
    );
    const svgRule = config.module.rule("svg");

    // 清除已有的所有 loader。
    // 如果你不这样做，接下来的 loader 会附加在该规则现有的 loader 之后。
    svgRule.uses.clear();

    // 添加要替换的 loader
    svgRule.use("vue-svg-loader").loader("vue-svg-loader");

    /**
     * 删除懒加载模块的prefetch，降低带宽压力
     * https://cli.vuejs.org/zh/guide/html-and-static-assets.html#prefetch
     * 而且预渲染时生成的prefetch标签是modern版本的，低版本浏览器是不需要的
     */
    config.plugins.delete("prefetch");
    /**
     * 添加CDN参数到htmlWebpackPlugin配置中
     */
    config.plugin("html").tap(args => {
      if (process.env.NODE_ENV === "production") {
        args[0].cdn = cdn.build;
      }
      if (process.env.NODE_ENV === "development") {
        args[0].cdn = cdn.dev;
      }
      return args;
    });
    // 配置vue,js文件eslint不符合规则，中断编译
    // config.module
    //   .rule("eslint-vue")
    //   .test(/\.(vue|js|jsx)$/)
    //   .use("eslint-loader")
    //   .loader("eslint-loader")
    //   .set("enforce", "pre")
    //   .end();
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
    const myConfig = {
      plugins: []
    };
    if (
      process.env.NODE_ENV === "production" ||
      process.env.VUE_APP_TYPE === "analysis"
    ) {
      // 1. 生产环境npm包转CDN
      myConfig.externals = externals;
      // 2. 使用预渲染，在仅加载html和css之后即可显示出基础的页面，提升用户体验，避免白屏
      myConfig.plugins = [];
      productionPrerender &&
        myConfig.plugins.push(
          new PrerenderSPAPlugin({
            staticDir: path.resolve(__dirname, DIST_ROOT), // 作为express.static()中间件的路径
            outputDir: path.resolve(__dirname, DIST_ROOT + BASE_URL),
            indexPath: path.resolve(
              __dirname,
              DIST_ROOT + BASE_URL + "index.html"
            ),
            routes: prerenderRoutes,
            minify: {
              collapseBooleanAttributes: true,
              collapseWhitespace: true,
              decodeEntities: true,
              keepClosingSlash: true,
              sortAttributes: true
            },
            postProcess(renderedRoute) {
              /**
               * 懒加载模块会自动注入，无需直接通过script标签引入
               * 而且预渲染的html注入的是modern版本的懒加载模块
               * 这会导致在低版本浏览器出现报错，需要剔除
               * 这并不是一个非常严谨的正则，不适用于使用了 webpackChunkName: "group-foo" 注释的懒加载
               */
              renderedRoute.html = renderedRoute.html.replace(
                /<script[^<]*chunk-[a-z0-9]{8}\.[a-z0-9]{8}.js[^<]*><\/script>/g,
                function(target) {
                  console.log(
                    chalk.bgRed("\n\n剔除的懒加载标签:"),
                    chalk.magenta(target)
                  );
                  return "";
                }
              );
              return renderedRoute;
            }
          })
        );
      // 3. 构建时开启gzip，降低服务器压缩对CPU资源的占用，服务器也要相应开启gzip
      productionGzip &&
        myConfig.plugins.push(
          new CompressionWebpackPlugin({
            test: new RegExp(
              "\\.(" + productionGzipExtensions.join("|") + ")$"
            ),
            threshold: 8192,
            minRatio: 0.8
          })
        );
      // 打包分析
      myConfig.plugins.push(new BundleAnalyzerPlugin());
    }
    if (process.env.NODE_ENV === "development") {
      /**
       * 关闭host check，方便使用ngrok之类的内网转发工具
       */
      myConfig.devServer = {
        disableHostCheck: true
      };
      // console.log(process.env.VUE_APP_TYPE)
      // myConfig.plugins = [];
      // if (process.env.VUE_APP_TYPE === "analysis") {
      //   myConfig.plugins.push(new BundleAnalyzerPlugin());
      // }
    }
    return myConfig;
  }
};

function addStyleResource(rule) {
  rule
    .use("style-resource")
    .loader("style-resources-loader")
    .options({
      patterns: [path.resolve(__dirname, "./src/assets/styles/imports.scss")]
    });
}
