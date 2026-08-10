import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appUrl = new URL("../src/app/App.tsx", import.meta.url);
const cssUrl = new URL("../src/app/app.css", import.meta.url);
const htmlUrl = new URL("../index.html", import.meta.url);

test("PediaMetric Web consome somente a fachada pública antropométrica", async () => {
  const source = await readFile(appUrl, "utf8");
  assert.match(source, /features\/anthropometry\/index\.ts/);
  assert.doesNotMatch(source, /features\/anthropometry\/(?:engine|data)\//);
  assert.doesNotMatch(
    source,
    /\b(?:lmsZScore|restrictedLmsZScore|zScoreToPercentile|measurementAtZ|classify)\s*\(/
  );
});

test("PediaMetric Web não usa rede ou persistência clínica", async () => {
  const sources = await Promise.all([appUrl, cssUrl, htmlUrl].map((url) => readFile(url, "utf8")));
  const joined = sources.join("\n");
  assert.doesNotMatch(joined, /\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\b/);
  assert.doesNotMatch(joined, /\b(?:localStorage|sessionStorage|indexedDB)\b/);
  assert.doesNotMatch(joined, /https?:\/\//);
});
