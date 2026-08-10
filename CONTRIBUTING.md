# Contributing to PediaMetric

Thank you for helping improve PediaMetric. Contributions must preserve the
architectural boundary between Core, WHO Data, Validation, and Web described in
`docs/ARCHITECTURE.md`.

## Development setup

1. Install Node.js 24+, pnpm 11.16.0, and Python 3.11+.
2. Create a virtual environment with `python -m venv .venv`.
3. Install the importer with `.venv/Scripts/python -m pip install -r scripts/requirements-import.txt` on Windows or `.venv/bin/python -m pip install -r scripts/requirements-import.txt` on Unix.
4. Review `THIRD_PARTY_NOTICES.md`, then run `pnpm run data:prepare`.
5. Run `pnpm install --frozen-lockfile`.
6. Run `pnpm run verify`, `pnpm run build`, and `pnpm run verify:core`.

Downloaded WHO archives and generated datasets must not be committed. Clinical
formula changes require authoritative evidence and regression tests. Web code
must consume the public anthropometry facade and must not duplicate formulas or
classification cutoffs.

Do not include patient data, credentials, telemetry payloads, or copyrighted
third-party files in issues, pull requests, fixtures, or commits.

By submitting a contribution, you agree that it may be distributed under the
repository's MIT license and confirm that you have the right to submit it.
