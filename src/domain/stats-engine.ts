function toNumericMap(stats = []) {
  const map = new Map();
  stats.forEach((stat) => {
    const key = `${stat.label}::${stat.unit || ""}`;
    map.set(key, stat);
  });
  return map;
}

export function createStatsEngine({ reverseStatLabels = [] } = {}) {
  const reverseSet = new Set(reverseStatLabels);

  return {
    collectStats(profile, catalogs, collector) {
      if (typeof collector !== "function") {
        throw new Error("collectStats requires a collector function");
      }
      return collector(profile, catalogs);
    },
    compareStats(leftStats = [], rightStats = []) {
      const leftMap = toNumericMap(leftStats);
      const rightMap = toNumericMap(rightStats);
      const keys = new Set([...leftMap.keys(), ...rightMap.keys()]);

      return [...keys].map((key) => {
        const left = leftMap.get(key) || { label: key.split("::")[0], value: 0, unit: key.split("::")[1] || "" };
        const right = rightMap.get(key) || { label: left.label, value: 0, unit: left.unit };
        const rawDelta = left.value - right.value;
        const delta = reverseSet.has(left.label) ? -rawDelta : rawDelta;
        return {
          label: left.label,
          unit: left.unit,
          leftValue: left.value,
          rightValue: right.value,
          delta,
        };
      });
    },
  };
}
