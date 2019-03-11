const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const spawn = require("cross-spawn");
const mapLimit = require("async/mapLimit");
const S3 = require("aws-sdk/clients/s3");
const fetch = require("node-fetch");
const build = require("./build");

const s3 = new S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: process.env.AWS_REGION
});
const bucket = process.env.BUCKET;

(async () => {
  // build
  await npm("install");
  const files = await build();

  // copy files to s3
  await Promise.all([
    s3UploadDirectory(path.join(__dirname, "../dist")),
    s3UploadDirectory(path.join(__dirname, "../assets"))
  ]);

  // update metadata
  const jsFiles = files.client.filter(filename => /\.js$/.test(filename));
  const cssFiles = files.client.filter(filename => /\.css$/.test(filename));
  const metadataJson = metadata(jsFiles, cssFiles);

  // update worker
  const scriptPath = path.resolve(__dirname, "../dist", files.worker[0]);
  const script = fs.readFileSync(scriptPath, "utf8");
  updateWorker(script, metadataJson);
})();

function npm(...commands) {
  return new Promise((resolve, reject) => {
    const proc = spawn("npm", ...commands, { stdio: "inherit" });
    proc.on("close", code => {
      if (code === 0) return resolve();
      reject(`Error running npm command - ${code}`);
    });
  });
}

function metadata(jsFiles, cssFiles, namespaces) {
  const data = {
    body_part: "script",
    bindings: [
      {
        name: "JS_FILES",
        type: "secret_text",
        text: jsFiles.join(";")
      },
      {
        name: "CSS_FILES",
        type: "secret_text",
        text: cssFiles.join(";")
      }
    ]
  };

  if (namespaces) {
    data.bindings = data.bindings.concat(
      namespaces.map(ns => ({
        name: ns.name,
        type: "kv_namespace",
        namespace_id: ns.id
      }))
    );
  }

  return JSON.stringify(data);
}

function s3UploadDirectory(dir) {
  return new Promise((resolve, reject) => {
    const files = fileList(dir);
    mapLimit(
      files,
      10,
      async ({ src, dest }) => await upload(src, dest, bucket),
      (err, contents) => {
        if (err) return reject(err);
        console.log("Files uploaded to S3");
        console.log("-----------------------------------------");
        console.log(contents.map(obj => `* ${obj}`).join("\n"));
        console.log("");
        resolve();
      }
    );
  });
}

// gather flat list of files in directory tree - { src, dest }
function fileList(dir) {
  const output = [];
  const ls = (srcDir, destDir) => {
    const filenames = fs.readdirSync(srcDir);
    filenames.forEach(name => {
      if (name.startsWith(".")) return;
      const src = path.join(srcDir, name);
      const stats = fs.statSync(src);
      if (stats.isDirectory()) {
        ls(src, `${destDir}${name}/`);
      } else if (stats.isFile()) {
        output.push({ src, dest: `${destDir}${name}` });
      }
    });
  };
  ls(dir, "");
  return output;
}

function upload(src, dest, bucket) {
  const buff = fs.readFileSync(src);
  return new Promise((resolve, reject) => {
    s3.upload(
      {
        ACL: "public-read",
        Body: buff,
        Bucket: bucket,
        CacheControl: "public, max-age=31536000",
        ContentType: contentType(path.extname(src)),
        Expires: oneYear(),
        Key: dest
      },
      (err, data) => {
        if (err) return reject(err);
        resolve(data.Location);
      }
    );
  });
}

function contentType(ext) {
  const types = {
    css: "text/css",
    gif: "image/gif",
    html: "text/html",
    ico: "image/x-icon",
    jpeg: "image/jpg",
    jpg: "image/jpg",
    js: "application/x-javascript",
    json: "application/json",
    map: "application/json",
    png: "image/png",
    svg: "image/svg+xml",
    txt: "text/plain",
    xml: "application/xml"
  };
  return types[ext] || "application/octet-stream";
}

function oneYear() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.getTime();
}

async function updateWorker(script, metadata) {
  const cfApi = "https://api.cloudflare.com/client/v4";
  const zoneId = process.env.CF_ZONE_ID;
  const email = process.env.CF_EMAIL;
  const key = process.env.CF_KEY;
  const form = new FormData();
  form.append("script", script);
  form.append("metadata", metadata);
  try {
    const response = await fetch(`${cfApi}/zones/${zoneId}/workers/script`, {
      method: "PUT",
      body: form,
      headers: {
        "X-Auth-Email": email,
        "X-Auth-Key": key
      }
    });
    if (response.ok) {
      console.log(`Worker deployed at ${new Date().toISOString()}`);
    } else {
      console.error("Worker deploy to CF failed:", response.statusText);
    }
  } catch (err) {
    console.error("Worker deploy to CF failed", err);
  }
}
