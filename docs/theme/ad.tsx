import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** Google AdSense unit rendered below the page outline. */
const Ad = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // AdSense only fills the <ins> once its script pushes it, which needs a
  // browser; the server-rendered HTML ships an empty placeholder.
  useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = "(adsbygoogle = window.adsbygoogle || []).push({});";
    containerRef.current?.append(script);
  }, []);

  return (
    <div className="google-ads" ref={containerRef}>
      <ins
        className="adsbygoogle"
        data-ad-client="ca-pub-3102250747488251"
        data-ad-format="auto"
        data-ad-slot="3708961821"
        data-full-width-responsive="true"
        style={{ display: "block" }}
      />
    </div>
  );
};

export default Ad;
