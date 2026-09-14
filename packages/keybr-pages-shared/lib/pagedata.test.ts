import { test } from "node:test";
import { equal } from "rich-assert";
import { getPageData } from "./pagedata.tsx";
import { getBasePath, localeFromPathname, stripBasePath } from "./paths.ts";
import { type PageData } from "./types.ts";

test("detect the locale inside the deployment directory", () => {
  const scope = globalThis as any;
  const previousData = scope.__PAGE_DATA__;
  const previousPath = window.location.href;
  const pageData: PageData = {
    base: "https://www.keybr.com/kanabr/",
    locale: "ja",
    user: null,
    publicUser: { id: null, name: "Anonymous", imageUrl: null },
    settings: null,
  };
  scope.__PAGE_DATA__ = pageData;
  try {
    for (const [path, locale] of [
      ["/kanabr/zh-hans/profile", "zh-hans"],
      ["/kanabr/en/help/", "en"],
      ["/kanabr/profile", "ja"],
      ["/kanabr/ja/", "ja"],
      ["/kanabr/%zz/", "ja"],
    ]) {
      window.history.replaceState(null, "", path);
      equal(getPageData().locale, locale);
      equal(getPageData().base, pageData.base);
    }

    // Root deployments still detect an explicit locale.
    scope.__PAGE_DATA__ = { ...pageData, base: "https://www.keybr.com/" };
    window.history.replaceState(null, "", "/en/help");
    equal(getPageData().locale, "en");
  } finally {
    scope.__PAGE_DATA__ = previousData;
    window.history.replaceState(null, "", previousPath);
  }
});

test("separate deployment paths from locale prefixes at segment boundaries", () => {
  equal(getBasePath("https://example.com/"), "");
  const basePath = getBasePath("https://example.com/projects/kanabr/");
  equal(basePath, "/projects/kanabr");
  equal(stripBasePath("/projects/kanabr", basePath), "/");
  equal(stripBasePath("/projects/kanabr/", basePath), "/");
  equal(
    stripBasePath("/projects/kanabr-other/en", basePath),
    "/projects/kanabr-other/en",
  );
  equal(
    localeFromPathname(
      stripBasePath("/projects/kanabr/zh-hans/help/", basePath),
    ),
    "zh-hans",
  );
  equal(localeFromPathname("/en/help"), "en");
  equal(localeFromPathname("/help/"), null);
  equal(localeFromPathname("/%zz/"), null);
});
