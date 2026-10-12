# AI Detective — Deduction Game

Детективна гра-дедукція, де **AI озвучує свідків, а код керує правилами**. Ви розслідуєте зникнення розробника з офісу: допитуєте підозрюваних, збираєте докази, перехресно перевіряєте свідчення і ставите остаточне звинувачення.

> Базова ідея — «Guess Who?» проти AI, розвинена в універсальну гру з персонажами, локаціями, предметами, подіями та доказами.

## Ключовий принцип

> **AI створює і озвучує. Код вирішує.**

Модель не знає, хто винний, і не вирішує, брехати їй чи ні. Усе, що впливає на результат гри, — детерміновані функції, покриті тестами.

| Рішення | Хто ухвалює | Де живе |
| --- | --- | --- |
| Хто винний, які докази ведуть до нього | Код | `entities/case` (`analyzeCase`, `checkSolvability`) |
| Брехати NPC чи говорити правду | Код | `entities/case/lib/lie-policy.ts` |
| Чи не повторює гравець питання; ліміт питань | Код | `entities/game-session` (`rules`, `selectors`) |
| Що NPC «знає» у цей момент | Код | `build-npc-context.ts` (мінімальний DTO без `culpritId` і ідентифікаторів) |
| Формулювання відповіді та репліки | AI | `server/lib/rephrase.ts` (structured output) |
| Генерація нової справи | AI + перевірка кодом | `server/lib/case-generator.ts` |

Відповідь моделі проходить перевірку на вірність: якщо вона змінила факти (`is-faithful`), сервер повторює спробу або повертає безпечну відповідь.

## Можливості

- **Допит NPC** з обмеженим числом питань, антиповтором і правилами брехні/правди.
- **Журнал доказів** і дошка справи (персонажі, локації, предмети, події).
- **Генерація справ**: AI створює справу за схемою (`structured outputs`), код перевіряє, що винний існує і докази ведуть саме до нього; несумісні справи відхиляються й виправляються повторним запитом.
- **Режим `mock`** — гра без AI для офлайн-розробки і тестів.
- **Збереження сесії** в `localStorage` з валідацією на довірчій межі (zod): пошкоджені дані ігноруються.
- **Анімації** через `motion` з повагою до `prefers-reduced-motion`.
- **Доступність**: семантична розмітка, клавіатурна навігація, `aria-live` для відповідей, нативний `<dialog>`, контраст за WCAG 2.2 AA, цілі натискання від 44 px.
- **Світла й темна теми** (за `prefers-color-scheme`), дизайн-токени як CSS custom properties.

## Стек

| Шар | Технології |
| --- | --- |
| UI | React 19, TypeScript (`strict`), Vite, SCSS Modules |
| Стан і форми | reducer + `zustand`, `react-hook-form` + `zod`, `@tanstack/react-query`, `react-router-dom` |
| Анімації | `motion` |
| Сервер | Hono (`@hono/node-server`), `zod`, OpenRouter (structured outputs) |
| Якість | ESLint (typed) + `eslint-plugin-boundaries` + `jsx-a11y`, Prettier, Vitest, Playwright, `@axe-core/playwright` |

## Швидкий старт

Потрібен **Node.js 20+** (рекомендовано поточний LTS) і ключ [OpenRouter](https://openrouter.ai/keys) для AI-режиму.

```bash
npm install

# Налаштування змінних середовища
cp .env.example .env                 # клієнт
cp server/.env.example server/.env   # сервер: додайте OPENROUTER_API_KEY

# Клієнт і сервер разом
npm run dev:all
```

Відкрийте адресу, яку виведе Vite. Запити `/api/*` проксіюються на `http://localhost:8787`, тому CORS не потрібен.

**Без ключа:** поставте `VITE_NPC_MODE=mock` у `.env` і запустіть лише `npm run dev` — NPC відповідатимуть без AI.

## Змінні середовища

### Клієнт (`.env`)

| Змінна | Опис | За замовчуванням |
| --- | --- | --- |
| `VITE_NPC_MODE` | `ai` — відповіді через сервер, `mock` — без AI | `ai` |

### Сервер (`server/.env`)

| Змінна | Опис | За замовчуванням |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Ключ OpenRouter (**обов'язково**) | — |
| `OPENROUTER_MODEL` | Модель для відповідей NPC | `openai/gpt-4o-mini` |
| `OPENROUTER_CASE_MODEL` | Сильніша модель для генерації справ (з підтримкою `structured_outputs`) | `OPENROUTER_MODEL` |
| `PORT` | Порт API (має збігатися з проксі у `vite.config.ts`) | `8787` |
| `AI_ATTEMPT_TIMEOUT_MS` | Таймаут однієї спроби відповіді NPC | `6000` |
| `AI_TOTAL_TIMEOUT_MS` | Загальний дедлайн відповіді з усіма повторами | `14000` |
| `AI_MAX_ATTEMPTS` | Максимум спроб (1–5) | `3` |
| `RATE_LIMIT_PER_MINUTE` | Ліміт запитів на хвилину для `/api/*` | `30` |
| `CASE_ATTEMPT_TIMEOUT_MS` | Таймаут однієї спроби генерації справи | `60000` |
| `CASE_TOTAL_TIMEOUT_MS` | Загальний дедлайн генерації | `120000` |
| `CASE_MAX_ATTEMPTS` | Скільки разів просимо виправити справу (1–5) | `3` |
| `CASE_RATE_LIMIT_PER_MINUTE` | Ліміт генерацій на хвилину | `3` |

Сервер перевіряє середовище через zod під час старту і падає з читабельним повідомленням при помилці конфігурації.

> **Безпека.** Ключ OpenRouter живе лише на сервері й ніколи не потрапляє в клієнтський бандл. Не комітьте `.env`-файли.

## Скрипти

| Команда | Призначення |
| --- | --- |
| `npm run dev` | Vite dev-сервер (клієнт) |
| `npm run dev:server` | API з `tsx watch` |
| `npm run dev:all` | Клієнт і API одночасно |
| `npm run build` | Перевірка типів і production-збірка |
| `npm run preview` | Локальний перегляд збірки |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint (включно з межами шарів FSD) |
| `npm run format` / `format:check` | Prettier |
| `npm test` / `test:watch` | Юніт-тести (Vitest) |
| `npm run test:e2e` / `test:e2e:ui` | E2E-тести (Playwright) |
| `npm run size` | Перевірка бюджету розміру бандлу |
| `npm run analyze` | Візуалізація складу бандлу |
| `npm run check` | Повний локальний прогін: формат → типи → лінт → тести → збірка → розмір |

## Архітектура

Проєкт організований за **Feature-Sliced Design**. Залежності йдуть тільки вниз по шарах, межі гарантує `eslint-plugin-boundaries`; імпорт між слайсами — лише через публічний `index.ts`.

```text
src/
├── app/        # ініціалізація: провайдери, роутинг, глобальні стилі й токени, ErrorBoundary
├── pages/      # start, game, result
├── widgets/    # case-board, clue-journal, interrogation-panel
├── features/   # ask-npc, ai-npc-reply, generate-case, make-accusation, discover-clue
├── entities/   # case, character, clue, location, game-session
└── shared/     # api (контракти), ui (kit), lib, styles (міксини), config
server/         # Hono API: роути /api/npc, /api/case, клієнт OpenRouter, ретраї, ліміти
e2e/            # Playwright: ігровий потік, клавіатура, збереження, a11y (axe)
scripts/        # перевірка бюджету бандлу
```

Логіка гри розбита на три хуки замість одного величезного:

```text
useGameState     → стан гри (reducer): питання, журнал, докази, статус
usePlayerActions → ходи гравця: питання, звинувачення
useAIActions     → виклик AI, валідація відповіді, оновлення стану
useGameLogic     → оркеструє три хуки
```

### Контракти й валідація

Схеми zod — єдине джерело істини: з них генеруються JSON Schema для structured outputs (`z.toJSONSchema`) і типи. Відповідь моделі проходить `safeParse` на сервері, а потім ще раз на клієнті. Модель отримує мінімальний DTO — без `culpritId`, ідентифікаторів і прапорця `wasLie`.

### API

| Метод і шлях | Призначення |
| --- | --- |
| `GET /api/health` | Перевірка живості |
| `POST /api/npc/...` | Формулювання відповіді NPC (structured output, ретраї, таймаути) |
| `POST /api/case/...` | Генерація нової справи з перевіркою розв'язності |

Усі `/api/*` захищені `secureHeaders` і rate limit; для генерації діє окремий, суворіший ліміт.

## Якість

- **Типи:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- **Лінт:** typed-правила `strictTypeChecked`, `jsx-a11y`, межі шарів FSD.
- **Юніт-тести:** reducer, правила гри, селектори, генерація й аналіз справ, контракти, збереження, ретраї.
- **E2E (Playwright):** desktop і mobile (Pixel 7) на production-збірці з `reducedMotion: 'reduce'`.
- **a11y:** автоматичний аудит `axe` у e2e + ручна клавіатурна навігація.
- **Бандл:** бюджети (gzip) у `scripts/check-bundle-size.mjs` — початковий JS 130 KB, увесь JS 230 KB, CSS 20 KB. React винесено в окремий кешований чанк, анімації вантажуються через `LazyMotion`.

```bash
npm run check        # усе, крім e2e
npm run test:e2e     # потребує встановлених браузерів: npx playwright install
```

## Дизайн-система

Токени задаються SCSS-мапами в `src/app/styles/tokens` і віддаються як CSS custom properties (`--color-*`, `--space-*`, `--radius-*`, `--font-size-*`, `--duration-*`, `--ease-out`). Теми перемикаються за `prefers-color-scheme` або атрибутом `data-theme="light|dark"` на `<html>`. Спільні міксини (`up`, `focus-ring`, `visually-hidden`, `hover`, `press`) лежать у `src/shared/styles/mixins`. Шрифти — системні, без завантажень.

## Ліцензія

Приватний проєкт (`"private": true`). Ліцензію ще не визначено.
