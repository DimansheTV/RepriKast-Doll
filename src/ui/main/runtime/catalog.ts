// @ts-nocheck
import {
  SLOT_CONFIG,
  PASSIVE_MORPH_RING_SLOT_KEY,
  CLASS_RESTRICTED_EQUIPMENT_SLOT_CODES,
  EQUIPMENT_CLASS_BY_WIKI_ICON,
  KNIGHT_HALBERD_WEAPON_NAMES,
  SUMMONER_ORB_WEAPON_NAMES,
  SUMMONER_SOUL_STONE_SHIELD_NAMES,
  MAGE_RANGED_WEAPON_NAMES,
  MAGE_FOLIANT_SHIELD_NAMES,
} from "../../../domain/equipment/config";
import { SPHERE_SLOT_CONFIG, SPHERE_CATEGORY_CONFIG, SPHERE_TYPE_ONE_TABS } from "../../../domain/spheres/config";
import { TROPHY_SLOT_CONFIG } from "../../../domain/trophies/config";
import { PET_CATEGORY_CONFIG, PET_MERGE_CONFIG, PET_MERGE_TOTAL_LIMIT } from "../../../domain/pets/config";
import {
  getLocalizedCatalogField,
  getLocalizedCatalogLines,
  getLocalizedCatalogUpgradeLines,
} from "../../../shared/catalog-locales";
import { normalizeText, escapeHtml, sanitizeClassLevel } from "./utils";
import {
  parseNumericStat,
  formatStatValue,
  getUpgradeNumber,
  isBaphometSetItem,
  isIfritSetItem,
  isMagicVelkenOrMythrilItem,
  isPlainVelkenOrMythrilDefenseItem,
  isCustomDefenseScaleItem,
  isDefaultDefenseScaleEquipmentItem,
} from "./stats";

export function createCatalogModule(deps) {
  const { state, localizeText = (value) => String(value || ""), getCurrentLanguage = () => "ru" } = deps;

function sortByLocalizedName(left, right) {
  return getLocalizedItemName(left).localeCompare(getLocalizedItemName(right), getCurrentLanguage());
}

function getLocalizedField(item, field, options = {}) {
  return getLocalizedCatalogField(item, field, getCurrentLanguage(), options);
}

function getLocalizedLines(item, field, options = {}) {
  return getLocalizedCatalogLines(item, field, getCurrentLanguage(), options);
}

function getLocalizedUpgradeLines(item, level, options = {}) {
  return getLocalizedCatalogUpgradeLines(item, level, getCurrentLanguage(), options);
}

function getLocalizedItemName(item, options = {}) {
  return getLocalizedField(item, "name", options);
}

function getLocalizedItemDescription(item, options = {}) {
  const description = getLocalizedField(item, "description", options);
  if (description) {
    return description;
  }
  return getLocalizedLines(item, "descriptionLines", options)[0] || "";
}

function getLocalizedItemCategory(item, options = {}) {
  return getLocalizedField(item, "category", options);
}

function getLocalizedItemVariant(item, options = {}) {
  return getLocalizedField(item, "variant", options);
}

function getLocalizedItemElement(item, options = {}) {
  return getLocalizedField(item, "element", options);
}

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

function getMorphSphereRequiredLevel(item) {
  if (!item) {
    return 0;
  }

  const candidates = [
    item.name,
    item?.locales?.ru?.name,
    item?.locales?.en?.name,
    getLocalizedItemName(item, { fallbackToRu: true }),
  ]
    .filter(Boolean)
    .map((value) => normalizeText(value));

  for (const candidate of candidates) {
    const directLevelMatch = candidate.match(/(\d+)\+\s*уровня/i);
    if (directLevelMatch) {
      return Number(directLevelMatch[1]) || 0;
    }

    const localizedLevelMatch = candidate.match(/(?:lv\.?|level)\s*(\d+)\+/i);
    if (localizedLevelMatch) {
      return Number(localizedLevelMatch[1]) || 0;
    }
  }

  return 0;
}

function isSphereAllowedForLevel(item, classLevel = state.classConfig.level) {
  const requiredLevel = getMorphSphereRequiredLevel(item);
  if (!requiredLevel) {
    return true;
  }

  return sanitizeClassLevel(classLevel) >= requiredLevel;
}

function getSphereItemsForSlot(slotKey) {
  const slot = getSphereSlotConfig(slotKey);
  if (!slot) {
    return [];
  }

  return state.sphereItems
    .filter((item) => slot.matches(item))
    .sort(sortByLocalizedName);
}

function getTrophyItemsForSlot(slotKey) {
  return state.trophyItems
    .filter((item) => item.slot_code === slotKey)
    .sort(sortByLocalizedName);
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
      .sort(sortByLocalizedName);

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

function getAdjacentUpgradeLevel(item, level, delta) {
  const levels = getLevelKeys(item);
  if (!levels.length) {
    return "+0";
  }

  const currentLevel = getValidUpgradeLevel(item, level);
  const currentIndex = Math.max(0, levels.indexOf(currentLevel));
  const nextIndex = Math.min(levels.length - 1, Math.max(0, currentIndex + Number(delta || 0)));
  return levels[nextIndex];
}

function renderUpgradeStepperControl(controlClass, item, level, dataAttributes, ariaLabel) {
  const normalizedLevel = getValidUpgradeLevel(item, level);
  const levels = getLevelKeys(item);
  if (levels.length > 1) {
    const currentIndex = Math.max(0, levels.indexOf(normalizedLevel));
    const buttonData = Object.entries(dataAttributes || {})
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `data-${key}="${escapeHtml(value)}"`)
      .join(" ");

    return `
      <div class="${controlClass} upgrade-stepper" role="group" aria-label="${escapeHtml(ariaLabel)}">
        <button type="button" class="upgrade-stepper-btn" ${buttonData} data-upgrade-delta="-1" ${currentIndex === 0 ? "disabled" : ""} aria-label="${escapeHtml(`${ariaLabel}: уменьшить`)}">-</button>
        <span class="upgrade-stepper-value">${escapeHtml(normalizedLevel)}</span>
        <button type="button" class="upgrade-stepper-btn" ${buttonData} data-upgrade-delta="1" ${currentIndex === levels.length - 1 ? "disabled" : ""} aria-label="${escapeHtml(`${ariaLabel}: увеличить`)}">+</button>
      </div>
    `;
  }

  return shouldDisplayUpgradeLevel(normalizedLevel)
    ? `<span class="${controlClass} upgrade-stepper upgrade-stepper-static"><span class="upgrade-stepper-value">${escapeHtml(normalizedLevel)}</span></span>`
    : "";
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

function getLocalizedParamsForLevel(item, level) {
  const params = getLocalizedUpgradeLines(item, level, { fallbackToRu: true });
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

function normalizeEquipmentClassKey(value) {
  const normalized = normalizeText(value).toLowerCase();
  return EQUIPMENT_CLASS_BY_WIKI_ICON[normalized] || normalized;
}

function isClassRestrictedEquipmentSlot(slotOrItem) {
  const slotCode = typeof slotOrItem === "string"
    ? slotOrItem
    : slotOrItem?.sourceSlot || slotOrItem?.slot_code || slotOrItem?.slotCode || "";
  return CLASS_RESTRICTED_EQUIPMENT_SLOT_CODES.has(slotCode);
}

function getEquipmentClasses(item) {
  const source = Array.isArray(item?.classes)
    ? item.classes
    : Array.isArray(item?.sourceMeta?.classes)
      ? item.sourceMeta.classes
      : [];
  const classes = [...new Set(source.map((entry) => normalizeEquipmentClassKey(entry)).filter(Boolean))];

  if (!classes.length || classes.includes("all")) {
    return ["all"];
  }

  return classes.sort();
}

function isEquipmentAllowedForClass(item, classKey = state.classConfig.classKey) {
  if (!isClassRestrictedEquipmentSlot(item)) {
    return true;
  }

  const classes = getEquipmentClasses(item);
  return classes.includes("all") || classes.includes(classKey);
}

function getEquippedItem(equipped, slotKey) {
  const selection = equipped && typeof equipped === "object" ? equipped[slotKey] : null;
  return selection ? state.itemsById.get(String(selection.itemId)) || null : null;
}

function isKnightHalberdWeapon(item) {
  return item?.slot_code === "weapon" && KNIGHT_HALBERD_WEAPON_NAMES.has(normalizeText(item?.name).toLowerCase());
}

function isSummonerRestrictedOrbWeapon(item) {
  return item?.slot_code === "weapon" && SUMMONER_ORB_WEAPON_NAMES.has(normalizeText(item?.name).toLowerCase());
}

function isSummonerSoulStoneShield(item) {
  return item?.slot_code === "shield" && SUMMONER_SOUL_STONE_SHIELD_NAMES.has(normalizeText(item?.name).toLowerCase());
}

function isSummonerNonOrbWeapon(item) {
  return item?.slot_code === "weapon" && !isSummonerRestrictedOrbWeapon(item);
}

function isMageRangedWeapon(item) {
  return item?.slot_code === "weapon" && MAGE_RANGED_WEAPON_NAMES.has(normalizeText(item?.name).toLowerCase());
}

function isMageFoliantShield(item) {
  return item?.slot_code === "shield" && MAGE_FOLIANT_SHIELD_NAMES.has(normalizeText(item?.name).toLowerCase());
}

function isMageNonRangedWeapon(item) {
  return item?.slot_code === "weapon" && !isMageRangedWeapon(item);
}

function hasKnightWeaponShieldConflict(slot, item, classKey = state.classConfig.classKey, equipped = state.equipped) {
  if (classKey !== "knight" || !slot || !item) {
    return false;
  }

  if (slot.key === "weapon" && isKnightHalberdWeapon(item)) {
    return Boolean(getEquippedItem(equipped, "shield"));
  }

  if (slot.key === "shield") {
    return isKnightHalberdWeapon(getEquippedItem(equipped, "weapon"));
  }

  return false;
}

function hasSummonerWeaponShieldConflict(slot, item, classKey = state.classConfig.classKey, equipped = state.equipped) {
  if (classKey !== "summoner" || !slot || !item) {
    return false;
  }

  if (slot.key === "weapon" && isSummonerRestrictedOrbWeapon(item)) {
    const shield = getEquippedItem(equipped, "shield");
    return Boolean(shield && !isSummonerSoulStoneShield(shield));
  }

  if (slot.key === "weapon" && isSummonerNonOrbWeapon(item)) {
    return isSummonerSoulStoneShield(getEquippedItem(equipped, "shield"));
  }

  if (slot.key === "shield") {
    const weapon = getEquippedItem(equipped, "weapon");
    if (isSummonerRestrictedOrbWeapon(weapon)) {
      return !isSummonerSoulStoneShield(item);
    }
    if (isSummonerNonOrbWeapon(weapon)) {
      return isSummonerSoulStoneShield(item);
    }
  }

  return false;
}

function hasMageWeaponShieldConflict(slot, item, classKey = state.classConfig.classKey, equipped = state.equipped) {
  if (classKey !== "mage" || !slot || !item) {
    return false;
  }

  if (slot.key === "weapon" && isMageRangedWeapon(item)) {
    const shield = getEquippedItem(equipped, "shield");
    return Boolean(shield && !isMageFoliantShield(shield));
  }

  if (slot.key === "weapon" && isMageNonRangedWeapon(item)) {
    return isMageFoliantShield(getEquippedItem(equipped, "shield"));
  }

  if (slot.key === "shield") {
    const weapon = getEquippedItem(equipped, "weapon");
    if (isMageRangedWeapon(weapon)) {
      return !isMageFoliantShield(item);
    }
    if (isMageNonRangedWeapon(weapon)) {
      return isMageFoliantShield(item);
    }
  }

  return false;
}

function normalizeEquipmentSelections(equipped, classKey = state.classConfig.classKey) {
  const source = equipped && typeof equipped === "object" ? equipped : {};
  let next = source;

  if (classKey === "knight") {
    const weapon = getEquippedItem(next, "weapon");
    if (isKnightHalberdWeapon(weapon) && next.shield) {
      next = { ...next };
      delete next.shield;
    }
  }

  if (classKey === "summoner") {
    const weapon = getEquippedItem(next, "weapon");
    const shield = getEquippedItem(next, "shield");
    const hasInvalidOrbShieldPair = isSummonerRestrictedOrbWeapon(weapon) && shield && !isSummonerSoulStoneShield(shield);
    const hasInvalidNonOrbSoulStonePair = isSummonerNonOrbWeapon(weapon) && shield && isSummonerSoulStoneShield(shield);
    if (hasInvalidOrbShieldPair || hasInvalidNonOrbSoulStonePair) {
      if (next === source) {
        next = { ...next };
      }
      delete next.shield;
    }
  }

  if (classKey === "mage") {
    const weapon = getEquippedItem(next, "weapon");
    const shield = getEquippedItem(next, "shield");
    const hasInvalidRangedShieldPair = isMageRangedWeapon(weapon) && shield && !isMageFoliantShield(shield);
    const hasInvalidNonRangedFoliantPair = isMageNonRangedWeapon(weapon) && shield && isMageFoliantShield(shield);
    if (hasInvalidRangedShieldPair || hasInvalidNonRangedFoliantPair) {
      if (next === source) {
        next = { ...next };
      }
      delete next.shield;
    }
  }

  return next;
}

function matchesEquipmentSlot(slot, item, classKey = state.classConfig.classKey, equipped = state.equipped) {
  return Boolean(
    slot &&
    item &&
    item.slot_code === slot.sourceSlot &&
    (!slot.matches || slot.matches(item)) &&
    isEquipmentAllowedForClass(item, classKey) &&
    !hasKnightWeaponShieldConflict(slot, item, classKey, equipped) &&
    !hasSummonerWeaponShieldConflict(slot, item, classKey, equipped) &&
    !hasMageWeaponShieldConflict(slot, item, classKey, equipped),
  );
}

function getItemsForEquipmentSlot(slotKeyOrConfig, classKey = state.classConfig.classKey, equipped = state.equipped) {
  const slot = typeof slotKeyOrConfig === "string" ? getSlotConfig(slotKeyOrConfig) : slotKeyOrConfig;
  if (!slot) {
    return [];
  }

  return state.items
    .filter((item) => matchesEquipmentSlot(slot, item, classKey, equipped))
    .sort(sortByLocalizedName);
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

function getUniqueProfileCopyName(sourceName) {
  const names = new Set(state.profiles.map((profile) => profile.name));
  const source = normalizeText(sourceName) || "Профиль";
  const baseName = sanitizeProfileName(`${source} копия`, "Профиль копия");

  if (!names.has(baseName)) {
    return baseName;
  }

  let index = 2;
  while (index < 1000) {
    const suffix = ` копия ${index}`;
    const trimmedSource = source.slice(0, Math.max(1, 40 - suffix.length));
    const candidate = sanitizeProfileName(`${trimmedSource}${suffix}`, `Профиль копия ${index}`);
    if (!names.has(candidate)) {
      return candidate;
    }
    index += 1;
  }

  return sanitizeProfileName(`Профиль копия ${Date.now()}`, "Профиль копия");
}

function getActiveProfile() {
  return state.profiles.find((profile) => profile.id === state.activeProfileId) || null;
}

function createItemUid(item, index) {
  return `equipment:${item.id ?? index}`;
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

  function hydrateCatalogs(catalogs) {
    state.items = catalogs.equipment.map((item, index) => ({
      ...item,
      uid: createItemUid(item, index),
    }));
    state.sphereItems = catalogs.sphere.map((item, index) => ({
      ...item,
      uid: createSphereUid(item, index),
    }));
    state.trophyItems = catalogs.trophy.map((item, index) => ({
      ...item,
      uid: createTrophyUid(item, index),
    }));
    state.petItems = catalogs.pet.map((item, index) => ({
      ...item,
      uid: createPetUid(item, index),
    }));
    state.itemsById = new Map();
    state.items.forEach((item, index) => {
      state.itemsById.set(item.uid, item);
      const fallbackLegacyId = `${item.slot_code}:${item.name}:${index}`;
      const legacyIds = new Set([fallbackLegacyId, ...(Array.isArray(item.legacy_ids) ? item.legacy_ids : [])]);
      legacyIds.forEach((legacyId) => {
        if (legacyId && !state.itemsById.has(legacyId)) {
          state.itemsById.set(legacyId, item);
        }
      });
    });
    state.sphereItemsById = new Map(state.sphereItems.map((item) => [item.uid, item]));
    state.trophyItemsById = new Map(state.trophyItems.map((item) => [item.uid, item]));
    state.petItemsById = new Map(state.petItems.map((item) => [item.uid, item]));
  }

  return {
    SLOT_CONFIG,
    SPHERE_SLOT_CONFIG,
    SPHERE_CATEGORY_CONFIG,
    TROPHY_SLOT_CONFIG,
    PET_CATEGORY_CONFIG,
    PET_MERGE_CONFIG,
    PET_MERGE_TOTAL_LIMIT,
    SPHERE_TYPE_ONE_TABS,
    PASSIVE_MORPH_RING_SLOT_KEY,
    getSphereSlotConfig,
    getTrophySlotConfig,
    getCompatibleSphereSlots,
    getPrimarySphereSlot,
    getMorphSphereRequiredLevel,
    isSphereAllowedForLevel,
    shouldShowSphereUpgrade,
    getSphereItemsForSlot,
    getTrophyItemsForSlot,
    getPetItemsForCategory,
    getPetCategoryGroups,
    getSphereCategoryGroups,
    getLevelKeys,
    getDefaultUpgradeLevel,
    getValidUpgradeLevel,
    getAdjacentUpgradeLevel,
    renderUpgradeStepperControl,
    shouldDisplayUpgradeLevel,
    formatUpgradeSuffix,
    formatUpgradeTitleSuffix,
    getParamsForLevel,
    getLocalizedParamsForLevel,
    getSlotConfig,
    isClassRestrictedEquipmentSlot,
    getEquipmentClasses,
    isEquipmentAllowedForClass,
    isKnightHalberdWeapon,
    normalizeEquipmentSelections,
    matchesEquipmentSlot,
    getItemsForEquipmentSlot,
    getFirstAvailableSlotKey,
    getFirstAvailableSphereSlotKey,
    getFirstAvailablePetCategoryKey,
    getSphereTypeOneTabForSlot,
    getEquippedSlots,
    getEquippedSphereSlots,
    getEquippedTrophySlots,
    getEquippedPet,
    sanitizePetMergeCounts,
    getPetMergeCounts,
    getPetMergeTotal,
    getPetMergeBonusValue,
    createPetSelection,
    getPetMergeStats,
    getLocalizedCatalogField: getLocalizedField,
    getLocalizedCatalogLines: getLocalizedLines,
    getLocalizedCatalogUpgradeLines: getLocalizedUpgradeLines,
    getLocalizedItemName,
    getLocalizedItemDescription,
    getLocalizedItemCategory,
    getLocalizedItemVariant,
    getLocalizedItemElement,
    createItemUid,
    createSphereUid,
    createTrophyUid,
    createPetUid,
    hydrateCatalogs,
  };
}
