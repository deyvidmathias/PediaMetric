# Third-party notices

The MIT license in this repository covers original PediaMetric software and
documentation only. It does not grant rights to third-party datasets,
publications, names, emblems, or trademarks.

## World Health Organization data

PediaMetric can use the WHO Child Growth Standards 2006 and WHO Growth
Reference 2007. Those source archives and the generated LMS tables are not
distributed in this Git repository. `pnpm run data:prepare` downloads the
official archives directly from WHO and verifies their recorded SHA-256 hashes
before generating local files.

Users are responsible for reviewing and complying with the terms applicable
to their use, including attribution, permitted purposes, modification,
non-endorsement, and use of the WHO name and emblem:

- https://www.who.int/about/policies/publishing/data-policy/terms-and-conditions
- https://www.who.int/about/policies/publishing/copyright
- https://www.who.int/about/policies/publishing/permissions

PediaMetric is not affiliated with or endorsed by the World Health
Organization. “WHO” and “World Health Organization” identify the source of the
reference material only.

## `anthro` R package

The `anthro` R package version 1.1.0 was used locally as an independent
validation reference. It is licensed under GPL-3 and is not distributed in
this repository or required to build or run PediaMetric.

## Dependencies

JavaScript and Python dependencies are not vendored. Their names and exact or
bounded versions are recorded in `package.json`, `pnpm-lock.yaml`, and
`scripts/requirements-import.txt`; each remains under its own license.
