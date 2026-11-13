import { usePage } from "@rspress/core/runtime";

const SITE_ORIGIN = "https://vite-plugin-eslint2.modyqyw.top";
const REPOSITORY = "https://github.com/ModyQyW/vite-plugin-eslint2";

/**
 * JSON-LD for the pages that can use it: the landing page describes the package,
 * every other page gets a breadcrumb trail.
 *
 * Mounted through the layout's `top` slot, which Rspress skips when rendering
 * Markdown, so the `.md` pages stay free of markup.
 */
const StructuredData = () => {
  const { page } = usePage();
  const url = `${SITE_ORIGIN}${page.routePath}`;

  const data =
    page.pageType === "home"
      ? {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "vite-plugin-eslint2",
          description: page.description,
          url,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Node.js",
          programmingLanguage: "TypeScript",
          license: "https://opensource.org/license/mit",
          codeRepository: REPOSITORY,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }
      : {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: page.lang === "zh" ? "首页" : "Home",
              item: `${SITE_ORIGIN}/`,
            },
            { "@type": "ListItem", position: 2, name: page.title, item: url },
          ],
        };

  return <script type="application/ld+json">{JSON.stringify(data)}</script>;
};

export default StructuredData;
