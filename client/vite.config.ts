import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // unplugin-vue-components 是个 Vite 插件，能自动扫描你模板里用到的组件，帮你把 import 补上。NaiveUiResolver 是它的一个「解析器」，专门告诉它：遇到 <n-xxx> 这种标签，去 naive-ui 里找对应组件。装好之后，模板里直接写 <n-form>、<n-input>，不用 import，自动生效。而且是按需的
    Components({
      resolvers: [NaiveUiResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    open: true,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
