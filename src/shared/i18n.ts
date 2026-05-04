export type Language = "ru" | "en";

export const DEFAULT_LANGUAGE: Language = "ru";

const UI_MESSAGES: Record<string, { ru: string; en: string }> = {
  "toolbar.buildPanel": { ru: "Панель сборки", en: "Build toolbar" },
  "toolbar.buildPicker": { ru: "Выбор сборки", en: "Build picker" },
  "toolbar.languageSwitcher": { ru: "Переключатель языка", en: "Language switcher" },
  "toolbar.mobileNav": { ru: "Мобильная навигация", en: "Mobile navigation" },
  "toolbar.renameBuild": { ru: "Переименовать сборку", en: "Rename build" },
  "toolbar.copyBuild": { ru: "Скопировать сборку", en: "Copy build" },
  "toolbar.deleteBuild": { ru: "Удалить сборку", en: "Delete build" },
  "toolbar.buildName": { ru: "Название сборки", en: "Build name" },
  "toolbar.saved": { ru: "Сохранено", en: "Saved" },
  "toolbar.unsaved": { ru: "Не сохранено", en: "Unsaved" },
  "button.newBuild": { ru: "Новая сборка", en: "New build" },
  "button.cancel": { ru: "Отменить", en: "Cancel" },
  "button.save": { ru: "Сохранить", en: "Save" },
  "button.compare": { ru: "Сравнение", en: "Compare" },
  "button.menu": { ru: "Меню", en: "Menu" },
  "button.close": { ru: "Закрыть", en: "Close" },
  "button.mainMenu": { ru: "Главное меню", en: "Main menu" },
  "button.languageRu": { ru: "RU", en: "RU" },
  "button.languageEn": { ru: "EN", en: "EN" },
  "compare.toolbar": { ru: "Панель сравнения сборок", en: "Build comparison toolbar" },
  "compare.primaryBuild": { ru: "Сборка 1", en: "Build 1" },
  "compare.secondaryBuild": { ru: "Сборка 2", en: "Build 2" },
  "compare.primarySelect": { ru: "Основная сборка", en: "Primary build" },
  "compare.secondarySelect": { ru: "Вторая сборка", en: "Secondary build" },
  "compare.summaryPanel": { ru: "Итоги сравнения", en: "Comparison summary" },
  "compare.better": { ru: "Лучше", en: "Better" },
  "compare.worse": { ru: "Хуже", en: "Worse" },
  "compare.equal": { ru: "Равно", en: "Equal" },
  "compare.parameter": { ru: "Параметр", en: "Stat" },
  "compare.delta": { ru: "Δ", en: "Δ" },
  "compare.chooseSecondBuild": { ru: "Создайте или выберите вторую сборку для сравнения.", en: "Create or choose a second build for comparison." },
  "compare.createSecondBuild": { ru: "Создайте вторую сборку, чтобы увидеть вторую сборку.", en: "Create a second build to view the comparison panel." },
  "compare.classLevel": { ru: "{className} · Ур. {level}", en: "{className} · Lv. {level}" },
  "class.class": { ru: "Класс", en: "Class" },
  "class.level": { ru: "Уровень", en: "Level" },
  "class.characterLevel": { ru: "Уровень персонажа", en: "Character level" },
  "class.decreaseLevel": { ru: "Уменьшить уровень", en: "Decrease level" },
  "class.increaseLevel": { ru: "Увеличить уровень", en: "Increase level" },
  "stats.fromLevel": { ru: "Параметры от уровня", en: "Level stats" },
  "stats.derivedFromLevel": { ru: "Характеристики от уровня", en: "Derived level stats" },
  "stats.inventory": { ru: "Инвентарь", en: "Inventory" },
  "stats.pets": { ru: "Питомцы", en: "Pets" },
  "stats.spheres": { ru: "Сферы", en: "Spheres" },
  "stats.trophies": { ru: "Трофеи", en: "Trophies" },
  "stats.sets": { ru: "Сеты", en: "Sets" },
  "stats.effects": { ru: "Эффекты", en: "Effects" },
  "stats.sources": { ru: "Источники параметров", en: "Stat sources" },
  "stats.equipmentStats": { ru: "Параметры экипировки", en: "Equipment stats" },
  "stats.inventoryValues": { ru: "Параметры инвентаря", en: "Inventory stats" },
  "stats.petValues": { ru: "Параметры питомца", en: "Pet stats" },
  "stats.sphereValues": { ru: "Параметры сфер", en: "Sphere stats" },
  "stats.trophyValues": { ru: "Параметры трофеев", en: "Trophy stats" },
  "stats.setValues": { ru: "Параметры от сета", en: "Set stats" },
  "stats.specialEffects": { ru: "Особые эффекты", en: "Special effects" },
  "stats.setBonusMeta": { ru: "{itemCount} предметов · минимальная заточка +{setLevel}", en: "{itemCount} items · minimum upgrade +{setLevel}" },
  "board.totalStats": { ru: "Итоговые параметры", en: "Total stats" },
  "workspace.doll": { ru: "Рабочая область куклы", en: "Doll workspace" },
  "workspace.areas": { ru: "Рабочие области", en: "Workspace areas" },
  "mobileNav.quickJump": { ru: "Быстрый переход", en: "Quick navigation" },
  "mobileNav.sidebar": { ru: "Левая панель", en: "Left panel" },
  "mobileNav.workspace": { ru: "Рабочая область", en: "Workspace" },
  "workspace.inventory": { ru: "Инвентарь", en: "Inventory" },
  "workspace.pet": { ru: "Питомцы", en: "Pets" },
  "workspace.spheres": { ru: "Сферы", en: "Spheres" },
  "workspace.trophies": { ru: "Трофеи", en: "Trophies" },
  "workspace.equipmentSlots": { ru: "Слоты экипировки", en: "Equipment slots" },
  "workspace.passiveRing": { ru: "Пассивное кольцо перевоплощения", en: "Passive morph ring" },
  "workspace.sphereSlots": { ru: "Слоты сфер", en: "Sphere slots" },
  "workspace.petStage": { ru: "Выбранный питомец", en: "Selected pet" },
  "workspace.trophySlots": { ru: "Слоты трофеев", en: "Trophy slots" },
  "empty.setBonuses": { ru: "Сетовые бонусы не активны.", en: "Set bonuses are not active." },
  "empty.noParams": { ru: "Без параметров", en: "No stats" },
  "empty.inventoryStats": { ru: "Инвентарь пока не даёт числовых параметров.", en: "Inventory does not provide numeric stats yet." },
  "empty.petStats": { ru: "Питомец пока не выбран.", en: "No pet selected yet." },
  "empty.sphereStats": { ru: "Сферы пока не дают числовых параметров.", en: "Spheres do not provide numeric stats yet." },
  "empty.trophyStats": { ru: "Трофеи пока не дают числовых параметров.", en: "Trophies do not provide numeric stats yet." },
  "empty.effects": { ru: "Особые эффекты не найдены.", en: "No special effects found." },
  "empty.boardStats": { ru: "Надень предметы, чтобы увидеть итоговые параметры.", en: "Equip items to see total stats." },
  "empty.extraStats": { ru: "Дополнительных параметров нет.", en: "No extra stats." },
  "empty.noPetInBuild": { ru: "У сборки не выбран питомец.", en: "This build has no pet selected." },
  "empty.petNoNumericStats": { ru: "Питомец не даёт числовых параметров.", en: "This pet does not provide numeric stats." },
  "toast.buildSaved": { ru: "Сборка успешно сохранена", en: "Build saved successfully" },
  "build.defaultName": { ru: "Сборка {index}", en: "Build {index}" },
  "build.defaultCopyName": { ru: "Сборка копия", en: "Build copy" },
  "build.copySuffix": { ru: "копия", en: "copy" },
  "action.buildLoaded": { ru: 'Сборка загружена. Выберите слот, чтобы сменить предмет или уровень заточки.', en: "Build loaded. Choose a slot to change the item or upgrade level." },
  "action.chooseSlot": { ru: "Выберите слот на кукле или откройте категорию справа.", en: "Choose a slot on the doll or open a category on the right." },
  "action.buildActivated": { ru: 'Активирована сборка "{name}".', en: 'Activated build "{name}".' },
  "action.buildRenamed": { ru: 'Название сборки изменено на "{name}".', en: 'Renamed build to "{name}".' },
  "action.buildCreated": { ru: 'Создана новая сборка "{name}".', en: 'Created new build "{name}".' },
  "action.buildSaved": { ru: 'Сборка "{name}" сохранена.', en: 'Saved build "{name}".' },
  "action.buildCopied": { ru: 'Создана копия сборки "{name}".', en: 'Created a copy of build "{name}".' },
  "action.buildCanceled": { ru: 'Изменения сборки "{name}" отменены.', en: 'Cancelled changes for build "{name}".' },
  "action.buildDeleted": { ru: 'Сборка "{name}" удалена.', en: 'Deleted build "{name}".' },
  "confirm.deleteBuild": { ru: 'Удалить сборку "{name}"?', en: 'Delete build "{name}"?' },
  "error.loadData": { ru: "Не удалось загрузить данные", en: "Failed to load data" },
  "error.loadingFailed": { ru: "Загрузка не удалась.", en: "Loading failed." },
};

const EXACT_TRANSLATIONS = new Map<string, string>([
  ["Рыцарь", "Knight"],
  ["Рейнджер", "Ranger"],
  ["Маг", "Mage"],
  ["Призыватель", "Summoner"],
  ["Ассасин", "Assassin"],
  ["Серьги", "Earrings"],
  ["серьги", "Earrings"],
  ["Ожерелье", "Necklace"],
  ["ожерелье", "Necklace"],
  ["Ремень", "Belt"],
  ["ремень", "Belt"],
  ["Кольцо", "Ring"],
  ["кольцо", "Ring"],
  ["Шлемы", "Helmets"],
  ["Плащи", "Cloaks"],
  ["Ожерелья", "Necklaces"],
  ["Доспехи", "Armor"],
  ["Снаряжение", "Shield gear"],
  ["Оружие", "Weapons"],
  ["Ремни", "Belts"],
  ["Перчатки", "Gloves"],
  ["Сапоги", "Boots"],
  ["Кольцо 1-й слот", "Ring slot 1"],
  ["Кольцо 2-й слот", "Ring slot 2"],
  ["Кольцо перевоплощения", "Morph ring"],
  ["Кольца перевоплощения", "Morph rings"],
  ["Сфера жизни", "Life Sphere"],
  ["Сфера мастерства", "Mastery Sphere"],
  ["Сфера души", "Soul Sphere"],
  ["Сфера разрушения", "Destruction Sphere"],
  ["Сфера защиты", "Protection Sphere"],
  ["Сфера добычи", "Harvest Sphere"],
  ["Классовая сфера", "Class Sphere"],
  ["Сфера перевоплощения", "Morph Sphere"],
  ["Сферы жизни", "Life Spheres"],
  ["Сферы мастерства", "Mastery Spheres"],
  ["Сферы души", "Soul Spheres"],
  ["Сферы разрушения", "Destruction Spheres"],
  ["Сферы защиты", "Protection Spheres"],
  ["Сферы перевоплощения", "Morph Spheres"],
  ["Основные сферы", "Core Spheres"],
  ["Сферы добычи", "Harvest Spheres"],
  ["Особые сферы", "Special Spheres"],
  ["Сферы перевоплощения", "Morph Spheres"],
  ["Разрушения", "Destruction"],
  ["Жизни", "Life"],
  ["Мастерства", "Mastery"],
  ["Души", "Soul"],
  ["Защиты", "Protection"],
  ["Тип I", "Type I"],
  ["Тип II", "Type II"],
  ["Огонь", "Fire"],
  ["Земля", "Earth"],
  ["Энергия", "Energy"],
  ["Ветер", "Wind"],
  ["Луна", "Moon"],
  ["Солнце", "Sun"],
  ["Вода", "Water"],
  ["Корона", "Crown"],
  ["Маска", "Mask"],
  ["маска", "mask"],
  ["Шлем", "Helm"],
  ["шлем", "helm"],
  ["Плащ", "Cloak"],
  ["плащ", "cloak"],
  ["Пояс", "Belt"],
  ["пояс", "belt"],
  ["Доспех", "Armor"],
  ["доспех", "armor"],
  ["Браслет", "Bracelet"],
  ["браслет", "bracelet"],
  ["Амулет", "Amulet"],
  ["Чаша", "Cup"],
  ["Горн", "Horn"],
  ["Фолиант", "Tome"],
  ["фолиант", "tome"],
  ["Камень души", "Soul Stone"],
  ["камень души", "soul stone"],
  ["Перчатки", "Gloves"],
  ["перчатки", "gloves"],
  ["Сапоги", "Boots"],
  ["сапоги", "boots"],
  ["Щит", "Shield"],
  ["щит", "shield"],
  ["Колчан", "Quiver"],
  ["колчан", "quiver"],
  ["Стрела", "Arrow"],
  ["стрела", "arrow"],
  ["стрелы", "arrows"],
  ["стрел", "arrows"],
  ["Камни души", "Soul Stones"],
  ["камни души", "soul stones"],
  ["Сила", "Strength"],
  ["сила", "strength"],
  ["силой", "power"],
  ["Ловкость", "Dexterity"],
  ["ловкость", "dexterity"],
  ["Интеллект", "Intelligence"],
  ["интеллект", "intelligence"],
  ["Защита", "Defense"],
  ["защиты", "protection"],
  ["Скорость атаки", "Attack speed"],
  ["Скорость бега", "Move speed"],
  ["Скорость передвижения", "Move speed"],
  ["Параметры экипировки", "Equipment stats"],
  ["Уровень всех атак", "All attack levels"],
  ["Уровень ближних атак", "Melee attack level"],
  ["Уровень дальних атак", "Ranged attack level"],
  ["Уровень магических атак", "Magic attack level"],
  ["Точность всех атак", "All attack accuracy"],
  ["Точность ближних атак", "Melee accuracy"],
  ["Точность дальних атак", "Ranged accuracy"],
  ["Точность магических атак", "Magic accuracy"],
  ["Точность", "Accuracy"],
  ["Шанс нанести крит. удар", "Critical hit chance"],
  ["Шанс получить крит. удар", "Incoming critical hit chance"],
  ["Шанс получить крит. урон", "Incoming critical damage chance"],
  ["Доп. урон при крит. ударе", "Critical damage bonus"],
  ["Получаемый крит. урон", "Incoming critical damage"],
  ["Получение критического урона", "Incoming critical damage"],
  ["Получаемый урон", "Incoming damage"],
  ["Периодический урон", "Damage over time"],
  ["Проникающий урон", "Piercing damage"],
  ["Поглощение", "Absorption"],
  ["Уклонение", "Evasion"],
  ["Восстановление HP", "HP regeneration"],
  ["Восстановление MP", "MP regeneration"],
  ["Особое восстановление HP", "Special HP regeneration"],
  ["Особое восстановление MP", "Special MP regeneration"],
  ["Эффект зелий здоровья", "HP potion effect"],
  ["Увеличение эффекта зелий здоровья", "HP potion effect"],
  ["Увеличивает эффект зелий здоровья", "HP potion effect"],
  ["Эффективность уровня зелий", "Potion level effectiveness"],
  ["Уровень зелий здоровья", "HP potion level"],
  ["Увеличение уровня переносимого веса", "Carry weight level"],
  ["Уровень экипировки", "Required level"],
  ["Базовый уровень атаки", "Base attack level"],
  ["Базовый уровень защиты", "Base defense level"],
  ["Базовый урон", "Base damage"],
  ["Дополнительный урон при крит. ударе", "Critical damage bonus"],
  ["Шанс крит. удара", "Critical hit chance"],
  ["Расход МР", "MP cost"],
  ["Расход MP", "MP cost"],
  ["Невидимость", "Invisibility"],
  ["Ожог", "Burn"],
  ["Убийца людей", "Human slayer"],
  ["Могучая сила", "Mighty Strength"],
  ["Шанс ядовитого удара", "Poison strike chance"],
  ["По монстрам:", "Against monsters:"],
  ["Защита от людей ур. 1", "Human defense Lv. 1"],
  ["Защита от людей ур. 2", "Human defense Lv. 2"],
  ["Защита от людей", "Human defense"],
  ["Шанс выпадения трофеев", "Trophy drop chance"],
  ["Вероятность выпадения трофеев", "Trophy drop chance"],
  ["Количество получаемых очков опыта", "Experience gain"],
  ["Вес", "Weight"],
  ["Все параметры", "All stats"],
  ["Регенерация HP", "HP regeneration"],
  ["Регенерация MP", "MP regeneration"],
  ["Бафомета", "of Baphomet"],
  ["Ифрита", "of Ifrit"],
  ["Особые сферы", "Special spheres"],
  ["Без параметров", "No stats"],
  ["Надеть", "Equip"],
  ["Снять", "Remove"],
  ["Использовано", "Used"],
  ["Уменьшить", "Decrease"],
  ["Увеличить", "Increase"],
  ["данных нет", "no data"],
  ["Направление I", "Type I"],
  ["Направление II", "Type II"],
  ["Ближний бой", "Melee"],
  ["Дальний бой", "Ranged"],
  ["Магический бой", "Magic"],
  ["Скорость бега/атаки", "Move/attack speed"],
  ["Защита + опыт/дроп", "Defense + XP/drop"],
  ["Ближний бой + опыт/дроп", "Melee + XP/drop"],
  ["Дальний бой + опыт/дроп", "Ranged + XP/drop"],
  ["Магический бой + опыт/дроп", "Magic + XP/drop"],
  ["Скорость бега + опыт/дроп", "Move speed + XP/drop"],
  ["Уклонение + опыт/дроп", "Evasion + XP/drop"],
  ["Мана + опыт/дроп", "Mana + XP/drop"],
  ["Слияние питомца", "Pet merge"],
  ["Выберите питомца в каталоге справа.", "Choose a pet from the catalog on the right."],
  ["Подтипы сфер 1-го типа", "Type I sphere subtypes"],
  ["Для этой группы питомцев пока нет данных.", "There is no data for this pet group yet."],
  ["Для этой подкатегории сфер пока нет данных.", "There is no data for this sphere subcategory yet."],
  ["Для этой категории сфер пока нет данных.", "There is no data for this sphere category yet."],
  ["Для этого слота пока нет трофеев.", "There are no trophies for this slot yet."],
  ["Для этого слота пока нет предметов.", "There are no items for this slot yet."],
  ["Питомец не даёт числовых параметров.", "This pet does not provide numeric stats."],
  ["Наденьте кольцо для пасивного эфекта.", "Equip a ring to activate the passive effect."],
  ["Наденьте кольцо для пассивного эффекта.", "Equip a ring to activate the passive effect."],
  ["Блестящие", "Shining"],
  ["Блестящее", "Shining"],
  ["Блестящий", "Shining"],
  ["Светящиеся", "Glowing"],
  ["Светящееся", "Glowing"],
  ["Светящийся", "Glowing"],
  ["Ледяные", "Icy"],
  ["Ледяное", "Icy"],
  ["Ледяной", "Icy"],
  ["Стеклянные", "Glass"],
  ["Стеклянное", "Glass"],
  ["Стеклянный", "Glass"],
  ["Улучшенные", "Improved"],
  ["Улучшенное", "Improved"],
  ["Улучшенный", "Improved"],
  ["Усиленные", "Enhanced"],
  ["Усиленное", "Enhanced"],
  ["Усиленный", "Enhanced"],
  ["Усовершенствованные", "Advanced"],
  ["Усовершенствованное", "Advanced"],
  ["Усовершенствованный", "Advanced"],
  ["авантюриста", "of the adventurer"],
  ["атланта", "of the Atlantean"],
  ["беспощадной расправы", "of merciless retribution"],
  ["берсерка", "of the berserker"],
  ["божественного поглощения", "of divine absorption"],
  ["божественной гармонии", "of divine harmony"],
  ["варвара", "of the barbarian"],
  ["воздуха", "of air"],
  ["восстановления", "of recovery"],
  ["выживания", "of survival"],
  ["высокой ловкости", "of high dexterity"],
  ["высокой силы", "of high strength"],
  ["высокого интеллекта", "of high intelligence"],
  ["гармонии", "of harmony"],
  ["гладиатора", "of the gladiator"],
  ["головореза", "of the cutthroat"],
  ["доблести", "of valor"],
  ["жестокой расправы", "of cruel retribution"],
  ["земли", "of earth"],
  ["златорогого дракона", "of the golden-horned dragon"],
  ["интеллекта", "of intelligence"],
  ["атаки", "of attack"],
  ["гнева", "of wrath"],
  ["карателя", "of the punisher"],
  ["колосса", "of the colossus"],
  ["ловкости", "of dexterity"],
  ["мастера", "of the master"],
  ["мушкетера", "of the musketeer"],
  ["новичка", "of the novice"],
  ["огненного дракона", "of the fire dragon"],
  ["океана", "of the ocean"],
  ["охотника", "of the hunter"],
  ["поглощения", "of absorption"],
  ["потрошителя", "of the butcher"],
  ["праведной ярости", "of righteous fury"],
  ["пророка", "of the prophet"],
  ["расправы", "of retribution"],
  ["ратника", "of the warrior"],
  ["святого поглощения", "of holy absorption"],
  ["святой гармонии", "of holy harmony"],
  ["священной ярости", "of sacred fury"],
  ["силы", "of strength"],
  ["солнца", "of the sun"],
  ["шпиона", "of the spy"],
  ["витязя", "of the knight"],
  ["вождя", "of the chieftain"],
  ["улучшенного восстановления", "of improved recovery"],
  ["улучшенного поглощения", "of improved absorption"],
  ["улучшенного уклонения", "of improved evasion"],
  ["усиленного восстановления", "of enhanced recovery"],
  ["уклонения", "of evasion"],
  ["усиленного поглощения", "of enhanced absorption"],
  ["усиленного уклонения", "of enhanced evasion"],
  ["алчности", "of greed"],
  ["архимага", "of the archmage"],
  ["героя", "of the hero"],
  ["Велкена", "of Velken"],
  ["тьмы", "of darkness"],
  ["энергии Ифрита", "of Ifrit's energy"],
  ["ярости Бафомета", "of Baphomet's fury"],
  ["магических стрел", "of magical arrows"],
  ["мифриловых стрел", "of mithril arrows"],
  ["стальных стрел", "of steel arrows"],
  ["стрел Бафомета", "of Baphomet's arrows"],
  ["стрел Ифрита", "of Ifrit's arrows"],
  ["невидимости", "of invisibility"],
  ["смотрителя", "of the keeper"],
  ["убийцы", "of the killer"],
  ["хранителя", "of the guardian"],
  ["Метеоса", "of Meteos"],
  ["фанатика", "of the fanatic"],
  ["чародея", "of the sorcerer"],
  ["чернокнижника", "of the warlock"],
  ["ярости", "of fury"],
  ["грифона", "of the griffin"],
  ["гривеносного дракона", "of the maned dragon"],
  ["уровень концентрации", "concentration level"],
  ["удачу", "luck"],
  ["интеллект архимага", "the archmage's intelligence"],
  ["ловкость охотника", "the hunter's dexterity"],
  ["силой героя", "the power of a hero"],
  ["аурой защиты", "a protective aura"],
  ["жизненной энергией", "life energy"],
  ["магической энергией", "magical energy"],
  ["чистой энергией", "pure energy"],
  ["разрушительной мощью", "destructive power"],
  ["яростью", "fury"],
  ["Легендарная", "Legendary"],
  ["Обычная", "Common"],
  ["Редкая", "Rare"],
  ["Эпическая", "Epic"],
  ["легендарный", "legendary"],
  ["редкий", "rare"],
  ["эпический", "epic"],
  ["Магический", "Magical"],
  ["Магическая", "Magical"],
  ["Магическое", "Magical"],
  ["Магические", "Magical"],
  ["магический", "magical"],
  ["магическая", "magical"],
  ["магическое", "magical"],
  ["магические", "magical"],
  ["Мифриловый", "Mithril"],
  ["Мифриловая", "Mithril"],
  ["Мифриловое", "Mithril"],
  ["Мифриловые", "Mithril"],
  ["мифриловый", "mithril"],
  ["мифриловая", "mithril"],
  ["мифриловое", "mithril"],
  ["мифриловые", "mithril"],
  ["Стальной", "Steel"],
  ["Стальная", "Steel"],
  ["Стальное", "Steel"],
  ["Стальные", "Steel"],
  ["стальной", "steel"],
  ["стальная", "steel"],
  ["стальное", "steel"],
  ["стальные", "steel"],
  ["Тяжелый", "Heavy"],
  ["Тяжелая", "Heavy"],
  ["Тяжелое", "Heavy"],
  ["Тяжелые", "Heavy"],
  ["тяжелый", "heavy"],
  ["тяжелая", "heavy"],
  ["тяжелое", "heavy"],
  ["тяжелые", "heavy"],
  ["Легкий", "Light"],
  ["Легкая", "Light"],
  ["Легкое", "Light"],
  ["Легкие", "Light"],
  ["легкий", "light"],
  ["легкая", "light"],
  ["легкое", "light"],
  ["легкие", "light"],
  ["Обычный", "Common"],
  ["Обычная", "Common"],
  ["Обычное", "Common"],
  ["Обычные", "Common"],
  ["обычный", "common"],
  ["обычная", "common"],
  ["обычное", "common"],
  ["обычные", "common"],
  ["Железный", "Iron"],
  ["Железная", "Iron"],
  ["Железное", "Iron"],
  ["Железные", "Iron"],
  ["железный", "iron"],
  ["железная", "iron"],
  ["железное", "iron"],
  ["железные", "iron"],
  ["Пластинчатый", "Plate"],
  ["Пластинчатая", "Plate"],
  ["Пластинчатое", "Plate"],
  ["Пластинчатые", "Plate"],
  ["пластинчатый", "plate"],
  ["пластинчатая", "plate"],
  ["пластинчатое", "plate"],
  ["пластинчатые", "plate"],
  ["Кольчужный", "Chainmail"],
  ["Кольчужная", "Chainmail"],
  ["Кольчужное", "Chainmail"],
  ["Кольчужные", "Chainmail"],
  ["кольчужный", "chainmail"],
  ["кольчужная", "chainmail"],
  ["кольчужное", "chainmail"],
  ["кольчужные", "chainmail"],
  ["Большой", "Large"],
  ["большой", "large"],
  ["Средний", "Medium"],
  ["средний", "medium"],
  ["Костяной", "Bone"],
  ["костяной", "bone"],
  ["Тренировочная", "Training"],
  ["Тренировочные", "Training"],
  ["тренировочная", "training"],
  ["тренировочные", "training"],
  ["Деревянная", "Wooden"],
  ["деревянная", "wooden"],
  ["магических", "magical"],
  ["мифриловых", "mithril"],
  ["стальных", "steel"],
  ["Кольцо, увеличивающее поглощение от атак противника.", "A ring that increases absorption against enemy attacks."],
  ["Ожерелье, увеличивающее поглощение от атак противника.", "A necklace that increases absorption against enemy attacks."],
  ["Ремень, увеличивающий поглощение от атак противника.", "A belt that increases absorption against enemy attacks."],
  ["Увеличивает поглощение силой земли.", "Increases earth absorption."],
  ["Благодаря легкому весу позволяет с легкостью уворачиваться от атак противника.", "Thanks to its light weight, it makes it easy to evade enemy attacks."],
  ["Благодаря легкому весу, позволяют увернуться от атак противника.", "Thanks to their light weight, they allow you to evade enemy attacks."],
  ["Благодаря малому весу, позволяют с легкостью уйти от атак противника.", "Thanks to their low weight, they make it easy to avoid enemy attacks."],
  ["Может наложить на цель эффект:", "Can inflict the following effect on the target:"],
  ["Может наложить на цель эффект: Все параметры -1", "Can inflict the following effect on the target: All stats -1"],
  ["Пояс, повышающий интеллект.", "A belt that increases intelligence."],
  ["Ремень, повышающий ловкость.", "A belt that increases dexterity."],
  ["Расходуется, в отличие от колчана. Пригодится при тестировании скорости атаки.", "Consumed unlike a quiver. Useful for testing attack speed."],
  ["Расходуется, в отличие от обычных камней. Пригодится при тестировании скорости атаки.", "Consumed unlike regular soul stones. Useful for testing attack speed."],
  ["Реген MP от зелий", "MP recovery from potions"],
  ["Снижает уровень эффекта обнаружения.", "Reduces the detection effect level."],
  ["Увеличивает параметры МКБ в зависимости от уровня усиления оружия.", "Increases MKB stats depending on the weapon enhancement level."],
  ["Увеличивает уклонение за счет силы воздуха.", "Increases evasion through the power of air."],
  ["Чем выше уровень усиления, тем выше уровень магической атаки.", "The higher the enhancement level, the higher the magic attack level."],
  ["Чем выше уровень усиления, тем выше уровень уклонения.", "The higher the enhancement level, the higher the evasion level."],
  ["Щит, немного неудобный в использовании из-за своего веса и размера.", "A shield that is slightly awkward to use because of its weight and size."],
  ["Сфера, дарующая своему владельцу гармонию.", "A sphere that grants harmony to its owner."],
  ["Чем выше уровень усиления тем выше уровень поглощения.", "The higher the enhancement level, the higher the absorption level."],
  ["Щит стража", "Guardian's Shield"],
  ["Адские катары", "Hell Katars"],
  ["Адский клинок", "Hell Blade"],
  ["Алебарда хранителя", "Guardian's Halberd"],
  ["Англахель", "Anglahel"],
  ["Аронди", "Arondi"],
  ["Блестящий меч Солнца", "Shining Sword of the Sun"],
  ["Боевой топор", "Battle Axe"],
  ["Бронебойное ружье", "Armor-Piercing Rifle"],
  ["Вулканический мушкет Метеоса", "Meteos Volcanic Musket"],
  ["Громовое ружье", "Thunder Rifle"],
  ["Дамасская алебарда", "Damascus Halberd"],
  ["Двуручный меч", "Two-Handed Sword"],
  ["Двуручный меч хранителя", "Guardian's Two-Handed Sword"],
  ["Джамадхары убийцы", "Killer's Jamadhars"],
  ["Длинный лук ворона", "Raven Longbow"],
  ["Железная алебарда", "Iron Halberd"],
  ["Карабин гномов", "Dwarven Carbine"],
  ["Катары хранителя", "Guardian's Katars"],
  ["Клинок отражения", "Reflection Blade"],
  ["Клинок убийцы", "Killer's Blade"],
  ["Клинок хранителя", "Guardian's Blade"],
  ["Композитный лук", "Composite Bow"],
  ["Копье гвардейца", "Guard's Spear"],
  ["Кремниевое ружье", "Flintlock Rifle"],
  ["Крис", "Kris"],
  ["Кровавые джамадхары", "Bloody Jamadhars"],
  ["Кровавый клинок", "Bloody Blade"],
  ["Лук гнома", "Dwarven Bow"],
  ["Лук кочевника", "Nomad Bow"],
  ["Лук хранителя", "Guardian's Bow"],
  ["Магмовый орб Метеоса", "Meteos Magma Orb"],
  ["Меч Правосудия", "Sword of Justice"],
  ["Меч жреца", "Priest's Sword"],
  ["Меч кочевника", "Nomad Sword"],
  ["Меч лунного света", "Moonlight Sword"],
  ["Меч точности Рарки", "Rarka's Sword of Precision"],
  ["Меч хранителя", "Guardian's Sword"],
  ["Морглай", "Morglay"],
  ["Начальный клинок ассасина", "Novice Assassin's Blade"],
  ["Начальный лук рейнджера", "Novice Ranger Bow"],
  ["Начальный меч мага", "Novice Mage Sword"],
  ["Начальный меч рыцаря", "Novice Knight Sword"],
  ["Начальный орб призывателя", "Novice Summoner Orb"],
  ["Начальный посох мага", "Novice Mage Staff"],
  ["Огневой лук Метеоса", "Meteos Fire Bow"],
  ["Огненные катары Метеоса", "Meteos Fire Katars"],
  ["Огненный клеймор Метеоса", "Meteos Fire Claymore"],
  ["Орб Зефироса", "Zephyros Orb"],
  ["Орб Юпитера", "Jupiter Orb"],
  ["Орб воды", "Orb of Water"],
  ["Орб души Гайи", "Gaia Soul Orb"],
  ["Орб кочевника", "Nomad Orb"],
  ["Орб призывателя", "Summoner's Orb"],
  ["Орб хранителя", "Guardian's Orb"],
  ["Охотничий лук", "Hunting Bow"],
  ["Пламенная рапира Метеоса", "Meteos Flame Rapier"],
  ["Посох Аллатариэль", "Allatariel Staff"],
  ["Посох Литейн", "Litein Staff"],
  ["Посох Югенеса", "Yugenes Staff"],
  ["Посох кочевника", "Nomad Staff"],
  ["Пылающий двуручный меч Метеоса", "Meteos Blazing Two-Handed Sword"],
  ["Раскаленный ятаган Метеоса", "Meteos Searing Scimitar"],
  ["Ружье хранителя", "Guardian's Rifle"],
  ["Сабля хранителя", "Guardian's Saber"],
  ["Священный скипетр Метеоса", "Meteos Sacred Scepter"],
  ["Скипетр Мудрости", "Scepter of Wisdom"],
  ["Скипетр жреца", "Priest's Scepter"],
  ["Слэшер", "Slasher"],
  ["Стальная алебарда Метеоса", "Meteos Steel Halberd"],
  ["Стальное ружье", "Steel Rifle"],
  ["Хитиновая сабля", "Chitin Saber"],
  ["Эльфийский лук", "Elven Bow"],
  ["Эльфийский меч", "Elven Sword"],
  ["Кольцо грозового дракона", "Ring of the storm dragon"],
  ["Кольцо перевоплощения (легендарное)", "Morph Ring (Legendary)"],
  ["Кольцо перевоплощения (редкое)", "Morph Ring (Rare)"],
  ["Кольцо перевоплощения (эпическое)", "Morph Ring (Epic)"],
  ["Кольцо преграды", "Ring of barrier"],
  ["Кольцо разрушения", "Ring of destruction"],
  ["Кольцо славы", "Ring of glory"],
  ["Кольцо смелости", "Ring of courage"],
  ["Кольцо смертельной атаки", "Ring of deadly attack"],
  ["Кольцо тайфуна", "Ring of typhoon"],
  ["Кольцо химеры", "Ring of the chimera"],
  ["Кольцо холода", "Ring of cold"],
  ["Кольцо шипастого дракона", "Ring of the spiked dragon"],
  ["Мана", "Mana"],
]);

const REVERSE_EXACT_TRANSLATIONS = new Map<string, string>();

for (const [source, target] of EXACT_TRANSLATIONS.entries()) {
  if (!REVERSE_EXACT_TRANSLATIONS.has(target)) {
    REVERSE_EXACT_TRANSLATIONS.set(target, source);
  }
}

const REGEX_TRANSLATIONS: Array<[RegExp, string]> = [
  [/\bсписок открыт\b/giu, "list opened"],
  [/\bсписок свёрнут\b/giu, "list collapsed"],
  [/\bэтот предмет сейчас нельзя надеть\b/giu, "this item cannot be equipped right now"],
  [/\bнадет предмет\b/giu, "equipped item"],
  [/\bпредмет снят\b/giu, "item removed"],
  [/\bуровень заточки переключён на\b/giu, "upgrade level switched to"],
  [/\bвыберите проточку справа сверху или снимите предмет правой кнопкой\b/giu, "choose the upgrade on the top right or remove the item with right click"],
  [/\bдоступно\b/giu, "available"],
  [/(?<!\S)1\s+предмет(?!\S)/giu, "1 item"],
  [/(?<!\S)(\d+)\s+предмет(?:а|ов)?(?!\S)/giu, "$1 items"],
  [/\bпредметов\b/giu, "items"],
  [/\bдля этого слота пока нет предметов\b/giu, "there are no items for this slot yet"],
  [/\bданных нет\b/giu, "no data"],
  [/\bуровень заточки\b/giu, "Upgrade level"],
  [/\bслот выбран\b/giu, "slot selected"],
  [/\bвставлена\b/giu, "inserted"],
  [/\bсфера снята\b/giu, "sphere removed"],
  [/\bуровень сферы переключён на\b/giu, "sphere level switched to"],
  [/\bдоступно\b/giu, "available"],
  [/(?<!\S)1\s+сфера(?!\S)/giu, "1 sphere"],
  [/(?<!\S)(\d+)\s+сфер(?:а|ы)?(?!\S)/giu, "$1 spheres"],
  [/\bсфер\b/giu, "spheres"],
  [/\bдля этого слота пока нет сфер\b/giu, "there are no spheres for this slot yet"],
  [/\bусиление трофея переключено на\b/giu, "trophy enhancement switched to"],
  [/\bтрофей снят\b/giu, "trophy removed"],
  [/\bустановлен\b/giu, "equipped"],
  [/(?<!\S)1\s+трофей(?!\S)/giu, "1 trophy"],
  [/(?<!\S)(\d+)\s+трофе(?:й|я|ев)(?!\S)/giu, "$1 trophies"],
  [/\bтрофей\b/giu, "trophy"],
  [/\bпитомец\b/giu, "pet"],
  [/\bвыбран\b/giu, "selected"],
  [/\bснят\b/giu, "removed"],
  [/\bОсновные сферы: выбрана вкладка\b/gu, "Core spheres: selected tab"],
  [/\bГлавное меню\b/giu, "Main menu"],
];

function interpolate(template: string, params: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ""));
}

export function normalizeLanguage(value: unknown): Language {
  return String(value || "").toLowerCase() === "en" ? "en" : "ru";
}

function getRussianLetterScore(value: string): number {
  return (value.match(/[А-Яа-яЁё]/g) || []).length;
}

function looksLikeMojibake(value: string): boolean {
  if (/[ÐÑ]/u.test(value)) {
    return true;
  }

  const suspiciousPairs = (value.match(/[РС][°±²³ґµ¶·ё№»јЅѕїЃЌЎЉЊѓќћџ]/gu) || []).length;
  const suspiciousChars = (value.match(/[°±²³ґµ¶·№»јЅѕїЃЌЎЉЊѓќћџ]/gu) || []).length;
  return suspiciousPairs >= 2 || (suspiciousPairs >= 1 && suspiciousChars >= 2);
}

export function decodeMojibakeText(value: unknown): string {
  const input = String(value ?? "");
  if (!input || !looksLikeMojibake(input)) {
    return input;
  }

  try {
    const bytes = new TextEncoder().encode(input);
    const decoded = new TextDecoder("windows-1251").decode(bytes);
    return getRussianLetterScore(decoded) > getRussianLetterScore(input) ? decoded : input;
  } catch {
    return input;
  }
}

function hasCyrillic(value: string): boolean {
  return /[А-Яа-яЁё]/u.test(value);
}

function hasLatin(value: string): boolean {
  return /[A-Za-z]/u.test(value);
}

function translateExact(value: string): string | null {
  return EXACT_TRANSLATIONS.get(value) || null;
}

function translateExactReverse(value: string): string | null {
  return REVERSE_EXACT_TRANSLATIONS.get(value) || null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function translateCompositeTextWithEntries(value: string, entries: Array<[string, string]>): string {
  let result = value;

  for (const [source, target] of entries) {
    if (!result.includes(source)) {
      continue;
    }

    result = result.replace(new RegExp(escapeRegex(source), "gu"), target);
  }

  return result;
}

const FORWARD_TRANSLATION_ENTRIES = [...EXACT_TRANSLATIONS.entries()]
  .sort((left, right) => right[0].length - left[0].length);

const REVERSE_TRANSLATION_ENTRIES = [...REVERSE_EXACT_TRANSLATIONS.entries()]
  .sort((left, right) => right[0].length - left[0].length);

function translateCompositeText(value: string): string {
  return translateCompositeTextWithEntries(value, FORWARD_TRANSLATION_ENTRIES);
}

function translateCompositeTextReverse(value: string): string {
  return translateCompositeTextWithEntries(value, REVERSE_TRANSLATION_ENTRIES);
}

function translateStatLineWith(
  value: string,
  translateLabel: (label: string) => string,
  shouldReject: (value: string) => boolean,
): string | null {
  const match = value.match(/^(.*?)\s*([+-])\s*(\d+(?:[.,]\d+)?)\s*(%)?$/u);
  if (!match) {
    return null;
  }

  const translatedLabel = translateLabel(match[1].trim());
  if (shouldReject(translatedLabel)) {
    return null;
  }
  return `${translatedLabel} ${match[2]}${match[3]}${match[4] || ""}`.trim();
}

function translateStatLine(value: string): string | null {
  return translateStatLineWith(
    value,
    (label) => translateExact(label) || translateCompositeText(label),
    hasCyrillic,
  );
}

function translateStatLineReverse(value: string): string | null {
  return translateStatLineWith(
    value,
    (label) => translateExactReverse(label) || translateCompositeTextReverse(label),
    hasLatin,
  );
}

const SEGMENT_TRANSLATION_ENTRIES = [...EXACT_TRANSLATIONS.entries()]
  .sort((left, right) => {
    const wordCountDiff = right[0].split(/\s+/u).length - left[0].split(/\s+/u).length;
    return wordCountDiff || right[0].length - left[0].length;
  });

function translateTextBySegments(value: string): string | null {
  const source = value.trim();
  if (!source) {
    return source;
  }

  const tokens = source.split(/\s+/u);
  const translatedTokens: string[] = [];
  let index = 0;

  while (index < tokens.length) {
    const originalToken = tokens[index];
    if (/^[\d.+%()/-]+$/u.test(originalToken)) {
      translatedTokens.push(originalToken);
      index += 1;
      continue;
    }

    let matchedTranslation: string | null = null;
    let matchedLength = 0;

    for (const [sourceSegment, targetSegment] of SEGMENT_TRANSLATION_ENTRIES) {
      const segmentTokens = sourceSegment.split(/\s+/u);
      if (segmentTokens.length > tokens.length - index) {
        continue;
      }

      const candidate = tokens.slice(index, index + segmentTokens.length).join(" ");
      if (candidate !== sourceSegment) {
        continue;
      }

      matchedTranslation = targetSegment;
      matchedLength = segmentTokens.length;
      break;
    }

    if (!matchedTranslation) {
      return null;
    }

    translatedTokens.push(matchedTranslation);
    index += matchedLength;
  }

  return translatedTokens.join(" ");
}

function lowerCaseSentenceObject(value: string): string {
  if (!value) {
    return value;
  }

  if (/^[A-Z]{2,}\b/u.test(value)) {
    return value;
  }

  return value.charAt(0).toLowerCase() + value.slice(1);
}

function buildItemIncreaseSentence(itemType: string, translatedTarget: string): string {
  const normalizedType = itemType.trim().toLowerCase();
  const normalizedTarget = lowerCaseSentenceObject(translatedTarget.trim());

  if (normalizedType === "earrings") {
    return `Earrings that increase ${normalizedTarget}.`;
  }

  const article = /^[aeiou]/iu.test(normalizedType) ? "An" : "A";
  return `${article} ${normalizedType} that increases ${normalizedTarget}.`;
}

function formatOrdinal(value: number): string {
  const suffix = value % 10 === 1 && value % 100 !== 11
    ? "st"
    : value % 10 === 2 && value % 100 !== 12
      ? "nd"
      : value % 10 === 3 && value % 100 !== 13
        ? "rd"
        : "th";

  return `${value}${suffix}`;
}

function translateTextFragment(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const exact = translateExact(trimmed);
  if (exact) {
    return exact;
  }

  const segmented = translateTextBySegments(trimmed);
  if (segmented && !hasCyrillic(segmented)) {
    return segmented;
  }

  return translateCompositeText(trimmed);
}

function reverseTranslateTextFragment(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const exact = translateExactReverse(trimmed);
  if (exact) {
    return exact;
  }

  return translateCompositeTextReverse(trimmed);
}

function translateTemplateText(value: string): string | null {
  const morphLevelMatch = value.match(/^(Сфера перевоплощения)\s+(\d+)\+\s+уровня$/u);
  if (morphLevelMatch) {
    const [, baseName, level] = morphLevelMatch;
    const translatedBase = translateTextFragment(baseName);
    if (hasCyrillic(translatedBase)) {
      return null;
    }
    return `${translatedBase} Lv. ${level}+`;
  }

  const leveledNameMatch = value.match(/^(.*?)\s+ур\.\s*(\d+)(?:\s+\((.+)\))?$/u);
  if (leveledNameMatch) {
    const [, baseName, level, rarity] = leveledNameMatch;
    const translatedBase = /^Сфера\s+/u.test(baseName) && !translateExact(baseName)
      ? `Sphere ${translateTextFragment(baseName.replace(/^Сфера\s+/u, ""))}`
      : translateTextFragment(baseName);
    const translatedRarity = rarity ? translateTextFragment(rarity) : "";
    if (hasCyrillic(translatedBase) || hasCyrillic(translatedRarity)) {
      return null;
    }
    return translatedRarity
      ? `${translatedBase} Lv. ${level} (${translatedRarity})`
      : `${translatedBase} Lv. ${level}`;
  }

  const simpleItemNameMatch = value.match(/^(Серьги|Ожерелье|Ремень|Кольцо)\s+(.+)$/u);
  if (simpleItemNameMatch) {
    const [, itemType, suffix] = simpleItemNameMatch;
    const translated = `${translateTextFragment(itemType)} ${translateTextFragment(suffix)}`;
    return hasCyrillic(translated) ? null : translated;
  }

  const decoratedItemNameMatch = value.match(
    /^(Блестящие|Блестящее|Блестящий|Светящиеся|Светящееся|Светящийся|Ледяные|Ледяное|Ледяной|Стеклянные|Стеклянное|Стеклянный|Улучшенные|Улучшенное|Улучшенный|Усиленные|Усиленное|Усиленный|Усовершенствованные|Усовершенствованное|Усовершенствованный)\s+(Серьги|Ожерелье|Ремень|Кольцо)(?:\s+(.+))?$/u,
  );
  if (decoratedItemNameMatch) {
    const [, adjective, itemType, suffix] = decoratedItemNameMatch;
    const translatedSuffix = suffix ? ` ${translateTextFragment(suffix)}` : "";
    const translated = `${translateTextFragment(adjective)} ${translateTextFragment(itemType)}${translatedSuffix}`;
    return hasCyrillic(translated) ? null : translated;
  }

  const itemBoostMatch = value.match(/^(Серьги|Ожерелье|Ремень|Кольцо),\s+увеличивающ(?:ее|ий|ие)\s+(.+)\.$/u);
  if (itemBoostMatch) {
    const [, itemType, boostTarget] = itemBoostMatch;
    const translatedType = translateTextFragment(itemType);
    const translatedTarget = translateTextFragment(boostTarget);
    return hasCyrillic(translatedType) || hasCyrillic(translatedTarget)
      ? null
      : buildItemIncreaseSentence(translatedType, translatedTarget);
  }

  const raisingItemMatch = value.match(/^(Пояс|Ремень),\s+повышающ(?:ий|ая|ее)\s+(.+)\.$/u);
  if (raisingItemMatch) {
    const [, itemType, boostTarget] = raisingItemMatch;
    const translatedType = translateTextFragment(itemType);
    const translatedTarget = translateTextFragment(boostTarget);
    return hasCyrillic(translatedType) || hasCyrillic(translatedTarget)
      ? null
      : buildItemIncreaseSentence(translatedType, translatedTarget);
  }

  const baseAttackLevelMatch = value.match(/^Базовый уровень атаки\s+([+-]?\d+(?:[.,]\d+)?)$/u);
  if (baseAttackLevelMatch) {
    return `Base attack level ${baseAttackLevelMatch[1]}`;
  }

  const baseDefenseLevelMatch = value.match(/^Базовый уровень защиты:?\s*([+-]?\d+(?:[.,]\d+)?)$/u);
  if (baseDefenseLevelMatch) {
    return `Base defense level ${baseDefenseLevelMatch[1]}`;
  }

  const baseDamageMatch = value.match(/^Базовый урон\s+([+-]?\d+(?:[.,]\d+)?)$/u);
  if (baseDamageMatch) {
    return `Base damage ${baseDamageMatch[1]}`;
  }

  const invisibilityMatch = value.match(/^Невидимость\s+(\d+)\s*ур\.$/u);
  if (invisibilityMatch) {
    return `Invisibility Lv. ${invisibilityMatch[1]}`;
  }

  const mightyStrengthMatch = value.match(/^Могучая сила,\s*ур\.\s*(\d+)$/u);
  if (mightyStrengthMatch) {
    return `Mighty Strength, Lv. ${mightyStrengthMatch[1]}`;
  }

  const humanSlayerMatch = value.match(/^Убийца людей\s+ур\.\s*(\d+)$/u);
  if (humanSlayerMatch) {
    return `Human slayer Lv. ${humanSlayerMatch[1]}`;
  }

  const humanDefenseMatch = value.match(/^Защита от людей\s+ур\.\s*(\d+)$/u);
  if (humanDefenseMatch) {
    return `Human defense Lv. ${humanDefenseMatch[1]}`;
  }

  const burnMatch = value.match(/^Ожог\s+\(([+-]?\d+(?:[.,]\d+)?)\s*HP\s+в\s+секунду\)$/u);
  if (burnMatch) {
    return `Burn (${burnMatch[1]} HP per second)`;
  }

  const raceRewardMatch = value.match(/^Награда за\s+(\d+)-е\s+место\s+в\s+гонках\.$/u);
  if (raceRewardMatch) {
    const [, place] = raceRewardMatch;
    return `Reward for ${formatOrdinal(Number(place))} place in the races.`;
  }

  const grantsOwnerMatch = value.match(/^Сфера,\s+дарующая своему владельцу\s+(.+)\.$/u);
  if (grantsOwnerMatch) {
    const translatedTarget = translateTextFragment(grantsOwnerMatch[1]).toLowerCase();
    return hasCyrillic(translatedTarget) ? null : `Grants its owner ${translatedTarget}.`;
  }

  const grantsYouMatch = value.match(/^Сфера,\s+придающая вам\s+(.+)\.$/u);
  if (grantsYouMatch) {
    const translatedTarget = translateTextFragment(grantsYouMatch[1]).toLowerCase();
    return hasCyrillic(translatedTarget) ? null : `Grants you ${translatedTarget}.`;
  }

  const filledMatch = value.match(/^Сфера,\s+наполненная\s+(.+)\.$/u);
  if (filledMatch) {
    const translatedTarget = translateTextFragment(filledMatch[1]).toLowerCase();
    return hasCyrillic(translatedTarget) ? null : `A sphere filled with ${translatedTarget}.`;
  }

  const fillsYouMatch = value.match(/^Сфера,\s+наполняющая вас\s+(.+)\.$/u);
  if (fillsYouMatch) {
    const translatedTarget = translateTextFragment(fillsYouMatch[1]).toLowerCase();
    return hasCyrillic(translatedTarget) ? null : `A sphere that fills you with ${translatedTarget}.`;
  }

  const fillsHeartMatch = value.match(/^Сфера,\s+наполняющая сердце\s+(.+)\.$/u);
  if (fillsHeartMatch) {
    const translatedTarget = translateTextFragment(fillsHeartMatch[1]).toLowerCase();
    return hasCyrillic(translatedTarget) ? null : `A sphere that fills the heart with ${translatedTarget}.`;
  }

  const withAuraMatch = value.match(/^Сфера\s+с\s+(.+)\.$/u);
  if (withAuraMatch) {
    const translatedTarget = translateTextFragment(withAuraMatch[1]).toLowerCase();
    return hasCyrillic(translatedTarget) ? null : `A sphere with ${translatedTarget}.`;
  }

  const powerMatch = value.match(/^Увеличивает\s+(.+)\s+силой\s+(.+)\.$/u);
  if (powerMatch) {
    const translatedValue = translateTextFragment(powerMatch[1]).toLowerCase();
    const translatedSource = translateTextFragment(powerMatch[2]).toLowerCase();
    return hasCyrillic(translatedValue) || hasCyrillic(translatedSource)
      ? null
      : `Increases ${translatedValue} through the power of ${translatedSource}.`;
  }

  const enhancementMatch = value.match(/^Чем выше уровень усиления тем выше уровень\s+(.+)\.$/u);
  if (enhancementMatch) {
    const translatedTarget = translateTextFragment(enhancementMatch[1]).toLowerCase();
    return hasCyrillic(translatedTarget) ? null : `The higher the enhancement level, the higher the ${translatedTarget} level.`;
  }

  return null;
}

function reverseTranslateTemplateText(value: string): string | null {
  const morphLevelMatch = value.match(/^(Morph Sphere) Lv\. (\d+)\+$/u);
  if (morphLevelMatch) {
    const [, baseName, level] = morphLevelMatch;
    const translatedBase = reverseTranslateTextFragment(baseName);
    return hasCyrillic(translatedBase) ? `${translatedBase} ${level}+ уровня` : null;
  }

  const leveledNameMatch = value.match(/^(.*?) Lv\. (\d+)(?: \((.+)\))?$/u);
  if (leveledNameMatch) {
    const [, baseName, level, rarity] = leveledNameMatch;
    const translatedBase = reverseTranslateTextFragment(baseName);
    const translatedRarity = rarity ? reverseTranslateTextFragment(rarity) : "";
    if (!hasCyrillic(translatedBase) || (translatedRarity && !hasCyrillic(translatedRarity))) {
      return null;
    }
    return translatedRarity
      ? `${translatedBase} ур. ${level} (${translatedRarity})`
      : `${translatedBase} ур. ${level}`;
  }

  const grantsOwnerMatch = value.match(/^Grants its owner (.+)\.$/u);
  if (grantsOwnerMatch) {
    const translatedTarget = reverseTranslateTextFragment(grantsOwnerMatch[1]).toLowerCase();
    return hasCyrillic(translatedTarget) ? `Сфера, дарующая своему владельцу ${translatedTarget}.` : null;
  }

  const grantsYouMatch = value.match(/^Grants you (.+)\.$/u);
  if (grantsYouMatch) {
    const translatedTarget = reverseTranslateTextFragment(grantsYouMatch[1]).toLowerCase();
    return hasCyrillic(translatedTarget) ? `Сфера, придающая вам ${translatedTarget}.` : null;
  }

  const filledMatch = value.match(/^A sphere filled with (.+)\.$/u);
  if (filledMatch) {
    const translatedTarget = reverseTranslateTextFragment(filledMatch[1]).toLowerCase();
    return hasCyrillic(translatedTarget) ? `Сфера, наполненная ${translatedTarget}.` : null;
  }

  const fillsYouMatch = value.match(/^A sphere that fills you with (.+)\.$/u);
  if (fillsYouMatch) {
    const translatedTarget = reverseTranslateTextFragment(fillsYouMatch[1]).toLowerCase();
    return hasCyrillic(translatedTarget) ? `Сфера, наполняющая вас ${translatedTarget}.` : null;
  }

  const fillsHeartMatch = value.match(/^A sphere that fills the heart with (.+)\.$/u);
  if (fillsHeartMatch) {
    const translatedTarget = reverseTranslateTextFragment(fillsHeartMatch[1]).toLowerCase();
    return hasCyrillic(translatedTarget) ? `Сфера, наполняющая сердце ${translatedTarget}.` : null;
  }

  const withAuraMatch = value.match(/^A sphere with (.+)\.$/u);
  if (withAuraMatch) {
    const translatedTarget = reverseTranslateTextFragment(withAuraMatch[1]).toLowerCase();
    return hasCyrillic(translatedTarget) ? `Сфера с ${translatedTarget}.` : null;
  }

  const powerMatch = value.match(/^Increases (.+) through the power of (.+)\.$/u);
  if (powerMatch) {
    const translatedValue = reverseTranslateTextFragment(powerMatch[1]).toLowerCase();
    const translatedSource = reverseTranslateTextFragment(powerMatch[2]).toLowerCase();
    return hasCyrillic(translatedValue) && hasCyrillic(translatedSource)
      ? `Увеличивает ${translatedValue} силой ${translatedSource}.`
      : null;
  }

  const enhancementMatch = value.match(/^The higher the enhancement level, the higher the (.+) level\.$/u);
  if (enhancementMatch) {
    const translatedTarget = reverseTranslateTextFragment(enhancementMatch[1]).toLowerCase();
    return hasCyrillic(translatedTarget)
      ? `Чем выше уровень усиления тем выше уровень ${translatedTarget}.`
      : null;
  }

  return null;
}

function applyRegexTranslations(value: string): string {
  return REGEX_TRANSLATIONS.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), value);
}

export function localizeText(value: unknown, language: Language): string {
  const decoded = decodeMojibakeText(value);
  if (!decoded) {
    return decoded;
  }

  if (language === "ru") {
    if (!hasLatin(decoded)) {
      return decoded;
    }

    const exactReverse = translateExactReverse(decoded);
    if (exactReverse) {
      return exactReverse;
    }

    const templateReverse = reverseTranslateTemplateText(decoded);
    if (templateReverse) {
      return templateReverse;
    }

    const statLineReverse = translateStatLineReverse(decoded);
    if (statLineReverse) {
      return statLineReverse;
    }

    const translatedReverse = translateCompositeTextReverse(decoded);
    return hasLatin(translatedReverse) ? decoded : translatedReverse;
  }

  if (!/[А-Яа-яЁё]/u.test(decoded)) {
    return decoded;
  }

  const exact = translateExact(decoded);
  if (exact) {
    return exact;
  }

  const template = translateTemplateText(decoded);
  if (template) {
    return template;
  }

  const statLine = translateStatLine(decoded);
  if (statLine) {
    return statLine;
  }

  const translated = applyRegexTranslations(decoded);
  return hasCyrillic(translated) ? decoded : translated;
}

export function t(key: string, language: Language, params: Record<string, string | number> = {}): string {
  const entry = UI_MESSAGES[key];
  if (!entry) {
    return key;
  }

  return interpolate(entry[language] || entry.ru, params);
}
