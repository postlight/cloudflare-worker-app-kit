import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as spawn from "cross-spawn";
import slugify from "slugify";
import { Command, flags } from "@oclif/command";

export default class Create extends Command {
  static description = "Generate a new Cloudflare Worker app project";

  static flags = {
    help: flags.help({ char: "h" }),
    react: flags.boolean(),
    javascript: flags.boolean()
  };

  static args = [
    { name: "appName", description: "Worker app name", required: true }
  ];

  async run() {
    const { args, flags } = this.parse(Create);

    if (flags.react) {
      this.log("TODO: use react instead of preact");
    }

    if (flags.javascript) {
      this.log("TODO: use plain js instead of ts");
    }

    // create and validate app slug
    const fullName: string = args.appName.trim();
    const slug = slugify(fullName, {
      lower: true,
      remove: /[*~()'!]/g
    }).replace(/^[._]/, "");

    this.log(`Generating new Cloudflare Worker app.`);

    // Generate files from template
    const targetDir = path.join(process.cwd(), fullName);
    try {
      await copyFiles(path.join(__dirname, "../../template"), targetDir);
    } catch (err) {
      console.error("Gen error:", err);
    }

    // Generate package.json
    try {
      writePackageJson(slug, targetDir);
    } catch (err) {
      console.error("Error creating package.json file:", err);
    }

    this.log(`> Installing dependencies`);

    // npm install
    try {
      await Promise.all([
        install(targetDir, false, "preact", "preact-render-to-string"),
        install(
          targetDir,
          true,
          "@dollarshaveclub/cloudworker",
          "parcel-bundler",
          "prettier",
          "serve-static",
          "typescript"
        )
      ]);
    } catch (err) {
      console.error(err);
    }

    this.log(`
All set! Here's what you do next.
================================

1. Move into your new project directory:
   cd ${fullName}

2. Start the development server:
   npm start

3. Build your app! You'll find some code to get you started in the src folder.


Other commands that are ready to go.
===================================
Lint:   npm run lint
Test:   npm run test
Build:  npm run build
Deploy: npm run deploy
`);
  }
}

function writePackageJson(name: string, targetDir: string) {
  const pkg = {
    name,
    version: "1.0.0",
    description: "Cloudflare Worker app",
    scripts: {
      build: "node scripts/build.js",
      deploy: "node scripts/deploy.js",
      lint: "eslint",
      start: "node scripts/start.js",
      test: "jest"
    }
  };

  fs.writeFileSync(
    path.join(targetDir, "package.json"),
    JSON.stringify(pkg, null, 2) + os.EOL
  );
}

async function copyFiles(srcDir: string, targetDir: string) {
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

async function install(target: string, isDev: boolean, ...deps: string[]) {
  return new Promise((resolve, reject) => {
    const saveArg = isDev ? "--save-dev" : "--save";
    const args = ["install", saveArg, "--save-exact", "--loglevel", "error"];
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
