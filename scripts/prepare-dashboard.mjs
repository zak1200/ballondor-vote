import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../.dev.vars", import.meta.url);
let contents = "";
let exists = true;
try { contents = await readFile(file, "utf8"); }
catch (error) { if (error.code !== "ENOENT") throw error; exists = false; }

if (/^ZAINAB_ADMIN_KEY\s*=/m.test(contents)) {
  console.log("Existing private dashboard key preserved.");
} else {
  const separator = contents && !contents.endsWith("\n") ? "\n" : "";
  await writeFile(file, `${separator}ZAINAB_ADMIN_KEY=${randomBytes(32).toString("base64url")}\n`, {
    flag: exists ? "a" : "wx", mode: 0o600,
  });
  console.log("Private dashboard key generated in ignored .dev.vars. The value is never logged.");
}
