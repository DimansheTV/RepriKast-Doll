import { normalizeText } from "../../shared/text";

export const PASSIVE_MORPH_RING_SLOT_KEY = "ring_morph_passive";

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
