# RepriKast Doll

Веб-калькулятор персонажа R2: экипировка, сферы, трофеи, питомцы, профили и сравнение двух сборок.

## Требования

- Node.js 24+
- Corepack
- pnpm через Corepack

Перед первым запуском:

```bash
corepack enable
corepack pnpm install
```

## Разработка

```bash
corepack pnpm dev
```

Vite поднимает сайт локально и обрабатывает корневые `index.html` и `compare.html`. Эти файлы используют TypeScript-исходники напрямую, поэтому через Live Server их открывать не нужно.

## Сборка

```bash
corepack pnpm build
```

Готовый статический сайт появляется в `dist/`. В production-сборке ссылки на JS, CSS и изображения относительные, поэтому каталог удобно раздавать как обычную статику.

## Live Server

1. Соберите проект:

```bash
corepack pnpm build
```

2. В VS Code запустите Live Server для `dist/index.html`.

В репозитории есть `.vscode/settings.json`: Live Server использует `/dist` как корень. Для страницы сравнения откройте `dist/compare.html`.

## Проверка

```bash
corepack pnpm test:e2e
```

Playwright сначала выполняет `corepack pnpm build`, затем запускает `vite preview` и проверяет уже готовый `dist`, а не dev-сервер.

## Каталоги

Основные данные лежат в `src/resources/data`, изображения - в `src/resources/images`.

Проверить локальные каталоги без сети:

```bash
corepack pnpm catalog:build -- --kind equipment
corepack pnpm catalog:build -- --kind pet
corepack pnpm catalog:build -- --kind sphere --validate-only
corepack pnpm catalog:build -- --kind trophy --validate-only
```

Обновить каталоги через Node:

```bash
corepack pnpm catalog:equipment
corepack pnpm catalog:pet
corepack pnpm catalog:sphere
corepack pnpm catalog:trophy
```

`equipment` и `pet` сейчас валидируют уже подготовленные JSON. `sphere` и `trophy` могут обращаться к r2online.ru, скачивать недостающие изображения и перезаписывать соответствующие JSON.

Полная пересборка `equipment` из wiki выключена по умолчанию и запускается только явным флагом:

```bash
corepack pnpm catalog:build -- --kind equipment --rebuild-from-wiki
```

Английская локализация каталогов обновляется отдельным шагом через OpenAI API:

```bash
corepack pnpm catalog:build -- --kind equipment --translate-en
```

Для `--translate-en` нужен секретный ключ OpenAI в переменной окружения `OPENAI_API_KEY`. Ключ не хранится в репозитории: каждый разработчик использует свой собственный ключ локально.

Пример для PowerShell:

```powershell
$env:OPENAI_API_KEY="sk-..."
corepack pnpm catalog:build -- --kind equipment --translate-en
```

Можно комбинировать пересборку и перевод в одном запуске:

```bash
corepack pnpm catalog:build -- --kind equipment --rebuild-from-wiki --translate-en
```

Важно:

- обычные `corepack pnpm build` и `corepack pnpm test:e2e` не требуют `OPENAI_API_KEY`;
- без `--translate-en` проект не обращается к OpenAI API;
- если `--translate-en` запущен без ключа, команда завершится с ошибкой;
- `.env` и `.env.*` игнорируются через `.gitignore`, поэтому локальный ключ не должен попадать в коммит.

## Деплой

Для деплоя нужен только каталог `dist/`.

```bash
corepack pnpm build
```

После сборки загрузите весь `dist/` на статический хостинг, CDN или сервер с nginx. Node.js на сервере не нужен. Пример nginx-конфига лежит в `deploy/nginx.conf.example` и показывает раздачу готового `dist`.
