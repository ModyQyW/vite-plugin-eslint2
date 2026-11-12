import path from "node:path";
import { defineConfig } from "@rspress/core";

export default defineConfig({
  lang: "en",
  title: "vite-plugin-eslint2",
  description: "ESLint plugin for Vite.",
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
      description: "Vite 的 ESLint 插件。",
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
