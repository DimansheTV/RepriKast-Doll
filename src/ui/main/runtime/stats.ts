// @ts-nocheck
import {
  MAIN_STATS,
  CLASS_PRIMARY_ATTRIBUTES,
  SECONDARY_STAT_PRIORITY,
  STAT_LABEL_ALIASES,
  GROUPED_ATTACK_STAT_TARGETS,
  BAPHOMET_SET_BONUSES,
  IFRIT_SET_BONUSES,
  CLASS_CONFIGS,
} from "../../../domain/stats/runtime-config";
import { SLOT_CONFIG } from "../../../domain/equipment/config";
import { normalizeText } from "./utils";

export { MAIN_STATS, SECONDARY_STAT_PRIORITY, BAPHOMET_SET_BONUSES, IFRIT_SET_BONUSES, CLASS_CONFIGS };

export function canonicalizeStatLabel(label) {
  const normalized = normalizeText(label).toLowerCase();
  return STAT_LABEL_ALIASES.get(normalized) || normalizeText(label);
}

export function parseNumericStat(line) {
  const match = normalizeText(line).match(/^(.*?)\s*([+-])\s*(\d+(?:[.,]\d+)?)\s*(%)?$/u);
  if (!match) {
    return null;
  }

  const label = canonicalizeStatLabel(match[1]);
  if (!label) {
    return null;
  }

  const magnitude = Number(match[3].replace(",", "."));
  const value = match[2] === "-" ? -magnitude : magnitude;

  return {
    label,
    value,
    unit: match[4] || "",
  };
}

export function getUpgradeNumber(level) {
  const match = String(level || "").match(/\+(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function isBaphometSetItem(item) {
  return /Бафомет[а]?/u.test(item?.name || "");
}

export function isIfritSetItem(item) {
  return /Ифрит[а]?/u.test(item?.name || "");
}

export function isMagicVelkenOrMythrilItem(item) {
  const name = item?.name || "";
  return /магическ/u.test(name) && /(велкен|мифрил)/iu.test(name);
}

export function isPlainVelkenOrMythrilDefenseItem(item) {
  const name = item?.name || "";
  const slot = item?.slot_code || "";

  if (/магическ/u.test(name)) {
    return false;
  }

  if (/(большой щит|мифриловый браслет хранителя)/iu.test(name)) {
    return true;
  }

  return /(велкен|мифрил)/iu.test(name) && ["helmet", "cloak", "armor", "gloves", "boots"].includes(slot);
}

export function isCustomDefenseScaleItem(item) {
  const name = item?.name || "";
  return /(щит стража|костяной щит|магический браслет хранителя)/iu.test(name);
}

export function isDefaultDefenseScaleEquipmentItem(item) {
  const slot = item?.slot_code || "";
  return SLOT_CONFIG.some((entry) => entry.sourceSlot === slot);
}

export function formatStatNumber(value) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  const rounded = Math.round(value * 100) / 100;
  const precision = Number.isInteger(rounded * 10) ? 1 : 2;
  return rounded.toFixed(precision).replace(".", ",");
}

export function formatStatValue(value, unit = "") {
  if (!value) {
    return "0";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatStatNumber(value)}${unit}`;
}

export function computeBaseClassStat(statConfig, level) {
  if (statConfig.growthType === "per_level") {
    return statConfig.base + Math.max(0, level - 1) * statConfig.amount;
  }

  if (statConfig.growthType === "interval") {
    const normalizedLevel = CLASS_PRIMARY_ATTRIBUTES.has(statConfig.label)
      ? Math.max(0, level)
      : Math.max(0, level - 1);
    return statConfig.base + Math.floor(normalizedLevel / statConfig.interval) * statConfig.amount;
  }

  return statConfig.base;
}

export function createStatsModule(deps) {
  const {
    state,
    getParamsForLevel,
    getDefaultUpgradeLevel,
    getValidUpgradeLevel,
    getPetMergeStats,
    getEquippedSlots,
    getEquippedSphereSlots,
    getEquippedTrophySlots,
    localizeText = (value) => String(value ?? ""),
    getLocalizedCatalogField = (item, field) => String(item?.[field] ?? ""),
    getCurrentLanguage = () => "ru",
  } = deps;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderItemIcon(item) {
  if (!item?.image) {
    return '<span class="item-icon-frame is-empty" aria-hidden="true"></span>';
  }

  return `
    <span class="item-icon-frame">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(getLocalizedCatalogField(item, "name", { fallbackToRu: true }))}" loading="lazy">
    </span>
  `;
}

function canonicalizeStatLabel(label) {
  const normalized = normalizeText(label).toLowerCase();
  return STAT_LABEL_ALIASES.get(normalized) || normalizeText(label);
}

function parseNumericStat(line) {
  const match = normalizeText(line).match(/^(.*?)\s*([+-])\s*(\d+(?:[.,]\d+)?)\s*(%)?$/u);
  if (!match) {
    return null;
  }

  const label = canonicalizeStatLabel(match[1]);
  if (!label) {
    return null;
  }

  const magnitude = Number(match[3].replace(",", "."));
  const value = match[2] === "-" ? -magnitude : magnitude;

  return {
    label,
    value,
    unit: match[4] || "",
  };
}

function addNumericStat(target, stat) {
  const label = canonicalizeStatLabel(stat.label);
  const key = `${label}::${stat.unit}`;
  const current = target.get(key) || { label, unit: stat.unit, value: 0 };
  current.value += stat.value;
  target.set(key, current);
}

function addStatCollection(target, stats) {
  stats.forEach((stat) => addNumericStat(target, stat));
}

function addStatWithRules(target, stat) {
  if (stat.label === "Все параметры") {
    applyAllStatsBonus(target, stat);
    return;
  }
  if (applyGroupedAttackStat(target, stat)) {
    return;
  }
  addNumericStat(target, stat);
}

function applyAllStatsBonus(target, stat) {
  ["Сила", "Ловкость", "Интеллект"].forEach((label) => {
    addNumericStat(target, { label, value: stat.value, unit: stat.unit });
  });
}

function applyGroupedAttackStat(target, stat) {
  const labels = GROUPED_ATTACK_STAT_TARGETS.get(stat.label);
  if (!labels) {
    return false;
  }

  labels.forEach((label) => {
    addNumericStat(target, { label, value: stat.value, unit: stat.unit });
  });
  return true;
}

function getUpgradeNumber(level) {
  const match = String(level || "").match(/\+(\d+)/);
  return match ? Number(match[1]) : 0;
}

function isBaphometSetItem(item) {
  return /Бафомет[а]?/u.test(item?.name || "");
}

function isIfritSetItem(item) {
  return /Ифрит[а]?/u.test(item?.name || "");
}

function isMagicVelkenOrMythrilItem(item) {
  const name = item?.name || "";
  return /магическ/u.test(name) && /(велкен|мифрил)/iu.test(name);
}

function isPlainVelkenOrMythrilDefenseItem(item) {
  const name = item?.name || "";
  const slot = item?.slot_code || "";

  if (/магическ/u.test(name)) {
    return false;
  }

  if (/(большой щит|мифриловый браслет хранителя)/iu.test(name)) {
    return true;
  }

  return /(велкен|мифрил)/iu.test(name) && ["helmet", "cloak", "armor", "gloves", "boots"].includes(slot);
}

function isCustomDefenseScaleItem(item) {
  const name = item?.name || "";
  return /(щит стража|костяной щит|магический браслет хранителя)/iu.test(name);
}

function isDefaultDefenseScaleEquipmentItem(item) {
  const slot = item?.slot_code || "";
  return SLOT_CONFIG.some((entry) => entry.sourceSlot === slot);
}

function collectEquipmentSetBonus({ name, bonuses, isSetItem }) {
  const setItems = getEquippedSlots()
    .map((slot) => {
      const selected = state.equipped[slot.key];
      const item = selected ? state.itemsById.get(selected.itemId) : null;
      if (!isSetItem(item)) {
        return null;
      }

      return {
        item,
        level: getUpgradeNumber(getValidUpgradeLevel(item, selected.upgradeLevel)),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.level - a.level);

  if (setItems.length < 3) {
    return null;
  }

  const setSize = Math.min(5, setItems.length);
  const activeItems = setItems.slice(0, setSize);
  const setLevel = Math.min(...activeItems.map((entry) => entry.level));
  const sourceStats = bonuses[setLevel]?.[setSize] || [];
  if (!sourceStats.length) {
    return null;
  }

  const displayStats = new Map();
  sourceStats.forEach((stat) => addStatWithRules(displayStats, stat));

  return {
    name,
    itemCount: setSize,
    setLevel,
    stats: [...displayStats.values()],
  };
}

function collectBaphometSetBonus() {
  return collectEquipmentSetBonus({
    name: "Бафомета",
    bonuses: BAPHOMET_SET_BONUSES,
    isSetItem: isBaphometSetItem,
  });
}

function collectIfritSetBonus() {
  return collectEquipmentSetBonus({
    name: "Ифрита",
    bonuses: IFRIT_SET_BONUSES,
    isSetItem: isIfritSetItem,
  });
}

function getStatPriority(label) {
  const index = SECONDARY_STAT_PRIORITY.indexOf(label);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function formatStatNumber(value) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  const rounded = Math.round(value * 100) / 100;
  const precision = Number.isInteger(rounded * 10) ? 1 : 2;
  return rounded.toFixed(precision).replace(".", ",");
}

function formatStatValue(value, unit = "") {
  if (!value) {
    return "0";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatStatNumber(value)}${unit}`;
}

function formatBoardPrimaryValue(stat) {
  return formatStatNumber(Math.max(0, stat.value));
}

function createCollectedStatsBucket() {
  return {
    numericStats: new Map(),
    effects: new Map(),
  };
}

function collectPetSelectionIntoBucket(selection, bucket) {
  if (!selection || !bucket) {
    return;
  }

  const pet = state.petItemsById.get(String(selection.itemId));
  if (!pet) {
    return;
  }

  collectItemParamsIntoBucket(pet, { upgradeLevel: getDefaultUpgradeLevel(pet) }, bucket);
  getPetMergeStats(selection.mergeCounts).forEach((stat) => addStatWithRules(bucket.numericStats, stat));
}

function collectItemParamsIntoBucket(item, selected, bucket) {
  const level = getValidUpgradeLevel(item, selected.upgradeLevel);
  const params = getParamsForLevel(item, level);
  params.forEach((line) => {
    const cleanLine = normalizeText(line);
    if (!cleanLine) {
      return;
    }

    const numericStat = parseNumericStat(cleanLine);
    if (numericStat) {
      addStatWithRules(bucket.numericStats, numericStat);
      return;
    }

    bucket.effects.set(cleanLine.toLowerCase(), cleanLine);
  });
}

function getDisplayStatsFromMap(statsMap, { includeMainZeros = false } = {}) {
  const mainStats = MAIN_STATS.map((label) => {
    const exact = statsMap.get(`${label}::`) || statsMap.get(`${label}::%`);
    return {
      label,
      unit: exact?.unit || "",
      value: exact?.value || 0,
    };
  }).filter((stat) => includeMainZeros || stat.value !== 0);

  const secondaryStats = [...statsMap.values()]
    .filter((stat) => !MAIN_STATS.includes(stat.label))
    .sort((a, b) => {
      const priorityDiff = getStatPriority(a.label) - getStatPriority(b.label);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return localizeText(a.label).localeCompare(localizeText(b.label), getCurrentLanguage());
    });

  return {
    mainStats,
    secondaryStats,
    allStats: [...mainStats, ...secondaryStats],
  };
}

function collectEquippedStats() {
  const inventoryBucket = createCollectedStatsBucket();
  const sphereBucket = createCollectedStatsBucket();
  const trophyBucket = createCollectedStatsBucket();
  const petBucket = createCollectedStatsBucket();
  const numericStats = new Map();
  const effects = new Map();
  const setBonuses = [];

  getEquippedSlots().forEach((slot) => {
    const selected = state.equipped[slot.key];
    const item = state.itemsById.get(selected.itemId);
    if (!item) {
      return;
    }
    collectItemParamsIntoBucket(item, selected, inventoryBucket);
  });

  getEquippedSphereSlots().forEach((slot) => {
    const selected = state.sphereEquipped[slot.key];
    const item = state.sphereItemsById.get(selected.itemId);
    if (!item) {
      return;
    }
    collectItemParamsIntoBucket(item, selected, sphereBucket);
  });

  getEquippedTrophySlots().forEach((slot) => {
    const selected = state.trophyEquipped[slot.key];
    const item = state.trophyItemsById.get(selected.itemId);
    if (!item) {
      return;
    }
    collectItemParamsIntoBucket(item, selected, trophyBucket);
  });

  collectPetSelectionIntoBucket(state.petEquipped, petBucket);

  [inventoryBucket, sphereBucket, trophyBucket, petBucket].forEach((bucket) => {
    addStatCollection(numericStats, [...bucket.numericStats.values()]);
    bucket.effects.forEach((effect, key) => {
      effects.set(key, effect);
    });
  });

  [collectBaphometSetBonus(), collectIfritSetBonus()].forEach((setBonus) => {
    if (!setBonus) {
      return;
    }

    setBonus.stats.forEach((stat) => addNumericStat(numericStats, stat));
    setBonuses.push(setBonus);
  });

  return {
    numericStats,
    setBonuses,
    sourceBreakdown: {
      inventory: inventoryBucket,
      pet: petBucket,
      spheres: sphereBucket,
      trophies: trophyBucket,
    },
    effects: [...effects.values()].sort((a, b) => localizeText(a).localeCompare(localizeText(b), getCurrentLanguage())),
  };
}

  return {
    escapeHtml,
    renderItemIcon,
    canonicalizeStatLabel,
    parseNumericStat,
    addNumericStat,
    addStatCollection,
    addStatWithRules,
    applyAllStatsBonus,
    applyGroupedAttackStat,
    getUpgradeNumber,
    isBaphometSetItem,
    isIfritSetItem,
    isMagicVelkenOrMythrilItem,
    isPlainVelkenOrMythrilDefenseItem,
    isCustomDefenseScaleItem,
    isDefaultDefenseScaleEquipmentItem,
    getStatPriority,
    formatStatNumber,
    formatStatValue,
    formatBoardPrimaryValue,
    createCollectedStatsBucket,
    collectPetSelectionIntoBucket,
    collectItemParamsIntoBucket,
    getDisplayStatsFromMap,
    collectEquippedStats,
    computeBaseClassStat,
  };
}
