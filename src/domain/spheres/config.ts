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
