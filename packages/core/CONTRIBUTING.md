# Contributing to PediaMetric Core

Thank you for your interest in improving PediaMetric Core. The package is currently private and its public contribution workflow has not opened yet. These guidelines define the intended process for a future public repository.

## Before contributing

- Use an issue or discussion to align on substantial API or clinical changes before implementation.
- Keep the Core independent of interfaces, frameworks, network access, storage, and concrete datasets.
- Do not add WHO tables, source files, logos, or other third-party materials to this package.
- Do not present outputs as a substitute for professional assessment.
- Report suspected vulnerabilities privately according to `SECURITY.md`, not in a public issue.

## Development workflow

1. Create a focused branch from the current default branch.
2. Make the smallest change that satisfies the agreed scope.
3. Add or update automated tests for behavior and regressions.
4. Run `pnpm run verify:core` from the repository root.
5. Document user-visible API changes in `CHANGELOG.md`.
6. Open a pull request describing the problem, approach, validation, and any compatibility impact.

Clinical rules, reference interpretation, and plausibility changes require traceable primary evidence. Avoid drive-by formatting or unrelated refactors in the same pull request.

## API compatibility

The API is not stable before the first public release. Even so, changes to runtime exports must deliberately update `scripts/public-api.snapshot.json` and explain the compatibility impact. Type-only changes should be reviewed with the same care even though they are not represented in the runtime snapshot.

## Commit and review expectations

Prefer small, reviewable commits. Pull requests should pass all checks and avoid generated-file edits by hand. Maintainers may request additional reference comparisons, edge cases, or independent clinical review before accepting a change.

By contributing, you agree that your contribution may be distributed under the license in `LICENSE`.
