from __future__ import annotations

import json
import re
import time
import urllib.parse
from pathlib import Path
from typing import Dict, List, Tuple

import requests
from bs4 import BeautifulSoup


BASE_URL = "https://r2online.ru"
SECTION_URL = f"{BASE_URL}/wiki/base/section/14/"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
)

OUT_JSON = Path("sphere-items.json")
IMG_DIR = Path("img") / "sphere"


CATEGORY_SLOT_MAP = {
    "Сферы души": "soul",
    "Сферы жизни": "life",
    "Сферы разрушения": "destruction",
    "Сферы защиты": "protection",
    "Сферы мастерства": "mastery",
    "Особые сферы": "special",
    "Сферы перевоплощения": "morph",
}

MANUAL_SPHERES = [
    {
        "id": "morph_1",
        "name": "Сфера перевоплощения 1+ уровня",
        "category": "Сферы перевоплощения",
        "slot_code": "morph",
        "image": "img/sphere/sphere_morph_1.png",
        "classes": ["all"],
        "description": "",
        "description_lines": [],
        "upgrade_levels": {
            "+0": [
                "HP +400",
                "MP +200",
                "Скорость атаки +34%",
                "Скорость бега +50",
                "Вес +1000",
            ],
        },
    },
    {
        "id": "morph_50",
        "name": "Сфера перевоплощения 50+ уровня",
        "category": "Сферы перевоплощения",
        "slot_code": "morph",
        "image": "img/sphere/sphere_morph_1.png",
        "classes": ["all"],
        "description": "",
        "description_lines": [],
        "upgrade_levels": {
            "+0": [
                "HP +500",
                "MP +250",
                "Скорость атаки +36%",
                "Скорость бега +50",
                "Вес +1500",
            ],
        },
    },
    {
        "id": "morph_60",
        "name": "Сфера перевоплощения 60+ уровня",
        "category": "Сферы перевоплощения",
        "slot_code": "morph",
        "image": "img/sphere/sphere_morph_1.png",
        "classes": ["all"],
        "description": "",
        "description_lines": [],
        "upgrade_levels": {
            "+0": [
                "HP +600",
                "MP +300",
                "Скорость атаки +38%",
                "Скорость бега +50",
                "Вес +2000",
            ],
        },
    },
    {
        "id": "morph_65",
        "name": "Сфера перевоплощения 65+ уровня",
        "category": "Сферы перевоплощения",
        "slot_code": "morph",
        "image": "img/sphere/sphere_morph_1.png",
        "classes": ["all"],
        "description": "",
        "description_lines": [],
        "upgrade_levels": {
            "+0": [
                "HP +700",
                "MP +350",
                "Скорость атаки +40%",
                "Скорость бега +50",
                "Вес +2500",
            ],
        },
    },
    {
        "id": "morph_70",
        "name": "Сфера перевоплощения 70+ уровня",
        "category": "Сферы перевоплощения",
        "slot_code": "morph",
        "image": "img/sphere/sphere_morph_1.png",
        "classes": ["all"],
        "description": "",
        "description_lines": [],
        "upgrade_levels": {
            "+0": [
                "HP +800",
                "MP +400",
                "Скорость атаки +42%",
                "Скорость бега +50",
                "Вес +3000",
            ],
        },
    },
    {
        "id": "morph_75",
        "name": "Сфера перевоплощения 75+ уровня",
        "category": "Сферы перевоплощения",
        "slot_code": "morph",
        "image": "img/sphere/sphere_morph_1.png",
        "classes": ["all"],
        "description": "",
        "description_lines": [],
        "upgrade_levels": {
            "+0": [
                "HP +900",
                "MP +450",
                "Скорость атаки +44%",
                "Скорость бега +50",
                "Вес +3500",
            ],
        },
    },
    {
        "id": "morph_80",
        "name": "Сфера перевоплощения 80+ уровня",
        "category": "Сферы перевоплощения",
        "slot_code": "morph",
        "image": "img/sphere/sphere_morph_1.png",
        "classes": ["all"],
        "description": "",
        "description_lines": [],
        "upgrade_levels": {
            "+0": [
                "HP +1000",
                "MP +500",
                "Скорость атаки +46%",
                "Скорость бега +50",
                "Вес +4000",
            ],
        },
    },
    {
        "id": "morph_85",
        "name": "Сфера перевоплощения 85+ уровня",
        "category": "Сферы перевоплощения",
        "slot_code": "morph",
        "image": "img/sphere/sphere_morph_1.png",
        "classes": ["all"],
        "description": "",
        "description_lines": [],
        "upgrade_levels": {
            "+0": [
                "HP +1100",
                "MP +550",
                "Скорость атаки +48%",
                "Скорость бега +50",
                "Вес +4500",
            ],
        },
    },
    {
        "id": "morph_90",
        "name": "Сфера перевоплощения 90+ уровня",
        "category": "Сферы перевоплощения",
        "slot_code": "morph",
        "image": "img/sphere/sphere_morph_1.png",
        "classes": ["all"],
        "description": "",
        "description_lines": [],
        "upgrade_levels": {
            "+0": [
                "HP +1200",
                "MP +600",
                "Скорость атаки +50%",
                "Скорость бега +50",
                "Вес +5000",
            ],
        },
    },
    {
        "id": "morph_95",
        "name": "Сфера перевоплощения 95+ уровня",
        "category": "Сферы перевоплощения",
        "slot_code": "morph",
        "image": "img/sphere/sphere_morph_1.png",
        "classes": ["all"],
        "description": "",
        "description_lines": [],
        "upgrade_levels": {
            "+0": [
                "HP +1300",
                "MP +650",
                "Скорость атаки +52%",
                "Скорость бега +50",
                "Вес +5500",
            ],
        },
    },
    {
        "id": "morph_100",
        "name": "Сфера перевоплощения 100+ уровня",
        "category": "Сферы перевоплощения",
        "slot_code": "morph",
        "image": "img/sphere/sphere_morph_1.png",
        "classes": ["all"],
        "description": "",
        "description_lines": [],
        "upgrade_levels": {
            "+0": [
                "HP +1400",
                "MP +700",
                "Скорость атаки +54%",
                "Скорость бега +50",
                "Вес +6000",
            ],
        },
    },
    {
        "id": "morph_105",
        "name": "Сфера перевоплощения 105+ уровня",
        "category": "Сферы перевоплощения",
        "slot_code": "morph",
        "image": "img/sphere/sphere_morph_1.png",
        "classes": ["all"],
        "description": "",
        "description_lines": [],
        "upgrade_levels": {
            "+0": [
                "HP +1500",
                "MP +750",
                "Скорость атаки +56%",
                "Скорость бега +50",
                "Вес +6500",
            ],
        },
    },
    {
        "id": "morph_110",
        "name": "Сфера перевоплощения 110+ уровня",
        "category": "Сферы перевоплощения",
        "slot_code": "morph",
        "image": "img/sphere/sphere_morph_1.png",
        "classes": ["all"],
        "description": "",
        "description_lines": [],
        "upgrade_levels": {
            "+0": [
                "HP +1600",
                "MP +800",
                "Скорость атаки +58%",
                "Скорость бега +50",
                "Вес +7000",
            ],
        },
    },
]


class WikiClient:
    def __init__(self) -> None:
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT})
        self.challenge_passed = False

    @staticmethod
    def _get_jhash(code: int) -> int:
        x = 123456789
        k = 0
        for i in range(1677696):
            x = ((x + code) ^ (x + (x % 3) + (x % 17) + code) ^ i) % 16776960
            if x % 117 == 0:
                k = (k + 1) % 1111
        return k

    def get_text(self, url: str) -> str:
        response = self.session.get(url, timeout=30)
        if not self.challenge_passed and "__js_p_" in self.session.cookies:
            code = int(self.session.cookies.get("__js_p_").split(",")[0])
            self.session.cookies.set("__jhash_", str(self._get_jhash(code)), domain="r2online.ru", path="/")
            self.session.cookies.set(
                "__jua_",
                urllib.parse.quote(USER_AGENT, safe=""),
                domain="r2online.ru",
                path="/",
            )
            time.sleep(1.1)
            response = self.session.get(url, timeout=30)
            self.challenge_passed = True
        response.raise_for_status()
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


def extract_categories(section_html: str) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
    soup = BeautifulSoup(section_html, "html.parser")
    categories: Dict[str, Dict[str, str]] = {}
    skipped: Dict[str, Dict[str, str]] = {}

    for anchor in soup.select('a.catalog-item[href*="/wiki/base/list/"]'):
        href = abs_url(anchor["href"])
        image = anchor.find("img")
        title = clean_text(image.get("title") if image else anchor.get_text(" ", strip=True))
        image_url = abs_url(image["src"]) if image and image.get("src") else ""
        if not title:
            continue

        record = {"title": title, "url": href, "image_url": image_url}
        if title == "Cферы перевоплощения":
            if href not in skipped or image_url:
                skipped[href] = record
            continue

        categories[href] = record

    return list(categories.values()), list(skipped.values())


def extract_item_links(list_html: str) -> List[Dict[str, str]]:
    soup = BeautifulSoup(list_html, "html.parser")
    items: Dict[str, Dict[str, str]] = {}

    for anchor in soup.select('a.catalog-item[href*="/wiki/base/view/"]'):
        href = abs_url(anchor["href"])
        image = anchor.find("img")
        name = clean_text(anchor.get_text(" ", strip=True))
        if not name and image:
            name = clean_text(image.get("title"))
        image_url = abs_url(image["src"]) if image and image.get("src") else ""

        if href not in items:
            items[href] = {"url": href, "name": name, "image_url": image_url}
        else:
            if not items[href]["name"] and name:
                items[href]["name"] = name
            if not items[href]["image_url"] and image_url:
                items[href]["image_url"] = image_url

    return list(items.values())


def parse_classes(info_table: BeautifulSoup | None) -> List[str]:
    if info_table is None:
        return []

    classes = []
    for icon in info_table.select(".icon-class"):
        for class_name in icon.get("class", []):
            if class_name.startswith("cl-") and class_name != "cl-all":
                classes.append(class_name.removeprefix("cl-"))

    if info_table.select_one(".icon-class.cl-all"):
        return ["all"]

    return sorted(set(classes))


def parse_weight(info_table: BeautifulSoup | None) -> int | None:
    if info_table is None:
        return None

    text = info_table.get_text(" ", strip=True)
    match = re.search(r"Вес:\s*(\d+)", text)
    return int(match.group(1)) if match else None


def parse_description_lines(info_table: BeautifulSoup | None) -> List[str]:
    if info_table is None:
        return []

    description_cell = info_table.select_one("tr:last-child td[colspan]")
    if description_cell is None:
        return []

    return [clean_text(line) for line in description_cell.stripped_strings if clean_text(line)]


def parse_upgrade_table(soup: BeautifulSoup) -> Dict[str, List[str]]:
    table = soup.select_one("table.detail-item-properties")
    if table is None:
        return {}

    levels: Dict[str, List[str]] = {}
    for row in table.select("tbody tr"):
        cells = row.find_all("td")
        if len(cells) < 2:
            continue
        level = clean_text(cells[0].get_text(" ", strip=True))
        params = [clean_text(line) for line in cells[1].stripped_strings if clean_text(line)]
        if level:
            levels[level] = params

    return levels


def parse_item_page(item_html: str, fallback_name: str) -> Dict[str, object]:
    soup = BeautifulSoup(item_html, "html.parser")

    title_tag = next(
        (
            tag
            for tag in soup.find_all("h1")
            if clean_text(tag.get_text(" ", strip=True)) and clean_text(tag.get_text(" ", strip=True)) != "База знаний"
        ),
        None,
    )
    title = clean_text(title_tag.get_text(" ", strip=True)) if title_tag else fallback_name

    main_icon = soup.select_one('.layout-item-icon.main-icon-item img[src*="/upload/icons/"]')
    info_table = soup.select_one("table.info-description")

    description_lines = parse_description_lines(info_table)
    upgrade_levels = parse_upgrade_table(soup)
    if not upgrade_levels and description_lines:
        upgrade_levels = {"+0": description_lines[1:] if len(description_lines) > 1 else description_lines}

    return {
        "title": title,
        "image_url": abs_url(main_icon["src"]) if main_icon and main_icon.get("src") else "",
        "weight": parse_weight(info_table),
        "classes": parse_classes(info_table),
        "description_lines": description_lines,
        "upgrade_levels": upgrade_levels,
    }


def build() -> None:
    client = WikiClient()
    IMG_DIR.mkdir(parents=True, exist_ok=True)

    section_html = client.get_text(SECTION_URL)
    categories, skipped_categories = extract_categories(section_html)

    items: List[Dict[str, object]] = []
    downloaded_images = 0

    for category in categories:
        list_html = client.get_text(category["url"])
        category_items = extract_item_links(list_html)

        for item in category_items:
            page_html = client.get_text(item["url"])
            parsed = parse_item_page(page_html, item["name"])

            item_id_match = re.search(r"/view/(\d+)/?$", item["url"])
            item_id = int(item_id_match.group(1)) if item_id_match else None

            image_url = parsed["image_url"] or item["image_url"]
            local_image = ""
            if image_url:
                extension = Path(urllib.parse.urlparse(image_url).path).suffix or ".jpg"
                filename = f"sphere_{item_id}{extension}"
                local_path = IMG_DIR / filename
                if not local_path.exists():
                    client.download_file(image_url, local_path)
                    downloaded_images += 1
                local_image = local_path.as_posix()

            items.append(
                {
                    "id": item_id,
                    "name": parsed["title"],
                    "category": category["title"],
                    "slot_code": CATEGORY_SLOT_MAP.get(category["title"], "unknown"),
                    "wiki_url": item["url"],
                    "image": local_image,
                    "source_image_url": image_url,
                    "weight": parsed["weight"],
                    "classes": parsed["classes"],
                    "description": parsed["description_lines"][0] if parsed["description_lines"] else "",
                    "description_lines": parsed["description_lines"],
                    "upgrade_levels": parsed["upgrade_levels"],
                }
            )

    for manual_item in MANUAL_SPHERES:
        source_image_url = str(manual_item.get("source_image_url") or "")
        local_image = Path(str(manual_item["image"]))
        if source_image_url and not local_image.exists():
            client.download_file(source_image_url, local_image)
            downloaded_images += 1
        items = [item for item in items if item.get("id") != manual_item["id"]]
        items.append(dict(manual_item))

    items.sort(key=lambda entry: (str(entry["category"]), str(entry["name"])))

    OUT_JSON.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Categories: {len(categories)}")
    print(f"Spheres: {len(items)}")
    print(f"Images downloaded: {downloaded_images}")
    if skipped_categories:
        print(f"Skipped categories: {len(skipped_categories)}")
    if skipped_categories:
        for category in skipped_categories:
            print(f"  - {category['title']}: {category['url']}")


if __name__ == "__main__":
    build()
