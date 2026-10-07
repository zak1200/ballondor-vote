import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

export const testKey = "test-only-access-key-never-used-outside-tests";

export async function createTestWorker() {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const server = `${root}dist/server/`;
  const files = (await readdir(server, { recursive: true }))
    .filter((file) => file.endsWith(".js") && file !== "index.js");
  const worker = new Miniflare({
    modulesRoot: server,
    modules: ["index.js", ...files].map((file) => ({ type: "ESModule", path: `${server}${file}` })),
    compatibilityDate: "2026-05-15",
    compatibilityFlags: ["nodejs_compat"],
    d1Databases: ["DB"],
    bindings: { ZAINAB_ADMIN_KEY: testKey },
    assets: {
      directory: `${root}dist/client`,
      binding: "ASSETS",
      routerConfig: { has_user_worker: true, invoke_user_worker_ahead_of_assets: true },
    },
  });
  try {
    const db = await worker.getD1Database("DB");
    for (const file of (await readdir(`${root}drizzle`)).filter((name) => name.endsWith(".sql")).sort()) {
      await db.exec((await readFile(`${root}drizzle/${file}`, "utf8")).replaceAll("\n", " "));
    }
    return worker;
  } catch (error) {
    await worker.dispose();
    throw error;
  }
}
