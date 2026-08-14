"use client";

import { MessageCircle } from "lucide-react";
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
      <button
        type="button"
        aria-label="Open live support chat"
        title="Open live support chat"
        onClick={() => window.smartsupp?.("chat:open")}
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary text-primary-foreground shadow-xl transition hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <MessageCircle aria-hidden="true" className="size-6" />
        <span className="sr-only">Open live support chat</span>
      </button>
    </>
  );
}

declare global {
  interface Window {
    _smartsupp?: { key?: string };
    smartsupp?: ((...args: unknown[]) => void) & { _: unknown[] };
  }
}
