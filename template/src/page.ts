export function page(title: string, content: string, json: string = "") {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <script src="/assets/js/client.js" defer></script>
    <script type="application/json" id="bootstrap-data">${json}</script>
  </head>
  <body>${content}</body>
</html>`;
}
