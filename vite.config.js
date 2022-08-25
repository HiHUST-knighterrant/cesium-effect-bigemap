// vite.config.js
const path = require("path");

export default {
  // 配置选项
  server: {
    hmr: false
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "cesium-effect-bigemap",
      formats: ["es"],
      fileName: (format) => `cesium-effect-bigemap.${format}.js`
    },
    sourcemap: true
  }
}