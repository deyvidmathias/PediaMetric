import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  createAnthropometryAssessment,
  type LmsDatasetProvider
} from "../src/features/anthropometry/core.ts";

const moduleRoot = join(process.cwd(), "src", "features", "anthropometry");

test("PediaMetric Core does not import WHO Data or Web implementations", () => {
  const coreFiles = [
    join(moduleRoot, "core.ts"),
    ...readdirSync(join(moduleRoot, "engine"), { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
      .map((entry) => join(moduleRoot, "engine", entry.name))
  ];

  for (const file of coreFiles) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /(?:from|import\s*)\s*[('"`]\.\.\/data\//);
    assert.doesNotMatch(source, /(?:from|import\s*)\s*[('"`][^'"`]*(?:react|web)/i);
  }
});

test("PediaMetric Core calculates through an injected dataset provider", () => {
  const provider: LmsDatasetProvider = {
    getDataset(reference, indicator) {
      if (reference !== "WHO_2006" || indicator !== "WEIGHT_FOR_AGE") {
        return undefined;
      }
      return {
        reference,
        source: "in-memory-test",
        key: "ageDays",
        male: [[0, 1, 3.3, 0.1]],
        female: [[0, 1, 3.2, 0.1]]
      };
    }
  };
  const assess = createAnthropometryAssessment(provider);
  const result = assess({
    sex: "male",
    birthDate: "2026-01-01",
    assessmentDate: "2026-01-01",
    weightKg: 3.3
  });

  assert.equal(result.validity.valid, true);
  assert.equal(result.results.length, 1);
  assert.equal(result.results[0]?.indicator, "WEIGHT_FOR_AGE");
  assert.ok(Math.abs(result.results[0]?.zScore ?? Number.NaN) < 1e-12);
});
