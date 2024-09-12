// https://vitepress.dev/guide/custom-theme
import type { EnhanceAppContext, Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import VAd from "./VAd.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,

  enhanceApp(ctx: EnhanceAppContext) {
    ctx.app.component("VAd", VAd);
    DefaultTheme.enhanceApp(ctx);
  },

  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 添加广告
      "aside-bottom": () => [h(VAd)],
    });
  },
} satisfies Theme;
