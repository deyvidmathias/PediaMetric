import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as publicApi from "@pediametric/core";

const snapshotUrl = new URL("./public-api.snapshot.json", import.meta.url);
const expected = JSON.parse(await readFile(snapshotUrl, "utf8"));
const actual = Object.keys(publicApi).sort();

assert.deepEqual(
  actual,
  [...expected].sort(),
  "Public runtime exports changed. Review compatibility and update public-api.snapshot.json deliberately."
);

console.log(`Core public API snapshot passed (${actual.length} runtime exports).`);
