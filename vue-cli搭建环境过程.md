# 从头使用 vue-cli3

## 一 vue-cli3 创建项目选项

- 启动git bash 参见（https://github.com/vuejs/vue-cli/issues/2117）
```shell
winpty vue.cmd create hello-world

Manually select features
 (*) Babel
 ( ) TypeScript
 ( ) Progressive Web App (PWA) Support
 (*) Router
 (*) Vuex
 (*) CSS Pre-processors
 (*) Linter / Formatter
 (*) Unit Testing
>(*) E2E Testing

? Use history mode for router? (Requires proper server setup for index fallback
in production) (Y/n) Y

? Pick a CSS pre-processor (PostCSS, Autoprefixer and CSS Modules are supported
by default):
  Sass/SCSS (with dart-sass)
> Sass/SCSS (with node-sass)
  Less
  Stylus

? Pick a linter / formatter config:
  ESLint with error prevention only
  ESLint + Airbnb config
  ESLint + Standard config
> ESLint + Prettier

? Pick additional lint features:
 (*) Lint on save
>(*) Lint and fix on commit

? Pick a unit testing solution:
  Mocha + Chai
> Jest

? Pick a E2E testing solution: (Use arrow keys)
> Cypress (Chrome only)
  Nightwatch (Selenium-based)

? Where do you prefer placing config for Babel, PostCSS, ESLint, etc.? (Use arro
w keys)
> In dedicated config files
  In package.json

? Save this as a preset for future projects? (y/N) Y

? Save preset as: outer



```

##  二 代码格式化和统一规范

- 见（https://juejin.im/post/5b27a326e51d45588a7dac57）

- vscode 代码格式提示配置

```js
{
    "eslint.validate": [ 
        "javascript", 
        "javascriptreact", 
        { 
            "language": "vue", 
            // "autoFix": true 
        } 
    ]
}
```



## 三 根据vue-cli3文档配置

- 自动化导入

> 见（https://cli.vuejs.org/zh/guide/css.html#%E8%87%AA%E5%8A%A8%E5%8C%96%E5%AF%BC%E5%85%A5）

```shell
npm install style-resources-loader -d
```

- 在 vue.config.js 中编写

```js
const path = require('path')

module.exports = {
  chainWebpack: config => {
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type => addStyleResource(config.module.rule('scss').oneOf(type)))
  },
}

function addStyleResource (rule) {
  rule.use('style-resource')
  .loader('style-resources-loader')
  .options({
    patterns: [
      path.resolve(__dirname, './src/assets/styles/variable.scss'),
    ],
  })
}

```

- CSS Modules  / css模块化

```js
// 我们不修改vue.config.js配置, 以便于我们自己识别 module文件
import sassStyles from './foo.module.scss'

```

- 替换svg Loader规则

```shell
 npm install vue-svg-loader
```

> 在 vue.config.js添加

```js
const svgRule = config.module.rule('svg')

    // 清除已有的所有 loader。
    // 如果你不这样做，接下来的 loader 会附加在该规则现有的 loader 之后。
    svgRule.uses.clear()

    // 添加要替换的 loader
    svgRule
      .use('vue-svg-loader')
        .loader('vue-svg-loader')
```

> 使用方法

```js
<template>
  <div class="home">
    <NavShop />
  </div>
</template>
<script>
import NavShop from "../assets/images/svg/NavShop.svg";
export default {
  name: "home",
  components: {
    NavShop
  }
};
</script>

```

## 四 其他优化

见vue-cli3-optimization： https://github.com/HaoChuan9421/vue-cli3-optimization

- cdn optimization /CDN 优化

- Gzip 优化

```js
//  开启nginx的gzip_static on;选项， 如果gzip_static设置为on,那么就会使用同名的.gz文件，不会占用服务器的CPU资源去压缩。
```

- 路由懒加载(按需加载)

- Prerender 首页预渲染

> 预渲染的单页应用路由需要使用 History 模式而不是 Hash 模式。原因很简单，Hash 不会带到服务器，路由信息会丢失。
  History 模式需要后台配置支持，最简单的是通过 nginx 配置 try_files 指令。

```js
// nginx 配置
location / {
  try_files $uri $uri/  xxx/index.html;
}

```

> 调整main.js

```js
new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app', true)

```

> 调整public/index.html

```html
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <!-- 使用CDN加速的CSS文件，配置在vue.config.js下 -->
    <% for (var i in htmlWebpackPlugin.options.cdn&&htmlWebpackPlugin.options.cdn.css) { %>
    <link href="<%= htmlWebpackPlugin.options.cdn.css[i] %>" rel="preload" as="style">
    <link href="<%= htmlWebpackPlugin.options.cdn.css[i] %>" rel="stylesheet">
    <% } %>
    <!-- 使用CDN加速的JS文件，配置在vue.config.js下 -->
    <% for (var i in htmlWebpackPlugin.options.cdn&&htmlWebpackPlugin.options.cdn.js) { %>
    <link href="<%= htmlWebpackPlugin.options.cdn.js[i] %>" rel="preload" as="script">
    <% } %>
    <title>vue-cli-demo-es6-prettier</title>
  </head>
  <body>
    <noscript>
      <strong>We're sorry but vue-cli-demo-es6-prettier doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    <div id="app"></div>
    <!-- built files will be auto injected -->

    <!-- 使用CDN加速的JS文件，配置在vue.config.js下 -->
    <% for (var i in htmlWebpackPlugin.options.cdn&&htmlWebpackPlugin.options.cdn.js) { %>
    <script src="<%= htmlWebpackPlugin.options.cdn.js[i] %>"></script>
    <% } %>
  </body>
</html>

```

## 打包分析插件

```shell
npm install webpack-bundle-analyzer -D
```
```js
// vue.config.js
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  configureWebpack: {
    plugins: [
      new BundleAnalyzerPlugin()
      // 其他 plugins ...
    ]
  }
};
```
```shell
// 查看打包体积分布
npm run bundle:analysis
```

## 输出生产资源
- 为了提升静态资源访问速度，降低主域名下服务器的流量压力，我们通常会将静态资源从主域名下剥离出来，托管在 CDN 上。这种情况下，相对路径无法工作。我们要在配置中指定 publicPath 以指定静态资源的域名。

```shell
// vue.config.js
module.exports = {
  //..
  publicPath: process.env.NODE_ENV === "production" ? "//some.cdn.com" : "/",
};

<!-- dist/html 文件内注入的脚本 -->
<script src=//some.cdn.com/js/chunk-vendors.f4718524.js></script>
<script src=//some.cdn.com/js/app.84426696.js></script>
```


## 本地预览效果

```shell
npm install -g serve

// 浏览器查看网页
serve -s dist

```

## vue风格指南

- https://cn.vuejs.org/v2/style-guide/index.html

### 相关文章：
- 使用vue-cli3有什么好处：https://github.com/vuejs/vue-cli/issues/2796
- 使用ESLint+Prettier来统一前端代码风格：https://juejin.im/post/5b27a326e51d45588a7dac57
- 优化向：单页应用多路由预渲染指南： https://juejin.im/post/59d49d976fb9a00a571d651d
- Vue项目预渲染机制引入实践 ： https://juejin.im/post/5b8ba25751882542f25a6cc8
- vue-cli3-optimization： https://github.com/HaoChuan9421/vue-cli3-optimization
- 从头开始用webpack4搭建vue/react环境： https://juejin.im/post/5c7f4fb3f265da2dd1688dbe 
- yarn or npm : https://www.ryadel.com/en/yarn-vs-npm-pnpm-2019/




