# cloudflare-worker-app-kit

A handy set of tools for creating, developing, testing, and deploying a [Cloudflare Worker app](https://www.cloudflare.com/products/cloudflare-workers/). No configuration, just build it and ship it.

## Get started

```bash
npx cloudflare-worker-app-kit create YourAppName
```

This `create` command scaffolds your project with the following:

- [Project structure](#project-structure), including source files, so you can see how everything fits together.
- [Development tools](#dev-tools) are all setup — local dev server, TypeScript, webpack, Prettier, ESLint, and Jest.
- [Build and deploy](#build-and-deploy) scripts. Provide the necessary environment variables and run the commands to ship your app to 150+ locations around the world.

## How the app works

Like any server-side rendered app this runs in two environments — [client](src/client.ts) and [worker](src/worker.ts). The client entry point is typical of most single-page, JavaScript applicatons where the root component is rendered into a container on the page. 

The worker entry points is where things are a little different.
[TODO: DETAILS HERE]

That's it, no origin server. Just some files on S3 and a little JS to handle requests. The result is a fast, server-rendered web app that can handle 10 million requests for $5 — not bad!

### Project structure

```
# Static assets will be served by worked from S3
assets/
 └─ images/

# Build configuration
config/
 ├─ webpack.client.js
 └─ webpack.worker.js

# Scripts for dev, build, and deploy
scripts/
 ├─ build.js
 ├─ deploy.js
 └─ start.js

# App files
src/
 ├─ components/
 ├─ client.ts
 └─ worker.ts
```

After you build the app there will also be `dist` directory where you'll find JS and CSS bundles along with their associated source maps.

### Environment variables
You'll need to set these environment variables to deploy the app. If you're using the optional `CF_KV_NAMESPACES` or `CF_WORKER_BINDINGS`, they'll need to be set in your local dev environment as well. If you're not sure where to find these values, there's [more info below](#setup-cloudflare-and-s3).

```bash
# Required
BUCKET=bucket-name
AWS_KEY=XXXACCESSKEYXXX
AWS_SECRET=XXXXXXXXXSECRETXXXXXXXXX
AWS_REGION=us-east-1
CF_ZONE_ID=XXXXXXXXXWORKERZONEIDXXXXXXXXX
CF_KEY=XXXXCLOUDFLAREAUTHKEYXXXX
CF_EMAIL=account@email.com

# Optional
CF_KV_NAMESPACES="NAME XXXXXXXXXNAMESPACEIDXXXXXXXXX"
CF_WORKER_BINDINGS="KEY value"
```

### Dev tools
```bash
npm start
```

```bash
npm test
```

```bash
npm lint
```


### Build and deploy
```bash
npm build
```

```bash
npm deploy
```

## Setup Cloudflare and S3
[TODO: Steps to follow with cli commands to use]