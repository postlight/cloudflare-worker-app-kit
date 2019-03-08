const path = require("path");
const Bundler = require("parcel-bundler");

console.time("Build complete");

const entries = [
  path.join(__dirname, "../src", "client.tsx"),
  path.join(__dirname, "../src", "worker.tsx")
];
const bundler = new Bundler(entries, {
  contentHash: true,
  logLevel: 2,
  minify: true,
  publicUrl: "/assets/js",
  watch: false
});

(async () => {
  const bun = await bundler.bundle();
  console.timeEnd("Build complete");
  bun.childBundles.forEach(child => {
    const file = `dist/${path.basename(child.name)}`;
    const size = `${Math.round(child.totalSize / 1024)}KB`;
    console.log(`* ${file} - ${size}`);
  });
  console.log("");
})();
