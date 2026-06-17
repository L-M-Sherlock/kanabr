# Getting Started

kanabr is a Node.js monorepo. The recommended way to run it is the static SPA
build, which does not require a server database.

## Prerequisites

Node.js 24 or newer is recommended.

With nvm:

```shell
nvm install 24
nvm use 24
```

## Static Mode

Clone this repository:

```shell
git clone https://github.com/L-M-Sherlock/kanabr.git
cd kanabr
```

Install dependencies:

```shell
npm install
```

Build the static output:

```shell
npm run build-vercel
```

Preview it locally:

```shell
npx serve -s vercel-dist
```

The generated `vercel-dist/` directory includes `index.html`, `404.html`,
`sitemap.xml`, `robots.txt`, and hashed assets. Configure static hosts so direct
client-side routes fall back to `index.html` or `404.html`.

## Development

Compile, build, and test:

```shell
npm run compile
npm run build-dev
npm run test
```

For active development, run the server and watcher in separate shells:

```shell
npm start
npm run watch
```

## Server Mode

Use server mode only when you need accounts, public profiles, high scores,
multiplayer, sync, email login, OAuth, ads, or checkout.

The easiest local server setup uses sqlite:

```shell
cp .env.example .env
./packages/devenv/lib/initdb.ts
npm start
```

With the default config the server is available at
[http://localhost:3000/](http://localhost:3000/).

## Docker

`Dockerfile` and `docker-compose.yaml` are provided for server mode. The
container exposes port 3000 internally. Mount a persistent data directory and an
environment file when you enable server-backed features.
