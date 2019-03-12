import { h } from "preact";
import { render } from "preact-render-to-string";
import { page } from "./page";
import { App } from "./components/app";

// Handle all requests hitting the worker
addEventListener("fetch", (e: Event) => {
  const fe = e as FetchEvent;
  fe.respondWith(router(fe.request));
});

async function router(request: Request) {
  const url = new URL(request.url);
  const segments = url.pathname.split("/");

  // First, check if request is for static asset. If so, send request on to
  // origin, the add a cache header to the response.
  if (segments[1] && segments[1] === "assets") {
    const assetRes = await fetch(request);
    const response = new Response(assetRes.body, assetRes);
    // response.headers.set("cache-control", "public, max-age=31536000");
    return response;
  }

  // Render page
  let scripts;
  let stylesheets;
  const { html } = await htmlString();
  if (JS_FILES) {
    scripts = JS_FILES.split(" ");
  }
  if (CSS_FILES) {
    stylesheets = CSS_FILES.split(" ");
  }
  const renderedPage = page({
    title: "Worker App",
    content: html,
    scripts,
    stylesheets
  });
  return new Response(renderedPage, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}

// Render app as a string
async function htmlString() {
  return { html: render(<App />) };
}

// Worker bindings defined in metadata.js
declare const JS_FILES: string | undefined;
declare const CSS_FILES: string | undefined;
