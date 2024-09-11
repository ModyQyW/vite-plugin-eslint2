import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "vite-plugin-eslint2",
  head: [
    // ["link", { rel: "icon", type: "image/png", href: "/logo.png" }],
    ["meta", { name: "og:type", content: "website" }],
    ["meta", { name: "og:locale", content: "en-US" }],
    ["meta", { name: "og:site_name", content: "vite-plugin-eslint2" }],
    // [
    //   "meta",
    //   {
    //     name: "og:image",
    //     content: "/logo.png",
    //   },
    // ],
  ],
  locales: {
    root: {
      lang: "en-US",
      label: "English",
      description: "ESLint plugin for Vite.",
      themeConfig: {
        nav: [
          {
            text: "Guide",
            link: "/guide/getting-started",
            activeMatch: "/guide/",
          },
          {
            text: "Resources",
            items: [
              {
                text: "Changelog",
                link: "https://github.com/ModyQyW/vite-plugin-eslint2/tree/main/CHANGELOG.md",
              },
            ],
          },
        ],
        sidebar: [
          {
            text: "Guide",
            items: [
              { text: "Why?", link: "/guide/why" },
              {
                text: "Getting Started",
                link: "/guide/getting-started",
              },
              {
                text: "Options",
                link: "/guide/options",
              },
              {
                text: "FAQ",
                link: "/guide/faq",
              },
            ],
          },
        ],
      },
    },
    "zh-Hans": {
      lang: "zh-Hans",
      label: "简体中文",
      description: "_description_",
      themeConfig: {
        nav: [
          {
            text: "指南",
            link: "/zh-Hans/guide/getting-started",
            activeMatch: "/zh-Hans/guide/",
          },
          {
            text: "资源",
            items: [
              {
                text: "改动日志",
                link: "https://github.com/ModyQyW/vite-plugin-eslint2/tree/main/CHANGELOG.md",
              },
            ],
          },
        ],
        sidebar: [
          {
            text: "Guide",
            items: [
              { text: "为什么？", link: "/zh-Hans/guide/why" },
              {
                text: "起步",
                link: "/zh-Hans/guide/getting-started",
              },
              {
                text: "选项配置",
                link: "/zh-Hans/guide/options",
              },
              {
                text: "常见问题",
                link: "/zh-Hans/guide/faq",
              },
            ],
          },
        ],
      },
    },
  },
  themeConfig: {
    // logo: { src: "/logo.png", width: 24, height: 24 },
    outline: "deep",
    editLink: {
      pattern:
        "https://github.com/ModyQyW/vite-plugin-eslint2/edit/main/docs/:path",
    },
    lastUpdated: {},
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/ModyQyW/vite-plugin-eslint2",
      },
    ],
    search: {
      provider: "local",
    },
  },
});
