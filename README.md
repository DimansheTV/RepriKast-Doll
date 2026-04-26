# RepriKast-Doll

Статическое web-приложение для сборки и сравнения экипировки, сфер, трофеев и питомцев в RepriKast. Клиент собирается через Vite, каталоги данных поддерживаются Python-скриптами, а e2e-проверки идут через Playwright.

## Требования

- `pnpm` через `corepack`
- Node.js 24+ для разработки и сборки
- Python 3.11+ для скриптов обновления каталогов

## Команды

```powershell
corepack pnpm install
corepack pnpm dev
corepack pnpm build
corepack pnpm test:e2e
```

## Структура

```text
src/
  application/   repositories и app context
  domain/        конфиги и доменные правила по equipment/spheres/trophies/pets/stats
  resources/     JSON-каталоги и изображения
  shared/        общие утилиты и схемы
  ui/
    main/        bootstrap и runtime основной страницы
    compare/     bootstrap и runtime страницы сравнения
```

## Обновление каталогов

```powershell
python build_catalog.py --kind equipment
python build_catalog.py --kind sphere
python build_catalog.py --kind trophy
python build_catalog.py --kind pet
```

Скрипты используют общий слой в `scripts/data` и проверяют обязательные поля, `upgrade_levels`, дубликаты `id` и совместимость `slot_code`.

## Production build

```powershell
corepack pnpm build
```

Результат попадает в `dist/`. Это статический сайт: на сервере не нужен Node runtime, достаточно раздавать `dist/` с корректными MIME-типами для JS/CSS/JSON/изображений. В проекте уже зафиксирован `base: "./"` в `vite.config.ts`, поэтому `index.html` и `compare.html` можно раздавать как два отдельных entrypoint'а.

Готовый пример для Nginx лежит в `deploy/nginx.conf.example`.
