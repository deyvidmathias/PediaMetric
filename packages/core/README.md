# @pediametric/core

[Leia em português do Brasil](./README.pt-BR.md)

Framework-independent TypeScript primitives for pediatric anthropometry. This package is the calculation layer used by PediaMetric and is being prepared for a possible future open source release.

> **Pre-release status:** the package is currently private, unpublished, and its API may change before the first public release.

## Scope

The Core provides:

- exact age and reference selection;
- BMI and stature-position adjustment;
- LMS Z-scores and percentiles;
- classifications and plausibility handling;
- complete assessments through an injected `LmsDatasetProvider`.

It does not depend on React, the DOM, CSS, charts, network access, persistent storage, or a concrete data source.

## WHO data is not included

This package does **not** contain World Health Organization tables, source files, names, logos, or other WHO materials. Consumers must provide compatible, validated datasets through `LmsDatasetProvider` and remain responsible for their provenance, version, integrity, licensing, and permitted use.

The MIT license in this directory applies only to the Core code and its documentation. It does not grant rights to third-party data or trademarks.

## Example

```ts
import {
  createAnthropometryAssessment,
  type LmsDatasetProvider
} from "@pediametric/core";

const provider: LmsDatasetProvider = {
  getDataset(reference, indicator) {
    // Return a validated dataset for this reference and indicator.
    return undefined;
  }
};

const assess = createAnthropometryAssessment(provider);
const result = assess({
  sex: "female",
  birthDate: "2026-01-01",
  assessmentDate: "2026-08-01",
  weightKg: 7.2
});
```

The Core returns full-precision values. Rounding and display formatting belong to the consuming application.

## Local development

From the repository root:

```sh
pnpm run verify:core
```

The command builds ESM output and TypeScript declarations, tests a package self-import, checks the public runtime API snapshot, inspects the output for forbidden dependencies or data, and performs an npm pack dry run. Build artifacts are written to `packages/core/dist`.

## Safety and clinical use

PediaMetric Core is software under development. Its output does not replace professional judgment, diagnosis, or care. Consumers must validate their data provider and integration for their intended context.

See [CONTRIBUTING.md](./CONTRIBUTING.md), [SECURITY.md](./SECURITY.md), and [CHANGELOG.md](./CHANGELOG.md) for project policies.
