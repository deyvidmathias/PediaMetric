import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" })
  .split(/\r?\n/u)
  .map((line) => line.trim())
  .filter(Boolean);

const forbidden = (path) =>
  (path.startsWith("vendor/sources/") && path !== "vendor/sources/.gitkeep")
  || path.startsWith("src/features/anthropometry/data/generated/");

const tracked = git("ls-files");
const forbiddenTracked = tracked.filter(forbidden);
assert.deepEqual(
  forbiddenTracked,
  [],
  `Third-party or generated data is tracked: ${forbiddenTracked.join(", ")}`,
);

const historicalPaths = git("log", "--format=", "--name-only", "HEAD");
const forbiddenHistory = [...new Set(historicalPaths.filter(forbidden))];
assert.deepEqual(
  forbiddenHistory,
  [],
  `Third-party or generated data exists in public history: ${forbiddenHistory.join(", ")}`,
);

for (const required of [
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "TRADEMARKS.md",
]) {
  assert.ok(existsSync(required), `Missing public repository file: ${required}`);
}

const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
const corePackage = JSON.parse(readFileSync("packages/core/package.json", "utf8"));
assert.equal(rootPackage.private, true, "The Web package must not be publishable to npm");
assert.equal(corePackage.private, true, "The Core package must remain private until npm approval");

console.log("Public repository audit passed.");
