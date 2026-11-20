// app.js — Life Dashboard application logic

// ============================================================
// State Variables
// ============================================================
let tasks        = [];
let links        = [];
let timerSeconds = 1500;      // current countdown value; never persisted
let timerRunning = false;     // never persisted
let timerIntervalId = null;   // never persisted
let currentTheme = 'light';
let currentSort  = 'creation'; // never persisted

// Change Pomodoro Time — the saved duration in whole minutes.
// Default is 25; loaded from localStorage key "ld_timer_duration".
let timerDurationMinutes = 25;

// Bonus — Custom Name in Greeting
let userName = '';

// ============================================================
// Local Storage Module (Task 5)
// ============================================================

function loadFromStorage() {
  // ld_tasks
  try {
    const raw    = localStorage.getItem('ld_tasks');
    const parsed = JSON.parse(raw);
    tasks = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    tasks = [];
  }

  // ld_links
  try {
    const raw    = localStorage.getItem('ld_links');
    const parsed = JSON.parse(raw);
    links = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    links = [];
  }

  // ld_theme — plain string, never JSON.parse()
  const savedTheme = localStorage.getItem('ld_theme');
  currentTheme = savedTheme === 'dark' ? 'dark' : 'light';

  // ld_name — plain string, never JSON.parse()
  const savedName = localStorage.getItem('ld_name');
  userName = (typeof savedName === 'string') ? savedName : '';

  // ld_timer_duration — stored as a plain integer string, e.g. "30".
  // Parse it and validate: must be a positive whole number.
  // Falls back to 25 if the stored value is missing, non-numeric, or invalid.
  const rawDuration = localStorage.getItem('ld_timer_duration');
  const parsedDuration = parseInt(rawDuration, 10);
  timerDurationMinutes = (Number.isInteger(parsedDuration) && parsedDuration >= 1)
    ? parsedDuration
    : 25;

  // Set timerSeconds to match the loaded duration so the display is
  // correct before the user ever touches the timer.
  timerSeconds = timerDurationMinutes * 60;
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
  const now     = new Date();
  const hours   = now.getHours();
  const minutes = now.getMinutes();

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  document.getElementById('current-time').textContent = hh + ':' + mm;

  document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric'
  });

  let band;
  if      (hours >= 5  && hours <= 11) { band = 'Good Morning';   }
  else if (hours >= 12 && hours <= 17) { band = 'Good Afternoon'; }
  else if (hours >= 18 && hours <= 20) { band = 'Good Evening';   }
  else                                 { band = 'Good Night';     }

  const suffix = userName.trim() ? ', ' + userName.trim() + '!' : '!';
  document.getElementById('greeting-text').textContent = band + suffix;
}

// ============================================================
// Bonus — Custom Name in Greeting
// ============================================================

function updateNameUI() {
  const triggerBtn = document.getElementById('btn-edit-name');
  const nameInput  = document.getElementById('name-input');
  triggerBtn.textContent = userName ? 'Edit name' : 'Set name';
  nameInput.value        = userName;
}

function openNameEditor() {
  document.getElementById('name-editor').classList.remove('hidden');
  document.getElementById('btn-edit-name').classList.add('hidden');
  document.getElementById('name-input').focus();
}

function closeNameEditor() {
  document.getElementById('name-editor').classList.add('hidden');
  document.getElementById('btn-edit-name').classList.remove('hidden');
}

function saveName() {
  const trimmed = document.getElementById('name-input').value.trim();
  userName = trimmed;
  if (trimmed === '') {
    localStorage.removeItem('ld_name');
  } else {
    localStorage.setItem('ld_name', trimmed);
  }
  updateGreeting();
  updateNameUI();
  closeNameEditor();
}

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
  const statusEl = document.getElementById('timer-status');
  if (statusEl) statusEl.textContent = '';
  updateTimerRing();
}

// ============================================================
// Focus Timer — circular progress ring (UI refinement)
// Updates the SVG stroke-dashoffset to visually represent elapsed
// time. Reads existing timerSeconds and timerDurationMinutes;
// does not modify any timer logic.
// ============================================================

function updateTimerRing() {
  const ring = document.querySelector('.timer-ring-progress');
  if (!ring) return;
  const total = timerDurationMinutes * 60;
  const progress = total > 0 ? 1 - (timerSeconds / total) : 0;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));
  ring.style.strokeDashoffset = String(offset);
}

function timerTick() {
  timerSeconds = Math.max(0, timerSeconds - 1);
  renderTimerDisplay();
  if (timerSeconds === 0) {
    stopTimer();
    const statusEl = document.getElementById('timer-status');
    if (statusEl) statusEl.textContent = 'Session complete!';
  }
}

// ============================================================
// Focus Timer — controls (Task 9)
// ============================================================

function startTimer() {
  if (timerRunning === true) return;
  if (timerSeconds === 0)    return;
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

/*
  resetTimer — now resets to timerDurationMinutes instead of the
  hardcoded 1500 (25 min). This is the only line that changed from
  the original Task 9 implementation.
  Default is still 25 min because timerDurationMinutes defaults to 25.
*/
function resetTimer() {
  stopTimer();
  timerSeconds = timerDurationMinutes * 60;   // was: timerSeconds = 1500
  renderTimerDisplay();
  updateTimerButtons();
}

function updateTimerButtons() {
  const btnStart = document.getElementById('btn-start');
  const btnStop  = document.getElementById('btn-stop');
  const btnReset = document.getElementById('btn-reset');
  if (!btnStart || !btnStop || !btnReset) return;

  // Start: enabled when stopped AND there is time remaining
  btnStart.disabled = timerRunning || timerSeconds === 0;

  // Stop: enabled only while the timer is actively counting down
  btnStop.disabled = !timerRunning;

  // Reset: disabled when the timer is at its full duration AND not running.
  // This covers initial load and the moment after clicking Reset.
  // In every other state (running, paused, or completed) Reset is enabled.
  const fullDuration = timerDurationMinutes * 60;
  btnReset.disabled = !timerRunning && timerSeconds === fullDuration;
}

// ============================================================
// Change Pomodoro Time — apply duration
// ============================================================

/*
  applyDuration
  Reads #duration-input, validates it, persists the value, and
  resets the timer to the new duration.

  Validation rules (Requirement 4):
  - Must not be empty.
  - Must be a whole number (no decimals).
  - Must be >= 1.
  - Values > 999 are blocked by the input's max="999" attribute,
    but we also guard here for programmatic calls.

  On success:
  - timerDurationMinutes is updated.
  - Value saved to localStorage as a plain integer string.
  - resetTimer() is called, which stops any running countdown and
    sets timerSeconds = timerDurationMinutes * 60.
  - Error message is cleared.

  On failure:
  - Error message is shown; nothing else changes.
*/
function applyDuration() {
  const input   = document.getElementById('duration-input');
  const errorEl = document.getElementById('duration-error');
  const raw     = input.value.trim();

  // Guard: empty field
  if (raw === '') {
    errorEl.textContent = 'Please enter a duration.';
    return;
  }

  const parsed = Number(raw);

  // Guard: must be a positive whole number (integer >= 1, no decimals)
  if (!Number.isInteger(parsed) || parsed < 1) {
    errorEl.textContent = 'Duration must be a whole number of at least 1.';
    return;
  }

  // Guard: very large values (belt-and-suspenders beyond the max attribute)
  if (parsed > 999) {
    errorEl.textContent = 'Duration must be 999 minutes or less.';
    return;
  }

  // Valid — persist, update state, reset timer
  timerDurationMinutes = parsed;
  localStorage.setItem('ld_timer_duration', String(parsed));

  errorEl.textContent = '';
  resetTimer();   // stops any running countdown; sets timerSeconds = parsed * 60
}

/*
  syncDurationInput
  Writes the current timerDurationMinutes back into #duration-input.
  Called once during init() so the field always shows the saved value
  on page load, even before the user clicks Apply.
*/
function syncDurationInput() {
  document.getElementById('duration-input').value = timerDurationMinutes;
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

  tasks.push({
    id:          Date.now() + '-' + Math.random(),
    description: trimmed,
    completed:   false,
    createdAt:   Date.now()
  });

  saveTasksToStorage();
  renderTasks();
  input.value         = '';
  errorEl.textContent = '';
}

// ============================================================
// To-Do List — edit task (Task 14)
// ============================================================

function enterEditMode(id) {
  const li   = document.querySelector('#task-list li[data-id="' + id + '"]');
  const task = li && tasks.find(t => t.id === id);
  if (!li || !task) return;

  const span = li.querySelector('span');
  if (span) li.removeChild(span);

  const editBtn = li.querySelector('[data-action="edit"]');
  if (editBtn) editBtn.style.display = 'none';

  const input          = document.createElement('input');
  input.type           = 'text';
  input.value          = task.description;
  input.dataset.action = 'edit-input';
  input.classList.add('edit-input');

  const saveBtn          = document.createElement('button');
  saveBtn.textContent    = 'Save';
  saveBtn.dataset.action = 'save';
  saveBtn.className      = 'task-btn-save';

  const cancelBtn          = document.createElement('button');
  cancelBtn.textContent    = 'Cancel';
  cancelBtn.dataset.action = 'cancel';
  cancelBtn.className      = 'task-btn-cancel';

  const errorEl        = document.createElement('span');
  errorEl.dataset.role = 'edit-error';
  errorEl.classList.add('edit-error');

  const checkbox      = li.querySelector('input[type="checkbox"]');
  const afterCheckbox = checkbox ? checkbox.nextSibling : li.firstChild;

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
  if (!normalized.toLowerCase().startsWith('http://') &&
      !normalized.toLowerCase().startsWith('https://')) {
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

  links.push({
    id:   Date.now() + '-' + Math.random(),
    name: trimmedName,
    url:  normalizedURL
  });

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

  // Update progress indicator
  const progressEl = document.getElementById('task-progress');
  if (progressEl) {
    const total     = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const textEl    = progressEl.querySelector('.task-progress-text');
    const fillEl    = progressEl.querySelector('.task-progress-fill');
    if (total > 0) {
      if (textEl) textEl.textContent = completed + ' / ' + total + ' done';
      if (fillEl) fillEl.style.width = Math.round((completed / total) * 100) + '%';
      progressEl.style.display = 'flex';
    } else {
      progressEl.style.display = 'none';
    }
  }

  getSortedTasks().forEach(task => {
    const li         = document.createElement('li');
    li.dataset.id    = task.id;

    const checkbox          = document.createElement('input');
    checkbox.type           = 'checkbox';
    checkbox.checked        = task.completed;
    checkbox.dataset.action = 'toggle';

    const span         = document.createElement('span');
    span.textContent   = task.description;
    if (task.completed) span.classList.add('completed');

    const editBtn          = document.createElement('button');
    editBtn.className      = 'task-btn-edit';
    editBtn.dataset.action = 'edit';
    editBtn.title          = 'Edit';
    editBtn.innerHTML      = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';

    const deleteBtn          = document.createElement('button');
    deleteBtn.className      = 'task-btn-delete';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.title          = 'Delete';
    deleteBtn.innerHTML      = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

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

  if (links.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'links-empty';
    emptyMsg.textContent = 'Your shortcuts will appear here.';
    list.appendChild(emptyMsg);
    return;
  }

  links.forEach(link => {
    const li = document.createElement('li');
    li.className = 'link-card';

    const anchor       = document.createElement('a');
    anchor.href        = link.url;
    anchor.target      = '_blank';
    anchor.rel         = 'noopener noreferrer';
    const favicon      = document.createElement('img');
    favicon.className   = 'link-favicon';
    favicon.src         = 'https://www.google.com/s2/favicons?domain=' + new URL(link.url).hostname + '&sz=32';
    favicon.alt         = '';
    favicon.width       = 16;
    favicon.height      = 16;
    favicon.loading     = 'lazy';
    favicon.onerror     = function() { this.onerror = null; this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='2' y1='12' x2='22' y2='12'/%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/%3E%3C/svg%3E"; };

    const linkText      = document.createElement('span');
    linkText.className   = 'link-name-text';
    linkText.textContent = link.name;

    anchor.appendChild(favicon);
    anchor.appendChild(linkText);

    const deleteBtn          = document.createElement('button');
    deleteBtn.textContent    = '\u00D7';
    deleteBtn.className      = 'link-delete-btn';
    deleteBtn.setAttribute('aria-label', 'Delete ' + link.name);
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
    btn.textContent = '\uD83C\uDF19 Dark';
  } else {
    btn.textContent = '\u2600\uFE0F Light';
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
  // Task controls (unchanged)
  document.getElementById('btn-add-task').addEventListener('click', addTask);
  document.getElementById('task-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTask();
  });
  document.getElementById('btn-add-link').addEventListener('click', addLink);
  document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('btn-start').addEventListener('click', startTimer);
  document.getElementById('btn-stop').addEventListener('click', stopTimer);
  document.getElementById('btn-reset').addEventListener('click', resetTimer);

  // Change Pomodoro Time — Apply button and Enter key in the input
  document.getElementById('btn-apply-duration').addEventListener('click', applyDuration);
  document.getElementById('duration-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') applyDuration();
  });

  // Bonus — name editor
  document.getElementById('btn-edit-name').addEventListener('click', openNameEditor);
  document.getElementById('btn-save-name').addEventListener('click', saveName);
  document.getElementById('btn-cancel-name').addEventListener('click', cancelName);
  document.getElementById('name-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter')  saveName();
    if (e.key === 'Escape') cancelName();
  });

  // Delegated listener on #task-list
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

  // Delegated listener on #links-list
  document.getElementById('links-list').addEventListener('click', function (event) {
    var deleteBtn = event.target.closest('.link-delete-btn');
    if (deleteBtn) {
      event.preventDefault();
      event.stopPropagation();
      deleteLink(deleteBtn.dataset.id);
    }
  });

  initSortButtons();
}

// ============================================================
// Initialization (Task 6)
// ============================================================

function init() {
  loadFromStorage();       // loads tasks, links, theme, userName, timerDurationMinutes
  applyTheme(currentTheme);
  renderTasks();
  renderLinks();
  renderTimerDisplay();    // timerSeconds is already set by loadFromStorage
  updateGreeting();
  setInterval(updateGreeting, 60000);
  updateTimerButtons();
  updateNameUI();
  syncDurationInput();     // keep the number input in sync with the loaded duration
  attachEventListeners();
}

document.addEventListener('DOMContentLoaded', init);
