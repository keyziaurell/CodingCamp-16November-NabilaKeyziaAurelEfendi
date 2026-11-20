# Design Document — Life Dashboard

## Overview

The Life Dashboard is a single-page, browser-based productivity dashboard built with plain HTML, CSS, and Vanilla JavaScript. It requires no frameworks, build tools, backend server, or test setup. All data is persisted exclusively via the browser's Local Storage API.

The project consists of exactly three files:

```
life-dashboard/
├── index.html        # Single HTML entry point
├── css/
│   └── style.css     # Exactly one CSS file
└── js/
    └── app.js        # Exactly one JavaScript file
```

---

## Architecture

### One-Way Data Flow

All state changes follow a single pattern:

```
User Action → Validate → Mutate State → Save to Storage → Re-render
```

No widget reads directly from Local Storage during render. All renders read from in-memory state (`tasks`, `links`, `currentTheme`). Only persistent data changes (task mutations, link mutations, and theme changes) are saved to Local Storage. Timer state (`timerSeconds`, `timerRunning`, `timerIntervalId`) and `currentSort` are never persisted.

### Initialization Sequence

`init()` is called on `DOMContentLoaded` and runs in this exact order:

1. `loadFromStorage()` — reads `ld_tasks`, `ld_links`, `ld_theme` from Local Storage; populates `tasks`, `links`, and `currentTheme` in memory; falls back to `[]` / `'light'` on missing or malformed data.
2. `applyTheme(currentTheme)` — applies the saved theme to `<body>` **before any widget is rendered**, preventing a flash of the wrong theme on page load.
3. `renderTasks()` — renders the task list with the correct theme already active on `<body>`.
4. `renderLinks()` — renders Quick Links with the correct theme already active on `<body>`.
5. `updateGreeting()` — sets the initial time, date, and greeting text.
6. `setInterval(updateGreeting, 60000)` — schedules greeting refresh every 60 seconds.
7. `updateTimerButtons()` — sets initial button disabled states; timer always starts at 25:00 in Stopped state.
8. `attachEventListeners()` — binds all DOM event listeners.

```javascript
document.addEventListener('DOMContentLoaded', init);
```

---

## Components and Interfaces

### Top Bar

- Left: app title "Life Dashboard"
- Right: theme toggle button (`#btn-theme-toggle`)
  - Label shows the *inactive* theme: "🌙 Dark" when light is active; "☀️ Light" when dark is active
  - Clicking calls `toggleTheme()`

### Greeting Widget

**Element IDs:** `#greeting-text`, `#current-time`, `#current-date`

| Element | Content | Example |
|---|---|---|
| `#greeting-text` | Time-based greeting | "Good Afternoon" |
| `#current-time` | 24-hour HH:MM | "14:05" |
| `#current-date` | Full date string | "Thursday, November 19, 2026" |

Greeting time bands:

| Band | Hours | Text |
|---|---|---|
| Morning | 05:00–11:59 | "Good Morning" |
| Afternoon | 12:00–17:59 | "Good Afternoon" |
| Evening | 18:00–20:59 | "Good Evening" |
| Night | 21:00–04:59 | "Good Night" |

### Focus Timer Widget

**Element IDs:** `#timer-display`, `#btn-start`, `#btn-stop`, `#btn-reset`

- `#timer-display` initialized to `"25:00"` on every page load — timer state is **never** persisted to Local Storage.
- **Stop** halts the countdown while retaining the remaining time (`timerSeconds` is preserved).
- **Start** (re)starts the countdown from the current `timerSeconds` value — this covers both a fresh start and resuming after a Stop.
- **Reset** stops the countdown and restores `timerSeconds` to 1500 (25:00), regardless of current state.
- Button disable rules:
  - Stopped state: `#btn-start` enabled, `#btn-stop` disabled.
  - Running state: `#btn-stop` enabled, `#btn-start` disabled.
  - `#btn-reset` is always enabled.

### To-Do List Widget

**Element IDs:** `#task-input`, `#btn-add-task`, `#task-error`, `#task-list`

**Sort controls:** Three buttons — "Creation Order" (default active), "A–Z", "By Status". The active button receives class `active`. The `currentSort` variable holds one of three values: `'creation'`, `'alphabetical'`, or `'completion'`.

Each task item is an `<li data-id="...">` containing:
- Checkbox — toggles `completed`; completed tasks render with `text-decoration: line-through`
- `<span>` — description text
- Edit button — replaces `<span>` with an `<input>` pre-filled with current text, plus Save and Cancel controls
- Delete button — permanently removes the task

### Quick Links Widget

**Element IDs:** `#link-name-input`, `#link-url-input`, `#btn-add-link`, `#link-error`, `#links-list`

Each Quick Link is rendered as a **semantic `<a>` element** with:
- `href` set to the normalized, validated URL
- `target="_blank"` to open in a new browser tab
- `rel="noopener noreferrer"` for security (prevents the opened page from accessing `window.opener`)
- Display text set to the saved link name

A separate **Delete button** is placed alongside each `<a>` element to remove the link. The delete control is not part of the anchor element itself.

**URL normalization:** If the submitted URL does not start with `http://` or `https://`, prepend `https://`. Validate the normalized value using `new URL(value)` in a try/catch; reject if it throws.

**Name validation:** Reject if the trimmed name is empty.

### CSS Theme System

All colors are defined as CSS custom properties on `:root` (light theme defaults). Dark theme values override via `[data-theme="dark"]` on `<body>`.

| Variable | Purpose |
|---|---|
| `--bg-color` | Page background |
| `--card-bg` | Widget card background |
| `--text-color` | Primary text |
| `--accent-color` | Buttons and highlights |
| `--border-color` | Card borders and dividers |

All four widget cards inherit these variables. No widget uses hardcoded color values.

### Responsive Layout

The dashboard uses a CSS Grid layout that adapts to viewport width:

- **768px and wider (desktop):** two-column grid — Greeting and Focus Timer in the top row; To-Do List and Quick Links in the bottom row.
- **Below 768px (mobile):** single-column stack — widgets appear in the same order: Greeting, Focus Timer, To-Do List, Quick Links.

The layout is usable at all widths from 320px to 1920px with no horizontal overflow or content overlap. Each widget is a card with padding, rounded corners, and a subtle shadow. The breakpoint is implemented with a single CSS `@media` query.

---

## Data Models

### In-Memory State Variables

```javascript
let tasks = [];              // Array of task objects loaded from storage
let links = [];              // Array of link objects loaded from storage
let timerSeconds = 1500;     // Always initialized to 1500 (25:00); never persisted
let timerRunning = false;    // true while the countdown interval is active; never persisted
let timerIntervalId = null;  // Holds the setInterval reference; never persisted
let currentTheme = 'light';  // 'light' | 'dark'; loaded from ld_theme on init
let currentSort = 'creation'; // 'creation' | 'alphabetical' | 'completion'; never persisted
```

### Task Object

```json
{
  "id": "1700000000000-0.123456",
  "description": "Buy groceries",
  "completed": false,
  "createdAt": 1700000000000
}
```

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier (`Date.now() + '-' + Math.random()`) |
| `description` | string | Trimmed task text |
| `completed` | boolean | `true` if the task is done |
| `createdAt` | number | Unix timestamp in ms; used for creation-order sort |

### Link Object

```json
{
  "id": "1700000001000-0.654321",
  "name": "GitHub",
  "url": "https://github.com"
}
```

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Trimmed display label shown on the anchor element |
| `url` | string | Normalized URL; always starts with `https://` or `http://` |

### Local Storage Keys

| Key | Value type | Contents |
|---|---|---|
| `ld_tasks` | JSON array | Array of task objects |
| `ld_links` | JSON array | Array of link objects |
| `ld_theme` | string | `"light"` or `"dark"` |

**Not persisted:** `timerSeconds`, `timerRunning`, `timerIntervalId`, and `currentSort`. The timer always resets to 25:00 on page load. There is no `ld_timer` key.

---

## Correctness Properties

| Property | Requirement | Enforcement Mechanism |
|---|---|---|
| Time displays in 24-hour HH:MM | Req 1.1 | `String(hours).padStart(2,'0') + ':' + String(minutes).padStart(2,'0')` |
| Greeting updates on 60s tick | Req 1.2 | `setInterval(updateGreeting, 60000)` started in `init()` |
| Correct greeting for each time band | Req 2.1–2.4 | `if/else` branches on `hours` value in `updateGreeting()` |
| Timer Invariant (00:00–25:00) | Req 3.4 | `timerSeconds = Math.max(0, timerSeconds - 1)` in `timerTick()` |
| Timer always starts at 25:00 | Req 3.1 | `timerSeconds = 1500` in `init()` and `resetTimer()`; no storage read |
| Reset returns to Stopped/25:00 | Req 4.3 | `resetTimer()` calls `stopTimer()` then sets `timerSeconds = 1500` |
| Stop retains remaining time | Req 4.1 | `stopTimer()` clears the interval but does not modify `timerSeconds` |
| Task add rejects empty input | Req 5.3 | Trim check before `addTask()` mutates state |
| Task edit rejects empty input | Req 6.3 | Trim check in `editTask()`; restores original on abort |
| Duplicate prevention on add | Req 9.1 | `isDuplicate(desc, null)` before `addTask()` saves |
| Duplicate prevention on edit | Req 9.3 | `isDuplicate(desc, taskId)` before `editTask()` saves |
| Duplicate Invariant | Req 9.4 | Both write paths go through `isDuplicate()`; no bypass |
| Sort is view-only | Req 10.4 | `getSortedTasks()` returns a copy; `tasks` array is never reordered |
| Status sort preserves creation order | Req 10.2 | Stable sort by `createdAt` within each completion group |
| URL normalization (prepend https://) | Req 11.3 | `if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url` |
| URL validation | Req 11.4 | `new URL(normalized)` in try/catch; rejects on throw |
| Quick Link name validation | Req 11.5 | Trim check on name before `addLink()` saves |
| Round-Trip Persistence — Tasks | Req 8.4 | `saveTasksToStorage()` on every mutation; `loadFromStorage()` parses JSON; falls back to `[]` |
| Round-Trip Persistence — Links | Req 12.5 | `saveLinksToStorage()` on every mutation; `loadFromStorage()` parses JSON; falls back to `[]` |
| Theme Persistence Invariant | Req 13.5 | `saveThemeToStorage(theme)` called synchronously inside `applyTheme()` before the function returns |

---

## Error Handling

### Validation Rules

**Task — Add:**
1. Trim input. If empty → show `#task-error`: "Task cannot be empty." Abort.
2. If `isDuplicate(trimmed, null)` → show `#task-error`: "A task with this name already exists." Abort.
3. Otherwise → create task, save, render, clear input.

**Task — Edit (Save):**
1. Trim new value. If empty → show inline error: "Task cannot be empty." Restore original display. Abort.
2. If `isDuplicate(trimmed, taskId)` → show inline error: "A task with this name already exists." Abort.
3. Otherwise → update task, save, render.

**Quick Link — Add:**
1. Trim name. If empty → show `#link-error`: "Link name cannot be empty." Abort.
2. Trim URL. If empty → show `#link-error`: "URL cannot be empty." Abort.
3. If URL does not start with `http://` or `https://`, prepend `https://`.
4. Try `new URL(normalizedURL)`. If throws → show `#link-error`: "Please enter a valid URL." Abort.
5. Otherwise → create link, save, render, clear inputs.

### Storage Error Recovery

`loadFromStorage()` wraps each `JSON.parse()` in a try/catch:
- If `ld_tasks` is missing or malformed → `tasks = []`
- If `ld_links` is missing or malformed → `links = []`
- If `ld_theme` is missing or not `"dark"` → `currentTheme = 'light'`

---

## Testing Strategy

No test framework, test runner, or additional dependencies are required (Requirement 14.5). The project runs without any build step or configuration. Manual testing is sufficient.

Each feature can be verified by opening `index.html` in a browser and exercising the UI:

- **Greeting:** confirm the time displays in 24-hour HH:MM format; confirm the greeting text matches the current time band; wait or mock time to verify boundary transitions.
- **Focus Timer:**
  - Click Start; confirm the countdown decrements each second.
  - Click Stop; confirm the countdown halts and the displayed time is retained.
  - Click Start again; confirm the countdown resumes from where it stopped.
  - Click Reset; confirm the display returns to 25:00 and the timer is in Stopped state.
  - Verify Start is disabled while running and Stop is disabled while stopped.
- **To-Do List:**
  - Add a task; confirm it appears in the list.
  - Attempt to add an empty task; confirm rejection message.
  - Attempt to add a duplicate; confirm rejection message.
  - Edit a task; confirm the description updates.
  - Mark a task complete; confirm strikethrough styling.
  - Delete a task; confirm it is removed.
  - Switch between all three sort options (Creation Order, A–Z, By Status); confirm the list reorders without affecting storage.
  - Refresh the page; confirm tasks and their completion states are restored.
- **Quick Links:**
  - Add a link with a full URL (e.g., https://github.com); confirm the anchor is created.
  - Add a link without a protocol (e.g., github.com); confirm https:// is prepended.
  - Attempt an invalid URL; confirm rejection message.
  - Attempt an empty name; confirm rejection message.
  - Click a link; confirm it opens in a new tab.
  - Delete a link; confirm it is removed.
  - Refresh the page; confirm links are restored.
- **Light/Dark Mode:** toggle the theme; confirm all four widget sections update. Refresh the page; confirm the saved theme is restored correctly.
- **Responsive layout:** resize the browser to 320px, 768px, and 1920px widths; confirm two-column layout at 768px and wider, single-column below 768px, with no overflow or overlap at any width.
- **Browser compatibility:** run the full manual test checklist in Chrome, Firefox, Edge, and Safari to confirm consistent behaviour across all four browsers.
