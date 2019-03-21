import { match } from "./request-match";

class MockRequest {
  public url: string;
  public method: string;

  public constructor(url: string, options: { method: string }) {
    this.url = url;
    this.method = options.method;
  }
}

test("match on path and method", () => {
  const request = new MockRequest("https://postlight.com/favicon.ico", {
    method: "GET"
  });
  const route0 = match(request as Request, "*", "/favicon.ico");
  expect(route0).toBeTruthy();
  const route1 = match(request as Request, "GET", "/favicon.ico");
  expect(route1).toBeTruthy();
  const route2 = match(request as Request, "OPTIONS", "/favicon.ico");
  expect(route2).toBeUndefined();
  const route3 = match(request as Request, "GET", "/");
  expect(route3).toBeUndefined();
});

test("parse url params", () => {
  const request = new MockRequest("https://postlight.com/user/123xyz", {
    method: "GET"
  });
  const route = match(request as Request, "get", "/user/:id");
  if (route) {
    expect(route.params.id).toBe("123xyz");
  } else {
    throw new Error("No match found");
  }
});
