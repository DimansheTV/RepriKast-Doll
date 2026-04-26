from __future__ import annotations

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class ArchitectureSmokeTests(unittest.TestCase):
    def test_html_uses_module_entrypoints(self) -> None:
        index_html = (ROOT / "index.html").read_text(encoding="utf-8")
        compare_html = (ROOT / "compare.html").read_text(encoding="utf-8")

        self.assertIn('type="module" src="/src/main-entry.ts"', index_html)
        self.assertIn('type="module" src="/src/compare-entry.ts"', compare_html)

    def test_runtime_no_longer_exports_window_globals(self) -> None:
        runtime_source = (ROOT / "src" / "ui" / "main" / "runtime-core.ts").read_text(encoding="utf-8")
        compare_source = (ROOT / "src" / "ui" / "compare" / "page-app.ts").read_text(encoding="utf-8")

        self.assertNotIn("window.r2App", runtime_source)
        self.assertNotIn("window.__R2_APP_READY__", runtime_source)
        self.assertNotIn("window.r2App", compare_source)
        self.assertNotIn("window.__R2_APP_READY__", compare_source)

    def test_required_modules_exist(self) -> None:
        expected = [
            ROOT / "src" / "application" / "app-context.ts",
            ROOT / "src" / "application" / "catalog-repository.ts",
            ROOT / "src" / "application" / "profile-repository.ts",
            ROOT / "src" / "application" / "ui-state-repository.ts",
            ROOT / "src" / "domain" / "equipment" / "config.ts",
            ROOT / "src" / "domain" / "spheres" / "config.ts",
            ROOT / "src" / "domain" / "trophies" / "config.ts",
            ROOT / "src" / "domain" / "pets" / "config.ts",
            ROOT / "src" / "domain" / "stats" / "runtime-config.ts",
            ROOT / "src" / "shared" / "item-schema.ts",
            ROOT / "src" / "shared" / "text.ts",
            ROOT / "src" / "resources" / "catalogs.ts",
            ROOT / "src" / "ui" / "main" / "runtime-core.ts",
            ROOT / "src" / "ui" / "main" / "page-app.ts",
            ROOT / "src" / "ui" / "main" / "page-transitions.ts",
            ROOT / "src" / "ui" / "compare" / "page-app.ts",
            ROOT / "src" / "main-entry.ts",
            ROOT / "src" / "compare-entry.ts",
        ]

        for path in expected:
            with self.subTest(path=path):
                self.assertTrue(path.exists(), f"Missing expected module: {path}")


if __name__ == "__main__":
    unittest.main()
