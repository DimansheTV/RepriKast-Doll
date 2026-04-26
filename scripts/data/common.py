from __future__ import annotations

import json
import re
import urllib.parse
from pathlib import Path
from typing import Any, Dict, Iterable, List

BASE_URL = "https://r2online.ru"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
)

VALID_SLOT_CODES = {
    "equipment": {"earring", "helmet", "cloak", "necklace", "armor", "shield", "weapon", "belt", "gloves", "ring", "boots"},
    "sphere": {"life", "mastery", "soul", "destruction", "protection", "special", "morph"},
    "trophy": {
        "trophy_top_left",
        "trophy_top_right",
        "trophy_middle_left",
        "trophy_middle_right",
        "trophy_bottom_left",
        "trophy_bottom_right",
    },
    "pet": set(),
}


class WikiClient:
    def __init__(self) -> None:
        import requests

        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT})

    def get_text(self, url: str) -> str:
        response = self.session.get(url, timeout=30)
        response.raise_for_status()
        response.encoding = response.encoding or "utf-8"
        return response.text

    def download_file(self, url: str, destination: Path) -> None:
        destination.parent.mkdir(parents=True, exist_ok=True)
        response = self.session.get(url, timeout=30)
        response.raise_for_status()
        destination.write_bytes(response.content)


def abs_url(url: str) -> str:
    return urllib.parse.urljoin(BASE_URL, url)


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip()


def write_json(path: Path, payload: list[dict[str, Any]]) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load_json(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise RuntimeError(f"{path} must contain a JSON array")
    return data


def validate_catalog(kind: str, items: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    normalized = list(items)
    seen_ids: set[str] = set()
    valid_slot_codes = VALID_SLOT_CODES.get(kind, set())

    for index, item in enumerate(normalized):
        if "id" not in item or item["id"] in (None, ""):
            legacy_slot = clean_text(str(item.get("slot_code", "") or "unknown"))
            legacy_name = clean_text(str(item.get("name", "") or f"{kind}-{index}"))
            item["id"] = f"{kind}:{legacy_slot}:{legacy_name}:{index}"

        for field in ("id", "name", "image", "upgrade_levels"):
            if field not in item:
                raise RuntimeError(f"{kind}[{index}] missing field {field}")

        item_id = str(item["id"])
        if item_id in seen_ids:
            raise RuntimeError(f"{kind} duplicate id: {item_id}")
        seen_ids.add(item_id)

        name = clean_text(str(item.get("name", "")))
        if not name:
            raise RuntimeError(f"{kind}[{index}] has empty name")

        slot_code = str(item.get("slot_code", "") or "")
        if valid_slot_codes and slot_code and slot_code not in valid_slot_codes:
            raise RuntimeError(f"{kind}[{index}] has invalid slot_code {slot_code}")

        upgrade_levels = item.get("upgrade_levels")
        if not isinstance(upgrade_levels, dict) or not upgrade_levels:
            raise RuntimeError(f"{kind}[{index}] has invalid upgrade_levels")

        for level, params in upgrade_levels.items():
            if not clean_text(str(level)):
                raise RuntimeError(f"{kind}[{index}] has empty upgrade level key")
            if not isinstance(params, list) or not all(isinstance(param, str) for param in params):
                raise RuntimeError(f"{kind}[{index}] level {level} must be a list of strings")

    return normalized
