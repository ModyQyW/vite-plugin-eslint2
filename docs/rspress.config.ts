import path from "node:path";
import { defineConfig, type UserConfig } from "@rspress/core";

const siteOrigin = "https://vite-plugin-eslint2.modyqyw.top";

// `siteOrigin` turns the sitemap `<loc>`, the hreflang links and the llms.txt
// entries into absolute URLs; Rspress leaves all three relative without it.
//
// Rspress 2 writes no canonical link, so it goes here per route. Keep
// `description`, `og:description`, `og:title` and `og:type` out of this array:
// the Layout skips its own page-level tags for any name it finds here, and every
// page would inherit the site description.
const seoHead: NonNullable<UserConfig["head"]> = [
  (route) => [
    "link",
    { rel: "canonical", href: `${siteOrigin}${route.routePath}` },
  ],
  (route) => [
    "meta",
    { property: "og:url", content: `${siteOrigin}${route.routePath}` },
  ],
  ["meta", { property: "og:site_name", content: "vite-plugin-eslint2" }],
  ["meta", { property: "og:image", content: `${siteOrigin}/og-image.png` }],
  ["meta", { property: "og:image:width", content: "1200" }],
  ["meta", { property: "og:image:height", content: "630" }],
  [
    "meta",
    {
      property: "og:image:alt",
      content: "vite-plugin-eslint2 — ESLint inside your Vite dev server",
    },
  ],
  ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ["meta", { name: "twitter:image", content: `${siteOrigin}/og-image.png` }],
];

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
    ...seoHead,
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
