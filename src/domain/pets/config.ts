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



export { PET_CATEGORY_CONFIG, PET_MERGE_TOTAL_LIMIT, PET_MERGE_CONFIG };
