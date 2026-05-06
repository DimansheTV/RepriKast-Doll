function normalizeSphereSlotCode(value) {
  return String(value || "").trim().toLowerCase().replace(/^sphere_/u, "");
}

function sphereSlotCodeIs(item, code) {
  return normalizeSphereSlotCode(item?.slot_code ?? item?.slotCode) === code;
}

function sphereNameCandidates(item) {
  return [
    item?.name,
    item?.locales?.ru?.name,
    item?.locales?.en?.name,
  ].filter(Boolean).map((value) => String(value));
}

function isHarvestSphere(item) {
  return sphereSlotCodeIs(item, "special") &&
    sphereNameCandidates(item).some((name) => /(алчност|гармони|greed|harmony)/iu.test(name));
}

const SPHERE_SLOT_CONFIG = [
  {
    key: "sphere_life",
    sourceSlot: "life",
    label: "Сфера жизни",
    categoryKey: "sphere_type_1",
    positionClass: "sphere-pos-top-left",
    matches: (item) => sphereSlotCodeIs(item, "life"),
  },
  {
    key: "sphere_mastery",
    sourceSlot: "mastery",
    label: "Сфера мастерства",
    categoryKey: "sphere_type_1",
    positionClass: "sphere-pos-top-center",
    matches: (item) => sphereSlotCodeIs(item, "mastery"),
  },
  {
    key: "sphere_soul",
    sourceSlot: "soul",
    label: "Сфера души",
    categoryKey: "sphere_type_1",
    positionClass: "sphere-pos-top-right",
    matches: (item) => sphereSlotCodeIs(item, "soul"),
  },
  {
    key: "sphere_destruction",
    sourceSlot: "destruction",
    label: "Сфера разрушения",
    categoryKey: "sphere_type_1",
    positionClass: "sphere-pos-bottom-left-upper",
    matches: (item) => sphereSlotCodeIs(item, "destruction"),
  },
  {
    key: "sphere_protection",
    sourceSlot: "protection",
    label: "Сфера защиты",
    categoryKey: "sphere_type_1",
    positionClass: "sphere-pos-bottom-right-upper",
    matches: (item) => sphereSlotCodeIs(item, "protection"),
  },
  {
    key: "sphere_harvest",
    sourceSlot: "special",
    label: "Сфера добычи",
    categoryKey: "sphere_type_2",
    positionClass: "sphere-pos-bottom-left",
    matches: (item) => isHarvestSphere(item),
  },
  {
    key: "sphere_class",
    sourceSlot: "special",
    label: "Классовая сфера",
    categoryKey: "sphere_type_3",
    positionClass: "sphere-pos-bottom-center",
    matches: (item) => sphereSlotCodeIs(item, "special") && !isHarvestSphere(item),
  },
  {
    key: "sphere_morph",
    sourceSlot: "morph",
    label: "Сфера перевоплощения",
    categoryKey: "sphere_type_4",
    positionClass: "sphere-pos-bottom-right",
    matches: (item) => sphereSlotCodeIs(item, "morph"),
  },
];

const SPHERE_CATEGORY_CONFIG = [
  { key: "sphere_type_1", label: "Основные сферы" },
  { key: "sphere_type_2", label: "Сферы добычи" },
  { key: "sphere_type_3", label: "Особые сферы" },
  { key: "sphere_type_4", label: "Сферы перевоплощения" },
];

const SPHERE_TYPE_ONE_TABS = [
  { category: "Сферы разрушения", label: "Разрушения", slotKey: "sphere_destruction" },
  { category: "Сферы жизни", label: "Жизни", slotKey: "sphere_life" },
  { category: "Сферы мастерства", label: "Мастерства", slotKey: "sphere_mastery" },
  { category: "Сферы души", label: "Души", slotKey: "sphere_soul" },
  { category: "Сферы защиты", label: "Защиты", slotKey: "sphere_protection" },
];

export { SPHERE_SLOT_CONFIG, SPHERE_CATEGORY_CONFIG, SPHERE_TYPE_ONE_TABS };
