import { normalizeText } from "../../shared/text";

export const PASSIVE_MORPH_RING_SLOT_KEY = "ring_morph_passive";

export const EQUIPMENT_CLASS_BY_WIKI_ICON = {
  "cl-1": "knight",
  "cl-2": "mage",
  "cl-3": "assassin",
  "cl-4": "summoner",
  "cl-5": "ranger",
  "cl-all": "all",
  "1": "knight",
  "2": "mage",
  "3": "assassin",
  "4": "summoner",
  "5": "ranger",
  all: "all",
};

export const CLASS_RESTRICTED_EQUIPMENT_SLOT_CODES = new Set([
  "weapon",
  "helmet",
  "armor",
  "boots",
  "gloves",
  "shield",
]);

export const KNIGHT_HALBERD_WEAPON_NAMES = new Set([
  "алебарда хранителя",
  "дамасская алебарда",
  "железная алебарда",
  "копье гвардейца",
  "стальная алебарда метеоса",
].map((name) => normalizeText(name).toLowerCase()));

export const SUMMONER_ORB_WEAPON_NAMES = new Set([
  "магмовый орб метеоса",
  "начальный орб призывателя",
  "орб воды",
  "орб души гайи",
  "орб зефироса",
  "орб кочевника",
  "орб призывателя",
  "орб хранителя",
  "орб юпитера",
].map((name) => normalizeText(name).toLowerCase()));

export const SUMMONER_SOUL_STONE_SHIELD_NAMES = new Set([
  "камень души бафомета",
  "камень души ифрита",
  "магический камень души",
  "мифриловый камень души",
  "стальной камень души",
  "тренировочные камни души",
].map((name) => normalizeText(name).toLowerCase()));

export const MAGE_RANGED_WEAPON_NAMES = new Set([
  "скипетр жреца",
  "начальный посох мага",
  "посох аллатариэль",
  "посох кочевника",
  "посох литейн",
  "посох югенеса",
  "священный скипетр метеоса",
  "скипетр мудрости",
].map((name) => normalizeText(name).toLowerCase()));

export const MAGE_FOLIANT_SHIELD_NAMES = new Set([
  "магический мифриловый фолиант",
  "мифриловый фолиант",
  "фолиант",
  "фолиант бафомета",
  "фолиант ифрита",
  "фолиант новичка",
].map((name) => normalizeText(name).toLowerCase()));

export function isMorphRingItem(item) {
  return item?.slot_code === "ring" && /перевоплощени/i.test(normalizeText(item?.name));
}

export const SLOT_CONFIG = [
  { key: "earring", label: "Серьги", sourceSlot: "earring", col: 1, row: 1 },
  { key: "helmet", label: "Шлемы", sourceSlot: "helmet", col: 2, row: 1 },
  { key: "cloak", label: "Плащи", sourceSlot: "cloak", col: 3, row: 1 },
  { key: "necklace", label: "Ожерелья", sourceSlot: "necklace", col: 1, row: 2 },
  { key: "armor", label: "Доспехи", sourceSlot: "armor", col: 2, row: 2 },
  { key: "shield", label: "Снаряжение", sourceSlot: "shield", col: 3, row: 2 },
  { key: "weapon", label: "Оружие", sourceSlot: "weapon", col: 1, row: 3 },
  { key: "belt", label: "Ремни", sourceSlot: "belt", col: 2, row: 3 },
  { key: "gloves", label: "Перчатки", sourceSlot: "gloves", col: 3, row: 3 },
  { key: "ring_left", label: "Кольцо 1-й слот", sourceSlot: "ring", col: 1, row: 4, matches: (item) => !isMorphRingItem(item) },
  { key: "boots", label: "Сапоги", sourceSlot: "boots", col: 2, row: 4 },
  { key: "ring_right", label: "Кольцо 2-й слот", sourceSlot: "ring", col: 3, row: 4, matches: (item) => !isMorphRingItem(item) },
  {
    key: PASSIVE_MORPH_RING_SLOT_KEY,
    label: "Кольцо перевоплощения",
    catalogLabel: "Кольца перевоплощения",
    sourceSlot: "ring",
    renderOnDoll: false,
    isPassive: true,
    matches: (item) => isMorphRingItem(item),
  },
];
