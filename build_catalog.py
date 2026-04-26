from __future__ import annotations

import argparse
from pathlib import Path

from scripts.data.common import load_json, validate_catalog


KIND_TO_PATH = {
    "equipment": Path("src/resources/data/equipment-items.json"),
    "sphere": Path("src/resources/data/sphere-items.json"),
    "trophy": Path("src/resources/data/trophy-items.json"),
    "pet": Path("src/resources/data/pet-items.json"),
}


def build_or_validate(kind: str) -> None:
    if kind == "sphere":
        from scripts.data.sphere_builder import build as build_sphere_catalog

        build_sphere_catalog()
        return
    if kind == "trophy":
        from scripts.data.trophy_builder import build as build_trophy_catalog

        build_trophy_catalog()
        return

    path = KIND_TO_PATH[kind]
    items = load_json(path)
    validate_catalog(kind, items)
    print(f"{kind}: validated {len(items)} items from {path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--kind", choices=sorted(KIND_TO_PATH), required=True)
    args = parser.parse_args()
    build_or_validate(args.kind)


if __name__ == "__main__":
    main()
