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
  ["defense", "Защита"],
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
      { label: "HP", base: 695, growthType: "per_level", amount: 5 },
      { label: "MP", base: 31, growthType: "per_level", amount: 1 },
      { label: "Вес", base: 3025, growthType: "per_level", amount: 25 },
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



export {
  MAIN_STATS,
  CLASS_PRIMARY_ATTRIBUTES,
  SECONDARY_STAT_PRIORITY,
  STAT_LABEL_ALIASES,
  GROUPED_ATTACK_STAT_TARGETS,
  BAPHOMET_SET_BONUSES,
  IFRIT_SET_BONUSES,
  CLASS_CONFIGS,
};
