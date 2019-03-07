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
  const { html } = await htmlString("url.pathname");
  return new Response(page("Worker App", html), {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}

// Render app as a string
async function htmlString(path: string) {
  return { html: render(<App />) };
}
