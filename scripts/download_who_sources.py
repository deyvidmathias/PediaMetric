"""Download official WHO growth-reference sources with strict hash checks.

The downloaded archives are third-party material and remain outside Git. Their
use is governed by the WHO terms linked in THIRD_PARTY_NOTICES.md.
"""

from __future__ import annotations

import hashlib
import os
import tempfile
import urllib.request
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "vendor" / "sources"


@dataclass(frozen=True)
class Source:
    filename: str
    url: str
    sha256: str


SOURCES_TO_DOWNLOAD = (
    Source(
        "igrowup-spss.zip",
        "https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/software/igrowup-spss.zip?sfvrsn=5fb221f_2",
        "1143FE907B38A95B478866D2D6A8570D685176AE27950D18F20F3FD266D0443F",
    ),
    Source(
        "who2007-spss.zip",
        "https://cdn.who.int/media/docs/default-source/child-growth/growth-reference-5-19-years/download-spss-marco.zip?sfvrsn=7ba91cd4_0",
        "6185CDCB02A4886B3E30A97609910C0B2F724BF65332F29E115334D95496701F",
    ),
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest().upper()


def download(source: Source) -> None:
    target = SOURCES / source.filename
    if target.is_file():
        actual = sha256(target)
        if actual != source.sha256:
            raise ValueError(
                f"Refusing to replace {target}: SHA-256 is {actual}, expected {source.sha256}"
            )
        print(f"Verified existing {source.filename}")
        return

    request = urllib.request.Request(
        source.url,
        headers={"User-Agent": "PediaMetric source preparation/0.1"},
    )
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f"{source.filename}.", suffix=".download", dir=SOURCES
    )
    os.close(descriptor)
    temporary = Path(temporary_name)
    try:
        with urllib.request.urlopen(request, timeout=60) as response, temporary.open("wb") as output:
            while block := response.read(1024 * 1024):
                output.write(block)
        actual = sha256(temporary)
        if actual != source.sha256:
            raise ValueError(
                f"SHA-256 mismatch for {source.filename}: {actual} != {source.sha256}"
            )
        temporary.replace(target)
        print(f"Downloaded and verified {source.filename}")
    finally:
        temporary.unlink(missing_ok=True)


def main() -> None:
    SOURCES.mkdir(parents=True, exist_ok=True)
    print("WHO data terms: https://www.who.int/about/policies/publishing/data-policy/terms-and-conditions")
    for source in SOURCES_TO_DOWNLOAD:
        download(source)


if __name__ == "__main__":
    main()
