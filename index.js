#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const pkgJson = require("./package.json");
const { Command } = require("commander");
const slugify = require("slugify");
const spawn = require("cross-spawn");

const program = new Command(pkgJson.name)
  .version(pkgJson.version)
  .usage("create <app-name>");
program
  .command("create <app-name>")
  .description("Creates a Worker app in sub-directory with provided name")
  .action(create);
program.parse(process.argv);

async function create(name) {
  // Create valid package slug
  const fullName = name.trim();
  const slug = slugify(fullName, {
    lower: true,
    remove: /[*~()'!]/g
  }).replace(/^[._]/, "");

  console.log(`
Creating new Cloudflare Worker app
----------------------------------
Name:    ${fullName}
Package: ${slug}
`);

  // Generate files from template
  const targetDir = path.join(process.cwd(), fullName);
  try {
    copyFiles(path.join(__dirname, "./template"), targetDir);
  } catch (err) {
    console.error("Error creating project:", err);
  }

  // Generate package.json and readme
  try {
    writePackageJson(slug, targetDir);
    writeReadme(fullName, targetDir);
  } catch (err) {
    console.error("Error creating package.json file:", err);
  }

  // npm install
  try {
    console.log(`
Installing dependencies...
`);
    await Promise.all([
      install(
        targetDir,
        false,
        "preact",
        "preact-render-to-string@4.1.0",
        "url-pattern"
      ),
      install(
        targetDir,
        true,
        "@dollarshaveclub/cloudworker",
        "@typescript-eslint/eslint-plugin",
        "@typescript-eslint/parser",
        "acorn",
        "async",
        "aws-sdk",
        "cross-spawn",
        "css-loader",
        "eslint-config-prettier",
        "eslint-plugin-jest",
        "eslint-plugin-prettier",
        "eslint-plugin-react",
        "eslint",
        "form-data",
        "mini-css-extract-plugin",
        "node-fetch",
        "null-loader",
        "prettier",
        "serve-static",
        "style-loader",
        "ts-loader",
        "typescript",
        "webpack-dev-middleware",
        "webpack"
      )
    ]);
  } catch (err) {
    console.error(err);
  }

  console.log(`
All set! Here's what you do next
--------------------------------

1. Move into your new project directory:
   cd ${fullName}

2. Start the development server:
   npm start

3. Build your app! You'll find some code to get you started in the src folder.


Other commands that are ready to go
-----------------------------------
Lint:   npm run lint
Test:   npm run test
Build:  npm run build
Deploy: npm run deploy
`);
}

function copyFiles(srcDir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }
  const filenames = fs.readdirSync(srcDir);
  filenames.forEach(name => {
    const filepath = path.join(srcDir, name);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      copyFiles(filepath, path.join(targetDir, name));
    } else if (stats.isFile()) {
      fs.copyFileSync(filepath, path.join(targetDir, name));
    }
  });
}

function writePackageJson(name, targetDir) {
  const pkg = {
    name,
    version: "1.0.0",
    description: "Cloudflare Worker app",
    scripts: {
      build: "node scripts/build.js",
      deploy: "node scripts/deploy.js",
      lint: "eslint --ext .js,.ts,.tsx ./src",
      start: "node scripts/start.js",
      test: "jest"
    }
  };

  fs.writeFileSync(
    path.join(targetDir, "package.json"),
    JSON.stringify(pkg, null, 2) + os.EOL
  );
}

function install(target, isDev, ...deps) {
  return new Promise((resolve, reject) => {
    const saveArg = isDev ? "--save-dev" : "--save";
    const args = ["install", saveArg, "--save-exact", "--silent"];
    const proc = spawn("npm", args.concat(deps), {
      cwd: target,
      stdio: "inherit"
    });
    proc.on("close", code => {
      if (code === 0) return resolve();
      reject(`Problem installing dependencies: code ${code}`);
    });
  });
}

function writeReadme(name, targetDir) {
  let readme = fs.readFileSync(
    path.resolve(__dirname, "readme-template.txt"),
    "utf8"
  );
  readme = readme.replace("${PROJECT_NAME}", name);
  fs.writeFileSync(path.join(targetDir, "README.md"), readme);
}
