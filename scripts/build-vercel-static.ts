import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { allLocales } from "./locale.js";

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
const basePath = new URL(baseUrl).pathname.replace(/\/+$/, "");
const locale = process.env.KEYBR_LOCALE ?? "en";
const color = process.env.KEYBR_COLOR ?? "system";
const font = process.env.KEYBR_FONT ?? "open-sans";
const siteTitle = "kanabr - Japanese kana practice";
const siteDescription =
  "Practice Japanese hiragana and katakana with adaptive lessons and romaji input. Static mode stores progress locally in your browser.";
const siteName = "kanabr";

const rtlLocales = new Set(["ar", "fa", "he"]);
const sitemapPaths = [
  "/",
  "/help",
  "/profile",
  "/account",
  "/high-scores",
  "/multiplayer",
  "/privacy-policy",
  "/terms-of-service",
] as const;

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

for (const file of ["502.html", "cover.png", "favicon.ico"]) {
  await copyOptional(join(publicDir, file), join(distDir, file));
}

const manifest: ManifestJson = JSON.parse(
  await readFile(join(distAssetsDir, "manifest.json"), "utf-8"),
);

const html = renderIndexHtml({ manifest, baseUrl, locale });
await writeFile(join(distDir, "index.html"), html, "utf-8");
await writeFile(join(distDir, "404.html"), html, "utf-8");
await writeFile(join(distDir, ".nojekyll"), "", "utf-8");

// Directory entrypoints let Pages serve direct links with HTTP 200.
// Keep 404.html as the SPA fallback for dynamic or unknown routes.
for (const prefix of ["", ...allLocales.map((value) => `/${value}`)]) {
  for (const path of sitemapPaths) {
    const route = prefix + (path === "/" ? "" : path);
    if (route !== "") {
      const directory = join(distDir, route.slice(1));
      await mkdir(directory, { recursive: true });
      await writeFile(join(directory, "index.html"), html, "utf-8");
    }
  }
}
await writeFile(join(distDir, "robots.txt"), renderRobotsTxt(baseUrl), "utf-8");
await writeFile(
  join(distDir, "sitemap.xml"),
  renderSitemapXml(baseUrl),
  "utf-8",
);

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
  const canonical = baseUrl;
  const coverUrl = new URL("cover.png", baseUrl).href;

  const head = [
    `<meta charset="UTF-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>${escapeHtmlText(siteTitle)}</title>`,
    `<meta name="description" content="${escapeHtmlAttr(siteDescription)}">`,
    `<link rel="canonical" href="${escapeHtmlAttr(canonical)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${escapeHtmlAttr(siteName)}">`,
    `<meta property="og:title" content="${escapeHtmlAttr(siteTitle)}">`,
    `<meta property="og:description" content="${escapeHtmlAttr(
      siteDescription,
    )}">`,
    `<meta property="og:url" content="${escapeHtmlAttr(canonical)}">`,
    `<meta property="og:image" content="${escapeHtmlAttr(coverUrl)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
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

function renderRobotsTxt(baseUrl: string): string {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /auth/",
    "Disallow: /login/",
    "Disallow: /_/",
    `Sitemap: ${new URL("sitemap.xml", baseUrl).href}`,
    "",
  ].join("\n");
}

function renderSitemapXml(baseUrl: string): string {
  const urls = sitemapPaths
    .map((path) => {
      const loc = path === "/" ? baseUrl : new URL(path.slice(1), baseUrl).href;
      return ["  <url>", `    <loc>${escapeXml(loc)}</loc>`, "  </url>"].join(
        "\n",
      );
    })
    .join("\n");
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    urls,
    `</urlset>`,
    "",
  ].join("\n");
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
  const path = basePath + name;
  return manifest.assets[path] ?? path;
}

function escapeHtmlAttr(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function escapeHtmlText(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
