const SLOT_CONFIG = [
  { key: "earring", label: "Серьги", sourceSlot: "earring", col: 1, row: 1 },
  { key: "helmet", label: "Шлемы", sourceSlot: "helmet", col: 2, row: 1 },
  { key: "cloak", label: "Плащи", sourceSlot: "cloak", col: 3, row: 1 },
  { key: "necklace", label: "Ожерелья", sourceSlot: "necklace", col: 1, row: 2 },
  { key: "armor", label: "Доспехи", sourceSlot: "armor", col: 2, row: 2 },
  { key: "shield", label: "Щиты", sourceSlot: "shield", col: 3, row: 2 },
  { key: "weapon", label: "Оружие", sourceSlot: "weapon", col: 1, row: 3 },
  { key: "belt", label: "Ремни", sourceSlot: "belt", col: 2, row: 3 },
  { key: "gloves", label: "Перчатки", sourceSlot: "gloves", col: 3, row: 3 },
  { key: "ring_left", label: "Кольцо I", sourceSlot: "ring", col: 1, row: 4 },
  { key: "boots", label: "Сапоги", sourceSlot: "boots", col: 2, row: 4 },
  { key: "ring_right", label: "Кольцо II", sourceSlot: "ring", col: 3, row: 4 },
];

const STORAGE_KEY = "r2-doll-equip-v3";
const CLASS_STORAGE_KEY = "r2-doll-class-v1";
const SIDEBAR_TAB_STORAGE_KEY = "r2-doll-sidebar-tab-v1";
const NICKNAME_STORAGE_KEY = "r2-doll-board-nickname-v1";
const MAIN_STATS = ["HP", "MP", "Сила", "Ловкость", "Интеллект", "Защита"];
const SECONDARY_STAT_PRIORITY = [
  "Скорость атаки",
  "Скорость бега",
  "Уровень всех атак",
  "Уровень ближних атак",
  "Уровень дальних атак",
  "Уровень магических атак",
  "Точность всех атак",
  "Точность ближних атак",
  "Точность дальних атак",
  "Точность магических атак",
  "Шанс нанести крит. удар",
  "Шанс получить крит. удар",
  "Доп. урон при крит. ударе",
  "Получаемый крит. урон",
  "Поглощение",
  "Уклонение",
  "Восстановление HP",
  "Восстановление MP",
  "Особое восстановление HP",
  "Особое восстановление MP",
  "Эффект зелий здоровья",
  "Уровень зелий здоровья",
  "Вес",
];
const STAT_LABEL_ALIASES = new Map([
  ["hp", "HP"],
  ["mp", "MP"],
  ["сила", "Сила"],
  ["ловкость", "Ловкость"],
  ["интеллект", "Интеллект"],
  ["защита", "Защита"],
  ["скорость атаки", "Скорость атаки"],
  ["скорость бега", "Скорость бега"],
  ["уровень всех атак", "Уровень всех атак"],
  ["уровень ближних атак", "Уровень ближних атак"],
  ["уровень дальних атак", "Уровень дальних атак"],
  ["уровень магических атак", "Уровень магических атак"],
  ["точность всех атак", "Точность всех атак"],
  ["точность ближних атак", "Точность ближних атак"],
  ["точность дальних атак", "Точность дальних атак"],
  ["точность магических атак", "Точность магических атак"],
  ["шанс нанести крит. удар", "Шанс нанести крит. удар"],
  ["шанс получить крит. удар", "Шанс получить крит. удар"],
  ["доп. урон при крит. ударе", "Доп. урон при крит. ударе"],
  ["получаемый крит. урон", "Получаемый крит. урон"],
  ["поглощение", "Поглощение"],
  ["уклонение", "Уклонение"],
  ["восстановление hp", "Восстановление HP"],
  ["восстановление mp", "Восстановление MP"],
  ["особое восстановление hp", "Особое восстановление HP"],
  ["особое восстановление mp", "Особое восстановление MP"],
  ["эффект зелий здоровья", "Эффект зелий здоровья"],
  ["уровень зелий здоровья", "Уровень зелий здоровья"],
  ["вес", "Вес"],
  ["все параметры", "Все параметры"],
]);
const CLASS_CONFIGS = {
  knight: {
    label: "Рыцарь",
    baseStats: [
      { label: "Сила", base: 6, growthType: "interval", interval: 3, amount: 1 },
      { label: "Ловкость", base: 3, growthType: "interval", interval: 6, amount: 1 },
      { label: "Интеллект", base: 1, growthType: "interval", interval: 9, amount: 1 },
      { label: "HP", base: 655, growthType: "per_level", amount: 5 },
      { label: "MP", base: 33, growthType: "per_level", amount: 1 },
      { label: "Вес", base: 3205, growthType: "per_level", amount: 25 },
    ],
    derivedStats(baseStats) {
      const strength = baseStats["Сила"] || 0;
      const dexterity = baseStats["Ловкость"] || 0;
      const intelligence = baseStats["Интеллект"] || 0;

      return [
        { label: "Уровень ближних атак", value: Math.floor(strength / 3), unit: "" },
        { label: "Точность ближних атак", value: Math.floor(strength / 2), unit: "" },
        { label: "Доп. урон при крит. ударе", value: Math.floor(strength / 12), unit: "" },
        { label: "Макс. HP от силы", value: strength * 2, unit: "" },
        { label: "Регенерация HP", value: Math.floor(strength / 12) * 0.1, unit: "" },
        { label: "Макс. вес от силы", value: strength * 30, unit: "" },
        { label: "Шанс нанести крит. удар", value: Math.floor(dexterity / 9), unit: "" },
        { label: "Скорость атаки", value: Math.floor(dexterity / 12), unit: "%" },
        { label: "Скорость передвижения", value: Math.floor(dexterity / 6), unit: "" },
        { label: "Макс. MP от интеллекта", value: intelligence * 2, unit: "" },
        { label: "Регенерация MP", value: Math.floor(intelligence / 6) * 0.1, unit: "" },
      ];
    },
  },
  ranger: {
    label: "Рейнджер",
    baseStats: [
      { label: "Сила", base: 3, growthType: "interval", interval: 6, amount: 1 },
      { label: "Ловкость", base: 6, growthType: "interval", interval: 3, amount: 1 },
      { label: "Интеллект", base: 1, growthType: "interval", interval: 9, amount: 1 },
      { label: "HP", base: 604, growthType: "per_level", amount: 4 },
      { label: "MP", base: 30, growthType: "per_level", amount: 1 },
      { label: "Вес", base: 3000, growthType: "per_level", amount: 15 },
    ],
    derivedStats(baseStats) {
      const strength = baseStats["Сила"] || 0;
      const dexterity = baseStats["Ловкость"] || 0;
      const intelligence = baseStats["Интеллект"] || 0;

      return [
        { label: "Доп. урон при крит. ударе", value: Math.floor(strength / 9), unit: "" },
        { label: "Макс. HP от силы", value: strength * 2, unit: "" },
        { label: "Регенерация HP", value: Math.floor(strength / 9) * 0.1, unit: "" },
        { label: "Макс. вес от силы", value: strength * 30, unit: "" },
        { label: "Уровень дальних атак", value: Math.floor(dexterity / 3), unit: "" },
        { label: "Точность дальних атак", value: Math.floor(dexterity / 2), unit: "" },
        { label: "Защита", value: Math.floor(dexterity / 6), unit: "" },
        { label: "Шанс нанести крит. удар", value: Math.floor(dexterity / 9), unit: "" },
        { label: "Скорость атаки", value: Math.floor(dexterity / 17), unit: "%" },
        { label: "Скорость передвижения", value: Math.floor(dexterity / 7), unit: "" },
        { label: "Макс. MP от интеллекта", value: intelligence * 2, unit: "" },
        { label: "Регенерация MP", value: Math.floor(intelligence / 4) * 0.1, unit: "" },
      ];
    },
  },
  mage: {
    label: "Маг",
    baseStats: [
      { label: "Сила", base: 6, growthType: "interval", interval: 3, amount: 1 },
      { label: "Ловкость", base: 2, growthType: "interval", interval: 7, amount: 1 },
      { label: "Интеллект", base: 4, growthType: "interval", interval: 4, amount: 1 },
      { label: "HP", base: 356, growthType: "per_level", amount: 4 },
      { label: "MP", base: 44, growthType: "per_level", amount: 2 },
      { label: "Вес", base: 3200, growthType: "per_level", amount: 20 },
    ],
    derivedStats(baseStats) {
      const strength = baseStats["Сила"] || 0;
      const dexterity = baseStats["Ловкость"] || 0;
      const intelligence = baseStats["Интеллект"] || 0;

      return [
        { label: "Уровень ближних атак", value: Math.floor(strength / 3), unit: "" },
        { label: "Точность ближних атак", value: Math.floor(strength / 2), unit: "" },
        { label: "Доп. урон при крит. ударе", value: Math.floor(strength / 12), unit: "" },
        { label: "Макс. HP от силы", value: strength * 2, unit: "" },
        { label: "Регенерация HP", value: Math.floor(strength / 9) * 0.1, unit: "" },
        { label: "Макс. вес от силы", value: strength * 30, unit: "" },
        { label: "Шанс нанести крит. удар", value: Math.floor(dexterity / 9), unit: "" },
        { label: "Скорость атаки", value: Math.floor(dexterity / 12), unit: "%" },
        { label: "Скорость передвижения", value: Math.floor(dexterity / 6), unit: "" },
        { label: "Уровень магических атак", value: Math.floor(intelligence / 3), unit: "" },
        { label: "Точность магических атак", value: Math.floor(intelligence / 2), unit: "" },
        { label: "Макс. MP от интеллекта", value: intelligence * 3, unit: "" },
        { label: "Регенерация MP", value: Math.floor(intelligence / 4) * 0.1, unit: "" },
      ];
    },
  },
  summoner: {
    label: "Призыватель",
    baseStats: [
      { label: "Сила", base: 5, growthType: "interval", interval: 4, amount: 1 },
      { label: "Ловкость", base: 5, growthType: "interval", interval: 4, amount: 1 },
      { label: "Интеллект", base: 3, growthType: "interval", interval: 6, amount: 1 },
      { label: "HP", base: 354, growthType: "per_level", amount: 4 },
      { label: "MP", base: 37, growthType: "per_level", amount: 1 },
      { label: "Вес", base: 3165, growthType: "per_level", amount: 15 },
    ],
    derivedStats(baseStats) {
      const strength = baseStats["Сила"] || 0;
      const dexterity = baseStats["Ловкость"] || 0;
      const intelligence = baseStats["Интеллект"] || 0;

      return [
        { label: "Уровень ближних атак", value: Math.floor(strength / 3), unit: "" },
        { label: "Точность ближних атак", value: Math.floor(strength / 2), unit: "" },
        { label: "Доп. урон при крит. ударе", value: Math.floor(strength / 15), unit: "" },
        { label: "Макс. HP от силы", value: strength * 2, unit: "" },
        { label: "Регенерация HP", value: Math.floor(strength / 12) * 0.1, unit: "" },
        { label: "Макс. вес от силы", value: strength * 30, unit: "" },
        { label: "Уровень дальних атак", value: Math.floor(dexterity / 3), unit: "" },
        { label: "Точность дальних атак", value: Math.floor(dexterity / 2), unit: "" },
        { label: "Защита", value: Math.floor(dexterity / 5), unit: "" },
        { label: "Шанс нанести крит. удар", value: Math.floor(dexterity / 15), unit: "" },
        { label: "Скорость атаки", value: Math.floor(dexterity / 13), unit: "%" },
        { label: "Скорость передвижения", value: Math.floor(dexterity / 8), unit: "" },
        { label: "Уровень магических атак", value: Math.floor(intelligence / 6), unit: "" },
        { label: "Точность магических атак", value: Math.floor(intelligence / 6), unit: "" },
        { label: "Макс. MP от интеллекта", value: intelligence * 2, unit: "" },
        { label: "Регенерация MP", value: Math.floor(intelligence / 4) * 0.1, unit: "" },
      ];
    },
  },
  assassin: {
    label: "Ассасин",
    baseStats: [
      { label: "Сила", base: 5, growthType: "interval", interval: 5, amount: 1 },
      { label: "Ловкость", base: 6, growthType: "interval", interval: 3, amount: 1 },
      { label: "Интеллект", base: 1, growthType: "interval", interval: 9, amount: 1 },
      { label: "HP", base: 153, growthType: "per_level", amount: 3 },
      { label: "MP", base: 33, growthType: "per_level", amount: 1 },
      { label: "Вес", base: 3170, growthType: "per_level", amount: 20 },
    ],
    derivedStats(baseStats) {
      const strength = baseStats["Сила"] || 0;
      const dexterity = baseStats["Ловкость"] || 0;
      const intelligence = baseStats["Интеллект"] || 0;

      return [
        { label: "Уровень ближних атак", value: Math.floor(strength / 3), unit: "" },
        { label: "Точность ближних атак", value: Math.floor(strength / 2), unit: "" },
        { label: "Доп. урон при крит. ударе", value: Math.floor(strength / 7), unit: "" },
        { label: "Макс. HP от силы", value: strength * 2, unit: "" },
        { label: "Регенерация HP", value: Math.floor(strength / 9) * 0.1, unit: "" },
        { label: "Макс. вес от силы", value: strength * 30, unit: "" },
        { label: "Защита", value: Math.floor(dexterity / 4), unit: "" },
        { label: "Шанс нанести крит. удар", value: Math.floor(dexterity / 10), unit: "" },
        { label: "Скорость атаки", value: Math.floor(dexterity / 12), unit: "%" },
        { label: "Скорость передвижения", value: Math.floor(dexterity / 9), unit: "" },
        { label: "Макс. MP от интеллекта", value: intelligence * 2, unit: "" },
        { label: "Регенерация MP", value: Math.floor(intelligence / 4) * 0.1, unit: "" },
      ];
    },
  },
};

const state = {
  items: [],
  itemsById: new Map(),
  equipped: loadEquippedState(),
  expandedCategories: new Set(),
  activeSlot: null,
  lastAction: "Выберите слот на кукле или откройте категорию справа.",
  classConfig: loadClassState(),
  activeSidebarTab: loadSidebarTabState(),
  nickname: loadNicknameState(),
};

function getItemsForSlot(slotCode) {
  return state.items
    .filter((item) => item.slot_code === slotCode)
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

function getLevelKeys(item) {
  return Object.keys(item.upgrade_levels || {}).sort((a, b) => {
    return Number(a.replace("+", "")) - Number(b.replace("+", ""));
  });
}

function getDefaultUpgradeLevel(item) {
  return getLevelKeys(item)[0] || "+0";
}

function getValidUpgradeLevel(item, level) {
  const levels = getLevelKeys(item);
  return levels.includes(level) ? level : getDefaultUpgradeLevel(item);
}

function getParamsForLevel(item, level) {
  return item?.upgrade_levels?.[level] || [];
}

function getSlotConfig(slotKey) {
  return SLOT_CONFIG.find((slot) => slot.key === slotKey);
}

function getFirstAvailableSlotKey() {
  return SLOT_CONFIG.find((slot) => getItemsForSlot(slot.sourceSlot).length)?.key || SLOT_CONFIG[0]?.key || null;
}

function getEquippedSlots() {
  return SLOT_CONFIG.filter((slot) => state.equipped[slot.key]);
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function createItemUid(item, index) {
  return `${item.slot_code}:${item.name}:${index}`;
}

function sanitizeClassLevel(level) {
  const numeric = Number(level);
  if (!Number.isFinite(numeric)) {
    return 1;
  }

  return Math.min(200, Math.max(1, Math.floor(numeric)));
}

function loadEquippedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function loadClassState() {
  try {
    const raw = localStorage.getItem(CLASS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const classKey = CLASS_CONFIGS[parsed?.classKey] ? parsed.classKey : "knight";
    const level = sanitizeClassLevel(parsed?.level ?? 1);
    return { classKey, level };
  } catch {
    return { classKey: "knight", level: 1 };
  }
}

function loadSidebarTabState() {
  try {
    const raw = localStorage.getItem(SIDEBAR_TAB_STORAGE_KEY);
    return ["equip", "stats", "class"].includes(raw) ? raw : "equip";
  } catch {
    return "equip";
  }
}

function loadNicknameState() {
  try {
    return normalizeText(localStorage.getItem(NICKNAME_STORAGE_KEY) || "");
  } catch {
    return "";
  }
}

function saveEquippedState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.equipped));
  } catch {
    // Ignore storage errors to keep the page usable in private/file contexts.
  }
}

function saveClassState() {
  try {
    localStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(state.classConfig));
  } catch {
    // Ignore storage errors to keep the page usable in private/file contexts.
  }
}

function saveSidebarTabState() {
  try {
    localStorage.setItem(SIDEBAR_TAB_STORAGE_KEY, state.activeSidebarTab);
  } catch {
    // Ignore storage errors to keep the page usable in private/file contexts.
  }
}

function saveNicknameState() {
  try {
    localStorage.setItem(NICKNAME_STORAGE_KEY, state.nickname);
  } catch {
    // Ignore storage errors to keep the page usable in private/file contexts.
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  const key = `${stat.label}::${stat.unit}`;
  const current = target.get(key) || { label: stat.label, unit: stat.unit, value: 0 };
  current.value += stat.value;
  target.set(key, current);
}

function addStatCollection(target, stats) {
  stats.forEach((stat) => addNumericStat(target, stat));
}

function applyAllStatsBonus(target, stat) {
  ["Сила", "Ловкость", "Интеллект"].forEach((label) => {
    addNumericStat(target, { label, value: stat.value, unit: stat.unit });
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

function collectEquippedStats() {
  const numericStats = new Map();
  const effects = new Map();

  getEquippedSlots().forEach((slot) => {
    const selected = state.equipped[slot.key];
    const item = state.itemsById.get(selected.itemId);
    if (!item) {
      return;
    }

    const level = getValidUpgradeLevel(item, selected.upgradeLevel);
    const params = getParamsForLevel(item, level);

    params.forEach((line) => {
      const cleanLine = normalizeText(line);
      if (!cleanLine) {
        return;
      }

      const numericStat = parseNumericStat(cleanLine);
      if (numericStat) {
        if (numericStat.label === "Все параметры") {
          applyAllStatsBonus(numericStats, numericStat);
          return;
        }
        addNumericStat(numericStats, numericStat);
        return;
      }

      effects.set(cleanLine.toLowerCase(), cleanLine);
    });
  });

  return {
    numericStats,
    effects: [...effects.values()].sort((a, b) => a.localeCompare(b, "ru")),
  };
}

function renderStatRows(stats) {
  return stats.map((stat) => {
    const rowClass = stat.value < 0 ? "is-negative" : "is-positive";
    return `
      <div class="stat-row ${rowClass}">
        <span class="stat-name">${escapeHtml(stat.label)}</span>
        <span class="stat-value">${escapeHtml(formatStatValue(stat.value, stat.unit))}</span>
      </div>
    `;
  }).join("");
}

function computeBaseClassStat(statConfig, level) {
  if (statConfig.growthType === "per_level") {
    return statConfig.base + Math.max(0, level - 1) * statConfig.amount;
  }

  if (statConfig.growthType === "interval") {
    return statConfig.base + Math.floor(Math.max(0, level - 1) / statConfig.interval) * statConfig.amount;
  }

  return statConfig.base;
}

function renderStatsPanel() {
  const mainContainer = document.getElementById("stats-main-list");
  const extraContainer = document.getElementById("stats-extra-list");
  const effectsContainer = document.getElementById("stats-effects-list");
  if (!mainContainer || !extraContainer || !effectsContainer) {
    return;
  }

  const equippedSlots = getEquippedSlots();
  if (!equippedSlots.length) {
    const emptyHtml = '<div class="empty-note">Наденьте предметы, чтобы увидеть суммарные параметры.</div>';
    mainContainer.innerHTML = emptyHtml;
    extraContainer.innerHTML = emptyHtml;
    effectsContainer.innerHTML = emptyHtml;
    return;
  }

  const { numericStats, effects } = collectEquippedStats();
  const mainStats = MAIN_STATS.map((label) => {
    const exact = numericStats.get(`${label}::`) || numericStats.get(`${label}::%`);
    return {
      label,
      unit: exact?.unit || "",
      value: exact?.value || 0,
    };
  });

  const secondaryStats = [...numericStats.values()]
    .filter((stat) => !MAIN_STATS.includes(stat.label))
    .sort((a, b) => {
      const priorityDiff = getStatPriority(a.label) - getStatPriority(b.label);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.label.localeCompare(b.label, "ru");
    });

  mainContainer.innerHTML = renderStatRows(mainStats);
  extraContainer.innerHTML = secondaryStats.length
    ? renderStatRows(secondaryStats)
    : '<div class="empty-note">Дополнительных числовых параметров пока нет.</div>';
  effectsContainer.innerHTML = effects.length
    ? effects.map((effect) => `<div class="effect-pill">${escapeHtml(effect)}</div>`).join("")
    : '<div class="empty-note">Особые эффекты не найдены.</div>';
}

function getClassPanelData() {
  const config = CLASS_CONFIGS[state.classConfig.classKey] || CLASS_CONFIGS.knight;
  const baseStatMap = {};
  const baseStats = config.baseStats.map((statConfig) => {
    const value = computeBaseClassStat(statConfig, state.classConfig.level);
    baseStatMap[statConfig.label] = value;
    return {
      label: statConfig.label,
      value,
      unit: "",
    };
  });

  const derivedStats = config.derivedStats(baseStatMap);

  return {
    config,
    baseStatMap,
    baseStats,
    derivedStats,
  };
}

function renderClassPanel() {
  const select = document.getElementById("class-select");
  const levelInput = document.getElementById("class-level-input");
  const baseStatsContainer = document.getElementById("class-base-stats");
  const derivedStatsContainer = document.getElementById("class-derived-stats");
  if (!select || !levelInput || !baseStatsContainer || !derivedStatsContainer) {
    return;
  }

  const { config, baseStats, derivedStats } = getClassPanelData();
  select.value = state.classConfig.classKey;
  levelInput.value = String(state.classConfig.level);

  baseStatsContainer.innerHTML = renderStatRows(baseStats);
  derivedStatsContainer.innerHTML = renderStatRows(derivedStats);
}

function getTotalStatsData() {
  const totalStats = new Map();
  const { numericStats, effects } = collectEquippedStats();
  const { baseStats, derivedStats } = getClassPanelData();

  addStatCollection(totalStats, baseStats);
  addStatCollection(totalStats, derivedStats);
  addStatCollection(totalStats, [...numericStats.values()]);

  const mainStats = MAIN_STATS.map((label) => {
    const exact = totalStats.get(`${label}::`) || totalStats.get(`${label}::%`);
    return {
      label,
      unit: exact?.unit || "",
      value: exact?.value || 0,
    };
  });

  const secondaryStats = [...totalStats.values()]
    .filter((stat) => !MAIN_STATS.includes(stat.label))
    .sort((a, b) => {
      const priorityDiff = getStatPriority(a.label) - getStatPriority(b.label);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.label.localeCompare(b.label, "ru");
    });

  return {
    mainStats,
    secondaryStats,
    effects,
  };
}

function renderBoardTotalStats() {
  const mainContainer = document.getElementById("board-main-stats");
  const extraContainer = document.getElementById("board-extra-stats");
  const nicknameInput = document.getElementById("board-nickname-input");
  if (!mainContainer || !extraContainer || !nicknameInput) {
    return;
  }

  nicknameInput.value = state.nickname;

  const { mainStats, secondaryStats } = getTotalStatsData();
  const visibleMainStats = mainStats.filter((stat) => stat.value !== 0);
  const visibleSecondaryStats = secondaryStats.filter((stat) => stat.value !== 0);

  if (!visibleMainStats.length && !visibleSecondaryStats.length) {
    mainContainer.innerHTML = '<div class="board-stats-empty">Надень предметы, чтобы увидеть итоговые параметры.</div>';
    extraContainer.innerHTML = "";
    return;
  }

  mainContainer.innerHTML = visibleMainStats.length
    ? visibleMainStats.map((stat) => `
    <div class="board-stat-row board-stat-row-main">
      <span class="board-stat-name">${escapeHtml(stat.label)}</span>
      <span class="board-stat-value">${escapeHtml(formatBoardPrimaryValue(stat))}</span>
    </div>
  `).join("")
    : "";

  extraContainer.innerHTML = visibleSecondaryStats.length
    ? visibleSecondaryStats.map((stat) => `
    <div class="board-stat-row board-stat-row-extra">
      <span class="board-stat-name">${escapeHtml(stat.label)}</span>
      <span class="board-stat-value">${escapeHtml(formatStatValue(stat.value, stat.unit))}</span>
    </div>
  `).join("")
    : '<div class="board-stats-empty">Дополнительных параметров нет.</div>';
}

function renderTotalPanel() {
  const mainContainer = document.getElementById("total-main-stats");
  const extraContainer = document.getElementById("total-extra-stats");
  const effectsContainer = document.getElementById("total-effects-list");
  if (!mainContainer || !extraContainer || !effectsContainer) {
    return;
  }

  const { mainStats, secondaryStats, effects } = getTotalStatsData();

  mainContainer.innerHTML = renderStatRows(mainStats);
  extraContainer.innerHTML = secondaryStats.length
    ? renderStatRows(secondaryStats)
    : '<div class="empty-note">Дополнительных суммарных параметров пока нет.</div>';
  effectsContainer.innerHTML = effects.length
    ? effects.map((effect) => `<div class="effect-pill">${escapeHtml(effect)}</div>`).join("")
    : '<div class="empty-note">Эффектов экипировки пока нет.</div>';
}

function bindClassControls() {
  const select = document.getElementById("class-select");
  const levelInput = document.getElementById("class-level-input");
  if (!select || !levelInput) {
    return;
  }

  select.addEventListener("change", () => {
    state.classConfig.classKey = CLASS_CONFIGS[select.value] ? select.value : "knight";
    saveClassState();
    renderClassPanel();
    renderBoardTotalStats();
    renderTotalPanel();
  });

  levelInput.addEventListener("input", () => {
    state.classConfig.level = sanitizeClassLevel(levelInput.value);
    saveClassState();
    renderClassPanel();
    renderBoardTotalStats();
    renderTotalPanel();
  });
}

function bindBoardNicknameControl() {
  const input = document.getElementById("board-nickname-input");
  if (!input || input.dataset.bound === "1") {
    return;
  }

  input.dataset.bound = "1";
  input.addEventListener("input", () => {
    state.nickname = normalizeText(input.value);
    saveNicknameState();
  });
}

function setLastAction(message) {
  state.lastAction = message;
  const actionEl = document.getElementById("last-action");
  if (actionEl) {
    actionEl.textContent = message;
  }
}

function renderSidebarTabs() {
  document.querySelectorAll(".sidebar-tab-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === state.activeSidebarTab);
  });

  document.querySelectorAll(".sidebar-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.tabPanel === state.activeSidebarTab);
  });
}

function setSidebarTab(tabKey) {
  if (!["equip", "stats", "class"].includes(tabKey)) {
    return;
  }

  state.activeSidebarTab = tabKey;
  saveSidebarTabState();
  renderSidebarTabs();
}

function bindSidebarTabs() {
  document.querySelectorAll(".sidebar-tab-button").forEach((button) => {
    button.addEventListener("click", () => setSidebarTab(button.dataset.tab));
  });
}

function sanitizeEquippedState() {
  const previous = state.equipped && typeof state.equipped === "object" ? state.equipped : {};
  const next = {};
  let changed = false;

  Object.entries(previous).forEach(([slotKey, selection]) => {
    const slot = getSlotConfig(slotKey);
    const item = state.itemsById.get(String(selection?.itemId));
    if (!slot || !item || item.slot_code !== slot.sourceSlot) {
      changed = true;
      return;
    }

    const normalized = {
      itemId: String(item.uid),
      upgradeLevel: getValidUpgradeLevel(item, selection?.upgradeLevel),
    };

    if (
      String(selection?.itemId) !== normalized.itemId ||
      selection?.upgradeLevel !== normalized.upgradeLevel
    ) {
      changed = true;
    }

    next[slotKey] = normalized;
  });

  if (Object.keys(next).length !== Object.keys(previous).length) {
    changed = true;
  }

  state.equipped = next;

  if (changed) {
    saveEquippedState();
  }
}

function initializeUiState() {
  const equippedSlotKeys = getEquippedSlots().map((slot) => slot.key);
  const initialSlot = equippedSlotKeys[0] || getFirstAvailableSlotKey();

  state.activeSlot = initialSlot;
  state.expandedCategories = new Set([...equippedSlotKeys, initialSlot].filter(Boolean));

  if (equippedSlotKeys.length) {
    setLastAction("Сборка загружена. Выберите слот, чтобы сменить предмет или уровень заточки.");
  } else {
    setLastAction("Выберите слот на кукле или откройте категорию справа.");
  }
}

function scrollCategoryIntoView(slotKey) {
  const block = document.querySelector(`.category-block[data-slot="${slotKey}"]`);
  block?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderAll() {
  renderSidebarTabs();
  renderDollSlots();
  renderBoardTotalStats();
  renderEquippedList();
  renderStatsPanel();
  renderClassPanel();
  renderTotalPanel();
  renderCategoryList();
}

function equipItem(slotKey, itemId) {
  const slot = getSlotConfig(slotKey);
  const item = state.itemsById.get(String(itemId));
  if (!slot || !item || item.slot_code !== slot.sourceSlot) return;

  state.equipped[slotKey] = {
    itemId: String(item.uid),
    upgradeLevel: getDefaultUpgradeLevel(item),
  };
  state.activeSlot = slotKey;
  state.expandedCategories.add(slotKey);
  saveEquippedState();
  renderAll();
  setLastAction(`${slot.label}: надет предмет "${item.name}".`);
}

function clearSlot(slotKey) {
  const slot = getSlotConfig(slotKey);
  delete state.equipped[slotKey];
  saveEquippedState();
  renderAll();
  if (slot) {
    setLastAction(`${slot.label}: предмет снят.`);
  }
}

function setUpgradeLevel(slotKey, level) {
  const slot = getSlotConfig(slotKey);
  const selected = state.equipped[slotKey];
  if (!selected) return;

  const item = state.itemsById.get(selected.itemId);
  if (!item) return;

  selected.upgradeLevel = getValidUpgradeLevel(item, level);
  saveEquippedState();
  renderAll();
  if (slot) {
    setLastAction(`${slot.label}: уровень заточки переключён на ${selected.upgradeLevel}.`);
  }
}

function selectSlot(slotKey, { scroll = false } = {}) {
  const slot = getSlotConfig(slotKey);
  if (!slot) return;

  state.activeSlot = slotKey;
  state.expandedCategories.add(slotKey);
  renderAll();

  if (scroll) {
    scrollCategoryIntoView(slotKey);
  }

  const count = getItemsForSlot(slot.sourceSlot).length;
  if (count) {
    setLastAction(`${slot.label}: доступно ${count} предметов.`);
  } else {
    setLastAction(`${slot.label}: для этого слота пока нет предметов.`);
  }
}

function renderDollSlots() {
  const container = document.getElementById("slot-grid");
  if (!container) return;

  container.innerHTML = SLOT_CONFIG.map((slot) => {
    const items = getItemsForSlot(slot.sourceSlot);
    const selected = state.equipped[slot.key];
    const item = selected ? state.itemsById.get(selected.itemId) : null;
    const level = item ? getValidUpgradeLevel(item, selected.upgradeLevel) : null;

    const classes = ["slot-pin"];
    if (state.activeSlot === slot.key) classes.push("is-active");
    if (item) classes.push("is-filled");
    if (!items.length) classes.push("is-unavailable");

    const metaText = item ? level : items.length ? `${items.length} шт.` : "нет";
    const titleText = item
      ? `${slot.label}: ${item.name} (${level})`
      : items.length
        ? `${slot.label}: ${items.length} предметов`
        : `${slot.label}: данных нет`;

    return `
      <button
        type="button"
        class="${classes.join(" ")}"
        data-slot="${slot.key}"
        style="grid-column: ${slot.col}; grid-row: ${slot.row};"
        title="${escapeHtml(titleText)}"
        aria-label="${escapeHtml(titleText)}"
      >
        <span class="slot-pin-label">${escapeHtml(slot.label)}</span>
        <span class="slot-pin-meta">${escapeHtml(metaText)}</span>
      </button>
    `;
  }).join("");

  container.querySelectorAll(".slot-pin").forEach((button) => {
    button.addEventListener("click", () => selectSlot(button.dataset.slot, { scroll: true }));
  });
}

function clearAll() {
  state.equipped = {};
  saveEquippedState();
  renderAll();
  setLastAction("Все предметы сняты.");
}

function toggleCategory(slotKey) {
  const slot = getSlotConfig(slotKey);
  if (state.expandedCategories.has(slotKey)) {
    state.expandedCategories.delete(slotKey);
  } else {
    state.expandedCategories.add(slotKey);
  }

  state.activeSlot = slotKey;
  renderAll();

  if (slot) {
    const isExpanded = state.expandedCategories.has(slotKey);
    setLastAction(`${slot.label}: список ${isExpanded ? "открыт" : "свёрнут"}.`);
  }
}

function renderEquippedList() {
  const list = document.getElementById("equipped-list");
  const countEl = document.getElementById("equipped-count");
  const entries = getEquippedSlots();
  countEl.textContent = entries.length;

  if (!entries.length) {
    const template = document.getElementById("equipped-empty-template");
    list.innerHTML = template ? template.innerHTML.trim() : '<div class="empty-note">Пока ничего не надето</div>';
    return;
  }

  list.innerHTML = entries.map((slot) => {
    const selected = state.equipped[slot.key];
    const item = state.itemsById.get(selected.itemId);
    if (!item) return "";

    const levels = getLevelKeys(item);
    const level = getValidUpgradeLevel(item, selected.upgradeLevel);
    const params = getParamsForLevel(item, level);
    const levelControl = levels.length > 1
      ? `
        <select class="upgrade-select" data-slot="${slot.key}" aria-label="Уровень заточки ${escapeHtml(slot.label)}">
          ${levels.map((entry) => `<option value="${escapeHtml(entry)}" ${entry === level ? "selected" : ""}>${escapeHtml(entry)}</option>`).join("")}
        </select>
      `
      : `<span class="level-badge">${escapeHtml(level)}</span>`;

    return `
      <div class="equipped-card">
        <div class="equipped-header">
          <span class="slot-label">${escapeHtml(slot.label)}</span>
          ${levelControl}
          <button class="remove-btn" type="button" data-slot="${slot.key}">Снять</button>
        </div>
        <div class="item-name">${escapeHtml(item.name)}</div>
        ${params.length ? `<ul class="params-list">${params.map((param) => `<li>${escapeHtml(param)}</li>`).join("")}</ul>` : ""}
      </div>
    `;
  }).join("");

  list.querySelectorAll(".upgrade-select").forEach((select) => {
    select.addEventListener("change", () => setUpgradeLevel(select.dataset.slot, select.value));
  });

  list.querySelectorAll(".remove-btn").forEach((button) => {
    button.addEventListener("click", () => clearSlot(button.dataset.slot));
  });
}

function renderCategoryList() {
  const container = document.getElementById("category-list");
  const totalEl = document.getElementById("chooser-count");
  const totalItems = state.items.length;
  const activeSlot = getSlotConfig(state.activeSlot);

  totalEl.textContent = activeSlot
    ? `${totalItems} предметов · ${activeSlot.label}: ${getItemsForSlot(activeSlot.sourceSlot).length}`
    : `${totalItems} предметов`;

  container.innerHTML = SLOT_CONFIG.map((slot) => {
    const items = getItemsForSlot(slot.sourceSlot);
    const isExpanded = state.expandedCategories.has(slot.key);
    const selectedItemId = state.equipped[slot.key]?.itemId;

    let itemsHtml = "";
    if (isExpanded && items.length) {
      itemsHtml = items.map((item) => {
        const previewLevel = getDefaultUpgradeLevel(item);
        const params = getParamsForLevel(item, previewLevel);
        const isEquipped = String(item.uid) === String(selectedItemId || "");
        const previewText = params[0] || "Без параметров";

        return `
          <div class="catalog-item ${isEquipped ? "is-selected" : ""}" data-id="${escapeHtml(item.uid)}">
            <div class="item-row">
              <div class="item-info">
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-meta">${escapeHtml(previewLevel)} · ${escapeHtml(previewText)}</div>
              </div>
              <button class="equip-btn ${isEquipped ? "is-selected" : ""}" type="button" data-slot="${slot.key}" data-id="${escapeHtml(item.uid)}">
                ${isEquipped ? "Надето" : "Надеть"}
              </button>
            </div>
          </div>
        `;
      }).join("");
    } else if (isExpanded) {
      itemsHtml = '<div class="category-empty">Для этого слота пока нет предметов.</div>';
    }

    return `
      <div class="category-block ${state.activeSlot === slot.key ? "active" : ""}" data-slot="${slot.key}">
        <button class="category-header" type="button" data-slot="${slot.key}">
          <span class="cat-name">${escapeHtml(slot.label)}</span>
          <span class="cat-count">${items.length}</span>
          <span class="cat-arrow">${isExpanded ? "▼" : "▶"}</span>
        </button>
        <div class="category-items ${isExpanded ? "expanded" : "collapsed"}">
          ${itemsHtml}
        </div>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".category-header").forEach((button) => {
    button.addEventListener("click", () => toggleCategory(button.dataset.slot));
  });

  container.querySelectorAll(".equip-btn").forEach((button) => {
    button.addEventListener("click", () => equipItem(button.dataset.slot, button.dataset.id));
  });
}

async function loadItems() {
  if (Array.isArray(window.__EQUIPMENT_ITEMS__)) {
    return window.__EQUIPMENT_ITEMS__;
  }

  const response = await fetch("./equipment-items.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

async function init() {
  try {
    const rawItems = await loadItems();
    state.items = rawItems.map((item, index) => ({
      ...item,
      uid: createItemUid(item, index),
    }));
    state.itemsById = new Map(state.items.map((item) => [item.uid, item]));
    sanitizeEquippedState();
    initializeUiState();
    document.getElementById("total-items").textContent = state.items.length;
    renderAll();
    bindSidebarTabs();
    bindClassControls();
    bindBoardNicknameControl();
  } catch (err) {
    document.getElementById("category-list").innerHTML = `<div class="error-note">Ошибка загрузки данных: ${escapeHtml(err.message)}</div>`;
    document.getElementById("slot-grid").innerHTML = "";
    setLastAction("Каталог не загрузился.");
  }
}

document.getElementById("clear-all-button").addEventListener("click", clearAll);
init();
