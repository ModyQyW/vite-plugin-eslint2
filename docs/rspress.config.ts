import path from "node:path";
import { defineConfig } from "@rspress/core";

const siteOrigin = "https://vite-plugin-eslint2.modyqyw.top";

// `siteOrigin` turns the sitemap `<loc>`, the hreflang links and the llms.txt
// entries into absolute URLs; Rspress leaves all three relative without it.

export default defineConfig({
  lang: "en",
  title: "vite-plugin-eslint2",
  description:
    "Run ESLint inside Vite with a browser overlay, worker linting and auto-fix. Supports Vite 2-8 and ESLint 7-10.",
  siteOrigin,
  icon: "/vite-plugin-eslint2.svg",
  logo: "/vite-plugin-eslint2.svg",
  logoText: "vite-plugin-eslint2",
  locales: [
    {
      lang: "en",
      label: "English",
      title: "vite-plugin-eslint2",
      description: "ESLint plugin for Vite.",
    },
    {
      lang: "zh",
      label: "简体中文",
      title: "vite-plugin-eslint2",
      description:
        "在 Vite 里跑 ESLint，带浏览器浮层、worker 和自动修复。支持 Vite 2-8 和 ESLint 7-10。",
    },
  ],
  globalStyles: path.join(import.meta.dirname, "theme/index.css"),
  head: [
    // Google Analytics
    [
      "script",
      {
        async: "",
        src: "https://www.googletagmanager.com/gtag/js?id=G-GBE9KNFWLS",
      },
    ],
    // Google AdSense
    [
      "script",
      {
        async: "",
        crossorigin: "anonymous",
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3102250747488251",
      },
    ],
  ],
  // `head` only accepts tags without children, so the inline gtag bootstrap has
  // to go through Rsbuild's html tag config instead.
  builderConfig: {
    html: {
      tags: [
        {
          tag: "script",
          children: `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-GBE9KNFWLS');`,
        },
      ],
    },
  },
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/ModyQyW/vite-plugin-eslint2",
      },
    ],
    editLink: {
      docRepoBaseUrl:
        "https://github.com/ModyQyW/vite-plugin-eslint2/tree/main/docs",
    },
    lastUpdated: true,
    llmsUI: true,
  },
});
