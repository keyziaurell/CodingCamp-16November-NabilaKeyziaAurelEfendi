# Implementation Plan: Life Dashboard

## Overview

Implement a single-page, browser-based productivity dashboard using plain HTML, CSS, and Vanilla JavaScript. Tasks, quick links, and the selected theme persist via Local Storage. Timer state (`timerSeconds`, `timerRunning`, `timerIntervalId`) and the current sort selection (`currentSort`) are session-only and are never written to Local Storage. The project produces exactly three application source files: `index.html`, `css/style.css`, and `js/app.js`.

## Tasks

- [x] 1. Project scaffold — create the three-file structure with all required element IDs
  - Create `index.html` with the top bar (`#btn-theme-toggle`), Greeting widget (`#greeting-text`, `#current-time`, `#current-date`), Focus Timer (`#timer-display`, `#btn-start`, `#btn-stop`, `#btn-reset`), To-Do List (`#task-input`, `#btn-add-task`, `#task-error`, `#task-list`), and Quick Links (`#link-name-input`, `#link-url-input`, `#btn-add-link`, `#link-error`, `#links-list`) sections
  - Create `css/style.css` as an empty file linked in `index.html`
  - Create `js/app.js` as an empty file linked at the bottom of `<body>` in `index.html`
  - Include three sort buttons ("Creation Order", "A–Z", "By Status") in the To-Do List section
  - _Requirements: 14.1, 14.2_

- [x] 2. CSS foundation — custom properties and base styles
  - [ ] 2.1 Define CSS custom properties for the light theme on `:root`: `--bg-color`, `--card-bg`, `--text-color`, `--accent-color`, `--border-color`
    - _Requirements: 13.3, 15.3, 15.4_
  - [ ] 2.2 Define dark theme overrides on `[data-theme="dark"]` using the same five variables
    - _Requirements: 13.2, 13.3_
  - [ ] 2.3 Apply `--bg-color`, `--text-color` to `body`; apply `--card-bg`, `--border-color` to widget cards; apply `--accent-color` to buttons — no hardcoded color values anywhere
    - _Requirements: 13.3, 15.3, 15.4_

- [x] 3. Responsive layout — CSS Grid and card styles
  - [ ] 3.1 Implement the desktop two-column grid layout (Greeting + Timer top row; To-Do + Quick Links bottom row) active at viewport widths ≥ 768px
    - _Requirements: 15.5_
  - [ ] 3.2 Add a single `@media (max-width: 767px)` query that switches to a single-column stack (Greeting → Timer → To-Do → Quick Links order)
    - _Requirements: 15.5_
  - [ ] 3.3 Add card styles: padding, rounded corners, and a subtle box-shadow on each widget card; verify no horizontal overflow at 320px or 1920px
    - _Requirements: 15.3, 15.5_

- [x] 4. In-memory state — declare all state variables in `app.js`
  - Declare `let tasks = []`, `let links = []`, `let timerSeconds = 1500`, `let timerRunning = false`, `let timerIntervalId = null`, `let currentTheme = 'light'`, `let currentSort = 'creation'` at the top of `app.js`
  - Add a comment next to each timer/sort variable noting it is never persisted to Local Storage
  - _Requirements: 3.1, 8.3, 12.4, 13.4_

- [x] 5. Local Storage module — storage read/write functions with error recovery
  - [ ] 5.1 Implement `loadFromStorage()`: for `ld_tasks` — read the raw value, parse with `JSON.parse()` inside a try/catch, then verify the result with `Array.isArray()`; if the key is missing, parsing throws, or the result is not an array, set `tasks = []`. For `ld_links` — apply the same pattern: `JSON.parse()` in try/catch + `Array.isArray()` check; fall back to `links = []`. For `ld_theme` — read the raw string directly with `localStorage.getItem('ld_theme')` (do NOT use `JSON.parse()`); if the value is exactly `"dark"` set `currentTheme = 'dark'`; otherwise set `currentTheme = 'light'`
    - _Requirements: 8.2, 8.3, 12.3, 12.4, 13.4_
  - [ ] 5.2 Implement `saveTasksToStorage()`: call `localStorage.setItem('ld_tasks', JSON.stringify(tasks))`
    - _Requirements: 8.1, 8.4_
  - [ ] 5.3 Implement `saveLinksToStorage()`: call `localStorage.setItem('ld_links', JSON.stringify(links))`
    - _Requirements: 12.2, 12.5_
  - [ ] 5.4 Implement `saveThemeToStorage(theme)`: call `localStorage.setItem('ld_theme', theme)` — stores the plain string `"light"` or `"dark"`, never uses `JSON.stringify`
    - _Requirements: 13.5_

- [x] 6. Initialization sequence — `init()` and `DOMContentLoaded` wiring
  - Define the complete `init()` function only after all functions it calls are fully implemented (Tasks 5, 7, 8.1, 9.4, 12, 16, 19.1, 20.1, 21). `init()` must call, in this exact order: `loadFromStorage()`, `applyTheme(currentTheme)`, `renderTasks()`, `renderLinks()`, `renderTimerDisplay()`, `updateGreeting()`, `setInterval(updateGreeting, 60000)`, `updateTimerButtons()`, `attachEventListeners()`
  - Register `document.addEventListener('DOMContentLoaded', init)` immediately after `init` is defined
  - Do NOT create empty placeholder or stub functions. Every function called by `init()` must be fully implemented before `init()` is defined and registered
  - Although Task 6 appears here numerically, it must be executed last in the dependency graph — after Tasks 5, 7, 8.1, 9.4, 12, 16, 19.1, 20.1, and 21 are all complete. See the Task Dependency Graph at the end of this document.
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 8.2, 12.3, 13.4_

- [x] 7. Greeting widget — `updateGreeting()`
  - [ ] 7.1 Implement `updateGreeting()`: call `new Date()`, format `#current-time` as 24-hour HH:MM using `padStart(2,'0')`, format `#current-date` as the full locale date string (e.g., "Thursday, November 19, 2026")
    - _Requirements: 1.1, 1.3_
  - [ ] 7.2 Determine the greeting band: 05–11 → "Good Morning", 12–17 → "Good Afternoon", 18–20 → "Good Evening", 21–04 → "Good Night"; set `#greeting-text`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 8. Focus Timer — display and tick
  - [ ] 8.1 Implement `renderTimerDisplay()`: format `timerSeconds` as MM:SS using `padStart(2,'0')` and write the string to `#timer-display`
    - _Requirements: 3.1, 3.2_
  - [ ] 8.2 Implement `timerTick()`: set `timerSeconds = Math.max(0, timerSeconds - 1)`, call `renderTimerDisplay()`; if `timerSeconds === 0`: call `stopTimer()` and display a visual completion indicator on `#timer-display` (e.g., add a CSS class or briefly show a "Session complete!" message) to signal the session has ended
    - _Requirements: 3.2, 3.3, 3.4, 4.4_

- [x] 9. Focus Timer — controls
  - [ ] 9.1 Implement `startTimer()`: if `timerRunning === true`, return immediately (prevents multiple simultaneous intervals); if `timerSeconds === 0`, return immediately (timer is exhausted — user must Reset before starting again); otherwise set `timerRunning = true`, set `timerIntervalId = setInterval(timerTick, 1000)`, call `updateTimerButtons()`
    - _Requirements: 4.1, 4.2_
  - [ ] 9.2 Implement `stopTimer()`: call `clearInterval(timerIntervalId)`, set `timerIntervalId = null`, set `timerRunning = false` — do NOT modify `timerSeconds`; call `updateTimerButtons()`
    - _Requirements: 4.1, 4.2_
  - [ ] 9.3 Implement `resetTimer()`: call `stopTimer()` (clears interval, sets `timerIntervalId = null`, sets `timerRunning = false`), set `timerSeconds = 1500`, call `renderTimerDisplay()`, call `updateTimerButtons()`
    - _Requirements: 4.3_
  - [ ] 9.4 Implement `updateTimerButtons()`: disable `#btn-start` when `timerRunning === true` OR when `timerSeconds === 0`; disable `#btn-stop` when `timerRunning === false`; `#btn-reset` is always enabled (never disabled); after `resetTimer()` sets `timerSeconds = 1500`, `#btn-start` becomes enabled again
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 10. Checkpoint — Verify greeting and timer in the browser
  - Open `index.html` in the browser. At this stage the greeting must display the correct 24-hour time and greeting text. The timer must initialize to 25:00. Verify Start, Stop, and Reset respond correctly, the countdown decrements, and the timer halts at 00:00 with the completion indicator. No console errors should appear. Verify in the browser before proceeding.
  - This checkpoint is executable only after Task 6 (init) and Task 21.1 (timer event listeners) are complete.

- [x] 11. To-Do List — duplicate prevention (`isDuplicate`)
  - Implement `isDuplicate(desc, excludeId)`: compare `desc.trim().toLowerCase()` against `task.description.trim().toLowerCase()` for every task whose `id !== excludeId`; return `true` if any match is found
  - This function must be implemented before `addTask` and `editTask`
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 12. To-Do List — render tasks (`renderTasks`)
  - Implement `renderTasks()`: call `getSortedTasks()`, clear `#task-list`, and for each task render an `<li data-id="...">` containing a checkbox, a `<span>` with the description (add strikethrough class when `completed === true`), an Edit button, and a Delete button
  - `getSortedTasks()` must be fully implemented (Task 16) before `renderTasks()` is first called — no stub is used
  - **Safe DOM insertion:** Set task description text using `element.textContent = value`. Do NOT insert user-provided strings directly into an `innerHTML` template
  - _Requirements: 5.1, 7.1, 7.2, 10.3, 10.5_

- [x] 13. To-Do List — add task (`addTask`)
  - [ ] 13.1 Implement `addTask()`: trim `#task-input` value; if empty show `#task-error` "Task cannot be empty." and return; if `isDuplicate(trimmed, null)` show `#task-error` "A task with this name already exists." and return
    - _Requirements: 5.3, 9.1_
  - [ ] 13.2 On valid input: create `{id: Date.now() + '-' + Math.random(), description: trimmed, completed: false, createdAt: Date.now()}`, push to `tasks`, call `saveTasksToStorage()`, call `renderTasks()`, clear `#task-input`, clear `#task-error`
    - **Safe DOM insertion:** Task description is stored as a plain string and rendered via `textContent` in `renderTasks()` — never via `innerHTML` interpolation
    - _Requirements: 5.1, 5.2, 8.1_

- [x] 14. To-Do List — edit task (inline edit mode)
  - [ ] 14.1 On Edit button click: replace the task `<span>` with an `<input>` pre-filled with the current description plus Save and Cancel buttons
    - **Safe DOM insertion:** Pre-fill the edit `<input>` using `input.value = currentDescription`. Do NOT inject the description into an `innerHTML` string
    - _Requirements: 6.1_
  - [ ] 14.2 Implement `editTask(id, newDesc)`: trim `newDesc`; if the trimmed value is empty, display the inline error "Task cannot be empty." inside the edit interface — keep the input field and Save/Cancel buttons visible, do NOT restore the read-only display while the error is shown; if `isDuplicate(trimmed, id)` is true, display the inline error "A task with this name already exists." inside the edit interface — keep the edit interface visible; only on a valid (non-empty, non-duplicate) value: update `task.description = trimmed`, call `saveTasksToStorage()`, call `renderTasks()`. The original task description is preserved in the `tasks` array until a valid save completes
    - _Requirements: 6.2, 6.3, 6.4_

- [x] 15. To-Do List — complete and delete
  - [ ] 15.1 Implement `toggleComplete(id)`: find the task by `id`, flip `task.completed`, call `saveTasksToStorage()`, call `renderTasks()`; ensure the CSS class for strikethrough (`text-decoration: line-through`) is applied when `completed === true`
    - _Requirements: 7.1, 7.2, 8.1_
  - [ ] 15.2 Implement `deleteTask(id)`: filter `tasks` to exclude the matching `id`, call `saveTasksToStorage()`, call `renderTasks()`
    - _Requirements: 7.3, 8.1_

- [x] 16. To-Do List — sort (`getSortedTasks`)
  - Implement the full `getSortedTasks()`: return a sorted copy of `tasks` (never mutate the `tasks` array); `'creation'` → sort ascending by `createdAt`; `'alphabetical'` → sort by `description.toLowerCase()`; `'completion'` → incomplete first, ties broken by `createdAt` (stable)
  - Wire up the three sort buttons: on click, set `currentSort` to `'creation'`, `'alphabetical'`, or `'completion'`; remove `active` class from all sort buttons; add `active` class to the clicked button; call `renderTasks()`
  - Task 16 must be completed before Task 12 (`renderTasks`) is first called
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 17. Checkpoint — Ensure To-Do List works end-to-end
  - Verify add/edit/complete/delete/sort all function; verify duplicates are rejected; verify tasks survive a page refresh. Verify in the browser before proceeding.
  - This checkpoint is executable only after Task 6 (init) and Task 21.2 (To-Do List event listeners) are complete.

- [x] 18. Quick Links — URL validation and add link
  - [ ] 18.1 Implement `validateURL(url)`: trim the input string; check case-insensitively whether the trimmed value starts with `http://` or `https://` — if neither prefix is present, prepend `https://`; attempt `new URL(normalizedValue)` inside a try/catch; if the constructor throws, return `null`; if it succeeds, verify that `parsedURL.protocol` is exactly `"http:"` or `"https:"` and that `parsedURL.hostname` is non-empty — if either check fails return `null`; otherwise return the normalized URL string
    - _Requirements: 11.3, 11.4_
  - [ ] 18.2 Implement `addLink()`: trim `#link-name-input`; if empty show `#link-error` "Link name cannot be empty." and return; trim `#link-url-input`; if empty show `#link-error` "URL cannot be empty." and return; call `validateURL`; if `null` show `#link-error` "Please enter a valid URL." and return; create `{id: Date.now() + '-' + Math.random(), name: trimmedName, url: normalizedURL}`, push to `links`, call `saveLinksToStorage()`, call `renderLinks()`, clear both inputs, clear `#link-error`
    - _Requirements: 11.1, 11.3, 11.4, 11.5, 12.2_

- [x] 19. Quick Links — render and delete
  - [ ] 19.1 Implement `renderLinks()`: clear `#links-list`; for each link render an `<a href="..." target="_blank" rel="noopener noreferrer">` with the link name as display text, plus a separate Delete button alongside it (not inside the anchor)
    - **Safe DOM insertion:** Set link name text using `anchor.textContent = link.name`. Do NOT inject the name into an `innerHTML` string
    - _Requirements: 11.1, 11.2, 12.3_
  - [ ] 19.2 Implement `deleteLink(id)`: filter `links` to exclude the matching `id`, call `saveLinksToStorage()`, call `renderLinks()`
    - _Requirements: 12.1, 12.2_

- [x] 20. Light/Dark Mode — `applyTheme` and `toggleTheme`
  - [ ] 20.1 Implement `applyTheme(theme)`: set `currentTheme = theme`; set `document.body.setAttribute('data-theme', theme)`; update `#btn-theme-toggle` label to "🌙 Dark" when `theme === 'light'` and "☀️ Light" when `theme === 'dark'` — do NOT call `saveThemeToStorage()` inside `applyTheme()`; this function is called during initialization (without saving) and by `toggleTheme()` after saving
    - _Requirements: 13.1, 13.2, 13.3_
  - [ ] 20.2 Implement `toggleTheme()`: calculate `const next = currentTheme === 'light' ? 'dark' : 'light'`; call `applyTheme(next)`; then call `saveThemeToStorage(next)` — this is the only code path that writes the theme to Local Storage
    - _Requirements: 13.2, 13.5_

- [x] 21. Event listeners — `attachEventListeners()`
  - [ ] 21.1 Bind `#btn-add-task` click and `#task-input` `keydown` event (checking `event.key === "Enter"`) to `addTask()`; bind `#btn-add-link` click to `addLink()`; bind `#btn-theme-toggle` click to `toggleTheme()`; bind `#btn-start`, `#btn-stop`, `#btn-reset` clicks to `startTimer()`, `stopTimer()`, `resetTimer()` respectively
    - _Requirements: 5.1, 5.2, 11.1, 13.2, 4.1, 4.2, 4.3_
  - [ ] 21.2 Add a single delegated event listener on `#task-list` to handle checkbox change (call `toggleComplete(id)`), Edit button click (enter inline edit mode), Save button click (call `editTask(id, value)`), Cancel button click (call `renderTasks()`), and Delete button click (call `deleteTask(id)`)
    - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.2, 7.3_
  - [ ] 21.3 Add a delegated event listener on `#links-list` to handle Delete button click (call `deleteLink(id)`)
    - _Requirements: 12.1_

- [x] 22. Final checkpoint — Verify all features work together
  - Open `index.html` in the browser and manually verify all features end-to-end: greeting (time, date, correct greeting text), timer (start, stop, reset, auto-stop at 00:00, completion indicator, correct button states), To-Do List (add, edit, complete, delete, sort, duplicate rejection, persistence), Quick Links (add, open in new tab, delete, persistence), theme toggle (all sections update, survives page refresh), and Local Storage round-trips. Verify in the browser before proceeding to the manual verification pass.
  - This checkpoint depends on all implementation tasks and on checkpoints 10 and 17 being complete.

- [x] 23. Manual verification pass
  - Verify greeting shows correct 24-hour time and date; confirm greeting text changes at each of the four time-band boundaries
  - Verify timer starts, stops (retaining remaining time), resets to 25:00, reaches 00:00 and stops automatically with the completion indicator; verify Start/Stop disable states are correct
  - Verify task add, edit, complete, delete, all three sort modes, duplicate rejection, and round-trip persistence across a page refresh
  - Verify quick link add (with and without protocol), open in new tab, delete, and round-trip persistence across a page refresh
  - Verify theme toggle updates all four widget sections and survives a page refresh
  - Verify layout at 320px (single column), 768px (two columns), and 1920px (two columns) with no horizontal overflow
  - Verify consistent behavior in Chrome, Firefox, Edge, and Safari
  - _Requirements: 1.1, 1.2, 1.3, 2.1–2.5, 3.1–3.4, 4.1–4.4, 5.1–5.3, 6.1–6.4, 7.1–7.3, 8.1–8.4, 9.1–9.4, 10.1–10.5, 11.1–11.5, 12.1–12.5, 13.1–13.5, 14.1–14.5, 15.1–15.5_

## Notes

- Each task references specific requirements for traceability
- Checkpoints (Tasks 10, 17, 22) are browser verification steps — no automated test framework is used; Requirement 14.5 mandates manual testing only
- The `tasks` array must never be mutated by sort operations — `getSortedTasks()` always returns a new copy
- `currentSort` values are exactly: `'creation'`, `'alphabetical'`, `'completion'`
- Timer state (`timerSeconds`, `timerRunning`, `timerIntervalId`) and `currentSort` are never written to Local Storage
- All three application source files (`index.html`, `css/style.css`, `js/app.js`) must be created before any logic is implemented
- `getSortedTasks()` (Task 16) must be fully implemented before `renderTasks()` (Task 12) is first called — no stub is used
- `startTimer()` guards: returns immediately if `timerRunning === true` (prevents duplicate intervals) or if `timerSeconds === 0` (timer exhausted; user must Reset first)
- `stopTimer()` sets `timerIntervalId = null` after clearing the interval
- `updateTimerButtons()` disables `#btn-start` when `timerRunning === true` OR `timerSeconds === 0`; re-enables after Reset
- Inline edit errors (empty value, duplicate) keep the edit interface visible — the original description is preserved until a valid save
- `validateURL()` checks case-insensitively for `http://` or `https://` prefix, then validates protocol and hostname after `new URL()` construction
- Task input uses `keydown` event with `event.key === "Enter"` check — not the deprecated `keypress`
- User-provided text (task descriptions, link names) must be set via `textContent`, never via `innerHTML` interpolation
- `applyTheme()` does NOT call `saveThemeToStorage()`. Only `toggleTheme()` calls `saveThemeToStorage()` after a user-initiated change
- Task 6 (init + DOMContentLoaded) appears numerically early in the task list but must be executed last in the dependency graph, after all functions it calls are fully implemented. The dependency graph is the authoritative execution order.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2", "3.3", "5.1"] },
    { "id": 3, "tasks": ["5.2", "5.3", "5.4"] },
    { "id": 4, "tasks": ["7.1", "8.1", "9.4", "20.1"] },
    { "id": 5, "tasks": ["7.2", "8.2", "9.1", "9.2", "20.2"] },
    { "id": 6, "tasks": ["9.3", "11"] },
    { "id": 7, "tasks": ["16"] },
    { "id": 8, "tasks": ["12"] },
    { "id": 9, "tasks": ["13.1", "14.1", "15.1", "15.2", "18.1"] },
    { "id": 10, "tasks": ["13.2", "14.2", "18.2"] },
    { "id": 11, "tasks": ["19.1", "19.2"] },
    { "id": 12, "tasks": ["21.1", "21.2", "21.3"] },
    { "id": 13, "tasks": ["6"] },
    { "id": 14, "tasks": ["10", "17"] },
    { "id": 15, "tasks": ["22"] },
    { "id": 16, "tasks": ["23"] }
  ]
}
```