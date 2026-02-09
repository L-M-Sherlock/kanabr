import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

type ManifestJson = {
  entrypoints: Record<
    string,
    {
      assets: {
        css?: readonly string[];
        js?: readonly string[];
      };
    }
  >;
  assets: Record<string, string>;
};

const cwd = process.cwd();
const publicDir = resolve(cwd, "root", "public");
const srcAssetsDir = resolve(publicDir, "assets");

const distDir = resolve(cwd, process.env.KEYBR_DIST_DIR ?? "vercel-dist");
const distAssetsDir = resolve(distDir, "assets");

const baseUrl = ensureTrailingSlash(
  process.env.KEYBR_BASE_URL ?? "http://localhost:3000/",
);
const locale = process.env.KEYBR_LOCALE ?? "en";
const color = process.env.KEYBR_COLOR ?? "system";
const font = process.env.KEYBR_FONT ?? "open-sans";

const rtlLocales = new Set(["ar", "fa", "he"]);

const favIcons = [
  {
    href: "/assets/favicon-16x16.png",
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
  },
  {
    href: "/assets/favicon-32x32.png",
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
  },
  {
    href: "/assets/favicon-96x96.png",
    rel: "icon",
    type: "image/png",
    sizes: "96x96",
  },
] as const;

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await cp(srcAssetsDir, distAssetsDir, { recursive: true });

for (const file of ["502.html", "cover.png", "favicon.ico", "robots.txt"]) {
  await copyOptional(join(publicDir, file), join(distDir, file));
}

const manifest: ManifestJson = JSON.parse(
  await readFile(join(distAssetsDir, "manifest.json"), "utf-8"),
);

const html = renderIndexHtml({ manifest, baseUrl, locale });
await writeFile(join(distDir, "index.html"), html, "utf-8");

function renderIndexHtml({
  manifest,
  baseUrl,
  locale,
}: {
  readonly manifest: ManifestJson;
  readonly baseUrl: string;
  readonly locale: string;
}): string {
  const entry = manifest.entrypoints.browser?.assets ?? {};
  const css = entry.css ?? [];
  const js = entry.js ?? [];

  const pageData = {
    base: baseUrl,
    locale,
    user: null,
    publicUser: {
      id: null,
      name: "Anonymous",
      imageUrl: null,
    },
    settings: null,
  };

  const pageDataJson = JSON.stringify(pageData)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");

  const dir = rtlLocales.has(locale.toLowerCase()) ? "rtl" : "ltr";

  const head = [
    `<meta charset="UTF-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>Practice</title>`,
    ...favIcons.map((icon) => {
      const href = assetPath(manifest, icon.href);
      const attrs = [
        `rel="${icon.rel}"`,
        `href="${href}"`,
        `type="${icon.type}"`,
        `sizes="${icon.sizes}"`,
      ].join(" ");
      return `<link ${attrs}>`;
    }),
    ...css.map((href) => `<link rel="stylesheet" href="${href}">`),
    `<script id="page-data">var __PAGE_DATA__ = ${pageDataJson};</script>`,
    ...js.map((src) => `<script defer src="${src}"></script>`),
  ].join("");

  const body = `<div id="root"></div>`;

  return `<!DOCTYPE html><html lang="${escapeHtmlAttr(
    locale,
  )}" dir="${dir}" data-color="${escapeHtmlAttr(
    color,
  )}" data-font="${escapeHtmlAttr(
    font,
  )}"><head>${head}</head><body>${body}</body></html>`;
}

async function copyOptional(src: string, dest: string): Promise<void> {
  try {
    await cp(src, dest, { recursive: false });
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      throw err;
    }
  }
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : value + "/";
}

function assetPath(manifest: ManifestJson, name: string): string {
  return manifest.assets[name] ?? name;
}

function escapeHtmlAttr(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}
