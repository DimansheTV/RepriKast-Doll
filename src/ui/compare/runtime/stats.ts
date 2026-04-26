// @ts-nocheck
import { REVERSE_COMPARE_STATS } from "../config";

export function createCompareStatsModule(deps) {
  const {
    app,
    getEquippedSlotsForProfile,
    getEquippedSphereSlotsForProfile,
    getEquippedTrophySlotsForProfile,
  } = deps;

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

  function collectEquipmentSetBonusForProfile(profile, { name, bonuses, isSetItem }) {
    const setItems = getEquippedSlotsForProfile(profile)
      .map((slot) => {
        const selected = profile.equipped[slot.key];
        const item = selected ? app.state.itemsById.get(selected.itemId) : null;
        if (!isSetItem(item)) {
          return null;
        }

        return {
          item,
          level: getUpgradeNumber(app.getValidUpgradeLevel(item, selected.upgradeLevel)),
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
    sourceStats.forEach((stat) => app.addStatWithRules(displayStats, stat));

    return {
      name,
      itemCount: setSize,
      setLevel,
      stats: [...displayStats.values()],
    };
  }

  function collectEquippedStatsForProfile(profile) {
    const inventoryBucket = app.createCollectedStatsBucket();
    const sphereBucket = app.createCollectedStatsBucket();
    const trophyBucket = app.createCollectedStatsBucket();
    const petBucket = app.createCollectedStatsBucket();
    const numericStats = new Map();
    const effects = new Map();
    const setBonuses = [];

    getEquippedSlotsForProfile(profile).forEach((slot) => {
      const selected = profile.equipped[slot.key];
      const item = app.state.itemsById.get(selected.itemId);
      if (!item) {
        return;
      }

      app.collectItemParamsIntoBucket(item, selected, inventoryBucket);
    });

    getEquippedSphereSlotsForProfile(profile).forEach((slot) => {
      const selected = profile.sphereEquipped[slot.key];
      const item = app.state.sphereItemsById.get(selected.itemId);
      if (!item) {
        return;
      }

      app.collectItemParamsIntoBucket(item, selected, sphereBucket);
    });

    getEquippedTrophySlotsForProfile(profile).forEach((slot) => {
      const selected = profile.trophyEquipped[slot.key];
      const item = app.state.trophyItemsById.get(selected.itemId);
      if (!item) {
        return;
      }

      app.collectItemParamsIntoBucket(item, selected, trophyBucket);
    });

    app.collectPetSelectionIntoBucket(profile.petEquipped, petBucket);

    [inventoryBucket, sphereBucket, trophyBucket, petBucket].forEach((bucket) => {
      app.addStatCollection(numericStats, [...bucket.numericStats.values()]);
      bucket.effects.forEach((effect, key) => effects.set(key, effect));
    });

    [
      collectEquipmentSetBonusForProfile(profile, {
        name: "Бафомета",
        bonuses: app.BAPHOMET_SET_BONUSES,
        isSetItem: isBaphometSetItem,
      }),
      collectEquipmentSetBonusForProfile(profile, {
        name: "Ифрита",
        bonuses: app.IFRIT_SET_BONUSES,
        isSetItem: isIfritSetItem,
      }),
    ].forEach((setBonus) => {
      if (!setBonus) {
        return;
      }

      setBonus.stats.forEach((stat) => app.addNumericStat(numericStats, stat));
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

  function getClassPanelDataForProfile(profile) {
    const config = app.CLASS_CONFIGS[profile.classConfig.classKey] || app.CLASS_CONFIGS.knight;
    const baseStatMap = {};
    const baseStats = config.baseStats.map((statConfig) => {
      const value = app.computeBaseClassStat(statConfig, profile.classConfig.level);
      baseStatMap[statConfig.label] = value;
      return {
        label: statConfig.label,
        value,
        unit: "",
      };
    });

    return {
      config,
      baseStatMap,
      baseStats,
      derivedStats: config.derivedStats(baseStatMap),
    };
  }

  function getTotalStatsDataForProfile(profile) {
    const totalStats = new Map();
    const { numericStats, effects } = collectEquippedStatsForProfile(profile);
    const { config, baseStats, baseStatMap } = getClassPanelDataForProfile(profile);
    const effectiveAttributeMap = {
      ...baseStatMap,
    };

    ["Сила", "Ловкость", "Интеллект"].forEach((label) => {
      const bonus = numericStats.get(`${label}::`);
      if (bonus) {
        effectiveAttributeMap[label] = (effectiveAttributeMap[label] || 0) + bonus.value;
      }
    });

    const derivedStats = config.derivedStats(effectiveAttributeMap);

    app.addStatCollection(totalStats, baseStats);
    app.addStatCollection(totalStats, derivedStats);
    app.addStatCollection(totalStats, [...numericStats.values()]);

    const { mainStats, secondaryStats } = app.getDisplayStatsFromMap(totalStats, { includeMainZeros: true });

    return {
      mainStats,
      secondaryStats,
      effects,
    };
  }

  function getStatKey(stat) {
    return `${stat.label}::${stat.unit || ""}`;
  }

  function parseStatKey(key) {
    const [label, unit = ""] = key.split("::");
    return { label, unit };
  }

  function formatAbsoluteStat(stat) {
    return app.MAIN_STATS.includes(stat.label)
      ? app.formatBoardPrimaryValue(stat)
      : app.formatStatValue(stat.value, stat.unit);
  }

  function getComparisonClasses(label, primaryValue, secondaryValue) {
    if (primaryValue === secondaryValue) {
      return {
        primary: "",
        secondary: "",
        delta: "",
      };
    }

    const primaryBetter = REVERSE_COMPARE_STATS.has(label)
      ? primaryValue < secondaryValue
      : primaryValue > secondaryValue;

    return {
      primary: primaryBetter ? "is-better" : "is-worse",
      secondary: primaryBetter ? "is-worse" : "is-better",
      delta: primaryBetter ? "is-better" : "is-worse",
    };
  }

  function buildComparisonRows(primaryProfile, secondaryProfile) {
    const primaryStats = getTotalStatsDataForProfile(primaryProfile);
    const secondaryStats = getTotalStatsDataForProfile(secondaryProfile);
    const primaryAllStats = [...primaryStats.mainStats, ...primaryStats.secondaryStats];
    const secondaryAllStats = [...secondaryStats.mainStats, ...secondaryStats.secondaryStats];
    const primaryMap = new Map(primaryAllStats.map((stat) => [getStatKey(stat), stat]));
    const secondaryMap = new Map(secondaryAllStats.map((stat) => [getStatKey(stat), stat]));

    const primaryMainMap = new Map(primaryStats.mainStats.map((stat) => [stat.label, stat]));
    const secondaryMainMap = new Map(secondaryStats.mainStats.map((stat) => [stat.label, stat]));

    const keys = app.MAIN_STATS.map((label) => {
      const stat = primaryMainMap.get(label) || secondaryMainMap.get(label) || { label, unit: "" };
      return getStatKey(stat);
    });

    const secondaryKeyMap = new Map();
    [...primaryStats.secondaryStats, ...secondaryStats.secondaryStats].forEach((stat) => {
      secondaryKeyMap.set(getStatKey(stat), stat);
    });

    const orderedSecondaryKeys = [...secondaryKeyMap.keys()].sort((a, b) => {
      const statA = secondaryKeyMap.get(a);
      const statB = secondaryKeyMap.get(b);
      const priorityA = app.SECONDARY_STAT_PRIORITY.includes(statA.label)
        ? app.SECONDARY_STAT_PRIORITY.indexOf(statA.label)
        : Number.MAX_SAFE_INTEGER;
      const priorityB = app.SECONDARY_STAT_PRIORITY.includes(statB.label)
        ? app.SECONDARY_STAT_PRIORITY.indexOf(statB.label)
        : Number.MAX_SAFE_INTEGER;
      const priorityDiff = priorityA - priorityB;
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return statA.label.localeCompare(statB.label, "ru");
    });

    orderedSecondaryKeys.forEach((key) => {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    });

    return keys.map((key) => {
      const baseStat = primaryMap.get(key) || secondaryMap.get(key) || parseStatKey(key);
      const primaryStat = primaryMap.get(key) || { label: baseStat.label, unit: baseStat.unit, value: 0 };
      const secondaryStat = secondaryMap.get(key) || { label: baseStat.label, unit: baseStat.unit, value: 0 };
      const delta = primaryStat.value - secondaryStat.value;
      const classes = getComparisonClasses(baseStat.label, primaryStat.value, secondaryStat.value);

      return {
        label: baseStat.label,
        unit: baseStat.unit || "",
        primary: primaryStat,
        secondary: secondaryStat,
        delta,
        classes,
      };
    });
  }

  return {
    collectEquippedStatsForProfile,
    getClassPanelDataForProfile,
    getTotalStatsDataForProfile,
    buildComparisonRows,
    formatAbsoluteStat,
  };
}
