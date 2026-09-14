import { allLocales, type LocaleId } from "@keybr/intl";

/** The deployment directory, without a trailing slash. */
export function getBasePath(base: string): string {
  return new URL(base).pathname.replace(/\/+$/, "");
}

export function stripBasePath(pathname: string, basePath: string): string {
  if (pathname === basePath) {
    return "/";
  }
  return pathname.startsWith(basePath + "/")
    ? pathname.slice(basePath.length)
    : pathname;
}

/** Read the locale after removing the deployment directory. */
export function localeFromPathname(pathname: string): LocaleId | null {
  const m = /^\/([^/]+)(?:\/|$)/.exec(pathname);
  if (m == null) {
    return null;
  }
  try {
    const segment = decodeURIComponent(m[1]).toLowerCase();
    return allLocales.includes(segment) ? segment : null;
  } catch {
    return null;
  }
}
