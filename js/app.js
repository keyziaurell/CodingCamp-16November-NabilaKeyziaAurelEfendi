// app.js — Life Dashboard application logic

// ============================================================
// State Variables
// ============================================================
let tasks        = [];
let links        = [];
let timerSeconds = 1500;      // never persisted
let timerRunning = false;     // never persisted
let timerIntervalId = null;   // never persisted
let currentTheme = 'light';
let currentSort  = 'creation'; // never persisted

// Bonus — Custom Name in Greeting
// Loaded from localStorage key "ld_name" (plain string, no JSON).
let userName = '';

// ============================================================
// Local Storage Module (Task 5)
// ============================================================

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

  // ld_theme — plain string, never JSON.parse()
  const savedTheme = localStorage.getItem('ld_theme');
  currentTheme = savedTheme === 'dark' ? 'dark' : 'light';

  // ld_name — plain string, never JSON.parse()
  // If the key was never set, getItem returns null; treat that as empty string.
  const savedName = localStorage.getItem('ld_name');
  userName = (typeof savedName === 'string') ? savedName : '';
}

function saveTasksToStorage() {
  localStorage.setItem('ld_tasks', JSON.stringify(tasks));
}

function saveLinksToStorage() {
  localStorage.setItem('ld_links', JSON.stringify(links));
}

function saveThemeToStorage(theme) {
  localStorage.setItem('ld_theme', theme);
}

// ============================================================
// Greeting Widget (Task 7)
// ============================================================

function updateGreeting() {
  const now   = new Date();
  const hours   = now.getHours();
  const minutes = now.getMinutes();

  // 7.1 — Time and date display
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  document.getElementById('current-time').textContent = hh + ':' + mm;

  document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric'
  });

  // 7.2 — Time-based greeting band
  let band;
  if (hours >= 5 && hours <= 11) {
    band = 'Good Morning';
  } else if (hours >= 12 && hours <= 17) {
    band = 'Good Afternoon';
  } else if (hours >= 18 && hours <= 20) {
    band = 'Good Evening';
  } else {
    band = 'Good Night';
  }

  // Bonus — append the saved name when present.
  // No name  ->  "Good Morning!"
  // Name set ->  "Good Morning, Nabila!"
  // The exclamation mark is always added exactly once; no double punctuation.
  const suffix = userName.trim() ? ', ' + userName.trim() + '!' : '!';
  document.getElementById('greeting-text').textContent = band + suffix;
}

// ============================================================
// Bonus — Custom Name in Greeting
// ============================================================

/*
  updateNameUI
  Syncs the trigger button label and the editor input with the
  current value of `userName`. Called after every save/remove.
*/
function updateNameUI() {
  const triggerBtn = document.getElementById('btn-edit-name');
  const nameInput  = document.getElementById('name-input');

  // Button label tells the user whether they are setting or editing.
  triggerBtn.textContent = userName ? '✏ Edit name' : '✏ Set name';

  // Pre-fill the input with the saved name so the user can edit in place.
  nameInput.value = userName;
}

/*
  openNameEditor
  Shows #name-editor and hides the trigger button, then moves
  keyboard focus into the input field for immediate typing.
*/
function openNameEditor() {
  const editor     = document.getElementById('name-editor');
  const triggerBtn = document.getElementById('btn-edit-name');

  editor.classList.remove('hidden');
  triggerBtn.classList.add('hidden');

  // Focus the input so the user can type straight away.
  document.getElementById('name-input').focus();
}

/*
  closeNameEditor
  Hides the editor panel and restores the trigger button.
  Does NOT modify userName — just closes the UI.
*/
function closeNameEditor() {
  document.getElementById('name-editor').classList.add('hidden');
  document.getElementById('btn-edit-name').classList.remove('hidden');
}

/*
  saveName
  Reads the input, trims whitespace, persists to localStorage,
  updates the greeting immediately, and closes the editor.

  Empty input = remove the name (greeting reverts to "Good Morning!").
  Non-empty input = save and display "Good Morning, Nabila!".
*/
function saveName() {
  const trimmed = document.getElementById('name-input').value.trim();

  userName = trimmed;

  if (trimmed === '') {
    // User cleared the name — remove the key from storage entirely.
    localStorage.removeItem('ld_name');
  } else {
    // Store as a plain string, consistent with ld_theme.
    localStorage.setItem('ld_name', trimmed);
  }

  updateGreeting();   // refresh greeting text with the new name
  updateNameUI();     // flip trigger label between "Set name" and "Edit name"
  closeNameEditor();  // hide the editor, restore the trigger button
}

/*
  cancelName
  Discards any unsaved typing and closes the editor.
  Restores the input to the last-saved userName so the next
  time the editor opens it still shows the correct value.
*/
function cancelName() {
  document.getElementById('name-input').value = userName;
  closeNameEditor();
}

// ============================================================
// Focus Timer — display and tick (Task 8)
// ============================================================

function renderTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const display = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  const el = document.getElementById('timer-display');
  el.textContent = display;
  el.classList.remove('timer-complete');
}

function timerTick() {
  timerSeconds = Math.max(0, timerSeconds - 1);
  renderTimerDisplay();

  if (timerSeconds === 0) {
    stopTimer();
    const display = document.getElementById('timer-display');
    display.textContent = 'Session complete!';
    display.classList.add('timer-complete');
  }
}

// ============================================================
// Focus Timer — controls (Task 9)
// ============================================================

function startTimer() {
  if (timerRunning === true) return;
  if (timerSeconds === 0)   return;
  timerRunning    = true;
  timerIntervalId = setInterval(timerTick, 1000);
  updateTimerButtons();
}

function stopTimer() {
  clearInterval(timerIntervalId);
  timerIntervalId = null;
  timerRunning    = false;
  updateTimerButtons();
}

function resetTimer() {
  stopTimer();
  timerSeconds = 1500;
  renderTimerDisplay();
  updateTimerButtons();
}

function updateTimerButtons() {
  const btnStart = document.getElementById('btn-start');
  const btnStop  = document.getElementById('btn-stop');
  const btnReset = document.getElementById('btn-reset');

  btnStart.disabled = timerRunning || timerSeconds === 0;
  btnStop.disabled  = !timerRunning;
  btnReset.disabled = false;
}

// ============================================================
// To-Do List — duplicate prevention (Task 11)
// ============================================================

function isDuplicate(desc, excludeId) {
  const normalized = desc.trim().toLowerCase();
  return tasks.some(task => task.id !== excludeId && task.description.trim().toLowerCase() === normalized);
}

// ============================================================
// To-Do List — complete and delete (Task 15)
// ============================================================

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasksToStorage();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasksToStorage();
  renderTasks();
}

// ============================================================
// To-Do List — add task (Task 13)
// ============================================================

function addTask() {
  const input   = document.getElementById('task-input');
  const errorEl = document.getElementById('task-error');
  const trimmed = input.value.trim();

  if (trimmed === '') {
    errorEl.textContent = 'Task cannot be empty.';
    return;
  }

  if (isDuplicate(trimmed, null)) {
    errorEl.textContent = 'A task with this name already exists.';
    return;
  }

  const newTask = {
    id:          Date.now() + '-' + Math.random(),
    description: trimmed,
    completed:   false,
    createdAt:   Date.now()
  };

  tasks.push(newTask);
  saveTasksToStorage();
  renderTasks();

  input.value         = '';
  errorEl.textContent = '';
}

// ============================================================
// To-Do List — edit task (Task 14)
// ============================================================

function enterEditMode(id) {
  const li = document.querySelector('#task-list li[data-id="' + id + '"]');
  if (!li) return;

  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const currentDescription = task.description;

  const span = li.querySelector('span');
  if (span) li.removeChild(span);

  const editBtn = li.querySelector('[data-action="edit"]');
  if (editBtn) editBtn.style.display = 'none';

  const input = document.createElement('input');
  input.type          = 'text';
  input.value         = currentDescription;
  input.dataset.action = 'edit-input';
  input.classList.add('edit-input');

  const saveBtn = document.createElement('button');
  saveBtn.textContent   = 'Save';
  saveBtn.dataset.action = 'save';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent   = 'Cancel';
  cancelBtn.dataset.action = 'cancel';

  const errorEl = document.createElement('span');
  errorEl.dataset.role = 'edit-error';
  errorEl.classList.add('edit-error');

  const checkbox        = li.querySelector('input[type="checkbox"]');
  const afterCheckbox   = checkbox ? checkbox.nextSibling : li.firstChild;

  li.insertBefore(input,     afterCheckbox);
  li.insertBefore(saveBtn,   input.nextSibling);
  li.insertBefore(cancelBtn, saveBtn.nextSibling);
  li.insertBefore(errorEl,   cancelBtn.nextSibling);

  input.focus();
}

function editTask(id, newDesc) {
  const trimmed = newDesc.trim();

  const li      = document.querySelector('#task-list li[data-id="' + id + '"]');
  const errorEl = li ? li.querySelector('[data-role="edit-error"]') : null;

  if (trimmed === '') {
    if (errorEl) errorEl.textContent = 'Task cannot be empty.';
    return;
  }

  if (isDuplicate(trimmed, id)) {
    if (errorEl) errorEl.textContent = 'A task with this name already exists.';
    return;
  }

  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.description = trimmed;
  saveTasksToStorage();
  renderTasks();
}

// ============================================================
// Quick Links — URL validation and add link (Task 18)
// ============================================================

function validateURL(url) {
  let normalized = url.trim();

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

function addLink() {
  const nameInput = document.getElementById('link-name-input');
  const urlInput  = document.getElementById('link-url-input');
  const errorEl   = document.getElementById('link-error');

  const trimmedName = nameInput.value.trim();
  const trimmedURL  = urlInput.value.trim();

  if (trimmedName === '') {
    errorEl.textContent = 'Link name cannot be empty.';
    return;
  }

  if (trimmedURL === '') {
    errorEl.textContent = 'URL cannot be empty.';
    return;
  }

  const normalizedURL = validateURL(trimmedURL);
  if (normalizedURL === null) {
    errorEl.textContent = 'Please enter a valid URL.';
    return;
  }

  const newLink = {
    id:   Date.now() + '-' + Math.random(),
    name: trimmedName,
    url:  normalizedURL
  };

  links.push(newLink);
  saveLinksToStorage();
  renderLinks();

  nameInput.value     = '';
  urlInput.value      = '';
  errorEl.textContent = '';
}

// ============================================================
// To-Do List — sort (Task 16)
// ============================================================

function getSortedTasks() {
  const copy = tasks.slice();

  if (currentSort === 'alphabetical') {
    copy.sort((a, b) => a.description.toLowerCase().localeCompare(b.description.toLowerCase()));
  } else if (currentSort === 'completion') {
    copy.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.createdAt - b.createdAt;
    });
  } else {
    copy.sort((a, b) => a.createdAt - b.createdAt);
  }

  return copy;
}

function initSortButtons() {
  const sortButtons = document.querySelectorAll('.sort-btn');
  sortButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentSort = btn.dataset.sort;
      sortButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTasks();
    });
  });
}

// ============================================================
// To-Do List — render tasks (Task 12)
// ============================================================

function renderTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  const sorted = getSortedTasks();

  sorted.forEach(task => {
    const li       = document.createElement('li');
    li.dataset.id  = task.id;

    const checkbox   = document.createElement('input');
    checkbox.type    = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.dataset.action = 'toggle';

    const span        = document.createElement('span');
    span.textContent  = task.description;
    if (task.completed) span.classList.add('completed');

    const editBtn        = document.createElement('button');
    editBtn.textContent  = 'Edit';
    editBtn.dataset.action = 'edit';

    const deleteBtn        = document.createElement('button');
    deleteBtn.textContent  = 'Delete';
    deleteBtn.dataset.action = 'delete';

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

// ============================================================
// Quick Links — render and delete (Tasks 19.1 / 19.2)
// ============================================================

function renderLinks() {
  const list = document.getElementById('links-list');
  list.innerHTML = '';

  links.forEach(link => {
    const li = document.createElement('li');

    const anchor    = document.createElement('a');
    anchor.href     = link.url;
    anchor.target   = '_blank';
    anchor.rel      = 'noopener noreferrer';
    anchor.textContent = link.name;

    const deleteBtn        = document.createElement('button');
    deleteBtn.textContent  = 'Delete';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.id     = link.id;

    li.appendChild(anchor);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

function deleteLink(id) {
  links = links.filter(link => link.id !== id);
  saveLinksToStorage();
  renderLinks();
}

// ============================================================
// Theme (Tasks 20.1 / 20.2)
// ============================================================

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

function toggleTheme() {
  const next = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(next);
  saveThemeToStorage(next);
}

// ============================================================
// Event Listeners (Task 21)
// ============================================================

function attachEventListeners() {
  // 21.1 — Direct bindings (unchanged)
  document.getElementById('btn-add-task').addEventListener('click', addTask);
  document.getElementById('task-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTask();
  });
  document.getElementById('btn-add-link').addEventListener('click', addLink);
  document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('btn-start').addEventListener('click', startTimer);
  document.getElementById('btn-stop').addEventListener('click', stopTimer);
  document.getElementById('btn-reset').addEventListener('click', resetTimer);

  // Bonus — name editor bindings
  document.getElementById('btn-edit-name').addEventListener('click', openNameEditor);
  document.getElementById('btn-save-name').addEventListener('click', saveName);
  document.getElementById('btn-cancel-name').addEventListener('click', cancelName);

  // Allow pressing Enter in the name input to save (mirrors the task input UX).
  document.getElementById('name-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter')  saveName();
    if (e.key === 'Escape') cancelName();
  });

  // 21.2 — Delegated listener on #task-list
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
        const editInput  = li.querySelector('[data-action="edit-input"]');
        const inputValue = editInput ? editInput.value : '';
        editTask(id, inputValue);
      } else if (action === 'cancel') {
        renderTasks();
      } else if (action === 'delete') {
        deleteTask(id);
      }
    }
  }

  taskList.addEventListener('click',  handleTaskListEvent);
  taskList.addEventListener('change', handleTaskListEvent);

  // 21.3 — Delegated listener on #links-list
  document.getElementById('links-list').addEventListener('click', function (event) {
    if (event.target.dataset.action === 'delete') {
      deleteLink(event.target.dataset.id);
    }
  });

  initSortButtons();
}

// ============================================================
// Initialization (Task 6)
// ============================================================

function init() {
  loadFromStorage();    // loads tasks, links, theme, AND userName
  applyTheme(currentTheme);
  renderTasks();
  renderLinks();
  renderTimerDisplay();
  updateGreeting();           // uses userName if already loaded
  setInterval(updateGreeting, 60000);
  updateTimerButtons();
  updateNameUI();             // set trigger label + pre-fill input from stored name
  attachEventListeners();
}

document.addEventListener('DOMContentLoaded', init);