import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const staging = path.join(root, ".sites-runtime", "pages-project");
const output = path.join(root, "out", "pages");
await rm(staging, { recursive: true, force: true });
await mkdir(path.join(staging, "app"), { recursive: true });

// Build only the public letter. Cloudflare API modules and the private dashboard
// stay in the normal Worker build; GitHub Pages cannot execute them.
for (const file of ["page.tsx", "layout.tsx", "zainab-page.tsx", "globals.css"]) {
  await cp(path.join(root, "app", file), path.join(staging, "app", file));
}
await cp(path.join(root, "vendor"), path.join(staging, "vendor"), { recursive: true });
await cp(path.join(root, "public"), path.join(staging, "public"), { recursive: true });
await cp(path.join(root, "postcss.config.mjs"), path.join(staging, "postcss.config.mjs"));
await writeFile(path.join(staging, "package.json"), JSON.stringify({ name: "ballondor-vote", private: true, type: "module" }));
await writeFile(path.join(staging, "next.config.ts"), `export default { output: "export", images: { unoptimized: true } };\n`);
await writeFile(path.join(staging, "vite.config.ts"), `import vinext from "vinext";\nimport { defineConfig } from "vite";\nexport default defineConfig({ base: "/ballondor-vote/", plugins: [vinext()] });\n`);

execFileSync(path.join(root, "node_modules", ".bin", "vinext"), ["build"], {
  cwd: staging,
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_GITHUB_PAGES: "true" },
});
const html = await readFile(path.join(staging, "dist", "client", "index.html"), "utf8");
if (!html.includes("A prescription") || !html.includes("doesn’t record or send your answer")) {
  throw new Error("The GitHub Pages homepage did not export correctly.");
}
await rm(output, { recursive: true, force: true });
await cp(path.join(staging, "dist", "client"), output, { recursive: true });
await writeFile(path.join(output, ".nojekyll"), "");
console.log("GitHub Pages website built in out/pages; no dashboard key or server code is included.");
