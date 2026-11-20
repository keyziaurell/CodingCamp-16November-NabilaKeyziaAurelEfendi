// app.js — application logic will be added in Tasks 4–21

// --- State Variables ---
let tasks = [];
let links = [];
let timerSeconds = 1500;      // never persisted to Local Storage
let timerRunning = false;     // never persisted to Local Storage
let timerIntervalId = null;   // never persisted to Local Storage
let currentTheme = 'light';
let currentSort = 'creation'; // never persisted to Local Storage

// --- Local Storage Module (Task 5) ---

function loadFromStorage() {
  // ld_tasks
  try {
    const raw = localStorage.getItem('ld_tasks');
    const parsed = JSON.parse(raw);
    tasks = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    tasks = [];
  }

  // ld_links
  try {
    const raw = localStorage.getItem('ld_links');
    const parsed = JSON.parse(raw);
    links = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    links = [];
  }

  // ld_theme — read as plain string, do NOT use JSON.parse()
  const savedTheme = localStorage.getItem('ld_theme');
  currentTheme = savedTheme === 'dark' ? 'dark' : 'light';
}

function saveTasksToStorage() {
  localStorage.setItem('ld_tasks', JSON.stringify(tasks));
}

function saveLinksToStorage() {
  localStorage.setItem('ld_links', JSON.stringify(links));
}

function saveThemeToStorage(theme) {
  // Store as plain string — never use JSON.stringify here
  localStorage.setItem('ld_theme', theme);
}

// --- Greeting Widget (Task 7) ---

function updateGreeting() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // 7.1 — Time and date display
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  document.getElementById('current-time').textContent = `${hh}:${mm}`;

  document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 7.2 — Time-based greeting band
  let greeting;
  if (hours >= 5 && hours <= 11) {
    greeting = 'Good Morning';
  } else if (hours >= 12 && hours <= 17) {
    greeting = 'Good Afternoon';
  } else if (hours >= 18 && hours <= 20) {
    greeting = 'Good Evening';
  } else {
    greeting = 'Good Night';
  }
  document.getElementById('greeting-text').textContent = greeting;
}

// --- Focus Timer — display and tick (Task 8) ---

// 8.1 — Render the current timerSeconds value as MM:SS in #timer-display
function renderTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const display = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  const el = document.getElementById('timer-display');
  el.textContent = display;
  el.classList.remove('timer-complete'); // clear completion indicator on any re-render
}

// 8.2 — Decrement timerSeconds by one; update display; stop and signal completion at 00:00
function timerTick() {
  timerSeconds = Math.max(0, timerSeconds - 1);
  renderTimerDisplay();

  if (timerSeconds === 0) {
    stopTimer(); // clears interval, sets timerRunning = false (implemented in Task 9)
    const display = document.getElementById('timer-display');
    display.textContent = 'Session complete!';
    display.classList.add('timer-complete');
  }
}

// --- Focus Timer — controls (Task 9) ---

// 9.1 — Start the countdown; guard against double-start and exhausted timer
function startTimer() {
  if (timerRunning === true) return;   // already running — do nothing
  if (timerSeconds === 0) return;      // exhausted — user must Reset first
  timerRunning = true;
  timerIntervalId = setInterval(timerTick, 1000);
  updateTimerButtons();
}

// 9.2 — Halt the countdown; preserve remaining timerSeconds
function stopTimer() {
  clearInterval(timerIntervalId);
  timerIntervalId = null;
  timerRunning = false;
  // timerSeconds is intentionally NOT modified here
  updateTimerButtons();
}

// 9.3 — Reset the timer to 25:00 in Stopped state
function resetTimer() {
  stopTimer();              // clears interval, nulls timerIntervalId, sets timerRunning = false
  timerSeconds = 1500;
  renderTimerDisplay();
  updateTimerButtons();
}

// 9.4 — Sync button disabled states with current timer state
function updateTimerButtons() {
  const btnStart = document.getElementById('btn-start');
  const btnStop  = document.getElementById('btn-stop');
  const btnReset = document.getElementById('btn-reset');

  // Disable Start when running OR when timer is exhausted (00:00)
  btnStart.disabled = timerRunning || timerSeconds === 0;

  // Disable Stop when not running
  btnStop.disabled = !timerRunning;

  // Reset is always enabled
  btnReset.disabled = false;
}

// --- To-Do List — duplicate prevention (Task 11) ---

// 11.1 — Return true if any task (excluding the one with excludeId) has a matching description
function isDuplicate(desc, excludeId) {
  const normalized = desc.trim().toLowerCase();
  return tasks.some(task => task.id !== excludeId && task.description.trim().toLowerCase() === normalized);
}


// --- To-Do List — complete and delete (Task 15) ---

// 15.1 — Toggle the completed state of a task by id
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasksToStorage();
  renderTasks();
}

// 15.2 — Remove a task from the tasks array by id
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasksToStorage();
  renderTasks();
}

// --- To-Do List — add task (Task 13) ---

// 13.1 / 13.2 — Validate and add a new task from #task-input
function addTask() {
  const input = document.getElementById('task-input');
  const errorEl = document.getElementById('task-error');
  const trimmed = input.value.trim();

  // 13.1 — Validation
  if (trimmed === '') {
    errorEl.textContent = 'Task cannot be empty.';
    return;
  }

  if (isDuplicate(trimmed, null)) {
    errorEl.textContent = 'A task with this name already exists.';
    return;
  }

  // 13.2 — Create task object and persist
  const newTask = {
    id: Date.now() + '-' + Math.random(),
    description: trimmed,          // stored as plain string; rendered via textContent in renderTasks()
    completed: false,
    createdAt: Date.now()
  };

  tasks.push(newTask);
  saveTasksToStorage();
  renderTasks();

  input.value = '';
  errorEl.textContent = '';
}

// --- To-Do List — edit task (Task 14) ---

// 14.1 — Replace the read-only <span> with an inline edit <input> + Save/Cancel/error elements.
// Called from the delegated listener (Task 21.2) when the Edit button is clicked.
function enterEditMode(id) {
  const li = document.querySelector(`#task-list li[data-id="${id}"]`);
  if (!li) return;

  // Retrieve current description from the tasks array (source of truth)
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const currentDescription = task.description;

  // Remove the read-only <span>
  const span = li.querySelector('span');
  if (span) li.removeChild(span);

  // Hide the Edit button while editing (it will be restored by renderTasks on save/cancel)
  const editBtn = li.querySelector('[data-action="edit"]');
  if (editBtn) editBtn.style.display = 'none';

  // Build the edit <input> — pre-fill via .value, never innerHTML
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentDescription;   // safe: .value assignment, not innerHTML
  input.dataset.action = 'edit-input';
  input.classList.add('edit-input');

  // Save button
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.dataset.action = 'save';

  // Cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.dataset.action = 'cancel';

  // Inline error element (initially empty)
  const errorEl = document.createElement('span');
  errorEl.dataset.role = 'edit-error';
  errorEl.classList.add('edit-error');
  // textContent is intentionally left empty until a validation failure occurs

  // Insert after the checkbox
  const checkbox = li.querySelector('input[type="checkbox"]');
  const afterCheckbox = checkbox ? checkbox.nextSibling : li.firstChild;

  li.insertBefore(input, afterCheckbox);
  li.insertBefore(saveBtn, input.nextSibling);
  li.insertBefore(cancelBtn, saveBtn.nextSibling);
  li.insertBefore(errorEl, cancelBtn.nextSibling);

  // Focus the input so the user can start typing immediately
  input.focus();
}

// 14.2 — Validate the new description and persist if valid; show inline error without
//         reverting to read-only mode on failure.
function editTask(id, newDesc) {
  const trimmed = newDesc.trim();

  // Helper: find the inline error element inside the editing <li>
  const li = document.querySelector(`#task-list li[data-id="${id}"]`);
  const errorEl = li ? li.querySelector('[data-role="edit-error"]') : null;

  // Validation — empty
  if (trimmed === '') {
    if (errorEl) errorEl.textContent = 'Task cannot be empty.';
    return; // keep edit UI visible
  }

  // Validation — duplicate (exclude the task being edited)
  if (isDuplicate(trimmed, id)) {
    if (errorEl) errorEl.textContent = 'A task with this name already exists.';
    return; // keep edit UI visible
  }

  // Valid — update the task object in memory, persist, re-render
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.description = trimmed;   // original is preserved until this line succeeds
  saveTasksToStorage();
  renderTasks();
}

// --- Quick Links — URL validation and add link (Task 18) ---

// 18.1 — Normalize and validate a URL string; return the normalized URL or null on failure
function validateURL(url) {
  let normalized = url.trim();

  // Prepend https:// if no recognized protocol is present
  if (!normalized.toLowerCase().startsWith('http://') && !normalized.toLowerCase().startsWith('https://')) {
    normalized = 'https://' + normalized;
  }

  try {
    const parsed = new URL(normalized);
    if ((parsed.protocol !== 'http:' && parsed.protocol !== 'https:') || parsed.hostname === '') {
      return null;
    }
    return normalized;
  } catch (e) {
    return null;
  }
}

// 18.2 — Validate inputs, create a link object, persist, and render
function addLink() {
  const nameInput = document.getElementById('link-name-input');
  const urlInput  = document.getElementById('link-url-input');
  const errorEl   = document.getElementById('link-error');

  const trimmedName = nameInput.value.trim();
  const trimmedURL  = urlInput.value.trim();

  // Name validation
  if (trimmedName === '') {
    errorEl.textContent = 'Link name cannot be empty.';
    return;
  }

  // URL presence validation
  if (trimmedURL === '') {
    errorEl.textContent = 'URL cannot be empty.';
    return;
  }

  // URL format validation
  const normalizedURL = validateURL(trimmedURL);
  if (normalizedURL === null) {
    errorEl.textContent = 'Please enter a valid URL.';
    return;
  }

  // Create link object and persist
  const newLink = {
    id: Date.now() + '-' + Math.random(),
    name: trimmedName,   // stored as plain string; rendered via textContent in renderLinks()
    url: normalizedURL
  };

  links.push(newLink);
  saveLinksToStorage();
  renderLinks();

  // Clear inputs and error
  nameInput.value = '';
  urlInput.value  = '';
  errorEl.textContent = '';
}

// --- To-Do List — sort (Task 16) ---

// 16.1 — Return a sorted copy of tasks; never mutate the tasks array
function getSortedTasks() {
  const copy = tasks.slice();

  if (currentSort === 'alphabetical') {
    copy.sort((a, b) => a.description.toLowerCase().localeCompare(b.description.toLowerCase()));
  } else if (currentSort === 'completion') {
    // Incomplete first; within each group preserve creation order (stable)
    copy.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1; // false (incomplete) sorts before true (complete)
      }
      return a.createdAt - b.createdAt;
    });
  } else {
    // 'creation' — ascending by createdAt (default)
    copy.sort((a, b) => a.createdAt - b.createdAt);
  }

  return copy;
}

// 16.2 — Wire the three sort buttons; called by attachEventListeners() (Task 21)
// Each button carries a data-sort attribute matching the currentSort values.
function initSortButtons() {
  const sortButtons = document.querySelectorAll('.sort-btn');
  sortButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentSort = btn.dataset.sort; // 'creation' | 'alphabetical' | 'completion'

      // Update active class
      sortButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      renderTasks();
    });
  });
}

// --- To-Do List — render tasks (Task 12) ---

// Renders the task list by sorting tasks and building DOM nodes safely via textContent
function renderTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = ''; // clear existing items

  const sorted = getSortedTasks();

  sorted.forEach(task => {
    const li = document.createElement('li');
    li.dataset.id = task.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.dataset.action = 'toggle';

    // Description span — use textContent for safe insertion
    const span = document.createElement('span');
    span.textContent = task.description;
    if (task.completed) {
      span.classList.add('completed'); // CSS: text-decoration: line-through
    }

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.dataset.action = 'edit';

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.dataset.action = 'delete';

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

// --- Quick Links — render and delete (Tasks 19.1 / 19.2) ---

// 19.1 — Clear #links-list and re-render all links from the links array
function renderLinks() {
  const list = document.getElementById('links-list');
  list.innerHTML = ''; // clear existing items

  links.forEach(link => {
    const li = document.createElement('li');

    // Anchor — use textContent, never innerHTML
    const anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = link.name;

    // Delete button — separate from the anchor, not inside it
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.id = link.id;

    li.appendChild(anchor);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

// 19.2 — Remove a link by id, persist, and re-render
function deleteLink(id) {
  links = links.filter(link => link.id !== id);
  saveLinksToStorage();
  renderLinks();
}

// --- Theme (Tasks 20.1 / 20.2) ---

// 20.1 — Apply a theme visually; does NOT write to Local Storage
function applyTheme(theme) {
  currentTheme = theme;
  document.body.setAttribute('data-theme', theme);

  const btn = document.getElementById('btn-theme-toggle');
  if (theme === 'light') {
    btn.textContent = '🌙 Dark';
  } else {
    btn.textContent = '☀️ Light';
  }
}

// 20.2 — Toggle between light/dark; this is the ONLY place that writes theme to Local Storage
function toggleTheme() {
  const next = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(next);
  saveThemeToStorage(next);
}

// --- Event Listeners (Task 21) ---

function attachEventListeners() {
  // 21.1 — Direct bindings
  document.getElementById('btn-add-task').addEventListener('click', addTask);

  document.getElementById('task-input').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') addTask();
  });

  document.getElementById('btn-add-link').addEventListener('click', addLink);
  document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('btn-start').addEventListener('click', startTimer);
  document.getElementById('btn-stop').addEventListener('click', stopTimer);
  document.getElementById('btn-reset').addEventListener('click', resetTimer);

  // 21.2 — Delegated listener on #task-list (handles both click and change)
  const taskList = document.getElementById('task-list');

  function handleTaskListEvent(event) {
    const target = event.target;
    const action = target.dataset.action;
    if (!action) return;

    const li = target.closest('li[data-id]');
    if (!li) return;
    const id = li.dataset.id;

    if (event.type === 'change' && action === 'toggle') {
      toggleComplete(id);
    } else if (event.type === 'click') {
      if (action === 'edit') {
        enterEditMode(id);
      } else if (action === 'save') {
        const editInput = li.querySelector('[data-action="edit-input"]');
        const inputValue = editInput ? editInput.value : '';
        editTask(id, inputValue);
      } else if (action === 'cancel') {
        renderTasks();
      } else if (action === 'delete') {
        deleteTask(id);
      }
    }
  }

  taskList.addEventListener('click', handleTaskListEvent);
  taskList.addEventListener('change', handleTaskListEvent);

  // 21.3 — Delegated listener on #links-list
  document.getElementById('links-list').addEventListener('click', function (event) {
    if (event.target.dataset.action === 'delete') {
      deleteLink(event.target.dataset.id);
    }
  });

  // Wire sort buttons
  initSortButtons();
}

// --- Initialization (Task 6) ---

function init() {
  loadFromStorage();
  applyTheme(currentTheme);
  renderTasks();
  renderLinks();
  renderTimerDisplay();
  updateGreeting();
  setInterval(updateGreeting, 60000);
  updateTimerButtons();
  attachEventListeners();
}

document.addEventListener('DOMContentLoaded', init);
