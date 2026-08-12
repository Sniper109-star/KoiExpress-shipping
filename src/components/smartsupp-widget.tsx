"use client";

import Script from "next/script";

export function SmartsuppWidget() {
  const key = process.env.NEXT_PUBLIC_SMARTSUPP_KEY;

  if (!key) return null;

  return (
    <>
      <Script id="smartsupp-config" strategy="afterInteractive">
        {`window._smartsupp = window._smartsupp || {};
window._smartsupp.key = ${JSON.stringify(key)};
window.smartsupp || (function (d) {
  var s, c, o = window.smartsupp = function () { o._.push(arguments); };
  o._ = [];
  s = d.getElementsByTagName("script")[0];
  c = d.createElement("script");
  c.type = "text/javascript";
  c.charset = "utf-8";
  c.async = true;
  c.src = "https://www.smartsuppchat.com/loader.js?";
  s.parentNode.insertBefore(c, s);
})(document);`}
      </Script>
    </>
  );
}

declare global {
  interface Window {
    _smartsupp?: { key?: string };
    smartsupp?: ((...args: unknown[]) => void) & { _: unknown[] };
  }
}
