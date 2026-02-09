import { allLocales, defaultLocale } from "@keybr/intl";
import { createContext, type ReactNode, useContext } from "react";
import { type AnyUser, type PageData } from "./types.ts";

const pageDataGlobalName = "__PAGE_DATA__";

export function getPageData(): PageData {
  const pageData = (globalThis as any)[pageDataGlobalName] as PageData;
  if (pageData == null) {
    return pageData;
  }
  if (typeof window === "undefined") {
    return pageData;
  }
  const locale = localeFromPathname(window.location.pathname);
  return locale == null || locale === pageData.locale
    ? pageData
    : { ...pageData, locale };
}

export function PageDataScript(): ReactNode {
  const pageDataJson = JSON.stringify(usePageData())
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
  return (
    <script
      id="page-data"
      dangerouslySetInnerHTML={{
        __html: `var ${pageDataGlobalName} = ${pageDataJson};`,
      }}
    />
  );
}

export const PageDataContext = createContext<PageData>(null!);

export function usePageData(): PageData {
  const value = useContext(PageDataContext);
  if (value == null) {
    throw new Error(
      process.env.NODE_ENV !== "production"
        ? "PageDataContext is missing"
        : undefined,
    );
  }
  return value;
}

export function isPremiumUser(user: AnyUser): boolean {
  return user.id != null && user.premium;
}

function localeFromPathname(pathname: string): string | null {
  // Locale is encoded as a leading path segment: `/{locale}/...`.
  // Default locale has no prefix, so if the segment isn't a known locale,
  // do not override the server/build-provided value.
  const m = /^\/([^/]+)(?:\/|$)/.exec(pathname);
  if (m == null) {
    return null;
  }
  const segment = decodeURIComponent(m[1]).toLowerCase();
  if (segment === defaultLocale) {
    return null;
  }
  return allLocales.includes(segment) ? segment : null;
}
