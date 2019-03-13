interface PageInit {
  title: string;
  content: string;
  scripts?: string[];
  stylesheets?: string[];
  json?: string;
}

export function page({
  title,
  content,
  scripts = [],
  stylesheets = [],
  json = ""
}: PageInit): string {
  const scriptTags = scripts
    .map(script => `<script src="/assets/${script}" defer></script>`)
    .join("\n");
  const linkTags = stylesheets
    .map(
      sheet => `<link rel="stylesheet" type="text/css" href="/assets/${sheet}">`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    ${scriptTags}
    <script type="application/json" id="bootstrap-data">${json}</script>
    ${linkTags}
  </head>
  <body>${content}</body>
</html>`;
}
