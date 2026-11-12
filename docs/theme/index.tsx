import { Layout as BasicLayout } from "@rspress/core/theme-original";
import Ad from "./ad";

// The AdSense slot sits below the page outline, where the default layout has
// spare vertical space.
const Layout = () => <BasicLayout afterOutline={<Ad />} />;

export * from "@rspress/core/theme-original";
export { Layout };
