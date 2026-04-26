const SLOT_CONFIG = [
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
    key: "ring_morph_passive",
    label: "Кольцо перевоплощения",
    catalogLabel: "Кольца перевоплощения",
    sourceSlot: "ring",
    renderOnDoll: false,
    isPassive: true,
    matches: (item) => isMorphRingItem(item),
  },
];

const SPHERE_SLOT_CONFIG = [
  {
    key: "sphere_life",
    label: "Сфера жизни",
    categoryKey: "sphere_type_1",
    positionClass: "sphere-pos-top-left",
    matches: (item) => item.category === "Сферы жизни",
  },
  {
    key: "sphere_mastery",
    label: "Сфера мастерства",
    categoryKey: "sphere_type_1",
    positionClass: "sphere-pos-top-center",
    matches: (item) => item.category === "Сферы мастерства",
  },
  {
    key: "sphere_soul",
    label: "Сфера души",
    categoryKey: "sphere_type_1",
    positionClass: "sphere-pos-top-right",
    matches: (item) => item.category === "Сферы души",
  },
  {
    key: "sphere_destruction",
    label: "Сфера разрушения",
    categoryKey: "sphere_type_1",
    positionClass: "sphere-pos-bottom-left-upper",
    matches: (item) => item.category === "Сферы разрушения",
  },
  {
    key: "sphere_protection",
    label: "Сфера защиты",
    categoryKey: "sphere_type_1",
    positionClass: "sphere-pos-bottom-right-upper",
    matches: (item) => item.category === "Сферы защиты",
  },
  {
    key: "sphere_harvest",
    label: "Сфера добычи",
    categoryKey: "sphere_type_2",
    positionClass: "sphere-pos-bottom-left",
    matches: (item) =>
      item.category === "Особые сферы" && /(алчност|гармони)/i.test(item.name || ""),
  },
  {
    key: "sphere_class",
    label: "Классовая сфера",
    categoryKey: "sphere_type_3",
    positionClass: "sphere-pos-bottom-center",
    matches: (item) =>
      item.category === "Особые сферы" && !/(алчност|гармони)/i.test(item.name || ""),
  },
  {
    key: "sphere_morph",
    label: "Сфера перевоплощения",
    categoryKey: "sphere_type_4",
    positionClass: "sphere-pos-bottom-right",
    matches: (item) => item.category === "Сферы перевоплощения",
  },
];

const SPHERE_CATEGORY_CONFIG = [
  { key: "sphere_type_1", label: "Сферы 1-го типа" },
  { key: "sphere_type_2", label: "Сферы 2-го типа" },
  { key: "sphere_type_3", label: "Сферы 3-го типа" },
  { key: "sphere_type_4", label: "Сферы 4-го типа" },
];

const SPHERE_TYPE_ONE_TABS = [
  { category: "Сферы разрушения", label: "Разрушения", slotKey: "sphere_destruction" },
  { category: "Сферы жизни", label: "Жизни", slotKey: "sphere_life" },
  { category: "Сферы мастерства", label: "Мастерства", slotKey: "sphere_mastery" },
  { category: "Сферы души", label: "Души", slotKey: "sphere_soul" },
  { category: "Сферы защиты", label: "Защиты", slotKey: "sphere_protection" },
];

const TROPHY_SLOT_CONFIG = [
  { key: "trophy_top_left", label: "Корона", statLabel: "HP", positionClass: "trophy-pos-top-left" },
  { key: "trophy_top_right", label: "Маска", statLabel: "Защита", positionClass: "trophy-pos-top-right" },
  { key: "trophy_middle_left", label: "Браслет", statLabel: "Сила", positionClass: "trophy-pos-middle-left" },
  { key: "trophy_middle_right", label: "Амулет", statLabel: "Ловкость", positionClass: "trophy-pos-middle-right" },
  { key: "trophy_bottom_left", label: "Чаша", statLabel: "Скорость бега", positionClass: "trophy-pos-bottom-left" },
  { key: "trophy_bottom_right", label: "Горн", statLabel: "Скорость атаки", positionClass: "trophy-pos-bottom-right" },
];

const PET_CATEGORY_CONFIG = [
  { key: "I", label: "Тип I" },
  { key: "II", label: "Тип II" },
];
const PET_MERGE_TOTAL_LIMIT = 5;
const PET_MERGE_CONFIG = [
  { key: "fire", label: "Огонь", statLabel: "Сила", unit: "", bonusSteps: [4, 2, 1, 1, 1] },
  { key: "earth", label: "Земля", statLabel: "Ловкость", unit: "", bonusSteps: [4, 2, 1, 1, 1] },
  { key: "energy", label: "Энергия", statLabel: "Интеллект", unit: "", bonusSteps: [4, 2, 1, 1, 1] },
  { key: "wind", label: "Ветер", statLabel: "Скорость атаки", unit: "%", bonusSteps: [8, 4, 2, 2, 2] },
  { key: "moon", label: "Луна", statLabel: "Поглощение", unit: "", bonusSteps: [4, 2, 1, 1, 1] },
  { key: "sun", label: "Солнце", statLabel: "Уклонение", unit: "", bonusSteps: [4, 2, 1, 1, 1] },
  { key: "water", label: "Вода", statLabel: "Вероятность выпадения трофеев", unit: "%", bonusSteps: [10, 5, 1, 1, 1] },
];

const STORAGE_KEY = "r2-doll-equip-v3";
const SPHERE_STORAGE_KEY = "r2-doll-sphere-v1";
const TROPHY_STORAGE_KEY = "r2-doll-trophy-v1";
const PET_STORAGE_KEY = "r2-doll-pet-v1";
const CLASS_STORAGE_KEY = "r2-doll-class-v1";
const SIDEBAR_TAB_STORAGE_KEY = "r2-doll-sidebar-tab-v2";
const WORKSPACE_TAB_STORAGE_KEY = "r2-doll-workspace-tab-v1";
const PROFILE_STORAGE_KEY = "r2-doll-profiles-v1";
const ACTIVE_PROFILE_STORAGE_KEY = "r2-doll-active-profile-v1";
const PASSIVE_MORPH_RING_SLOT_KEY = "ring_morph_passive";
const MAIN_STATS = ["HP", "MP", "Сила", "Ловкость", "Интеллект", "Защита"];
const CLASS_PRIMARY_ATTRIBUTES = new Set(["Сила", "Ловкость", "Интеллект"]);
const SECONDARY_STAT_PRIORITY = [
  "Скорость атаки",
  "Скорость бега",
  "Уровень ближних атак",
  "Уровень дальних атак",
  "Уровень магических атак",
  "Точность ближних атак",
  "Точность дальних атак",
  "Точность магических атак",
  "Шанс нанести крит. удар",
  "Шанс получить крит. удар",
  "Доп. урон при крит. ударе",
  "Получаемый крит. урон",
  "Получаемый урон",
  "Периодический урон",
  "Поглощение",
  "Уклонение",
  "Восстановление HP",
  "Восстановление MP",
  "Особое восстановление MP",
  "Эффект зелий здоровья",
  "Уровень зелий здоровья",
  "Вероятность выпадения трофеев",
  "Количество получаемых очков опыта",
  "Вес",
];
const STAT_LABEL_ALIASES = new Map([
  ["hp", "HP"],
  ["максимум hp", "HP"],
  ["макс. hp", "HP"],
  ["макс. hp от силы", "HP"],
  ["mp", "MP"],
  ["максимум mp", "MP"],
  ["макс. mp", "MP"],
  ["макс. mp от интеллекта", "MP"],
  ["сила", "Сила"],
  ["ловкость", "Ловкость"],
  ["интеллект", "Интеллект"],
  ["защита", "Защита"],
  ["скорость атаки", "Скорость атаки"],
  ["скорость бега", "Скорость бега"],
  ["скорость передвижения", "Скорость бега"],
  ["уровень всех атак", "Уровень всех атак"],
  ["уровень ближних атак", "Уровень ближних атак"],
  ["уровень дальних атак", "Уровень дальних атак"],
  ["уровень магических атак", "Уровень магических атак"],
  ["точность всех атак", "Точность всех атак"],
  ["точность ближних атак", "Точность ближних атак"],
  ["точность дальних атак", "Точность дальних атак"],
  ["точность магических атак", "Точность магических атак"],
  ["шанс нанести крит. удар", "Шанс нанести крит. удар"],
  ["шанс крит. удара", "Шанс нанести крит. удар"],
  ["шанс получить крит. удар", "Шанс получить крит. удар"],
  ["доп. урон при крит. ударе", "Доп. урон при крит. ударе"],
  ["дополнительный урон при крит. ударе", "Доп. урон при крит. ударе"],
  ["получаемый крит. урон", "Получаемый крит. урон"],
  ["получаемый урон", "Получаемый урон"],
  ["весь получаемый урон", "Получаемый урон"],
  ["периодический урон", "Периодический урон"],
  ["поглощение", "Поглощение"],
  ["уклонение", "Уклонение"],
  ["восстановление hp", "Восстановление HP"],
  ["регенерация hp", "Восстановление HP"],
  ["восстановление mp", "Восстановление MP"],
  ["регенерация mp", "Восстановление MP"],
  ["особое восстановление hp", "Восстановление HP"],
  ["особое восстановление mp", "Восстановление MP"],
  ["эффект зелий здоровья", "Эффект зелий здоровья"],
  ["уровень зелий здоровья", "Уровень зелий здоровья"],
  ["дроп", "Вероятность выпадения трофеев"],
  ["опыт", "Количество получаемых очков опыта"],
  ["параметры", "Все параметры"],
  ["вес", "Вес"],
  ["максимальный вес", "Вес"],
  ["макс. вес", "Вес"],
  ["макс. вес от силы", "Вес"],
  ["увеличение уровня переносимого веса", "Вес"],
  ["все параметры", "Все параметры"],
]);
let profileSyncLocked = false;
const GROUPED_ATTACK_STAT_TARGETS = new Map([
  ["Уровень всех атак", ["Уровень ближних атак", "Уровень дальних атак", "Уровень магических атак"]],
  ["Точность всех атак", ["Точность ближних атак", "Точность дальних атак", "Точность магических атак"]],
]);
const BAPHOMET_SET_BONUSES = {
  4: {
    3: [{ label: "Уровень всех атак", value: 1, unit: "" }],
    4: [
      { label: "Уровень всех атак", value: 1, unit: "" },
      { label: "Шанс нанести крит. удар", value: 2, unit: "" },
    ],
    5: [
      { label: "Уровень всех атак", value: 1, unit: "" },
      { label: "Шанс нанести крит. удар", value: 2, unit: "" },
      { label: "Доп. урон при крит. ударе", value: 4, unit: "" },
    ],
  },
  5: {
    3: [{ label: "Уровень всех атак", value: 2, unit: "" }],
    4: [
      { label: "Уровень всех атак", value: 2, unit: "" },
      { label: "Шанс нанести крит. удар", value: 3, unit: "" },
    ],
    5: [
      { label: "Уровень всех атак", value: 2, unit: "" },
      { label: "Шанс нанести крит. удар", value: 3, unit: "" },
      { label: "Доп. урон при крит. ударе", value: 6, unit: "" },
    ],
  },
  6: {
    3: [{ label: "Уровень всех атак", value: 3, unit: "" }],
    4: [
      { label: "Уровень всех атак", value: 3, unit: "" },
      { label: "Шанс нанести крит. удар", value: 4, unit: "" },
    ],
    5: [
      { label: "Уровень всех атак", value: 3, unit: "" },
      { label: "Шанс нанести крит. удар", value: 4, unit: "" },
      { label: "Доп. урон при крит. ударе", value: 8, unit: "" },
    ],
  },
  7: {
    3: [{ label: "Уровень всех атак", value: 4, unit: "" }],
    4: [
      { label: "Уровень всех атак", value: 4, unit: "" },
      { label: "Шанс нанести крит. удар", value: 5, unit: "" },
    ],
    5: [
      { label: "Уровень всех атак", value: 4, unit: "" },
      { label: "Шанс нанести крит. удар", value: 5, unit: "" },
      { label: "Доп. урон при крит. ударе", value: 10, unit: "" },
    ],
  },
  8: {
    3: [{ label: "Уровень всех атак", value: 5, unit: "" }],
    4: [
      { label: "Уровень всех атак", value: 5, unit: "" },
      { label: "Шанс нанести крит. удар", value: 6, unit: "" },
    ],
    5: [
      { label: "Уровень всех атак", value: 5, unit: "" },
      { label: "Шанс нанести крит. удар", value: 6, unit: "" },
      { label: "Доп. урон при крит. ударе", value: 12, unit: "" },
    ],
  },
  9: {
    3: [{ label: "Уровень всех атак", value: 6, unit: "" }],
    4: [
      { label: "Уровень всех атак", value: 6, unit: "" },
      { label: "Шанс нанести крит. удар", value: 7, unit: "" },
    ],
    5: [
      { label: "Уровень всех атак", value: 6, unit: "" },
      { label: "Шанс нанести крит. удар", value: 7, unit: "" },
      { label: "Доп. урон при крит. ударе", value: 14, unit: "" },
    ],
  },
  10: {
    3: [{ label: "Уровень всех атак", value: 6, unit: "" }],
    4: [
      { label: "Уровень всех атак", value: 6, unit: "" },
      { label: "Шанс нанести крит. удар", value: 7, unit: "" },
    ],
    5: [
      { label: "Уровень всех атак", value: 6, unit: "" },
      { label: "Шанс нанести крит. удар", value: 7, unit: "" },
      { label: "Доп. урон при крит. ударе", value: 14, unit: "" },
    ],
  },
  11: {
    3: [{ label: "Уровень всех атак", value: 7, unit: "" }],
    4: [
      { label: "Уровень всех атак", value: 7, unit: "" },
      { label: "Шанс нанести крит. удар", value: 8, unit: "" },
    ],
    5: [
      { label: "Уровень всех атак", value: 7, unit: "" },
      { label: "Шанс нанести крит. удар", value: 8, unit: "" },
      { label: "Доп. урон при крит. ударе", value: 16, unit: "" },
    ],
  },
  12: {
    3: [{ label: "Уровень всех атак", value: 7, unit: "" }],
    4: [
      { label: "Уровень всех атак", value: 7, unit: "" },
      { label: "Шанс нанести крит. удар", value: 8, unit: "" },
    ],
    5: [
      { label: "Уровень всех атак", value: 7, unit: "" },
      { label: "Шанс нанести крит. удар", value: 8, unit: "" },
      { label: "Доп. урон при крит. ударе", value: 16, unit: "" },
    ],
  },
  13: {
    3: [{ label: "Уровень всех атак", value: 8, unit: "" }],
    4: [
      { label: "Уровень всех атак", value: 8, unit: "" },
      { label: "Шанс нанести крит. удар", value: 9, unit: "" },
    ],
    5: [
      { label: "Уровень всех атак", value: 8, unit: "" },
      { label: "Шанс нанести крит. удар", value: 9, unit: "" },
      { label: "Доп. урон при крит. ударе", value: 18, unit: "" },
    ],
  },
};
const IFRIT_SET_BONUSES = Object.fromEntries(
  Array.from({ length: 10 }, (_, index) => {
    const level = index + 4;
    const hp = (level - 2) * 50;
    const defense = level - 3;
    const damageReduction = -(level - 3);

    return [level, {
      3: [{ label: "HP", value: hp, unit: "" }],
      4: [
        { label: "HP", value: hp, unit: "" },
        { label: "Защита", value: defense, unit: "" },
      ],
      5: [
        { label: "HP", value: hp, unit: "" },
        { label: "Защита", value: defense, unit: "" },
        { label: "Получаемый урон", value: damageReduction, unit: "%" },
      ],
    }];
  })
);
const CLASS_CONFIGS = {
  knight: {
    label: "Рыцарь",
    baseStats: [
      { label: "Сила", base: 6, growthType: "interval", interval: 3, amount: 1 },
      { label: "Ловкость", base: 3, growthType: "interval", interval: 6, amount: 1 },
      { label: "Интеллект", base: 1, growthType: "interval", interval: 9, amount: 1 },
      { label: "HP", base: 707, growthType: "per_level", amount: 5 },
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
        { label: "HP", value: strength * 2, unit: "" },
        { label: "Регенерация HP", value: Math.floor(strength / 12) * 0.1, unit: "" },
        { label: "Вес", value: strength * 30, unit: "" },
        { label: "Шанс нанести крит. удар", value: Math.floor(dexterity / 9), unit: "" },
        { label: "Скорость атаки", value: Math.floor(dexterity / 12), unit: "%" },
        { label: "Скорость передвижения", value: Math.floor(dexterity / 6), unit: "" },
        { label: "MP", value: intelligence * 2, unit: "" },
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
        { label: "HP", value: strength * 2, unit: "" },
        { label: "Регенерация HP", value: Math.floor(strength / 9) * 0.1, unit: "" },
        { label: "Вес", value: strength * 30, unit: "" },
        { label: "Уровень дальних атак", value: Math.floor(dexterity / 3), unit: "" },
        { label: "Точность дальних атак", value: Math.floor(dexterity / 2), unit: "" },
        { label: "Защита", value: Math.floor(dexterity / 6), unit: "" },
        { label: "Шанс нанести крит. удар", value: Math.floor(dexterity / 9), unit: "" },
        { label: "Скорость атаки", value: Math.floor(dexterity / 17), unit: "%" },
        { label: "Скорость передвижения", value: Math.floor(dexterity / 7), unit: "" },
        { label: "MP", value: intelligence * 2, unit: "" },
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
        { label: "HP", value: strength * 2, unit: "" },
        { label: "Регенерация HP", value: Math.floor(strength / 9) * 0.1, unit: "" },
        { label: "Вес", value: strength * 30, unit: "" },
        { label: "Шанс нанести крит. удар", value: Math.floor(dexterity / 9), unit: "" },
        { label: "Скорость атаки", value: Math.floor(dexterity / 12), unit: "%" },
        { label: "Скорость передвижения", value: Math.floor(dexterity / 6), unit: "" },
        { label: "Уровень магических атак", value: Math.floor(intelligence / 3), unit: "" },
        { label: "Точность магических атак", value: Math.floor(intelligence / 2), unit: "" },
        { label: "MP", value: intelligence * 3, unit: "" },
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
        { label: "HP", value: strength * 2, unit: "" },
        { label: "Регенерация HP", value: Math.floor(strength / 12) * 0.1, unit: "" },
        { label: "Вес", value: strength * 30, unit: "" },
        { label: "Уровень дальних атак", value: Math.floor(dexterity / 3), unit: "" },
        { label: "Точность дальних атак", value: Math.floor(dexterity / 2), unit: "" },
        { label: "Защита", value: Math.floor(dexterity / 5), unit: "" },
        { label: "Шанс нанести крит. удар", value: Math.floor(dexterity / 15), unit: "" },
        { label: "Скорость атаки", value: Math.floor(dexterity / 13), unit: "%" },
        { label: "Скорость передвижения", value: Math.floor(dexterity / 8), unit: "" },
        { label: "Уровень магических атак", value: Math.floor(intelligence / 6), unit: "" },
        { label: "Точность магических атак", value: Math.floor(intelligence / 6), unit: "" },
        { label: "MP", value: intelligence * 2, unit: "" },
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
        { label: "HP", value: strength * 2, unit: "" },
        { label: "Регенерация HP", value: Math.floor(strength / 9) * 0.1, unit: "" },
        { label: "Вес", value: strength * 30, unit: "" },
        { label: "Защита", value: Math.floor(dexterity / 4), unit: "" },
        { label: "Шанс нанести крит. удар", value: Math.floor(dexterity / 10), unit: "" },
        { label: "Скорость атаки", value: Math.floor(dexterity / 12), unit: "%" },
        { label: "Скорость передвижения", value: Math.floor(dexterity / 9), unit: "" },
        { label: "MP", value: intelligence * 2, unit: "" },
        { label: "Регенерация MP", value: Math.floor(intelligence / 4) * 0.1, unit: "" },
      ];
    },
  },
};

const state = {
  items: [],
  sphereItems: [],
  trophyItems: [],
  petItems: [],
  itemsById: new Map(),
  sphereItemsById: new Map(),
  trophyItemsById: new Map(),
  petItemsById: new Map(),
  equipped: loadEquippedState(),
  sphereEquipped: loadSphereEquippedState(),
  trophyEquipped: loadTrophyEquippedState(),
  petEquipped: loadPetEquippedState(),
  expandedCategories: new Set(),
  expandedSphereCategories: new Set(),
  expandedTrophySlots: new Set(),
  expandedPetCategories: new Set(),
  activeSlot: null,
  activeSphereSlot: SPHERE_SLOT_CONFIG[0]?.key || null,
  activeTrophySlot: TROPHY_SLOT_CONFIG[0]?.key || null,
  activePetCategory: PET_CATEGORY_CONFIG[0]?.key || "I",
  activeSphereTypeOneTab: "Сферы разрушения",
  lastAction: "Выберите слот на кукле или откройте категорию справа.",
  classConfig: loadClassState(),
  activeSidebarTab: loadSidebarTabState(),
  activeStatsTab: "inventory",
  activeWorkspaceTab: loadWorkspaceTabState(),
  profiles: [],
  activeProfileId: null,
};

function getSphereSlotConfig(slotKey) {
  return SPHERE_SLOT_CONFIG.find((slot) => slot.key === slotKey);
}

function getTrophySlotConfig(slotKey) {
  return TROPHY_SLOT_CONFIG.find((slot) => slot.key === slotKey);
}

function getCompatibleSphereSlots(item) {
  return SPHERE_SLOT_CONFIG.filter((slot) => slot.matches(item));
}

function getPrimarySphereSlot(item) {
  return getCompatibleSphereSlots(item)[0] || null;
}

function shouldShowSphereUpgrade(item, slot = getPrimarySphereSlot(item)) {
  return slot?.categoryKey === "sphere_type_1";
}

function getSphereItemsForSlot(slotKey) {
  const slot = getSphereSlotConfig(slotKey);
  if (!slot) {
    return [];
  }

  return state.sphereItems
    .filter((item) => slot.matches(item))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

function getTrophyItemsForSlot(slotKey) {
  return state.trophyItems
    .filter((item) => item.slot_code === slotKey)
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

function getPetItemsForCategory(categoryKey) {
  return state.petItems.filter((item) => item.variant === categoryKey);
}

function getPetCategoryGroups() {
  return PET_CATEGORY_CONFIG.map((group) => ({
    ...group,
    items: getPetItemsForCategory(group.key),
  }));
}

function getSphereCategoryGroups() {
  return SPHERE_CATEGORY_CONFIG.map((group) => {
    const items = state.sphereItems
      .filter((item) => getCompatibleSphereSlots(item).some((slot) => slot.categoryKey === group.key))
      .sort((a, b) => a.name.localeCompare(b.name, "ru"));

    return {
      ...group,
      items,
    };
  });
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

function shouldDisplayUpgradeLevel(level) {
  const normalizedLevel = normalizeText(level);
  return Boolean(normalizedLevel && normalizedLevel !== "+0");
}

function formatUpgradeSuffix(level) {
  return shouldDisplayUpgradeLevel(level) ? ` ${level}` : "";
}

function formatUpgradeTitleSuffix(level) {
  return shouldDisplayUpgradeLevel(level) ? ` (${level})` : "";
}

function getParamsForLevel(item, level) {
  const params = item?.upgrade_levels?.[level] || [];
  return applyEquipmentDefenseUpgradeRules(item, level, params);
}

function applyEquipmentDefenseUpgradeRules(item, level, params) {
  if (!Array.isArray(params) || !params.length) {
    return params;
  }

  const defenseRule = [
    { matches: isPlainVelkenOrMythrilDefenseItem, singleStepCap: 7 },
    { matches: isCustomDefenseScaleItem, singleStepCap: 6 },
    { matches: isMagicVelkenOrMythrilItem, singleStepCap: 6 },
    { matches: isIfritSetItem, singleStepCap: 5 },
    { matches: isBaphometSetItem, singleStepCap: 6 },
    { matches: isDefaultDefenseScaleEquipmentItem, singleStepCap: 8 },
  ].find((rule) => rule.matches(item));

  if (!defenseRule) {
    return params;
  }

  const baseDefense = getBaseDefenseForItem(item);
  if (!Number.isFinite(baseDefense)) {
    return params;
  }

  const defenseValue = getScaledDefenseValueForUpgrade(baseDefense, getUpgradeNumber(level), defenseRule.singleStepCap);
  let replaced = false;

  return params.map((line) => {
    const parsed = parseNumericStat(line);
    if (!replaced && parsed?.label === "Защита" && !parsed.unit) {
      replaced = true;
      return `Защита ${formatStatValue(defenseValue)}`;
    }
    return line;
  });
}

function getBaseDefenseForItem(item) {
  const baseParams = item?.upgrade_levels?.["+0"] || [];
  const baseDefense = baseParams
    .map((line) => parseNumericStat(line))
    .find((stat) => stat?.label === "Защита" && !stat.unit);

  return baseDefense?.value ?? null;
}

function getScaledDefenseValueForUpgrade(baseDefense, upgradeNumber, singleStepCap) {
  const safeUpgrade = Math.max(0, Math.floor(Number(upgradeNumber) || 0));
  const safeCap = Math.max(0, Math.floor(Number(singleStepCap) || 0));
  const bonus = safeUpgrade <= safeCap ? safeUpgrade : safeCap + (safeUpgrade - safeCap) * 2;
  return baseDefense + bonus;
}

function getSlotConfig(slotKey) {
  return SLOT_CONFIG.find((slot) => slot.key === slotKey);
}

function matchesEquipmentSlot(slot, item) {
  return Boolean(slot && item && item.slot_code === slot.sourceSlot && (!slot.matches || slot.matches(item)));
}

function getItemsForEquipmentSlot(slotKeyOrConfig) {
  const slot = typeof slotKeyOrConfig === "string" ? getSlotConfig(slotKeyOrConfig) : slotKeyOrConfig;
  if (!slot) {
    return [];
  }

  return state.items
    .filter((item) => matchesEquipmentSlot(slot, item))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

function getFirstAvailableSlotKey() {
  return SLOT_CONFIG.find((slot) => getItemsForEquipmentSlot(slot).length)?.key || SLOT_CONFIG[0]?.key || null;
}

function getFirstAvailableSphereSlotKey() {
  return SPHERE_SLOT_CONFIG.find((slot) => getSphereItemsForSlot(slot.key).length)?.key || SPHERE_SLOT_CONFIG[0]?.key || null;
}

function getFirstAvailablePetCategoryKey() {
  return PET_CATEGORY_CONFIG.find((group) => getPetItemsForCategory(group.key).length)?.key || PET_CATEGORY_CONFIG[0]?.key || "I";
}

function getSphereTypeOneTabForSlot(slotKey) {
  return SPHERE_TYPE_ONE_TABS.find((tab) => tab.slotKey === slotKey)?.category || "Сферы разрушения";
}

function getEquippedSlots() {
  return SLOT_CONFIG.filter((slot) => state.equipped[slot.key]);
}

function getEquippedSphereSlots() {
  return SPHERE_SLOT_CONFIG.filter((slot) => state.sphereEquipped[slot.key]);
}

function getEquippedTrophySlots() {
  return TROPHY_SLOT_CONFIG.filter((slot) => state.trophyEquipped[slot.key]);
}

function getEquippedPet() {
  return state.petEquipped ? state.petItemsById.get(state.petEquipped.itemId) || null : null;
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function sanitizePetMergeCounts(rawCounts) {
  const source = rawCounts && typeof rawCounts === "object" ? rawCounts : {};
  const normalized = {};

  PET_MERGE_CONFIG.forEach((entry) => {
    const numeric = Number(source[entry.key] ?? 0);
    if (!Number.isFinite(numeric)) {
      return;
    }

    const value = Math.min(PET_MERGE_TOTAL_LIMIT, Math.max(0, Math.floor(numeric)));
    if (value > 0) {
      normalized[entry.key] = value;
    }
  });

  return normalized;
}

function getPetMergeCounts(selection = state.petEquipped) {
  return sanitizePetMergeCounts(selection?.mergeCounts);
}

function getPetMergeTotal(mergeCounts = state.petEquipped?.mergeCounts) {
  const normalized = sanitizePetMergeCounts(mergeCounts);
  return PET_MERGE_CONFIG.reduce((total, entry) => total + (normalized[entry.key] || 0), 0);
}

function getPetMergeBonusValue(mergeConfig, count) {
  const safeCount = Math.min(PET_MERGE_TOTAL_LIMIT, Math.max(0, Math.floor(Number(count) || 0)));
  return mergeConfig.bonusSteps.slice(0, safeCount).reduce((sum, value) => sum + value, 0);
}

function createPetSelection(itemId, mergeCounts = {}) {
  const normalizedCounts = sanitizePetMergeCounts(mergeCounts);
  return {
    itemId: String(itemId),
    ...(Object.keys(normalizedCounts).length ? { mergeCounts: normalizedCounts } : {}),
  };
}

function getPetMergeStats(mergeCounts = state.petEquipped?.mergeCounts) {
  const normalized = sanitizePetMergeCounts(mergeCounts);

  return PET_MERGE_CONFIG.flatMap((entry) => {
    const count = normalized[entry.key] || 0;
    if (!count) {
      return [];
    }

    return [{
      label: entry.statLabel,
      value: getPetMergeBonusValue(entry, count),
      unit: entry.unit,
    }];
  });
}

function isMorphRingItem(item) {
  return item?.slot_code === "ring" && /перевоплощени/i.test(normalizeText(item?.name));
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createProfileId() {
  return `profile-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function getProfileFallbackName(index = state.profiles.length) {
  return `Профиль ${index + 1}`;
}

function sanitizeProfileName(name, fallbackName = getProfileFallbackName()) {
  const normalized = normalizeText(name).slice(0, 40);
  return normalized || fallbackName;
}

function sanitizeWorkspaceTab(tabKey) {
  return ["inventory", "pet", "spheres", "trophies"].includes(tabKey) ? tabKey : "inventory";
}

function normalizeProfileRecord(profile, index = 0) {
  const fallbackName = getProfileFallbackName(index);
  const classConfig = profile?.classConfig && typeof profile.classConfig === "object"
    ? profile.classConfig
    : {};

  return {
    id: String(profile?.id || createProfileId()),
    name: sanitizeProfileName(profile?.name, fallbackName),
    classConfig: {
      classKey: CLASS_CONFIGS[classConfig.classKey] ? classConfig.classKey : "knight",
      level: sanitizeClassLevel(classConfig.level ?? 1),
    },
    equipped: profile?.equipped && typeof profile.equipped === "object" ? deepClone(profile.equipped) : {},
    sphereEquipped: profile?.sphereEquipped && typeof profile.sphereEquipped === "object" ? deepClone(profile.sphereEquipped) : {},
    trophyEquipped: profile?.trophyEquipped && typeof profile.trophyEquipped === "object" ? deepClone(profile.trophyEquipped) : {},
    petEquipped: profile?.petEquipped && typeof profile.petEquipped === "object" ? deepClone(profile.petEquipped) : null,
    activeWorkspaceTab: sanitizeWorkspaceTab(profile?.activeWorkspaceTab),
    createdAt: Number(profile?.createdAt) || Date.now(),
    updatedAt: Number(profile?.updatedAt) || Date.now(),
  };
}

function createProfileSnapshot(overrides = {}) {
  const fallbackName = getProfileFallbackName();

  return normalizeProfileRecord({
    id: overrides.id || createProfileId(),
    name: overrides.name || fallbackName,
    classConfig: overrides.classConfig ?? state.classConfig,
    equipped: overrides.equipped ?? state.equipped,
    sphereEquipped: overrides.sphereEquipped ?? state.sphereEquipped,
    trophyEquipped: overrides.trophyEquipped ?? state.trophyEquipped,
    petEquipped: overrides.petEquipped ?? state.petEquipped,
    activeWorkspaceTab: overrides.activeWorkspaceTab ?? state.activeWorkspaceTab,
    createdAt: overrides.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  }, state.profiles.length);
}

function createEmptyProfile(name = getProfileFallbackName()) {
  return normalizeProfileRecord({
    id: createProfileId(),
    name,
    classConfig: { classKey: "knight", level: 1 },
    equipped: {},
    sphereEquipped: {},
    trophyEquipped: {},
    petEquipped: null,
    activeWorkspaceTab: "inventory",
  }, state.profiles.length);
}

function getNextProfileName() {
  const names = new Set(state.profiles.map((profile) => profile.name));
  let index = 1;
  while (names.has(`Профиль ${index}`)) {
    index += 1;
  }
  return `Профиль ${index}`;
}

function getActiveProfile() {
  return state.profiles.find((profile) => profile.id === state.activeProfileId) || null;
}

function createItemUid(item, index) {
  return `${item.slot_code}:${item.name}:${index}`;
}

function createSphereUid(item, index) {
  return `sphere:${item.category || "unknown"}:${item.id ?? index}`;
}

function createTrophyUid(item, index) {
  return `trophy:${item.slot_code || "unknown"}:${item.id ?? index}`;
}

function createPetUid(item, index) {
  return `pet:${item.id ?? index}`;
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

function loadPetEquippedState() {
  try {
    const raw = localStorage.getItem(PET_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function loadSidebarTabState() {
  try {
    const raw = localStorage.getItem(SIDEBAR_TAB_STORAGE_KEY);
    return ["class", "stats"].includes(raw) ? raw : "class";
  } catch {
    return "class";
  }
}

function loadSphereEquippedState() {
  try {
    const raw = localStorage.getItem(SPHERE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function loadTrophyEquippedState() {
  try {
    const raw = localStorage.getItem(TROPHY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function loadWorkspaceTabState() {
  try {
    const raw = localStorage.getItem(WORKSPACE_TAB_STORAGE_KEY);
    return ["inventory", "pet", "spheres", "trophies"].includes(raw) ? raw : "inventory";
  } catch {
    return "inventory";
  }
}

function loadProfilesState() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadActiveProfileIdState() {
  try {
    return normalizeText(localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY) || "");
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
  syncActiveProfileFromState();
}

function saveClassState() {
  try {
    localStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(state.classConfig));
  } catch {
    // Ignore storage errors to keep the page usable in private/file contexts.
  }
  syncActiveProfileFromState();
}

function saveSidebarTabState() {
  try {
    localStorage.setItem(SIDEBAR_TAB_STORAGE_KEY, state.activeSidebarTab);
  } catch {
    // Ignore storage errors to keep the page usable in private/file contexts.
  }
}

function saveSphereEquippedState() {
  try {
    localStorage.setItem(SPHERE_STORAGE_KEY, JSON.stringify(state.sphereEquipped));
  } catch {
    // Ignore storage errors to keep the page usable in private/file contexts.
  }
  syncActiveProfileFromState();
}

function saveTrophyEquippedState() {
  try {
    localStorage.setItem(TROPHY_STORAGE_KEY, JSON.stringify(state.trophyEquipped));
  } catch {
    // Ignore storage errors to keep the page usable in private/file contexts.
  }
  syncActiveProfileFromState();
}

function savePetEquippedState() {
  try {
    localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(state.petEquipped));
  } catch {
    // Ignore storage errors to keep the page usable in private/file contexts.
  }
  syncActiveProfileFromState();
}

function saveWorkspaceTabState() {
  try {
    localStorage.setItem(WORKSPACE_TAB_STORAGE_KEY, state.activeWorkspaceTab);
  } catch {
    // Ignore storage errors to keep the page usable in private/file contexts.
  }
  syncActiveProfileFromState();
}

function saveProfilesState() {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.profiles));
  } catch {
    // Ignore storage errors to keep the page usable in private/file contexts.
  }
}

function saveActiveProfileIdState() {
  try {
    localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, state.activeProfileId || "");
  } catch {
    // Ignore storage errors to keep the page usable in private/file contexts.
  }
}

function syncActiveProfileFromState() {
  if (profileSyncLocked || !state.activeProfileId || !state.profiles.length) {
    return;
  }

  const index = state.profiles.findIndex((profile) => profile.id === state.activeProfileId);
  if (index === -1) {
    return;
  }

  const currentProfile = state.profiles[index];
  state.profiles[index] = createProfileSnapshot({
    id: currentProfile.id,
    name: currentProfile.name,
    createdAt: currentProfile.createdAt,
  });
  saveProfilesState();
  saveActiveProfileIdState();
}

function persistLegacyStateSnapshot() {
  profileSyncLocked = true;
  saveActiveProfileIdState();
  saveClassState();
  saveEquippedState();
  saveSphereEquippedState();
  saveTrophyEquippedState();
  savePetEquippedState();
  saveWorkspaceTabState();
  profileSyncLocked = false;
}

function applyProfileToState(profile) {
  const normalized = normalizeProfileRecord(profile);
  state.activeProfileId = normalized.id;
  state.classConfig = deepClone(normalized.classConfig);
  state.equipped = deepClone(normalized.equipped);
  state.sphereEquipped = deepClone(normalized.sphereEquipped);
  state.trophyEquipped = deepClone(normalized.trophyEquipped);
  state.petEquipped = deepClone(normalized.petEquipped);
  state.activeWorkspaceTab = sanitizeWorkspaceTab(normalized.activeWorkspaceTab);
  persistLegacyStateSnapshot();
}

function initializeProfilesState() {
  const loadedProfiles = loadProfilesState().map((profile, index) => normalizeProfileRecord(profile, index));
  const activeProfileId = loadActiveProfileIdState();

  if (!loadedProfiles.length) {
    const migratedProfile = createProfileSnapshot({
      id: createProfileId(),
      name: getNextProfileName(),
      classConfig: state.classConfig,
      equipped: state.equipped,
      sphereEquipped: state.sphereEquipped,
      trophyEquipped: state.trophyEquipped,
      petEquipped: state.petEquipped,
      activeWorkspaceTab: state.activeWorkspaceTab,
    });
    state.profiles = [migratedProfile];
    state.activeProfileId = migratedProfile.id;
    saveProfilesState();
    saveActiveProfileIdState();
    return;
  }

  state.profiles = loadedProfiles;
  state.activeProfileId = loadedProfiles.some((profile) => profile.id === activeProfileId)
    ? activeProfileId
    : loadedProfiles[0].id;

  const activeProfile = getActiveProfile() || loadedProfiles[0];
  if (activeProfile) {
    applyProfileToState(activeProfile);
  }
}

function setActiveProfile(profileId, { persistCurrent = true } = {}) {
  const nextProfile = state.profiles.find((profile) => profile.id === profileId);
  if (!nextProfile) {
    return;
  }

  if (persistCurrent) {
    syncActiveProfileFromState();
  }

  applyProfileToState(nextProfile);
  sanitizeEquippedState();
  sanitizeSphereEquippedState();
  sanitizeTrophyEquippedState();
  sanitizePetEquippedState();
  initializeUiState();
  syncActiveProfileFromState();
  renderAll();
  setLastAction(`Активирован профиль "${nextProfile.name}".`);
}

function renameActiveProfile(name) {
  const profile = getActiveProfile();
  if (!profile) {
    return;
  }

  profile.name = sanitizeProfileName(name, profile.name);
  profile.updatedAt = Date.now();
  saveProfilesState();
  renderProfileBar();
  setLastAction(`Профиль переименован в "${profile.name}".`);
}

function createNewProfile() {
  syncActiveProfileFromState();
  const profile = createEmptyProfile(getNextProfileName());
  state.profiles.push(profile);
  saveProfilesState();
  setActiveProfile(profile.id, { persistCurrent: false });
  setLastAction(`Создан профиль "${profile.name}".`);
}

function deleteActiveProfile() {
  if (state.profiles.length <= 1) {
    return;
  }

  const profile = getActiveProfile();
  if (!profile) {
    return;
  }

  state.profiles = state.profiles.filter((entry) => entry.id !== profile.id);
  saveProfilesState();
  setActiveProfile(state.profiles[0].id, { persistCurrent: false });
  setLastAction(`Профиль "${profile.name}" удалён.`);
}

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
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">
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
      return a.label.localeCompare(b.label, "ru");
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

function renderSetBonusRows(setBonuses) {
  if (!setBonuses.length) {
    return '<div class="empty-note">Сетовые бонусы не активны.</div>';
  }

  return setBonuses.map((bonus) => `
    <div class="set-bonus-card">
      <div class="set-bonus-title">${escapeHtml(bonus.name)}</div>
      <div class="set-bonus-meta">${bonus.itemCount} предметов · минимальная заточка +${bonus.setLevel}</div>
      <div class="stat-list stat-list-secondary">${renderStatRows(bonus.stats)}</div>
    </div>
  `).join("");
}

function renderEquipmentDescription(slot, item, level) {
  if (!item) {
    return "";
  }

  const params = getParamsForLevel(item, level);
  const descriptionLines = Array.isArray(item.description_lines)
    ? item.description_lines.filter((line) => normalizeText(line))
    : [];
  const currentParamLabels = new Set(
    params
      .map((line) => parseNumericStat(line))
      .filter(Boolean)
      .map((stat) => stat.label),
  );
  const mergedLines = [
    ...params,
    ...descriptionLines.filter((line) => {
      const parsed = parseNumericStat(line);
      if (!parsed) {
        return !params.includes(line);
      }
      return !currentParamLabels.has(parsed.label);
    }),
  ];
  const paramsHtml = mergedLines.length
    ? mergedLines.map((param) => `<li>${escapeHtml(param)}</li>`).join("")
    : "<li>Без параметров</li>";

  return `
    <div class="equipment-description-card">
      <div class="equipment-description-content">
        <div class="equipment-description-name">${escapeHtml(item.name)}${escapeHtml(formatUpgradeSuffix(level))}</div>
        <ul class="equipment-description-params">${paramsHtml}</ul>
      </div>
    </div>
  `;
}

function renderSphereDescription(slot, item, level) {
  if (!item) {
    return "";
  }

  const params = getParamsForLevel(item, level);
  const descriptionLines = Array.isArray(item.description_lines)
    ? item.description_lines.filter((line) => normalizeText(line))
    : [];
  const currentParamLabels = new Set(
    params
      .map((line) => parseNumericStat(line))
      .filter(Boolean)
      .map((stat) => stat.label),
  );
  const mergedLines = [
    ...params,
    ...descriptionLines.filter((line) => {
      const parsed = parseNumericStat(line);
      if (!parsed) {
        return !params.includes(line);
      }
      return !currentParamLabels.has(parsed.label);
    }),
  ];
  const paramsHtml = mergedLines.length
    ? mergedLines.map((param) => `<li>${escapeHtml(param)}</li>`).join("")
    : "<li>Без параметров</li>";
  const displayLevel = shouldShowSphereUpgrade(item, slot) && getLevelKeys(item).length > 1
    ? formatUpgradeSuffix(level)
    : "";

  return `
    <div class="equipment-description-card">
      <div class="equipment-description-content">
        <div class="equipment-description-name">${escapeHtml(item.name)}${escapeHtml(displayLevel)}</div>
        <ul class="equipment-description-params">${paramsHtml}</ul>
      </div>
    </div>
  `;
}

function renderTrophyDescription(slot, item, level) {
  if (!item) {
    return "";
  }

  const params = getParamsForLevel(item, level);
  const paramsHtml = params.length
    ? params.map((param) => `<li>${escapeHtml(param)}</li>`).join("")
    : "<li>Без параметров</li>";
  return `
    <div class="equipment-description-card">
      <div class="equipment-description-content">
        <div class="equipment-description-name">${escapeHtml(item.name)}${escapeHtml(formatUpgradeSuffix(level))}</div>
        <ul class="equipment-description-params">${paramsHtml}</ul>
      </div>
    </div>
  `;
}

function computeBaseClassStat(statConfig, level) {
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

function renderStatsPanel() {
  const inventoryContainer = document.getElementById("stats-inventory-list");
  const petContainer = document.getElementById("stats-pets-list");
  const spheresContainer = document.getElementById("stats-spheres-list");
  const trophiesContainer = document.getElementById("stats-trophies-list");
  const setContainer = document.getElementById("stats-set-list");
  const effectsContainer = document.getElementById("stats-effects-list");
  if (!inventoryContainer || !petContainer || !spheresContainer || !trophiesContainer || !setContainer || !effectsContainer) {
    return;
  }

  const { sourceBreakdown, setBonuses, effects } = collectEquippedStats();
  const inventoryStats = getDisplayStatsFromMap(sourceBreakdown.inventory.numericStats).allStats;
  const petStats = getDisplayStatsFromMap(sourceBreakdown.pet.numericStats).allStats;
  const sphereStats = getDisplayStatsFromMap(sourceBreakdown.spheres.numericStats).allStats;
  const trophyStats = getDisplayStatsFromMap(sourceBreakdown.trophies.numericStats).allStats;

  inventoryContainer.innerHTML = inventoryStats.length
    ? renderStatRows(inventoryStats)
    : '<div class="empty-note">Инвентарь пока не даёт числовых параметров.</div>';
  petContainer.innerHTML = petStats.length
    ? renderStatRows(petStats)
    : '<div class="empty-note">Питомец пока не выбран.</div>';
  spheresContainer.innerHTML = sphereStats.length
    ? renderStatRows(sphereStats)
    : '<div class="empty-note">Сферы пока не дают числовых параметров.</div>';
  trophiesContainer.innerHTML = trophyStats.length
    ? renderStatRows(trophyStats)
    : '<div class="empty-note">Трофеи пока не дают числовых параметров.</div>';
  setContainer.innerHTML = renderSetBonusRows(setBonuses);
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
  const { config, baseStats, baseStatMap } = getClassPanelData();
  const effectiveAttributeMap = {
    ...baseStatMap,
  };

  ["Сила", "Ловкость", "Интеллект"].forEach((label) => {
    const bonus = numericStats.get(`${label}::`);
    if (!bonus) {
      return;
    }

    effectiveAttributeMap[label] = (effectiveAttributeMap[label] || 0) + bonus.value;
  });

  const derivedStats = config.derivedStats(effectiveAttributeMap);

  addStatCollection(totalStats, baseStats);
  addStatCollection(totalStats, derivedStats);
  addStatCollection(totalStats, [...numericStats.values()]);
  const { mainStats, secondaryStats } = getDisplayStatsFromMap(totalStats, { includeMainZeros: true });

  return {
    mainStats,
    secondaryStats,
    effects,
  };
}

function renderBoardTotalStats() {
  const mainContainer = document.getElementById("board-main-stats");
  const extraContainer = document.getElementById("board-extra-stats");
  if (!mainContainer || !extraContainer) {
    return;
  }

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
  });

  levelInput.addEventListener("input", () => {
    state.classConfig.level = sanitizeClassLevel(levelInput.value);
    saveClassState();
    renderClassPanel();
    renderBoardTotalStats();
  });
}

function renderProfileBar() {
  const select = document.getElementById("profile-select");
  const nameInput = document.getElementById("profile-name-input");
  const deleteButton = document.getElementById("profile-delete-button");
  if (!select || !nameInput || !deleteButton) {
    return;
  }

  const activeProfile = getActiveProfile();
  select.innerHTML = state.profiles.map((profile) => `
    <option value="${escapeHtml(profile.id)}" ${profile.id === state.activeProfileId ? "selected" : ""}>
      ${escapeHtml(profile.name)}
    </option>
  `).join("");

  nameInput.value = activeProfile?.name || "";
  deleteButton.disabled = state.profiles.length <= 1;
}

function bindProfileControls() {
  const select = document.getElementById("profile-select");
  const nameInput = document.getElementById("profile-name-input");
  const newButton = document.getElementById("profile-new-button");
  const deleteButton = document.getElementById("profile-delete-button");

  if (!select || !nameInput || !newButton || !deleteButton) {
    return;
  }

  if (select.dataset.bound !== "1") {
    select.dataset.bound = "1";
    select.addEventListener("change", () => setActiveProfile(select.value));
  }

  if (nameInput.dataset.bound !== "1") {
    nameInput.dataset.bound = "1";
    nameInput.addEventListener("input", () => {
      const profile = getActiveProfile();
      if (!profile) {
        return;
      }

      profile.name = sanitizeProfileName(nameInput.value, profile.name);
      profile.updatedAt = Date.now();
      saveProfilesState();
      const option = select.selectedOptions[0];
      if (option) {
        option.textContent = profile.name;
      }
    });
    nameInput.addEventListener("change", () => renameActiveProfile(nameInput.value));
    nameInput.addEventListener("blur", () => renameActiveProfile(nameInput.value));
  }

  if (newButton.dataset.bound !== "1") {
    newButton.dataset.bound = "1";
    newButton.addEventListener("click", createNewProfile);
  }

  if (deleteButton.dataset.bound !== "1") {
    deleteButton.dataset.bound = "1";
    deleteButton.addEventListener("click", deleteActiveProfile);
  }
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

function renderWorkspaceTabs() {
  document.querySelectorAll(".workspace-tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.workspaceTab === state.activeWorkspaceTab);
  });

  document.querySelectorAll(".workspace-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.workspacePanel === state.activeWorkspaceTab);
  });

  document.querySelectorAll(".catalog-context-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.catalogContext === state.activeWorkspaceTab);
  });
}

function renderStatsSourceTabs() {
  document.querySelectorAll(".stats-source-tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.statsTab === state.activeStatsTab);
  });

  document.querySelectorAll(".stats-source-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.statsPanel === state.activeStatsTab);
  });
}

function setWorkspaceTab(tabKey) {
  if (!["inventory", "pet", "spheres", "trophies"].includes(tabKey)) {
    return;
  }

  state.activeWorkspaceTab = tabKey;
  saveWorkspaceTabState();
  renderAll();
}

function setSidebarTab(tabKey) {
  if (!["class", "stats"].includes(tabKey)) {
    return;
  }

  state.activeSidebarTab = tabKey;
  saveSidebarTabState();
  renderSidebarTabs();
}

function setStatsSourceTab(tabKey) {
  if (!["inventory", "pets", "spheres", "trophies", "sets", "effects"].includes(tabKey)) {
    return;
  }

  state.activeStatsTab = tabKey;
  renderStatsSourceTabs();
}

function bindSidebarTabs() {
  document.querySelectorAll(".sidebar-tab-button").forEach((button) => {
    button.addEventListener("click", () => setSidebarTab(button.dataset.tab));
  });
}

function bindStatsSourceTabs() {
  document.querySelectorAll(".stats-source-tab").forEach((button) => {
    if (button.dataset.bound === "1") {
      return;
    }

    button.dataset.bound = "1";
    button.addEventListener("click", () => setStatsSourceTab(button.dataset.statsTab));
  });
}

function bindWorkspaceTabs() {
  document.querySelectorAll(".workspace-tab:not(:disabled)").forEach((button) => {
    button.addEventListener("click", () => setWorkspaceTab(button.dataset.workspaceTab));
  });
}

function sanitizeEquippedState() {
  const previous = state.equipped && typeof state.equipped === "object" ? state.equipped : {};
  const next = {};
  let changed = false;
  const passiveSlot = getSlotConfig(PASSIVE_MORPH_RING_SLOT_KEY);

  Object.entries(previous).forEach(([slotKey, selection]) => {
    const slot = getSlotConfig(slotKey);
    const item = state.itemsById.get(String(selection?.itemId));
    const normalized = item
      ? {
          itemId: String(item.uid),
          upgradeLevel: getValidUpgradeLevel(item, selection?.upgradeLevel),
        }
      : null;

    if (
      normalized &&
      passiveSlot &&
      slotKey !== PASSIVE_MORPH_RING_SLOT_KEY &&
      matchesEquipmentSlot(passiveSlot, item) &&
      !next[PASSIVE_MORPH_RING_SLOT_KEY]
    ) {
      next[PASSIVE_MORPH_RING_SLOT_KEY] = normalized;
      changed = true;
    }

    if (!slot || !item || !matchesEquipmentSlot(slot, item)) {
      changed = true;
      return;
    }

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

function sanitizeSphereEquippedState() {
  const previous = state.sphereEquipped && typeof state.sphereEquipped === "object" ? state.sphereEquipped : {};
  const next = {};
  let changed = false;

  Object.entries(previous).forEach(([slotKey, selection]) => {
    const slot = getSphereSlotConfig(slotKey);
    const item = state.sphereItemsById.get(String(selection?.itemId));
    if (!slot || !item || !slot.matches(item)) {
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

  state.sphereEquipped = next;

  if (changed) {
    saveSphereEquippedState();
  }
}

function sanitizeTrophyEquippedState() {
  const previous = state.trophyEquipped && typeof state.trophyEquipped === "object" ? state.trophyEquipped : {};
  const next = {};
  let changed = false;

  Object.entries(previous).forEach(([slotKey, selection]) => {
    const slot = getTrophySlotConfig(slotKey);
    const item = state.trophyItemsById.get(String(selection?.itemId));
    if (!slot || !item || item.slot_code !== slot.key) {
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

  state.trophyEquipped = next;

  if (changed) {
    saveTrophyEquippedState();
  }
}

function sanitizePetEquippedState() {
  const previous = state.petEquipped && typeof state.petEquipped === "object" ? state.petEquipped : null;
  const item = previous ? state.petItemsById.get(String(previous.itemId)) : null;
  const normalized = item ? createPetSelection(item.uid, previous?.mergeCounts) : null;
  const changed = JSON.stringify(previous || null) !== JSON.stringify(normalized || null);

  state.petEquipped = normalized;

  if (changed) {
    savePetEquippedState();
  }
}

function initializeUiState() {
  const equippedSlotKeys = getEquippedSlots().map((slot) => slot.key);
  const initialSlot = equippedSlotKeys[0] || getFirstAvailableSlotKey();
  const equippedSphereSlotKeys = getEquippedSphereSlots().map((slot) => slot.key);
  const initialSphereSlot = equippedSphereSlotKeys[0] || getFirstAvailableSphereSlotKey();
  const initialSphereCategory = getSphereSlotConfig(initialSphereSlot)?.categoryKey || null;
  const equippedTrophySlotKeys = getEquippedTrophySlots().map((slot) => slot.key);
  const equippedPet = getEquippedPet();
  const initialPetCategory = equippedPet?.variant || getFirstAvailablePetCategoryKey();

  state.activeSlot = initialSlot;
  state.expandedCategories = new Set(initialSlot ? [initialSlot] : []);
  state.activeSphereSlot = initialSphereSlot;
  state.expandedSphereCategories = new Set(initialSphereCategory ? [initialSphereCategory] : []);
  state.activeSphereTypeOneTab = getSphereTypeOneTabForSlot(initialSphereSlot);
  state.activeTrophySlot = equippedTrophySlotKeys[0] || TROPHY_SLOT_CONFIG[0]?.key || null;
  state.expandedTrophySlots = new Set(state.activeTrophySlot ? [state.activeTrophySlot] : []);
  state.activePetCategory = initialPetCategory;
  state.expandedPetCategories = new Set(initialPetCategory ? [initialPetCategory] : []);

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
  renderProfileBar();
  renderSidebarTabs();
  renderStatsSourceTabs();
  renderWorkspaceTabs();
  renderDollSlots();
  renderPassiveMorphRingSlot();
  renderPetWorkspace();
  renderSphereSlots();
  renderTrophySlots();
  renderBoardTotalStats();
  renderStatsPanel();
  renderClassPanel();
  renderCategoryList();
}

function equipItem(slotKey, itemId) {
  const slot = getSlotConfig(slotKey);
  const item = state.itemsById.get(String(itemId));
  if (!slot || !item || !matchesEquipmentSlot(slot, item)) return;

  state.equipped[slotKey] = {
    itemId: String(item.uid),
    upgradeLevel: getDefaultUpgradeLevel(item),
  };
  state.activeSlot = slotKey;
  state.expandedCategories = new Set([slotKey]);
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

function handleSlotPress(event, slotKey) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  handleDollSlotClick(slotKey);
}

function handleSlotRemove(event, slotKey) {
  if (event.key !== "Delete" && event.key !== "Backspace") {
    return;
  }

  if (!state.equipped[slotKey]) {
    return;
  }

  event.preventDefault();
  clearSlot(slotKey);
}

function handleDollSlotClick(slotKey) {
  const slot = getSlotConfig(slotKey);
  const isEquipped = Boolean(state.equipped[slotKey]);

  if (isEquipped) {
    selectSlot(slotKey, { scroll: false });
    if (slot) {
      setLastAction(`${slot.label}: выберите проточку справа сверху или снимите предмет правой кнопкой.`);
    }
    return;
  }

  selectSlot(slotKey, { scroll: true });
}

function selectSlot(slotKey, { scroll = false } = {}) {
  const slot = getSlotConfig(slotKey);
  if (!slot) return;

  state.activeSlot = slotKey;
  state.expandedCategories = new Set([slotKey]);
  renderAll();

  if (scroll) {
    scrollCategoryIntoView(slotKey);
  }

  const count = getItemsForEquipmentSlot(slot).length;
  if (count) {
    setLastAction(`${slot.label}: доступно ${count} предметов.`);
  } else {
    setLastAction(`${slot.label}: для этого слота пока нет предметов.`);
  }
}

function renderDollSlots() {
  const container = document.getElementById("slot-grid");
  if (!container) return;

  const visibleSlots = SLOT_CONFIG.filter((slot) => slot.renderOnDoll !== false);

  container.innerHTML = visibleSlots.map((slot) => {
    const items = getItemsForEquipmentSlot(slot);
    const selected = state.equipped[slot.key];
    const item = selected ? state.itemsById.get(selected.itemId) : null;
    const level = item ? getValidUpgradeLevel(item, selected.upgradeLevel) : null;
    const levels = item ? getLevelKeys(item) : [];

    const classes = ["slot-cell"];
    if (state.activeSlot === slot.key) classes.push("is-active");
    if (item) classes.push("is-filled");
    if (!items.length) classes.push("is-unavailable");

    const ariaText = item
      ? `${slot.label}: ${item.name}${formatUpgradeTitleSuffix(level)}`
      : items.length
        ? `${slot.label}: ${items.length} предметов`
        : `${slot.label}: данных нет`;
    const imageHtml = item?.image
      ? `<img class="slot-item-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">`
      : "";
    const upgradeControl = item && levels.length > 1
      ? `
        <select class="slot-upgrade-select" data-slot="${slot.key}" aria-label="Уровень заточки ${escapeHtml(slot.label)}">
          ${levels.map((entry) => `<option value="${escapeHtml(entry)}" ${entry === level ? "selected" : ""}>${escapeHtml(entry)}</option>`).join("")}
        </select>
      `
      : item && shouldDisplayUpgradeLevel(level)
        ? `<span class="slot-upgrade-select is-static">${escapeHtml(level)}</span>`
        : "";
    const descriptionHtml = item
      ? `<div class="equipment-description">${renderEquipmentDescription(slot, item, level)}</div>`
      : "";

    return `
      <div
        class="${classes.join(" ")}"
        data-slot="${slot.key}"
        style="grid-column: ${slot.col}; grid-row: ${slot.row};"
      >
        <button
          type="button"
          class="slot-pin"
          data-slot="${slot.key}"
          aria-label="${escapeHtml(ariaText)}"
        >
          <span class="slot-item-visual" aria-hidden="true">${imageHtml}</span>
        </button>
        ${upgradeControl}
        ${descriptionHtml}
      </div>
    `;
  }).join("");

  container.querySelectorAll(".slot-pin").forEach((button) => {
    button.addEventListener("click", () => handleDollSlotClick(button.dataset.slot));
    button.addEventListener("keydown", (event) => {
      handleSlotPress(event, button.dataset.slot);
      handleSlotRemove(event, button.dataset.slot);
    });
    button.addEventListener("contextmenu", (event) => {
      const slotKey = button.dataset.slot;
      if (!state.equipped[slotKey]) {
        return;
      }

      event.preventDefault();
      clearSlot(slotKey);
    });
  });

  container.querySelectorAll(".slot-upgrade-select").forEach((control) => {
    control.addEventListener("click", (event) => event.stopPropagation());
    control.addEventListener("keydown", (event) => event.stopPropagation());
    if (control.tagName === "SELECT") {
      control.addEventListener("change", () => setUpgradeLevel(control.dataset.slot, control.value));
    }
  });
}

function renderPassiveMorphRingSlot() {
  const container = document.getElementById("passive-ring-slot");
  if (!container) {
    return;
  }

  const slot = getSlotConfig(PASSIVE_MORPH_RING_SLOT_KEY);
  if (!slot) {
    container.innerHTML = "";
    return;
  }

  const items = getItemsForEquipmentSlot(slot);
  const selected = state.equipped[slot.key];
  const item = selected ? state.itemsById.get(selected.itemId) : null;
  const level = item ? getValidUpgradeLevel(item, selected.upgradeLevel) : null;
  const levels = item ? getLevelKeys(item) : [];
  const classes = ["slot-cell", "passive-slot-cell"];

  if (state.activeSlot === slot.key) {
    classes.push("is-active");
  }
  if (item) {
    classes.push("is-filled");
  }
  if (!items.length) {
    classes.push("is-unavailable");
  }

  const titleText = item
    ? `${slot.label}: ${item.name}${formatUpgradeTitleSuffix(level)}`
    : items.length
      ? `${slot.label}: ${items.length} колец`
      : `${slot.label}: данных нет`;
  const imageHtml = item?.image
    ? `<img class="slot-item-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">`
    : "";
  const upgradeControl = item && levels.length > 1
    ? `
      <select class="slot-upgrade-select" data-slot="${slot.key}" aria-label="Уровень заточки ${escapeHtml(slot.label)}">
        ${levels.map((entry) => `<option value="${escapeHtml(entry)}" ${entry === level ? "selected" : ""}>${escapeHtml(entry)}</option>`).join("")}
      </select>
    `
    : item && shouldDisplayUpgradeLevel(level)
      ? `<span class="slot-upgrade-select is-static">${escapeHtml(level)}</span>`
      : "";
  const descriptionHtml = item
    ? `<div class="equipment-description">${renderEquipmentDescription(slot, item, level)}</div>`
    : "";

  container.innerHTML = `
    <div class="passive-slot-card ${state.activeSlot === slot.key ? "is-active" : ""}">
      <div class="passive-slot-copy">
        <div class="passive-slot-title">${escapeHtml(slot.label)}</div>
        <div class="passive-slot-note">Наденьте кольцо для пасивного эфекта.</div>
      </div>
      <div class="${classes.join(" ")}" data-slot="${slot.key}">
        <button
          type="button"
          class="slot-pin"
          data-slot="${slot.key}"
          aria-label="${escapeHtml(titleText)}"
          title="${escapeHtml(titleText)}"
        >
          <span class="slot-item-visual" aria-hidden="true">${imageHtml}</span>
        </button>
        ${upgradeControl}
        ${descriptionHtml}
      </div>
    </div>
  `;

  container.querySelectorAll(".slot-pin").forEach((button) => {
    button.addEventListener("click", () => handleDollSlotClick(button.dataset.slot));
    button.addEventListener("keydown", (event) => {
      handleSlotPress(event, button.dataset.slot);
      handleSlotRemove(event, button.dataset.slot);
    });
    button.addEventListener("contextmenu", (event) => {
      const slotKey = button.dataset.slot;
      if (!state.equipped[slotKey]) {
        return;
      }

      event.preventDefault();
      clearSlot(slotKey);
    });
  });

  container.querySelectorAll(".slot-upgrade-select").forEach((control) => {
    control.addEventListener("click", (event) => event.stopPropagation());
    control.addEventListener("keydown", (event) => event.stopPropagation());
    if (control.tagName === "SELECT") {
      control.addEventListener("change", () => setUpgradeLevel(control.dataset.slot, control.value));
    }
  });
}

function togglePetCategory(categoryKey) {
  const category = PET_CATEGORY_CONFIG.find((entry) => entry.key === categoryKey);
  if (!category) {
    return;
  }

  state.activePetCategory = category.key;
  state.expandedPetCategories = state.expandedPetCategories.has(category.key)
    ? new Set()
    : new Set([category.key]);
  renderAll();
  setLastAction(`${category.label}: список ${state.expandedPetCategories.has(category.key) ? "открыт" : "свёрнут"}.`);
}

function equipPet(itemId) {
  const item = state.petItemsById.get(String(itemId));
  if (!item) {
    return;
  }

  state.petEquipped = createPetSelection(item.uid, state.petEquipped?.mergeCounts);
  state.activePetCategory = item.variant || getFirstAvailablePetCategoryKey();
  state.expandedPetCategories = new Set(state.activePetCategory ? [state.activePetCategory] : []);
  savePetEquippedState();
  renderAll();
  setLastAction(`Питомец "${item.name}" выбран.`);
}

function clearPet() {
  const current = getEquippedPet();
  state.petEquipped = null;
  savePetEquippedState();
  renderAll();
  setLastAction(current ? `Питомец "${current.name}" снят.` : "Питомец снят.");
}

function changePetMergeCount(mergeKey, delta) {
  const pet = getEquippedPet();
  const mergeConfig = PET_MERGE_CONFIG.find((entry) => entry.key === mergeKey);
  if (!pet || !mergeConfig) {
    return;
  }

  const currentCounts = getPetMergeCounts();
  const currentValue = currentCounts[mergeKey] || 0;
  const totalWithoutCurrent = getPetMergeTotal(currentCounts) - currentValue;
  const nextValue = Math.min(
    PET_MERGE_TOTAL_LIMIT,
    Math.max(0, currentValue + Number(delta || 0)),
  );
  const cappedValue = Math.min(nextValue, PET_MERGE_TOTAL_LIMIT - totalWithoutCurrent);

  if (cappedValue === currentValue) {
    return;
  }

  if (cappedValue > 0) {
    currentCounts[mergeKey] = cappedValue;
  } else {
    delete currentCounts[mergeKey];
  }

  state.petEquipped = createPetSelection(pet.uid, currentCounts);
  savePetEquippedState();
  renderAll();

  const totalBonus = getPetMergeBonusValue(mergeConfig, cappedValue);
  setLastAction(`Слияние "${mergeConfig.label}": ${cappedValue}. Бонус ${mergeConfig.statLabel} ${formatStatValue(totalBonus, mergeConfig.unit)}.`);
}

function getPetWorkspaceData(item, selection = state.petEquipped) {
  const bucket = createCollectedStatsBucket();
  collectItemParamsIntoBucket(item, { upgradeLevel: getDefaultUpgradeLevel(item) }, bucket);
  getPetMergeStats(selection?.mergeCounts).forEach((stat) => addStatWithRules(bucket.numericStats, stat));

  return {
    stats: getDisplayStatsFromMap(bucket.numericStats).allStats,
    mergeStats: getPetMergeStats(selection?.mergeCounts),
    mergeTotal: getPetMergeTotal(selection?.mergeCounts),
    effects: [...bucket.effects.values()].sort((a, b) => a.localeCompare(b, "ru")),
  };
}

function renderPetMergeTable(selection = state.petEquipped) {
  const mergeCounts = getPetMergeCounts(selection);
  const totalUsed = getPetMergeTotal(mergeCounts);

  return `
    <section class="pet-card-section">
      <div class="stats-subtitle-row stats-subtitle-row-split">
        <h3>Слияние питомца</h3>
        <span class="pet-merge-total-note">Использовано ${totalUsed}/${PET_MERGE_TOTAL_LIMIT}</span>
      </div>
      <div class="pet-merge-table-wrap">
        <table class="pet-merge-table">
          <tbody>
            ${PET_MERGE_CONFIG.map((entry) => {
              const count = mergeCounts[entry.key] || 0;
              const totalWithoutCurrent = totalUsed - count;
              const canDecrease = count > 0;
              const canIncrease = count < PET_MERGE_TOTAL_LIMIT && totalWithoutCurrent + count < PET_MERGE_TOTAL_LIMIT;
              const bonus = getPetMergeBonusValue(entry, count);

              return `
                <tr>
                  <td>
                    <div class="pet-merge-element">${escapeHtml(entry.label)}</div>
                  </td>
                  <td>
                    <div class="pet-merge-stat">${escapeHtml(entry.statLabel)}</div>
                  </td>
                  <td>
                    <div class="pet-merge-controls">
                      <button type="button" class="pet-merge-btn" data-pet-merge-key="${escapeHtml(entry.key)}" data-pet-merge-delta="-1" ${canDecrease ? "" : "disabled"} aria-label="Уменьшить ${escapeHtml(entry.label)}">-</button>
                      <span class="pet-merge-count">${count}</span>
                      <button type="button" class="pet-merge-btn" data-pet-merge-key="${escapeHtml(entry.key)}" data-pet-merge-delta="1" ${canIncrease ? "" : "disabled"} aria-label="Увеличить ${escapeHtml(entry.label)}">+</button>
                    </div>
                  </td>
                  <td>
                    <div class="pet-merge-bonus">${escapeHtml(formatStatValue(bonus, entry.unit))}</div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderPetWorkspace() {
  const container = document.getElementById("pet-stage");
  if (!container) {
    return;
  }

  const pet = getEquippedPet();
  if (!pet) {
    container.innerHTML = `
      <div class="pet-stage-empty">
        <div class="empty-note">Выберите питомца в каталоге справа.</div>
      </div>
    `;
    return;
  }

  const { stats, effects } = getPetWorkspaceData(pet, state.petEquipped);
  const subtitle = normalizeText(pet.description_lines?.[0]) || `${pet.element} (${pet.variant})`;
  const categoryLabel = PET_CATEGORY_CONFIG.find((entry) => entry.key === pet.variant)?.label || pet.category;

  container.innerHTML = `
    <article class="pet-card">
      <div class="pet-card-head">
        <div class="pet-card-portrait">
          <img src="${escapeHtml(pet.image)}" alt="${escapeHtml(pet.name)}" loading="lazy">
        </div>
        <div class="pet-card-copy">
          <div class="pet-card-kicker">${escapeHtml(categoryLabel)}</div>
          <div class="pet-card-title-row">
            <h3>${escapeHtml(pet.name)}</h3>
            <button type="button" class="pet-remove-btn" data-pet-clear="1">Снять</button>
          </div>
          <div class="pet-card-meta">${escapeHtml(subtitle)}</div>
        </div>
      </div>

      <section class="pet-card-section">
        <div class="stats-subtitle-row">
          <h3>Параметры питомца</h3>
        </div>
        <div class="stat-list stat-list-secondary">
          ${stats.length ? renderStatRows(stats) : '<div class="empty-note">Питомец не даёт числовых параметров.</div>'}
        </div>
      </section>

      ${renderPetMergeTable(state.petEquipped)}

      ${effects.length ? `
        <section class="pet-card-section">
          <div class="stats-subtitle-row">
            <h3>Особые эффекты</h3>
          </div>
          <div class="effects-list">
            ${effects.map((effect) => `<div class="effect-pill">${escapeHtml(effect)}</div>`).join("")}
          </div>
        </section>
      ` : ""}
    </article>
  `;

  container.querySelectorAll("[data-pet-clear]").forEach((button) => {
    button.addEventListener("click", () => clearPet());
  });
  container.querySelectorAll("[data-pet-merge-key]").forEach((button) => {
    button.addEventListener("click", () => changePetMergeCount(button.dataset.petMergeKey, Number(button.dataset.petMergeDelta || 0)));
  });
}

function selectSphereSlot(slotKey) {
  const slot = getSphereSlotConfig(slotKey);
  if (!slot) {
    return;
  }

  state.activeSphereSlot = slotKey;
  state.expandedSphereCategories = new Set([slot.categoryKey]);
  if (slot.categoryKey === "sphere_type_1") {
    state.activeSphereTypeOneTab = getSphereTypeOneTabForSlot(slotKey);
  }
  renderAll();

  const count = getSphereItemsForSlot(slotKey).length;
  if (count) {
    setLastAction(`${slot.label}: доступно ${count} сфер.`);
  } else {
    setLastAction(`${slot.label}: для этого слота пока нет сфер.`);
  }
}

function equipSphere(slotKey, itemId) {
  const slot = getSphereSlotConfig(slotKey);
  const item = state.sphereItemsById.get(String(itemId));
  if (!slot || !item || !slot.matches(item)) {
    return;
  }

  state.sphereEquipped[slotKey] = {
    itemId: String(item.uid),
    upgradeLevel: getDefaultUpgradeLevel(item),
  };
  state.activeSphereSlot = slotKey;
  state.expandedSphereCategories = new Set([slot.categoryKey]);
  if (slot.categoryKey === "sphere_type_1") {
    state.activeSphereTypeOneTab = getSphereTypeOneTabForSlot(slotKey);
  }
  saveSphereEquippedState();
  renderAll();
  setLastAction(`${slot.label}: вставлена "${item.name}".`);
}

function clearSphereSlot(slotKey) {
  const slot = getSphereSlotConfig(slotKey);
  delete state.sphereEquipped[slotKey];
  saveSphereEquippedState();
  renderAll();
  if (slot) {
    setLastAction(`${slot.label}: сфера снята.`);
  }
}

function setSphereUpgradeLevel(slotKey, level) {
  const slot = getSphereSlotConfig(slotKey);
  const selected = state.sphereEquipped[slotKey];
  if (!selected) {
    return;
  }

  const item = state.sphereItemsById.get(selected.itemId);
  if (!item) {
    return;
  }

  selected.upgradeLevel = getValidUpgradeLevel(item, level);
  saveSphereEquippedState();
  renderAll();
  if (slot) {
    setLastAction(`${slot.label}: уровень сферы переключён на ${selected.upgradeLevel}.`);
  }
}

function renderSphereSlots() {
  const container = document.getElementById("sphere-slot-grid");
  if (!container) {
    return;
  }

  container.innerHTML = SPHERE_SLOT_CONFIG.map((slot) => {
    const items = getSphereItemsForSlot(slot.key);
    const selected = state.sphereEquipped[slot.key];
    const item = selected ? state.sphereItemsById.get(selected.itemId) : null;
    const level = item ? getValidUpgradeLevel(item, selected.upgradeLevel) : null;
    const levels = item ? getLevelKeys(item) : [];
    const showUpgrade = item ? shouldShowSphereUpgrade(item, slot) : false;

    const classes = ["sphere-slot-cell", slot.positionClass];
    if (state.activeSphereSlot === slot.key) {
      classes.push("is-active");
    }
    if (item) {
      classes.push("is-filled");
    }
    if (!items.length) {
      classes.push("is-unavailable");
    }

    const imageHtml = item?.image
      ? `<img class="sphere-slot-item-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">`
      : "";
    const titleText = item
      ? `${slot.label}: ${item.name}${showUpgrade ? formatUpgradeTitleSuffix(level) : ""}`
      : items.length
        ? `${slot.label}: ${items.length} сфер`
        : `${slot.label}: данных нет`;
    const descriptionHtml = item
      ? `<div class="equipment-description sphere-description">${renderSphereDescription(slot, item, level)}</div>`
      : "";
    const upgradeControl = item && showUpgrade && levels.length > 1
      ? `
        <select class="sphere-upgrade-select" data-sphere-slot="${slot.key}" aria-label="Уровень сферы ${escapeHtml(slot.label)}">
          ${levels.map((entry) => `<option value="${escapeHtml(entry)}" ${entry === level ? "selected" : ""}>${escapeHtml(entry)}</option>`).join("")}
        </select>
      `
      : item && showUpgrade && shouldDisplayUpgradeLevel(level)
        ? `<span class="sphere-upgrade-select is-static">${escapeHtml(level)}</span>`
        : "";

    return `
      <div class="${classes.join(" ")}" data-sphere-slot="${slot.key}">
        <button
          type="button"
          class="sphere-slot-button"
          data-sphere-slot="${slot.key}"
          aria-label="${escapeHtml(titleText)}"
          title="${escapeHtml(titleText)}"
        >
          <span class="sphere-slot-item-visual" aria-hidden="true">${imageHtml}</span>
        </button>
        ${upgradeControl}
        ${descriptionHtml}
      </div>
    `;
  }).join("");

  container.querySelectorAll(".sphere-slot-button").forEach((button) => {
    button.addEventListener("click", () => selectSphereSlot(button.dataset.sphereSlot));
    button.addEventListener("contextmenu", (event) => {
      const slotKey = button.dataset.sphereSlot;
      if (!state.sphereEquipped[slotKey]) {
        return;
      }

      event.preventDefault();
      clearSphereSlot(slotKey);
    });
  });

  container.querySelectorAll(".sphere-upgrade-select").forEach((control) => {
    control.addEventListener("click", (event) => event.stopPropagation());
    control.addEventListener("keydown", (event) => event.stopPropagation());
    if (control.tagName === "SELECT") {
      control.addEventListener("change", () => setSphereUpgradeLevel(control.dataset.sphereSlot, control.value));
    }
  });
}

function selectTrophySlot(slotKey) {
  const slot = getTrophySlotConfig(slotKey);
  if (!slot) {
    return;
  }

  state.activeTrophySlot = slotKey;
  renderAll();
  setLastAction(`${slot.label}: слот выбран.`);
}

function equipTrophy(slotKey, itemId) {
  const slot = getTrophySlotConfig(slotKey);
  const item = state.trophyItemsById.get(String(itemId));
  if (!slot || !item || item.slot_code !== slot.key) {
    return;
  }

  state.trophyEquipped[slotKey] = {
    itemId: String(item.uid),
    upgradeLevel: getDefaultUpgradeLevel(item),
  };
  state.activeTrophySlot = slotKey;
  saveTrophyEquippedState();
  renderAll();
  setLastAction(`${slot.label}: установлен "${item.name}".`);
}

function clearTrophySlot(slotKey) {
  const slot = getTrophySlotConfig(slotKey);
  delete state.trophyEquipped[slotKey];
  saveTrophyEquippedState();
  renderAll();
  if (slot) {
    setLastAction(`${slot.label}: трофей снят.`);
  }
}

function setTrophyUpgradeLevel(slotKey, level) {
  const slot = getTrophySlotConfig(slotKey);
  const selected = state.trophyEquipped[slotKey];
  if (!selected) {
    return;
  }

  const item = state.trophyItemsById.get(selected.itemId);
  if (!item) {
    return;
  }

  selected.upgradeLevel = getValidUpgradeLevel(item, level);
  saveTrophyEquippedState();
  renderAll();
  if (slot) {
    setLastAction(`${slot.label}: усиление трофея переключено на ${selected.upgradeLevel}.`);
  }
}

function renderTrophySlots() {
  const container = document.getElementById("trophy-slot-grid");
  if (!container) {
    return;
  }

  container.innerHTML = TROPHY_SLOT_CONFIG.map((slot) => {
    const items = getTrophyItemsForSlot(slot.key);
    const selected = state.trophyEquipped[slot.key];
    const item = selected ? state.trophyItemsById.get(selected.itemId) : null;
    const level = item ? getValidUpgradeLevel(item, selected.upgradeLevel) : null;
    const levels = item ? getLevelKeys(item) : [];
    const classes = ["trophy-slot-cell", slot.positionClass];
    if (state.activeTrophySlot === slot.key) {
      classes.push("is-active");
    }
    if (item) {
      classes.push("is-filled");
    }

    const imageHtml = item?.image
      ? `<img class="trophy-slot-item-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">`
      : "";
    const titleText = item
      ? `${slot.label}: ${item.name}${formatUpgradeTitleSuffix(level)}`
      : items.length
        ? `${slot.label}: ${items.length} трофей`
        : `${slot.label}: данных нет`;
    const descriptionHtml = item
      ? `<div class="equipment-description trophy-description">${renderTrophyDescription(slot, item, level)}</div>`
      : "";
    const upgradeControl = item && levels.length > 1
      ? `
        <select class="trophy-upgrade-select" data-trophy-slot="${slot.key}" aria-label="Усиление трофея ${escapeHtml(slot.label)}">
          ${levels.map((entry) => `<option value="${escapeHtml(entry)}" ${entry === level ? "selected" : ""}>${escapeHtml(entry)}</option>`).join("")}
        </select>
      `
      : "";

    return `
      <div class="${classes.join(" ")}" data-trophy-slot="${slot.key}">
        <button
          type="button"
          class="trophy-slot-button"
          data-trophy-slot="${slot.key}"
          aria-label="${escapeHtml(titleText)}"
          title="${escapeHtml(titleText)}"
        >
          <span class="trophy-slot-item-visual" aria-hidden="true">${imageHtml}</span>
        </button>
        ${upgradeControl}
        ${descriptionHtml}
      </div>
    `;
  }).join("");

  container.querySelectorAll(".trophy-slot-button").forEach((button) => {
    button.addEventListener("click", () => selectTrophySlot(button.dataset.trophySlot));
    button.addEventListener("contextmenu", (event) => {
      const slotKey = button.dataset.trophySlot;
      if (!state.trophyEquipped[slotKey]) {
        return;
      }

      event.preventDefault();
      clearTrophySlot(slotKey);
    });
  });

  container.querySelectorAll(".trophy-upgrade-select").forEach((control) => {
    control.addEventListener("click", (event) => event.stopPropagation());
    control.addEventListener("keydown", (event) => event.stopPropagation());
    control.addEventListener("change", () => setTrophyUpgradeLevel(control.dataset.trophySlot, control.value));
  });
}

function toggleCategory(slotKey) {
  const slot = getSlotConfig(slotKey);
  if (state.expandedCategories.has(slotKey)) {
    state.expandedCategories = new Set();
  } else {
    state.expandedCategories = new Set([slotKey]);
  }

  state.activeSlot = slotKey;
  renderAll();

  if (slot) {
    const isExpanded = state.expandedCategories.has(slotKey);
    setLastAction(`${slot.label}: список ${isExpanded ? "открыт" : "свёрнут"}.`);
  }
}

function toggleSphereCategory(categoryKey) {
  if (state.expandedSphereCategories.has(categoryKey)) {
    state.expandedSphereCategories = new Set();
  } else {
    state.expandedSphereCategories = new Set([categoryKey]);
  }

  const firstSlot = SPHERE_SLOT_CONFIG.find((slot) => slot.categoryKey === categoryKey)?.key || null;
  if (firstSlot) {
    state.activeSphereSlot = firstSlot;
  }
  renderAll();
  const categoryLabel = SPHERE_CATEGORY_CONFIG.find((entry) => entry.key === categoryKey)?.label || categoryKey;
  setLastAction(`${categoryLabel}: список ${state.expandedSphereCategories.has(categoryKey) ? "открыт" : "свёрнут"}.`);
}

function toggleTrophyCategory(slotKey) {
  const slot = getTrophySlotConfig(slotKey);
  if (state.expandedTrophySlots.has(slotKey)) {
    state.expandedTrophySlots = new Set();
  } else {
    state.expandedTrophySlots = new Set([slotKey]);
  }

  state.activeTrophySlot = slotKey;
  renderAll();
  if (slot) {
    setLastAction(`${slot.label}: список ${state.expandedTrophySlots.has(slotKey) ? "открыт" : "свёрнут"}.`);
  }
}

function setSphereTypeOneTab(categoryName) {
  const tab = SPHERE_TYPE_ONE_TABS.find((entry) => entry.category === categoryName);
  if (!tab) {
    return;
  }

  state.activeSphereTypeOneTab = tab.category;
  state.activeSphereSlot = tab.slotKey;
  state.expandedSphereCategories = new Set(["sphere_type_1"]);
  renderAll();
  setLastAction(`Сферы 1-го типа: выбрана вкладка "${tab.label}".`);
}

function renderCategoryList() {
  const container = document.getElementById("category-list");
  if (!container) {
    return;
  }

  if (state.activeWorkspaceTab === "pet") {
    const groups = getPetCategoryGroups();

    container.innerHTML = groups.map((group) => {
      const isExpanded = state.expandedPetCategories.has(group.key);
      const selectedItemId = state.petEquipped?.itemId || "";
      let itemsHtml = "";

      if (isExpanded && group.items.length) {
        itemsHtml = group.items.map((item) => {
          const previewLevel = getDefaultUpgradeLevel(item);
          const params = getParamsForLevel(item, previewLevel);
          const previewText = params[0] || normalizeText(item.description_lines?.[0]) || "Без параметров";
          const isEquipped = String(item.uid) === String(selectedItemId);
          const metaParts = [];
          const subtitle = normalizeText(item.description_lines?.[0]);

          if (subtitle) {
            metaParts.push(subtitle);
          }
          metaParts.push(previewText);

          return `
            <div class="catalog-item catalog-item-pet ${isEquipped ? "is-selected" : ""}">
              <div class="item-row">
                ${renderItemIcon(item)}
                <div class="item-info">
                  <div class="item-name">${escapeHtml(item.name)}</div>
                  <div class="item-meta">${escapeHtml(metaParts.join(" · "))}</div>
                </div>
                <button
                  class="equip-btn ${isEquipped ? "is-selected" : ""}"
                  type="button"
                  data-pet-id="${escapeHtml(item.uid)}"
                  data-action="${isEquipped ? "remove" : "equip"}"
                >
                  ${isEquipped ? "Снять" : "Надеть"}
                </button>
              </div>
            </div>
          `;
        }).join("");
      } else if (isExpanded) {
        itemsHtml = '<div class="category-empty">Для этой группы питомцев пока нет данных.</div>';
      }

      return `
        <div class="category-block ${state.activePetCategory === group.key ? "active" : ""}" data-pet-category="${escapeHtml(group.key)}">
          <button class="category-header" type="button" data-pet-category="${escapeHtml(group.key)}">
            <span class="cat-name">${escapeHtml(group.label)}</span>
            <span class="cat-count">${group.items.length}</span>
            <span class="cat-arrow" aria-hidden="true">›</span>
          </button>
          <div class="category-items ${isExpanded ? "expanded" : "collapsed"}">
            ${itemsHtml}
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll("[data-pet-category]").forEach((button) => {
      if (button.classList.contains("category-header")) {
        button.addEventListener("click", () => togglePetCategory(button.dataset.petCategory));
      }
    });
    container.querySelectorAll("[data-pet-id]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.action === "remove") {
          clearPet();
          return;
        }
        equipPet(button.dataset.petId);
      });
    });
    return;
  }

  if (state.activeWorkspaceTab === "spheres") {
    const groups = getSphereCategoryGroups();

    container.innerHTML = groups.map((group) => {
      const isExpanded = state.expandedSphereCategories.has(group.key);

      let itemsHtml = "";
      if (isExpanded && group.items.length) {
        const renderSphereCatalogItem = (item, showCategory = true) => {
          const previewLevel = getDefaultUpgradeLevel(item);
          const params = getParamsForLevel(item, previewLevel);
          const previewText = params[0] || item.description || "Без параметров";
          const targetSlot = getPrimarySphereSlot(item);
          const selectedItemId = targetSlot ? state.sphereEquipped[targetSlot.key]?.itemId : null;
          const isEquipped = String(item.uid) === String(selectedItemId || "");
          const metaParts = [];
          if (showCategory) {
            metaParts.push(item.category);
          }
          if (shouldShowSphereUpgrade(item, targetSlot) && shouldDisplayUpgradeLevel(previewLevel)) {
            metaParts.push(previewLevel);
          }
          metaParts.push(previewText);

          return `
            <div class="catalog-item catalog-item-sphere ${isEquipped ? "is-selected" : ""}">
              <div class="item-row">
                ${renderItemIcon(item)}
                <div class="item-info">
                  <div class="item-name">${escapeHtml(item.name)}</div>
                  <div class="item-meta">${escapeHtml(metaParts.join(" · "))}</div>
                </div>
                <button
                  class="equip-btn ${isEquipped ? "is-selected" : ""}"
                  type="button"
                  data-sphere-slot="${escapeHtml(targetSlot?.key || "")}"
                  data-sphere-id="${escapeHtml(item.uid)}"
                  data-action="${isEquipped ? "remove" : "equip"}"
                  ${targetSlot ? "" : "disabled"}
                >
                  ${isEquipped ? "Снять" : "Надеть"}
                </button>
              </div>
            </div>
          `;
        };

        if (group.key === "sphere_type_1") {
          const activeTab = SPHERE_TYPE_ONE_TABS.find((tab) => tab.category === state.activeSphereTypeOneTab) || SPHERE_TYPE_ONE_TABS[0];
          const categoryItems = group.items.filter((item) => item.category === activeTab.category);
          const tabsHtml = `
            <div class="sphere-type-tabs" role="tablist" aria-label="Подтипы сфер 1-го типа">
              ${SPHERE_TYPE_ONE_TABS.map((tab) => `
                <button
                  class="sphere-type-tab ${tab.category === activeTab.category ? "is-active" : ""}"
                  type="button"
                  role="tab"
                  aria-selected="${tab.category === activeTab.category ? "true" : "false"}"
                  data-sphere-type-one-tab="${escapeHtml(tab.category)}"
                >
                  ${escapeHtml(tab.label)}
                </button>
              `).join("")}
            </div>
          `;
          const bodyHtml = categoryItems.length
            ? categoryItems.map((item) => renderSphereCatalogItem(item, false)).join("")
            : '<div class="category-empty">Для этой подкатегории сфер пока нет данных.</div>';
          itemsHtml = `
            ${tabsHtml}
            <div class="sphere-tab-panel">
              ${bodyHtml}
            </div>
          `;
        } else {
          itemsHtml = group.items.map((item) => renderSphereCatalogItem(item)).join("");
        }
      } else if (isExpanded) {
        itemsHtml = '<div class="category-empty">Для этой категории сфер пока нет данных.</div>';
      }

      return `
        <div class="category-block ${state.activeSphereSlot && getSphereSlotConfig(state.activeSphereSlot)?.categoryKey === group.key ? "active" : ""}" data-sphere-category="${escapeHtml(group.key)}">
          <button class="category-header" type="button" data-sphere-category="${escapeHtml(group.key)}">
            <span class="cat-name">${escapeHtml(group.label)}</span>
            <span class="cat-count">${group.items.length}</span>
            <span class="cat-arrow" aria-hidden="true">›</span>
          </button>
          <div class="category-items ${isExpanded ? "expanded" : "collapsed"}">
            ${itemsHtml}
          </div>
        </div>
      `;
    }).join("");

      container.querySelectorAll("[data-sphere-category]").forEach((button) => {
        if (button.classList.contains("category-header")) {
          button.addEventListener("click", () => toggleSphereCategory(button.dataset.sphereCategory));
        }
      });
      container.querySelectorAll("[data-sphere-id]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.dataset.action === "remove") {
            clearSphereSlot(button.dataset.sphereSlot);
            return;
          }
          equipSphere(button.dataset.sphereSlot, button.dataset.sphereId);
        });
      });
      container.querySelectorAll("[data-sphere-type-one-tab]").forEach((button) => {
        button.addEventListener("click", () => setSphereTypeOneTab(button.dataset.sphereTypeOneTab));
      });
      return;
    }

  if (state.activeWorkspaceTab === "trophies") {
    container.innerHTML = TROPHY_SLOT_CONFIG.map((slot) => {
      const items = getTrophyItemsForSlot(slot.key);
      const isExpanded = state.expandedTrophySlots.has(slot.key);
      const selectedItemId = state.trophyEquipped[slot.key]?.itemId;
      let itemsHtml = "";

      if (isExpanded && items.length) {
        itemsHtml = items.map((item) => {
          const previewLevel = getDefaultUpgradeLevel(item);
          const params = getParamsForLevel(item, previewLevel);
          const previewText = params[0] || "Без параметров";
          const isEquipped = String(item.uid) === String(selectedItemId || "");

          return `
            <div class="catalog-item catalog-item-trophy ${isEquipped ? "is-selected" : ""}">
              <div class="item-row">
                ${renderItemIcon(item)}
                <div class="item-info">
                  <div class="item-name">${escapeHtml(item.name)}</div>
                  <div class="item-meta">${escapeHtml(shouldDisplayUpgradeLevel(previewLevel) ? `${previewLevel} · ${previewText}` : previewText)}</div>
                </div>
                <button
                  class="equip-btn ${isEquipped ? "is-selected" : ""}"
                  type="button"
                  data-trophy-slot="${escapeHtml(slot.key)}"
                  data-trophy-id="${escapeHtml(item.uid)}"
                  data-action="${isEquipped ? "remove" : "equip"}"
                >
                  ${isEquipped ? "Снять" : "Надеть"}
                </button>
              </div>
            </div>
          `;
        }).join("");
      } else if (isExpanded) {
        itemsHtml = '<div class="category-empty">Для этого слота пока нет трофеев.</div>';
      }

      return `
        <div class="category-block ${state.activeTrophySlot === slot.key ? "active" : ""}" data-trophy-category="${escapeHtml(slot.key)}">
          <button class="category-header" type="button" data-trophy-category="${escapeHtml(slot.key)}">
            <span class="cat-name">${escapeHtml(slot.label)} — ${escapeHtml(slot.statLabel)}</span>
            <span class="cat-count">${items.length}</span>
            <span class="cat-arrow" aria-hidden="true">›</span>
          </button>
          <div class="category-items ${isExpanded ? "expanded" : "collapsed"}">
            ${itemsHtml}
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll("[data-trophy-category]").forEach((button) => {
      if (button.classList.contains("category-header")) {
        button.addEventListener("click", () => toggleTrophyCategory(button.dataset.trophyCategory));
      }
    });
    container.querySelectorAll("[data-trophy-id]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.action === "remove") {
          clearTrophySlot(button.dataset.trophySlot);
          return;
        }
        equipTrophy(button.dataset.trophySlot, button.dataset.trophyId);
      });
    });
    return;
  }

  container.innerHTML = SLOT_CONFIG.map((slot) => {
    const items = getItemsForEquipmentSlot(slot);
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
              ${renderItemIcon(item)}
              <div class="item-info">
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-meta">${escapeHtml(shouldDisplayUpgradeLevel(previewLevel) ? `${previewLevel} · ${previewText}` : previewText)}</div>
              </div>
              <button class="equip-btn ${isEquipped ? "is-selected" : ""}" type="button" data-slot="${slot.key}" data-id="${escapeHtml(item.uid)}" data-action="${isEquipped ? "remove" : "equip"}">
                ${isEquipped ? "Снять" : "Надеть"}
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
          <span class="cat-name">${escapeHtml(slot.catalogLabel || slot.label)}</span>
          <span class="cat-count">${items.length}</span>
          <span class="cat-arrow" aria-hidden="true">›</span>
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
    button.addEventListener("click", () => {
      if (button.dataset.action === "remove") {
        clearSlot(button.dataset.slot);
        return;
      }
      equipItem(button.dataset.slot, button.dataset.id);
    });
  });
}

async function loadItems() {
  const response = await fetch("./equipment-items.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

async function loadSphereItems() {
  const response = await fetch("./sphere-items.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

async function loadTrophyItems() {
  const response = await fetch("./trophy-items.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

async function loadPetItems() {
  const response = await fetch("./pet-items.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

async function init() {
  try {
    const rawItems = await loadItems();
    const rawSphereItems = await loadSphereItems();
    const rawTrophyItems = await loadTrophyItems();
    const rawPetItems = await loadPetItems();
    state.items = rawItems.map((item, index) => ({
      ...item,
      uid: createItemUid(item, index),
    }));
    state.sphereItems = rawSphereItems.map((item, index) => ({
      ...item,
      uid: createSphereUid(item, index),
    }));
    state.trophyItems = rawTrophyItems.map((item, index) => ({
      ...item,
      uid: createTrophyUid(item, index),
    }));
    state.petItems = rawPetItems.map((item, index) => ({
      ...item,
      uid: createPetUid(item, index),
    }));
    state.itemsById = new Map(state.items.map((item) => [item.uid, item]));
    state.sphereItemsById = new Map(state.sphereItems.map((item) => [item.uid, item]));
    state.trophyItemsById = new Map(state.trophyItems.map((item) => [item.uid, item]));
    state.petItemsById = new Map(state.petItems.map((item) => [item.uid, item]));
    initializeProfilesState();
    sanitizeEquippedState();
    sanitizeSphereEquippedState();
    sanitizeTrophyEquippedState();
    sanitizePetEquippedState();
    initializeUiState();
    renderAll();
    bindProfileControls();
    bindSidebarTabs();
    bindStatsSourceTabs();
    bindWorkspaceTabs();
    bindClassControls();
  } catch (err) {
    const categoryList = document.getElementById("category-list");
    if (categoryList) {
      categoryList.innerHTML = `<div class="error-note">Ошибка загрузки данных: ${escapeHtml(err.message)}</div>`;
    }
    const slotGrid = document.getElementById("slot-grid");
    if (slotGrid) {
      slotGrid.innerHTML = "";
    }
    const sphereGrid = document.getElementById("sphere-slot-grid");
    if (sphereGrid) {
      sphereGrid.innerHTML = "";
    }
    const trophyGrid = document.getElementById("trophy-slot-grid");
    if (trophyGrid) {
      trophyGrid.innerHTML = "";
    }
    const petStage = document.getElementById("pet-stage");
    if (petStage) {
      petStage.innerHTML = "";
    }
    setLastAction("Каталог не загрузился.");
  }
}
window.r2App = {
  SLOT_CONFIG,
  SPHERE_SLOT_CONFIG,
  TROPHY_SLOT_CONFIG,
  PET_CATEGORY_CONFIG,
  PET_MERGE_CONFIG,
  PET_MERGE_TOTAL_LIMIT,
  SPHERE_TYPE_ONE_TABS,
  CLASS_CONFIGS,
  MAIN_STATS,
  SECONDARY_STAT_PRIORITY,
  BAPHOMET_SET_BONUSES,
  IFRIT_SET_BONUSES,
  PASSIVE_MORPH_RING_SLOT_KEY,
  state,
  getActiveProfile,
  getSlotConfig,
  getSphereSlotConfig,
  getTrophySlotConfig,
  getItemsForEquipmentSlot,
  getSphereItemsForSlot,
  getTrophyItemsForSlot,
  getPetItemsForCategory,
  getPetMergeCounts,
  getPetMergeTotal,
  getPetMergeStats,
  getLevelKeys,
  getDefaultUpgradeLevel,
  getValidUpgradeLevel,
  shouldDisplayUpgradeLevel,
  formatUpgradeSuffix,
  formatUpgradeTitleSuffix,
  getParamsForLevel,
  getSphereTypeOneTabForSlot,
  matchesEquipmentSlot,
  normalizeText,
  sanitizeClassLevel,
  normalizeProfileRecord,
  renderItemIcon,
  escapeHtml,
  addNumericStat,
  addStatCollection,
  addStatWithRules,
  createCollectedStatsBucket,
  collectPetSelectionIntoBucket,
  collectItemParamsIntoBucket,
  getDisplayStatsFromMap,
  computeBaseClassStat,
  formatStatNumber,
  formatStatValue,
  formatBoardPrimaryValue,
  saveProfilesState,
  saveActiveProfileIdState,
  saveClassState,
  saveEquippedState,
  saveSphereEquippedState,
  saveTrophyEquippedState,
  savePetEquippedState,
  saveWorkspaceTabState,
  applyProfileToState,
  setActiveProfile,
  createNewProfile,
  deleteActiveProfile,
};
window.__R2_APP_READY__ = init();
