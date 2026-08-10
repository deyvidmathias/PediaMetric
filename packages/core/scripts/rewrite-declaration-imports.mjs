import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extname, join } from "node:path";

const distDirectory = fileURLToPath(new URL("../dist/", import.meta.url));

async function declarationFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return declarationFiles(path);
      return extname(entry.name) === ".ts" && entry.name.endsWith(".d.ts") ? [path] : [];
    })
  );
  return files.flat();
}

for (const path of await declarationFiles(distDirectory)) {
  const source = await readFile(path, "utf8");
  const normalized = source.replaceAll(/(from\s+["'][^"']+)\.ts(["'])/g, "$1.js$2");
  if (normalized !== source) await writeFile(path, normalized, "utf8");
}
