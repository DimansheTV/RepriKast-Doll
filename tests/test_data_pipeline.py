from __future__ import annotations

from pathlib import Path
import unittest

from scripts.data.common import load_json, validate_catalog


ROOT = Path(__file__).resolve().parents[1]


class DataPipelineTests(unittest.TestCase):
    def test_existing_catalogs_validate(self) -> None:
        catalogs = {
            "equipment": ROOT / "src" / "resources" / "data" / "equipment-items.json",
            "sphere": ROOT / "src" / "resources" / "data" / "sphere-items.json",
            "trophy": ROOT / "src" / "resources" / "data" / "trophy-items.json",
            "pet": ROOT / "src" / "resources" / "data" / "pet-items.json",
        }

        for kind, path in catalogs.items():
            with self.subTest(kind=kind):
                items = load_json(path)
                validated = validate_catalog(kind, items)
                self.assertGreater(len(validated), 0)

    def test_build_wrappers_exist(self) -> None:
        self.assertTrue((ROOT / "build_catalog.py").exists())
        self.assertTrue((ROOT / "build_sphere_data.py").exists())
        self.assertTrue((ROOT / "build_trophy_data.py").exists())


if __name__ == "__main__":
    unittest.main()
