import { h } from "preact";
import { render } from "preact-render-to-string";
import { page } from "./page";
import { match } from "./lib/request-match";
import { App } from "./components/app";

// Worker bindings defined in metadata.js
declare const JS_FILES: string | undefined;
declare const CSS_FILES: string | undefined;

// Handle all requests hitting the worker
addEventListener("fetch", (e: Event) => {
  const fe = e as FetchEvent;
  fe.respondWith(router(fe.request));
});

async function router(request: Request): Promise<Response> {
  try {
    // Check if request is for static asset. If so, send request on to origin,
    // then add a cache header to the response.
    const staticRoute = match(request, "get", "/assets/*");
    if (staticRoute) {
      const assetRes = await fetch(request);
      const response = new Response(assetRes.body, assetRes);
      response.headers.set("cache-control", "public, max-age=31536000");
      return response;
    }

    // Check for favicon request and fetch from static assets
    const faviconRoute = match(request, "get", "/favicon.ico");
    if (faviconRoute) {
      faviconRoute.url.pathname = "/assets/images/favicon.ico";
      return fetch(faviconRoute.url.toString());
    }

    // Render page
    let scripts;
    let stylesheets;
    const { html } = await serverRender();
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
  } catch (err) {
    return new Response("Internal Server Error", {
      status: 500,
      statusText: err
    });
  }
}

interface RenderResult {
  html: string;
}

// Render app as a string
async function serverRender(): Promise<RenderResult> {
  return { html: render(<App />) };
}
