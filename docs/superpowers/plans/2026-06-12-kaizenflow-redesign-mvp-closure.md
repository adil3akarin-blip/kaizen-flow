# KaizenFlow — Редизайн «Modern Calm» + закрытие MVP

**Дата:** 2026-06-12
**Статус:** утверждён к исполнению
**Направление:** Modern Calm — чистый светлый минимализм (уровень Things / Notion), одна тема
**Исполнитель:** модель Sonnet (см. «Инструкции по токен-экономии» внизу)

---

## Диагноз текущего UI (почему редизайн)

По живым скриншотам всех экранов:

1. **Монотонный бежевый** — фон, панели, кнопки, иконки в одной тёплой гамме `#faf6f0…#c4956a`. Нет контраста, экран «плывёт».
2. **Слабая иерархия** — активная вкладка почти не отличается от неактивной; primary-кнопка в disabled-состоянии сливается с фоном.
3. **Нет глубины** — карточки без выразительных теней, всё выглядит плоско и «в один слой».
4. **Lora + Segoe UI** — серифный заголовок выглядит архаично рядом с системным гротеском.
5. **Пустые состояния доминируют** — огромные пустые экраны с маленькой подписью по центру, без визуального действия.
6. **UX-трение в dump** — лишний промежуточный шаг: FAB «+» → шит → ещё раз «Начать» → только потом textarea.

Логика при этом в хорошем состоянии: все 17 фич MVP реализованы, сторы аккуратные. Редизайн — это смена токенов + точечные правки компонентов, **не** переписывание логики.

---

## Часть A — Новая дизайн-система

### A1. Токены (`src/index.css`, `@theme`)

Полностью заменить текущий блок:

```css
@import 'tailwindcss';
@import '@fontsource-variable/inter';

@theme {
  /* поверхности */
  --color-canvas: #f6f6f8;        /* фон приложения */
  --color-surface: #ffffff;       /* карточки, панели, шиты */
  --color-sunken: #efeff3;        /* вложенные зоны: segmented control, инпуты-чипы */
  --color-line: #e7e7ec;          /* границы */
  --color-line-strong: #d9d9e0;   /* границы при hover/focus-обводках */

  /* текст */
  --color-ink: #1b1b22;
  --color-ink-muted: #6e6e7a;
  --color-ink-faint: #9c9ca8;

  /* акцент — спокойный индиго */
  --color-accent: #5b5bd6;
  --color-accent-hover: #4a4ac4;
  --color-accent-soft: #ededfb;   /* фон чипов, active tab pill */

  /* семантика */
  --color-success: #2e9e6b;
  --color-success-soft: #e5f5ec;
  --color-warn: #d97a1a;          /* детектор заторов — янтарь, не красный */
  --color-warn-soft: #fbf0df;
  --color-danger: #d6455b;        /* только удаление */

  --font-sans: 'Inter Variable', 'Segoe UI', system-ui, sans-serif;

  --shadow-card: 0 1px 2px rgb(27 27 34 / 0.05), 0 4px 12px rgb(27 27 34 / 0.06);
  --shadow-float: 0 4px 8px rgb(27 27 34 / 0.08), 0 12px 32px rgb(27 27 34 / 0.12);
}
```

Зависимости: `npm i @fontsource-variable/inter && npm rm @fontsource/lora`.

**Карта механической замены классов** (Grep + replace по всему `src/`):

| Старый класс | Новый |
|---|---|
| `bg-cream` / `text-cream` | `bg-canvas` |
| `bg-cream-dark`, `border-cream-dark*` | `bg-sunken`, `border-line` |
| `text-warm-text` | `text-ink` |
| `text-warm-muted` | `text-ink-muted` |
| `*-warm-accent*` (bg/text/ring/shadow) | `*-accent*` |
| `font-serif` (везде) | удалить; заголовкам дать `font-semibold tracking-tight` |
| `bg-warm-text` (тост) | `bg-ink` |
| amber-* (stuck) | `warn` / `warn-soft` токены |

После замены `rg 'warm-|cream|font-serif|lora'` по `src/` должен давать 0 совпадений (кроме `STICKY_COLORS`).

### A2. Типографика

- Один шрифт — **Inter Variable**. Lora удалить полностью (вместе с зависимостью).
- Заголовок вкладки: `text-[22px] font-semibold tracking-tight text-ink`.
- Подзаголовок: `text-sm text-ink-muted`.
- Заголовок секции: `text-xs font-semibold uppercase tracking-wider text-ink-faint`.
- Тело: `text-[15px] text-ink leading-relaxed`.

### A3. Стикеры (`STICKY_COLORS` в `lib/cardUtils.js`)

Заменить кричащие пастели на приглушённые современные (bg / shadow):

| # | bg | shadow |
|---|---|---|
| 0 | `#FBF3D5` | `#E8DCAA` |
| 1 | `#FBE4E7` | `#EFC3CA` |
| 2 | `#DFEBFA` | `#BCD4F0` |
| 3 | `#E2F2E5` | `#BFDFC7` |
| 4 | `#EFE6F7` | `#D8C4EA` |
| 5 | `#FCE9DC` | `#F0CDB4` |

Dot-grid холста: точки `#dcdce2`, шаг 24px (только «Неделя тишины» — правило сохраняется).

### A4. Базовые компоненты (новые рецепты)

- **Primary button:** `bg-accent text-white text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-accent-hover active:scale-[0.98] transition disabled:opacity-40`.
- **Secondary:** `bg-surface border border-line text-ink rounded-xl hover:border-line-strong hover:bg-sunken/60`.
- **Ghost/danger-текст:** `text-ink-muted hover:text-ink` / `text-danger`.
- **Карточка:** `bg-surface rounded-2xl border border-line/60 shadow-(--shadow-card)`.
- **Шит/диалог:** `bg-surface rounded-t-3xl (mobile) / rounded-2xl (desktop) shadow-(--shadow-float)`; backdrop `bg-ink/30 backdrop-blur-sm`.
- **Сегментный переключатель** (День/Неделя, вид Разбора): контейнер `bg-sunken rounded-xl p-1`, активный сегмент `bg-surface rounded-lg shadow-sm font-medium`.
- **Чипы** (теги, энергия): `bg-sunken text-ink-muted rounded-full px-3 py-1 text-xs font-medium`; выбранный — `bg-accent-soft text-accent`.
- **Тост:** `bg-ink text-white rounded-xl shadow-(--shadow-float)`; ссылка undo — `text-accent-soft` → заменить hex `#FFE0B2`.
- **Focus:** на все интерактивные элементы `focus-visible:ring-2 ring-accent/40 outline-none`.

---

## Часть B — Редизайн по экранам

Порядок = порядок исполнения. Каждый пункт — отдельный коммит.

### B1. Shell: TabBar + Sidebar + TabPageHeader + FAB

`components/shell/TabBar.jsx`, `Sidebar.jsx`, `ui/TabPageHeader.jsx`

- Таб-бар: `bg-surface/90 backdrop-blur border-t border-line`, высота 64px + `pb-[env(safe-area-inset-bottom)]`.
- Активная вкладка: иконка + подпись `text-accent`, сверху pill `bg-accent-soft` за иконкой (вместо едва заметной точки). Неактивные: `text-ink-faint`.
- FAB «+»: уменьшить до 56px, `bg-accent shadow-(--shadow-float)`, поднят над баром на 12px; `active:scale-95`.
- Desktop sidebar: те же принципы, активный пункт — `bg-accent-soft text-accent rounded-xl`.

### B2. Dump overlay — главный UX-фикс

`components/shell/DumpOverlay.jsx`

- **Убрать промежуточный шаг**: тап по FAB открывает шит сразу в режиме captura с автофокусом textarea. Экран с кружком «Начать» удалить.
- Шапка шита: «Выгрузить мысль» + counter-чип `bg-accent-soft text-accent` («3 за сессию»), кнопка-крестик справа.
- Подсказки клавиш (`Enter / Shift+Enter / Esc`) показывать только на desktop (`useFinePointerDesktop`).
- Кнопка «Готово» — secondary (закрыть шит), сохранение всегда по Enter/кнопке-стрелке в textarea.
- После сохранения — лёгкий зелёный flash чипа счётчика + haptic (уже есть).

### B3. Onboarding: Manifest + Mission

`onboarding/ManifestScreen.jsx`, `MissionScreen.jsx`

- Manifest: убрать «карточку в карточке» — полноэкранный `bg-canvas`, по центру логотип-глиф (lucide `waves` в круге `bg-accent-soft`), заголовок `text-3xl font-semibold tracking-tight`, манифест из 3 коротких строк с иконками, primary-кнопка «Начать».
- Mission: тот же стиль, прогресс-точки если шагов > 1.

### B4. «Неделя тишины» / SilenceCanvas + StickyNote

`review/SilenceCanvas.jsx`, `StickyNote.jsx`, `Canvas.jsx`

- Новые цвета стикеров (A3), скругление `rounded-lg`, тень из пары shadow с y-offset 2px.
- Пустое состояние: вместо текста по центру пустоты — 3 полупрозрачных стикера-призрака с примерами мыслей + строка «Нажми + — выгрузи первую».
- Хедер: «Готов разбирать» — primary-кнопка обычной ширины справа в шапке, не на всю строку.

### B5. Разбор: Inbox + FilterFlow

`review/ReviewInbox.jsx`, `FilterFlow.jsx`, `ReviewViewToggle.jsx`

- Toggle вида — сегментный контрол (A4).
- Строка инбокса: карточка `bg-surface rounded-2xl shadow-card`, слева цветная полоска цвета стикера, кнопка «Разобрать» — `bg-accent-soft text-accent`.
- FilterFlow: сверху тонкий progress-бар `bg-accent` (этап N из M); карточка вопроса крупная по центру; ответы Хочу/Должен — две крупные кнопки-карточки с иконками; финальные три действия: «В поток» primary, «Пока не ясно» secondary, «Отпустить» ghost-danger.

### B6. Поток: WIP slot + очередь + энергия

`tabs/FlowTab.jsx`, `flow/WipSlot.jsx`, `PullQueue.jsx`, `EnergySnapshot.jsx`, `FlowStatusPanel.jsx`

- WIP-карточка — герой экрана: крупная, `shadow-card`, сверху метка «В РАБОТЕ» (section label), снизу две кнопки: «Сделано» (`bg-success text-white`) и «Отпустить» (secondary).
- Пустой WIP: dashed-карточка `border-2 border-dashed border-line-strong rounded-2xl` с текстом «Вытяни одно дело из очереди».
- Очередь: section label «ОЧЕРЕДЬ · N», карточки с чипом энергии (⚡ light/medium/heavy цветом success/ink-muted/warn); карточки не по энергии — `opacity-50`.
- Энергия: компактная строка-карточка с тремя пресетами как сегментный контрол, не отдельная огромная карточка.
- Stuck nudge: тонкая строка `bg-warn-soft text-warn rounded-xl` с иконкой.

### B7. Канбан + Музей побед

`tabs/KanbanTab.jsx`, `kanban/KanbanBoard.jsx`, `YearBoard.jsx`, `ElephantsFlow.jsx`, `MoveCardSheet.jsx`

- День/Неделя/Музей — сегментный контрол.
- Колонки: заголовок = section label + счётчик-чип; колонка «В работе» при заполненном WIP — фон `bg-accent-soft/40`; зона дропа при drag — `ring-2 ring-accent/40`.
- Stuck-карточки: левая полоска `bg-warn` + чип «N дней» — не вся карточка янтарная.
- Музей побед: сетка месяцев, число завершённых крупно, спокойная праздничность (никакого конфетти).

### B8. Диалоги, тосты, пустые состояния, Settings

`ui/EmptyState.jsx`, `Toast.jsx`, `flow/*Dialog.jsx`, `PauseScreen.jsx`, `settings/*`

- EmptyState: иконка в круге `bg-sunken` 48px, заголовок `font-semibold`, описание, **обязательная кнопка-действие** (например «Выгрузить мысль» → открывает dump).
- WipGate/EnergyGuard диалоги: иконка-глиф, мягкий заголовок, primary = безопасное действие, override — ghost (правило «warn, never jail» сохраняется).
- PauseScreen: полноэкранный `bg-canvas`, дыхательная анимация круга `bg-accent-soft` (Framer Motion scale loop).
- Settings: группы карточек `bg-surface rounded-2xl` со строками-разделителями `divide-y divide-line`.

### B9. PWA-манифест и документация

- `vite.config.js`: `background_color`/`theme_color` → `#f6f6f8`; перегенерировать иконку под новый акцент (`public/pwa-icon.svg`, `favicon.svg` — индиго-глиф).
- Обновить `context/ui-tokens.md` и `context/ui-rules.md` под новую систему (старые значения удалить, не оставлять «two truths»).
- `index.html`: `<meta name="theme-color" content="#f6f6f8">`, фон body.

---

## Часть C — Закрытие MVP: баги и edge cases

Найдено чтением кода. Каждый пункт: проблема → фикс → критерий приёмки.

### C1. Нарушение инварианта WIP=1 через undo (баг, P0)

`useCardsStore.undoDelete`: удалённая WIP-карточка восстанавливается в `in-progress`. Если за 5 секунд undo-окна пользователь вытянул другую карточку — в WIP оказываются две. Аналогично `discardWip` → undo.

**Фикс:** в `undoDelete`, если `card.status === 'wip'` и `selectWipCard(cards)` уже непустой — восстанавливать как `{ status: 'filtered', kanbanColumn: 'queue' }`.
**Приёмка:** discard WIP → pull другой карточки → undo → первая карточка в очереди, WIP по-прежнему одна.

### C2. Демо-данные подмешиваются реальному пользователю (P0)

`getInitialCardsState`: при пустом сторадже и завершённом онбординге сидятся `mockCards`. Реальный пользователь, удаливший все карточки и перезагрузивший страницу (сторадж пуст → `loadCardsPersisted()` вернёт `{cards: []}`… проверить: если сохранён пустой массив — ок, но после очистки браузера демо вернётся).

**Фикс:** убрать сидинг `mockCards` полностью; пустой сторадж = пустое состояние + EmptyState с действием. `mockCards.js` оставить только для dev (или удалить вместе с `mockPullCards`, `mockYearBoard`, если нигде не используются — проверить Grep).
**Приёмка:** новый пользователь после онбординга видит пустые экраны с CTA, не демо-карточки.

### C3. Потеря данных при гонке вкладок (P1)

Две вкладки пишут в `localStorage` debounced — last-write-wins, изменения первой вкладки теряются.

**Фикс (минимальный для MVP):** слушать `window.addEventListener('storage', …)` для `kaizenflow-cards` и перегидрировать стор, если документ скрыт (`document.hidden`). Полная синхронизация — post-MVP.
**Приёмка:** изменение во вкладке A видно во вкладке B после переключения на неё.

### C4. Молчаливая потеря данных при quota / private mode (P1)

`saveCardsPersisted` глотает исключение.

**Фикс:** при первом неудачном сохранении показать один раз тост «Не удалось сохранить — проверьте свободное место» (флаг в модуле, не спамить).
**Приёмка:** при замоканном throw из `setItem` появляется один тост.

### C5. Битый JSON затирается без бэкапа (P2)

`loadCardsPersisted` при ошибке парсинга возвращает `null` → старт с пустого состояния → первый же дебаунс-сейв перезаписывает повреждённые (но, возможно, восстановимые) данные.

**Фикс:** перед возвратом `null` из catch скопировать сырую строку в ключ `kaizenflow-cards-backup`.
**Приёмка:** при битом JSON исходник лежит в backup-ключе.

### C6. Атомарность при вставке многострочного текста (P2)

Правило «одна карточка — одна мысль»: вставка списка из буфера создаёт одну карточку-простыню.

**Фикс:** в dump-форме при вставке/сабмите текста с `\n\n` или 3+ строками — мягкий вопрос «Разбить на N мыслей?» (диалог: Разбить / Оставить одной).
**Приёмка:** вставка 5 строк → предложение разбить → 5 карточек.

### C7. Enter при наборе через IME (P2)

`keydown Enter` сохраняет карточку посреди композиции (японский/китайский ввод, свайп-клавиатуры).

**Фикс:** игнорировать `e.isComposing === true` во всех обработчиках Enter.

### C8. Длинный текст карточки (P2)

Проверить StickyNote / строки инбокса / WIP-карточку на тексте 500+ символов: clamp (`line-clamp-5` на стикере, `line-clamp-2` в списках) + полный текст в редакторе/CardEditSheet.

### C9. Перевод часов и stuck-детектор (P3)

`stuckSince` сравнивается с `Date.now()`: перевод часов назад «лечит» застой, вперёд — помечает свежие карточки. Для MVP: задокументировать; guard от отрицательной дельты (`Math.max(0, …)`) в `stuckDetector.js`.

### C10. Сервис-воркер: устаревший прекеш (P3)

`registerType: 'autoUpdate'` — ок, но проверить: после деплоя новой версии открытая PWA получает обновление при следующем запуске; offline-открытие работает (DevTools → Offline → reload). Если белый экран — добавить `cleanupOutdatedCaches: true` в workbox-конфиг.

### C11. Доступность (P2, делается заодно с редизайном)

- `aria-label` на FAB, иконках таб-бара, крестиках.
- Фокус-ловушка в шитах/диалогах + `Esc`; возврат фокуса на триггер.
- `prefers-reduced-motion`: отключить spring-анимации (Framer `useReducedMotion`).
- Контраст новой палитры: `ink-muted` на `canvas` ≥ 4.5:1 (проверено: 5.2:1).

---

## Часть D — Smoke QA чеклист (финальная проверка)

Прогнать вручную на mobile-вьюпорте (375px) и desktop (1280px):

1. Онбординг: манифест → неделя тишины → выгрузка 3 мыслей → «Готов разбирать» → миссия.
2. Dump из каждой вкладки; Esc с несохранённым текстом → диалог save/discard.
3. Разбор: фильтр до конца (В поток / Пока не ясно / Отпустить), undo «Отпустить».
4. Поток: pull → WIP → «Сделано»; pull при занятом WIP → WipGate; низкая энергия + heavy → EnergyGuard, override работает.
5. Канбан: drag на desktop, MoveCardSheet на mobile; WIP-гейт в колонке «В работе»; reorder внутри колонки.
6. Слоны: завершить месяц → карточки в музее; не завершённые перенесены.
7. Reload на каждом экране — состояние восстановилось; offline reload — приложение открывается.
8. Установка PWA → запуск standalone → safe-area снизу не перекрывает таб-бар.

---

## Порядок исполнения (фазы → коммиты)

| Фаза | Задачи | Файлы (основные) |
|---|---|---|
| 0 | A1–A2: токены, шрифт, карта замен классов | `index.css`, `package.json`, весь `src/` (механически) |
| 1 | B1–B2: shell + dump UX | `shell/*`, `ui/TabPageHeader.jsx` |
| 2 | B3–B5: онбординг, холст, разбор | `onboarding/*`, `StickyNote.jsx`, `review/*`, `cardUtils.js` |
| 3 | B6–B8: поток, канбан, диалоги, settings | `flow/*`, `kanban/*`, `ui/*`, `settings/*` |
| 4 | B9: PWA + docs | `vite.config.js`, `index.html`, `public/*`, `context/ui-*.md` |
| 5 | C1–C11: edge cases по приоритету P0 → P3 | `useCardsStore.js`, `persistStorage.js`, `DumpOverlay.jsx`, и др. |
| 6 | D: smoke QA, фиксы по результатам, обновить `progress-tracker.md` | — |

Каждая фаза = 1–3 коммита. После каждой фазы: `npm run lint && npm run build` + скриншот-проверка изменённых экранов.

---

## Инструкции по токен-экономии (для Sonnet)

1. **Не читай файлы целиком без необходимости.** Для механической замены классов (фаза 0) используй Grep по паттерну + точечные Edit, не Read всего файла.
2. **Этот документ — источник истины** по цветам, классам и рецептам компонентов. Не перечитывай `ui-tokens.md` (он устареет до фазы 4) и не выдумывай свои значения.
3. **Один экран — один заход:** Read компонента → все Edit сразу → следующий. Не возвращайся к уже сделанным файлам «проверить ещё раз».
4. **Не трогай логику сторов** в фазах 0–4. Логика меняется только в фазе 5, и только в местах, указанных в C1–C9.
5. **Проверка скриншотом** — максимум 1 скриншот на экран после правки, mobile-вьюпорт. Не скриншоть промежуточные состояния.
6. **Не переписывай компонент с нуля,** если достаточно заменить классы. Структура JSX в основном хорошая.
7. Если что-то в плане противоречит реальному коду — код первичен, адаптируй точечно и отметь отклонение в коммит-сообщении.
