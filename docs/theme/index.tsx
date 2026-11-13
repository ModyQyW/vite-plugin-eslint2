import { Layout as BasicLayout } from "@rspress/core/theme-original";
import HomeHeading from "./home-heading";
import StructuredData from "./structured-data";

// `top` renders on every page type, so the structured data goes there;
// `beforeHero` reaches the home layout only.
const Layout = () => (
  <BasicLayout beforeHero={<HomeHeading />} top={<StructuredData />} />
);

export * from "@rspress/core/theme-original";
export { Layout };
