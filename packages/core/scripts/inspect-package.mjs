import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const distRoot = join(packageRoot, "dist");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }));
  return nested.flat();
}

const files = await walk(distRoot);
assert.ok(files.length > 0, "Core dist must not be empty");

for (const file of files) {
  const name = relative(distRoot, file).replaceAll("\\", "/");
  assert.ok(name.endsWith(".js") || name.endsWith(".d.ts"), `Unexpected dist file: ${name}`);
  assert.notEqual(extname(file), ".json", `WHO/data JSON must not enter the Core package: ${name}`);
  const source = await readFile(file, "utf8");
  assert.doesNotMatch(source, /(?:from|import\s*)\s*[('"`]\.{1,2}\/data\//, name);
  assert.doesNotMatch(source, /(?:from|import\s*)\s*[('"`][^'"`]*(?:react|react-dom)/i, name);
  assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|indexedDB)\b/, name);
  assert.doesNotMatch(source, /from\s+["'][^"']+\.ts["']/, `TypeScript extension leaked: ${name}`);
}

console.log(`Core package inspection passed (${files.length} compiled files).`);
