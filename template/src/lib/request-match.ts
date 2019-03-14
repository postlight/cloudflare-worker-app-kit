import * as UrlPattern from "url-pattern";

interface Result {
  params: { [key: string]: string };
  url: URL;
}

export function match(
  request: Request,
  methods: string,
  pattern: string
): Result | void {
  const reqMethod = request.method.toLowerCase();
  const methodList = methods.toLowerCase().split(",");
  if (methods !== "*" && !methodList.includes(reqMethod)) {
    return;
  }

  const url = new URL(request.url);
  const patternMatcher = new UrlPattern(pattern);
  const params = patternMatcher.match(url.pathname);
  if (params == null) {
    return;
  }
  return { params, url };
}
