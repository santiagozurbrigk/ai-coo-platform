"use client";

import Script from "next/script";

// Extends the global Window interface to type window.fbq without any/ts-ignore.
declare global {
  interface Window {
    fbq: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue: unknown[][];
      push: (...args: unknown[]) => void;
      loaded: boolean;
      version: string;
    };
    _fbq?: Window["fbq"];
  }
}

const RAW_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
// Meta Pixel IDs are numeric strings — validate before injecting into script
const PIXEL_ID = /^\d+$/.test(RAW_PIXEL_ID ?? "") ? RAW_PIXEL_ID : null;

/**
 * Injects the Meta Pixel snippet for the landing pages only.
 * Returns null when NEXT_PUBLIC_META_PIXEL_ID is not set so local/staging
 * environments without the variable stay clean.
 */
export function MetaPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');
fbq('track','PageView');
          `.trim(),
        }}
      />
      {/* Fallback for browsers with JavaScript disabled */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          height={1}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          style={{ display: "none" }}
          width={1}
        />
      </noscript>
    </>
  );
}
