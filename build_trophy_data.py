from __future__ import annotations

import json
from pathlib import Path

from bs4 import BeautifulSoup

from build_sphere_data import WikiClient, abs_url


OUT_JSON = Path("trophy-items.json")
IMG_DIR = Path("img") / "trophies"

TROPHIES = [
    {
        "id": "trophy_crown",
        "page_id": "47511410014",
        "name": "Корона",
        "slot_code": "trophy_top_left",
        "stat": "HP",
        "base": 40,
        "step": 40,
        "max": 840,
    },
    {
        "id": "trophy_mask",
        "page_id": "47511410015",
        "name": "Маска",
        "slot_code": "trophy_top_right",
        "stat": "Защита",
        "base": 1,
        "step": 1,
        "max": 21,
    },
    {
        "id": "trophy_bracelet",
        "page_id": "47511410016",
        "name": "Браслет",
        "slot_code": "trophy_middle_left",
        "stat": "Сила",
        "base": 1,
        "step": 1,
        "max": 21,
    },
    {
        "id": "trophy_amulet",
        "page_id": "47511410017",
        "name": "Амулет",
        "slot_code": "trophy_middle_right",
        "stat": "Ловкость",
        "base": 1,
        "step": 1,
        "max": 21,
    },
    {
        "id": "trophy_cup",
        "page_id": "47511410018",
        "name": "Чаша",
        "slot_code": "trophy_bottom_left",
        "stat": "Скорость бега",
        "base": 2,
        "step": 2,
        "max": 42,
    },
    {
        "id": "trophy_horn",
        "page_id": "47511410019",
        "name": "Горн",
        "slot_code": "trophy_bottom_right",
        "stat": "Скорость атаки",
        "base": 1,
        "step": 1,
        "max": 21,
    },
]


def build_upgrade_levels(stat: str, base: int, step: int) -> dict[str, list[str]]:
    return {
        f"+{level}": [f"{stat} +{base + step * level}"]
        for level in range(21)
    }


def get_icon_url(client: WikiClient, page_id: str) -> str:
    html = client.get_text(f"https://r2online.ru/wiki/base/view/{page_id}/")
    soup = BeautifulSoup(html, "html.parser")
    icon = soup.select_one("img.base-item-icon")
    if not icon or not icon.get("src"):
        raise RuntimeError(f"Icon not found for trophy page {page_id}")
    return abs_url(icon["src"])


def main() -> None:
    client = WikiClient()
    items = []

    for trophy in TROPHIES:
        image_path = IMG_DIR / f"{trophy['id']}.webp"
        icon_url = get_icon_url(client, trophy["page_id"])
        if not image_path.exists():
            client.download_file(icon_url, image_path)

        items.append({
            "id": trophy["id"],
            "name": trophy["name"],
            "slot_code": trophy["slot_code"],
            "image": image_path.as_posix(),
            "parameters": {
                "stat": trophy["stat"],
                "base": trophy["base"],
                "per_enhancement": trophy["step"],
                "max": trophy["max"],
            },
            "upgrade_levels": build_upgrade_levels(trophy["stat"], trophy["base"], trophy["step"]),
        })

    OUT_JSON.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Trophies: {len(items)}")


if __name__ == "__main__":
    main()
