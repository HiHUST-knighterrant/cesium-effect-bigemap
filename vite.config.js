// vite.config.js
const path = require("path");
const _build_package_name = "cesium-effect-bigemap";
const _build_package_format = ["es"];
let mode;

const transformIndexHtml = (code) => {
  switch (mode) {
    case 'staging':
      return code.replace(/__INDEX__/, `dist/${_build_package_name}.${_build_package_format[0]}.js`)   // 生产环境
    default:
      return code.replace(/__INDEX__/, 'src/main.ts')    // 开发环境
  }
}

const _initHTMLPlugin = () => {
  return {
    name: 'initHTMLPlugin',
    enforce: 'pre',

    configResolved(resolvedConfig) {
      // 存储最终解析的配置
      mode = resolvedConfig.mode;
    },
    transform(code, id) {
      if (id.endsWith('.html')) {
        return { code: transformIndexHtml(code), map: null }
      }
    },
    transformIndexHtml
  };
}

export default {
  // 配置选项
  server: {
    hmr: false
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: _build_package_name,
      formats: _build_package_format,
      fileName: (format) => `cesium-effect-bigemap.${format}.js`
    },
    sourcemap: true
  },

  plugins: [
    _initHTMLPlugin(),
  ],
  define: {
    'process.env.VITE_ENV': `'${process.env.VITE_ENV}'`
  },
  optimizeDeps: {
    exclude: ['__INDEX__'] // 排除 __INDEX__
  },
}