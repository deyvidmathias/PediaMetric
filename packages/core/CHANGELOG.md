# Changelog

All notable changes to `@pediametric/core` will be documented in this file. Semantic Versioning will apply after the first public release.

## Unreleased

- Keep the package private and unpublished while its candidate API is reviewed.
- Add English and Brazilian Portuguese package documentation.
- Add contribution and security guidance for a future public repository.
- Add a checked snapshot of the public JavaScript runtime exports.
- Add provider-backed growth-curve models for Z scores from -3 through +3.
- Return an explicit unavailable result for head circumference after WHO 2006.

## 0.1.0-local - 2026-08-09

- Prepare PediaMetric Core as a local ESM package with TypeScript declarations.
- Decouple the Core from React, PediaMetric Web, and concrete WHO data.
- Introduce `LmsDatasetProvider` for reference-data injection.
- Add package self-import smoke testing, output inspection, and an npm pack dry run.
