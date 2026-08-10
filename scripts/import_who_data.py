"""Convert locally downloaded WHO SPSS LMS datasets to deterministic JSON.

This script is a build-time/import-time utility only. The browser runtime consumes
the generated JSON and never needs Python or pyreadstat.
"""

from __future__ import annotations

import hashlib
import json
import math
import tempfile
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import pyreadstat


ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "vendor" / "sources"
OUTPUT = ROOT / "src" / "features" / "anthropometry" / "data" / "generated"


EXPECTED_ARCHIVES = {
    "igrowup-spss.zip": "1143FE907B38A95B478866D2D6A8570D685176AE27950D18F20F3FD266D0443F",
    "who2007-spss.zip": "6185CDCB02A4886B3E30A97609910C0B2F724BF65332F29E115334D95496701F",
}


@dataclass(frozen=True)
class Dataset:
    reference: str
    archive: str
    source_file: str
    output_file: str
    key_column: str
    key_name: str
    expected_rows: int
    expected_range: tuple[float, float]


DATASETS = (
    Dataset("WHO_2006", "igrowup-spss.zip", "wazlms.sav", "who2006/weight-for-age.json", "AGEDAYS2", "ageDays", 3714, (0, 1856)),
    Dataset("WHO_2006", "igrowup-spss.zip", "hazlms.sav", "who2006/height-for-age.json", "AGEDAYS2", "ageDays", 3714, (0, 1856)),
    Dataset("WHO_2006", "igrowup-spss.zip", "wfllms.sav", "who2006/weight-for-length.json", "LENGTH2", "lengthCm", 1302, (45, 110)),
    Dataset("WHO_2006", "igrowup-spss.zip", "wfhlms.sav", "who2006/weight-for-height.json", "HEIGHT2", "heightCm", 1102, (65, 120)),
    Dataset("WHO_2006", "igrowup-spss.zip", "bmilms.sav", "who2006/bmi-for-age.json", "AGEDAYS2", "ageDays", 3714, (0, 1856)),
    Dataset("WHO_2006", "igrowup-spss.zip", "hclms.sav", "who2006/head-circumference-for-age.json", "AGEDAYS2", "ageDays", 3714, (0, 1856)),
    Dataset("WHO_2006", "igrowup-spss.zip", "aclms.sav", "who2006/arm-circumference-for-age.json", "AGEDAYS2", "ageDays", 3532, (91, 1856)),
    Dataset("WHO_2006", "igrowup-spss.zip", "tslms.sav", "who2006/triceps-skinfold-for-age.json", "AGEDAYS2", "ageDays", 3532, (91, 1856)),
    Dataset("WHO_2006", "igrowup-spss.zip", "sslms.sav", "who2006/subscapular-skinfold-for-age.json", "AGEDAYS2", "ageDays", 3532, (91, 1856)),
    Dataset("WHO_2007", "who2007-spss.zip", "hfawho2007.sav", "who2007/height-for-age.json", "AGEMOS", "ageMonths", 338, (61, 229)),
    Dataset("WHO_2007", "who2007-spss.zip", "bfawho2007.sav", "who2007/bmi-for-age.json", "AGEMOS", "ageMonths", 338, (61, 229)),
    Dataset("WHO_2007", "who2007-spss.zip", "wfawho2007.sav", "who2007/weight-for-age.json", "AGEMOS", "ageMonths", 122, (61, 121)),
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest().upper()


def validate_sources() -> None:
    for filename, expected in EXPECTED_ARCHIVES.items():
        path = SOURCES / filename
        if not path.is_file():
            raise FileNotFoundError(
                f"Missing local WHO source: {path}. Run `pnpm run data:download` first."
            )
        actual = sha256(path)
        if actual != expected:
            raise ValueError(f"SHA-256 mismatch for {filename}: {actual} != {expected}")


def number(value: Any) -> int | float:
    numeric = float(value)
    if numeric.is_integer():
        return int(numeric)
    return numeric


def convert_dataset(dataset: Dataset, extracted: Path) -> dict[str, Any]:
    source_path = extracted / dataset.archive / dataset.source_file
    columns, _metadata = pyreadstat.read_sav(str(source_path), output_format="dict")
    expected_columns = {"SEX", dataset.key_column, "L", "M", "S"}
    if set(columns) != expected_columns:
        raise ValueError(f"Unexpected columns in {dataset.source_file}: {list(columns)}")
    row_count = len(columns["SEX"])
    if row_count != dataset.expected_rows:
        raise ValueError(f"Unexpected row count in {dataset.source_file}: {row_count}")
    if any(len(values) != row_count for values in columns.values()):
        raise ValueError(f"Inconsistent column lengths in {dataset.source_file}")

    output: dict[str, Any] = {
        "reference": dataset.reference,
        "source": dataset.source_file,
        "key": dataset.key_name,
        "male": [],
        "female": [],
    }
    seen: set[tuple[int, float]] = set()
    for index in range(row_count):
        values = {name: columns[name][index] for name in expected_columns}
        if any(not math.isfinite(float(value)) for value in values.values()):
            raise ValueError(f"Missing or non-finite value in {dataset.source_file}")
        sex = int(values["SEX"])
        if sex not in (1, 2):
            raise ValueError(f"Invalid sex {sex} in {dataset.source_file}")
        key = number(values[dataset.key_column])
        unique = (sex, float(key))
        if unique in seen:
            raise ValueError(f"Duplicate key {unique} in {dataset.source_file}")
        seen.add(unique)
        output["male" if sex == 1 else "female"].append(
            [key, number(values["L"]), number(values["M"]), number(values["S"])]
        )

    for sex_name in ("male", "female"):
        rows = output[sex_name]
        if rows != sorted(rows, key=lambda item: item[0]):
            raise ValueError(f"Unsorted {sex_name} rows in {dataset.source_file}")
        actual_range = (float(rows[0][0]), float(rows[-1][0]))
        if actual_range != dataset.expected_range:
            raise ValueError(
                f"Unexpected key range for {dataset.source_file}/{sex_name}: {actual_range}"
            )
    return output


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    path.write_text(payload + "\n", encoding="utf-8", newline="\n")


def main() -> None:
    validate_sources()
    manifest: dict[str, Any] = {
        "schemaVersion": 1,
        "sourceHashes": EXPECTED_ARCHIVES,
        "datasets": [],
    }
    with tempfile.TemporaryDirectory(prefix="who-anthropometry-") as temp_name:
        extracted = Path(temp_name)
        for archive_name in {item.archive for item in DATASETS}:
            target = extracted / archive_name
            target.mkdir()
            with zipfile.ZipFile(SOURCES / archive_name) as archive:
                archive.extractall(target)

        for dataset in DATASETS:
            converted = convert_dataset(dataset, extracted)
            target = OUTPUT / dataset.output_file
            write_json(target, converted)
            manifest["datasets"].append(
                {
                    "reference": dataset.reference,
                    "source": dataset.source_file,
                    "output": dataset.output_file,
                    "rows": dataset.expected_rows,
                    "sha256": sha256(target),
                }
            )

    write_json(OUTPUT / "manifest.json", manifest)
    print(f"Generated {len(DATASETS)} datasets in {OUTPUT}")


if __name__ == "__main__":
    main()
