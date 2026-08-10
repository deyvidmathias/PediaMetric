import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const localPython = process.platform === "win32"
  ? resolve(".venv", "Scripts", "python.exe")
  : resolve(".venv", "bin", "python");
const python = process.env.PEDIAMETRIC_PYTHON
  ?? (existsSync(localPython) ? localPython : "python");
const result = spawnSync(python, process.argv.slice(2), { stdio: "inherit" });

if (result.error) {
  console.error(`Unable to start Python: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
