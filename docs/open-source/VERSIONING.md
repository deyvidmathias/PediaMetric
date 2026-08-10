# Versioning policy

The future `@pediametric/core` package follows Semantic Versioning. The package
is still private and unpublished; the rules below define the contract to use
when a public release is authorized.

## Before 1.0

- `0.MINOR.0` may contain intentional API changes.
- `0.MINOR.PATCH` contains compatible fixes and documentation improvements.
- Every API change must appear in `packages/core/CHANGELOG.md`.
- Consumers should pin an exact version during the `0.x` phase.

## From 1.0 onward

- `MAJOR`: incompatible changes to exported functions, types, validation rules,
  result semantics, or supported runtime environments.
- `MINOR`: backward-compatible features and new optional fields.
- `PATCH`: backward-compatible fixes with no intended contract change.

Changes in numerical results are treated as API changes even when TypeScript
signatures stay the same. A correction that can alter a Z-score, percentile, or
classification requires documented reference evidence, regression fixtures,
and an explicit changelog entry.

## Deprecation

After 1.0, a public API should be deprecated in one minor release before its
removal in the next major release, except for a confirmed safety or correctness
issue. Deprecations must include a replacement path.

## Data independence

Core releases do not version WHO datasets. Dataset providers and their source
versions are separate inputs to the calculation engine. A release must not add
WHO tables, copied reference files, or a hidden default dataset to the Core
package.
