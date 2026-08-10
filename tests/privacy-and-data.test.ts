import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const sourceRoot = new URL("../src/features/anthropometry/", import.meta.url);

async function walk(path: URL): Promise<URL[]> {
  const entries = await readdir(path, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const child = new URL(entry.name + (entry.isDirectory() ? "/" : ""), path);
    return entry.isDirectory() ? walk(child) : [child];
  }));
  return nested.flat();
}

test("sentinela de privacidade: motor não usa rede, telemetria ou persistência", async () => {
  const files = (await walk(sourceRoot)).filter((path) => path.pathname.endsWith(".ts"));
  const forbidden = /\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB)\b/;
  for (const file of files) {
    const content = await readFile(file, "utf8");
    assert.doesNotMatch(content, forbidden, file.pathname);
  }
});

test("manifesto corresponde aos hashes dos JSONs gerados", async () => {
  const generated = new URL("../src/features/anthropometry/data/generated/", import.meta.url);
  const manifest = JSON.parse(await readFile(new URL("manifest.json", generated), "utf8")) as {
    datasets: Array<{ output: string; sha256: string }>;
  };
  assert.equal(manifest.datasets.length, 12);
  for (const item of manifest.datasets) {
    const content = await readFile(new URL(item.output, generated));
    const hash = createHash("sha256").update(content).digest("hex").toUpperCase();
    assert.equal(hash, item.sha256, join("generated", item.output));
  }
});

