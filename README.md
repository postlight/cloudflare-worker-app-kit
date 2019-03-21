# cloudflare-worker-app-kit

A handy set of tools for creating, developing, testing, and deploying a [Cloudflare Worker app](https://developers.cloudflare.com/workers/about/). No configuration, just build it and ship it.

### Demo

A real app built with these tools — [secretmsg.app](https://secretmsg.app) ([repo](https://github.com/postlight/secretmsg)).

## Get started

```bash
npx @postlight/cloudflare-worker-app-kit create <AppName>
```

This `create` command scaffolds your project with the following:

- [Project structure](#project-structure), including source files, so you can see how everything fits together.
- [Development tools](#dev-tools) are all setup — local dev server, [TypeScript](https://www.typescriptlang.org/), webpack, [Prettier](https://prettier.io/), [ESLint](https://eslint.org/), and [Jest](https://jestjs.io/).
- [Build and deploy](#build-and-deploy) scripts. Provide the necessary environment variables and run the commands to ship your app to Cloudflare's 150+ locations around the world.

## How the app works

Like any server-side rendered app this runs in two environments — [client](src/client.ts) and [worker](src/worker.ts). The client entry point is typical of most single-page, JavaScript applications. The root component is rendered into a container on the page, and in this case, nothing happens since the page was delivered fully-rendered.

The worker entry point is where things are a little different.
Instead of sending the request all the way back to a Node.js server running in a central location, a quick-to-start Worker sitting in front of Cloudflare's cache handles the request. If it's a request for a static asset, like an image or JavaScript file, we fetch it from the cache or S3 like we normally would. If it's for a page, we render the app, delivering all the html. With all this happening at the edge, your user gets great response times no matter where they're located.

That's it, no origin server to worry about. Just some files on S3 and a little JS distributed around the world. The result is a fast, server-rendered web app that can handle 10 million requests per month for \$5 — not bad!

### Project structure

```
# Static assets will be copied to S3 and served by the worker
assets/
 └─ images/

# Scripts for build, deploy, and the dev server
scripts/
 ├─ build.js
 ├─ deploy.js
 └─ start.js

# App files
src/
 ├─ components/
 ├─ lib/
 ├─ client.ts
 └─ worker.ts
```

After you build the app there will also be `dist` directory where you'll find JS and CSS bundles along with their associated source maps. During deploys those files get copied to S3 along with your other assets.

### Environment variables

These environment variables are required to deploy the app. If you're not sure where to find these values, there's [more info below](#setup-cloudflare-and-s3).

```bash
BUCKET=bucket-name
AWS_KEY=XXXACCESSKEYXXX
AWS_SECRET=XXXXXXXXXSECRETXXXXXXXXX
AWS_REGION=us-east-1
CF_ZONE_ID=XXXXXXXXXWORKERZONEIDXXXXXXXXX
CF_KEY=XXXXCLOUDFLAREAUTHKEYXXXX
CF_EMAIL=account@email.com
```

If you want to use [Workers KV](https://developers.cloudflare.com/workers/kv/) you'll need the `CF_KV_NAMESPACES` environment variable during development and when you deploy.

```bash
# single KV namespace
CF_KV_NAMESPACES="NAME XXXXXXXXXNAMESPACEIDXXXXXXXXX"

# multiple namespace are supported, separate with a comma
CF_KV_NAMESPACES="NS_1 XXXXXXXNAMESPACEIDXXXXXXX, NS_2 XXXXXXXNAMESPACEIDXXXXXXX"
```

Similarly, you can bind other strings with `CF_WORKER_BINDINGS`

```bash
CF_WORKER_BINDINGS="KEY_1 value1, KEY_2 value2"
```

### Dev tools

The local dev environment consists of two servers. One delivers static assets using [webpack middleware](https://github.com/webpack/webpack-dev-middleware), basically standing in for S3. The other wraps [Cloudworker](https://github.com/dollarshaveclub/cloudworker) — a mock implementation of Cloudflare Workers. It loads the worker.js bundle and handles requests just like a worker would.

```bash
# Start a dev server at http://localhost:3333
npm start
```

Colocate test files with your source files with a `.test.ts` extension, and Jest will do the rest.

```bash
# Run jest tests
npm test
```

You know the drill, ESlint is here to keep you honest.

```bash
# Check source files for common errors
npm run lint
```

### Build and deploy

Using webpack, this script creates production-ready bundles for the client, worker and any css you imported into you components. If you're going to use the `deploy` script below, don't worry about this. It will run its own fresh build anyway.

```bash
# Output production-ready JS & CSS bundles in dist folder
npm run build
```

First, dependencies are installed and a fresh build is made. Then all the static files are copied to your S3 bucket Finally, the new worker script, along with some metadata, is deployed to Cloudflare.

```bash
# Build files, copy static assets to S3, and deploy worker to Cloudflare
npm run deploy
```

## Setup Cloudflare and S3

Two things need to happen before you can deploy. Get Cloudflare in front of your domain and setup an S3 bucket to serve static files to the public.

### Cloudflare

1. If you don't have a domain setup with Cloudflare, [step 2](https://support.cloudflare.com/hc/en-us/articles/201720164-Step-2-Create-a-Cloudflare-account-and-add-a-website) and [step 3](https://support.cloudflare.com/hc/en-us/articles/205195708) of their [_Getting Started_](https://support.cloudflare.com/hc/en-us/categories/200275218-Getting-Started) guide is a good place to start.
2. [Visit your Cloudflare dashboard](https://dash.cloudflare.com/) to turn on workers.
3. In the Workers tab, launch the workers editor then go to the routes section on the left. These routes filter what requests will be handled by the worker, something like `example.net/*` is a good place to start. All requests to your domain will go through the worker. If you're familiar with curl, you can [do all of this from the command-line](https://api.cloudflare.com/#worker-filters-create-filter).
4. If you want to play with the worker editor, it's a nice way to see some immediate results. There are also some handy debugging tools that might be helpful later on.
5. Before finishing, now's a good time to gather some environment variable values — `CF_ZONE_ID` and `CF_KEY`. Zone ID is on the dashboard overview page in the right column. For the API key, visit your user profile page, scroll to the bottom and copy the **Global API Key**.

### AWS S3

One way to handle this is to treat your S3 bucket like a static web server. You give it a name that matches your domain, like `example.net` and change your Cloudflare DNS settings to point at that bucket. If you haven't done this before, here's a good [step-by-step explanation](https://medium.freecodecamp.org/how-to-host-a-website-on-s3-without-getting-lost-in-the-sea-e2b82aa6cd38).

You can also name the bucket anything you want, leaving the DNS settings alone. You would then handle all the routing in the worker, like [this](https://developers.cloudflare.com/workers/recipes/static-site/).

While setting up your bucket, you should also gather some environment variable values for `BUCKET`, `AWS_KEY`, `AWS_SECRET`, and `AWS_REGION`. For the AWS credentials you should setup a user with [read and write access](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_s3_rw-bucket-console.html) to the new bucket.

---

🔬 A Labs project from your friends at [Postlight](https://postlight.com/labs)
