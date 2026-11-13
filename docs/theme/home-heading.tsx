import { useFrontmatter } from "@rspress/core/runtime";

/**
 * Rspress renders the home hero brand in a `<div>`, which leaves the landing
 * page without an `<h1>`. This puts a real one above the hero; `index.css` hides
 * the duplicate div so the brand still shows once.
 *
 * Only reached on `pageType: home`, because the layout passes `beforeHero` to
 * the home layout alone.
 */
const HomeHeading = () => {
  const { frontmatter } = useFrontmatter();
  const name = frontmatter.hero?.name;

  if (!name) {
    return null;
  }

  return (
    <h1 className="rp-home-h1">
      <span className="rp-home-h1__brand">{name}</span>
    </h1>
  );
};

export default HomeHeading;
