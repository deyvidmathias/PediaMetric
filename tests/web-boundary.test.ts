import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appUrl = new URL("../src/app/App.tsx", import.meta.url);
const cssUrl = new URL("../src/app/app.css", import.meta.url);
const htmlUrl = new URL("../index.html", import.meta.url);
const chartsUrl = new URL("../src/features/charts/GrowthCharts.tsx", import.meta.url);

test("PediaMetric Web consome somente a fachada pública antropométrica", async () => {
  const sources = await Promise.all([appUrl, chartsUrl].map((url) => readFile(url, "utf8")));
  const joined = sources.join("\n");
  assert.match(joined, /features\/anthropometry\/index\.ts/);
  assert.match(joined, /\bcreateGrowthChartModel\b/);
  assert.doesNotMatch(joined, /features\/anthropometry\/(?:engine|data)\//);
  assert.doesNotMatch(
    joined,
    /\b(?:lmsZScore|restrictedLmsZScore|zScoreToPercentile|measurementAtZ|classify)\s*\(/
  );
});

test("PediaMetric Web não usa rede ou persistência clínica", async () => {
  const sources = await Promise.all([appUrl, chartsUrl, cssUrl, htmlUrl].map((url) => readFile(url, "utf8")));
  const joined = sources.join("\n");
  assert.doesNotMatch(joined, /\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\b/);
  assert.doesNotMatch(joined, /\b(?:localStorage|sessionStorage|indexedDB)\b/);
  assert.doesNotMatch(joined, /https?:\/\//);
});

test("formulário destaca as medidas pediátricas principais e inicia deitado", async () => {
  const app = await readFile(appUrl, "utf8");
  const primaryMeasures = app.match(/<div className="primary-measures">([\s\S]*?)<\/div>/)?.[1] ?? "";
  const optionalSection = app.indexOf('className="optional-toggle"');

  assert.match(app, /measurementPosition: "length"/);
  assert.match(app, /> Deitado<\/button>/);
  assert.match(primaryMeasures, /label="Peso"/);
  assert.match(primaryMeasures, /label="Comprimento \/ altura"/);
  assert.match(primaryMeasures, /label="Perímetro cefálico"/);
  assert.ok(app.indexOf('className="primary-measures"') < optionalSection);
  assert.match(app, /className="sphere-logo"/);
  assert.doesNotMatch(app, /<strong>WHO<\/strong>/);
});
