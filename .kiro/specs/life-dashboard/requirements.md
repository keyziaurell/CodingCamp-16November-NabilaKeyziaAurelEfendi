# Requirements Document

## Introduction

The To-Do List Life Dashboard Website is a single-page, browser-based productivity dashboard built with Vanilla JavaScript. It combines a greeting widget (time, date, and time-based greeting), a Pomodoro focus timer, a full-featured to-do list, and a quick links manager — all persisted via Local Storage. The project uses no external frameworks or build tools, making it simple, portable, and beginner-friendly.

## Glossary

- **System**: The browser-based Life Dashboard application.
- **Timer**: The 25-minute Pomodoro countdown component displayed on the dashboard.
- **Task**: A single to-do item added by the user, with a description and a completion status.
- **Quick Link**: A named URL shortcut button stored in the Quick Links section.
- **Local Storage**: The browser's Web Storage API used as the sole persistence mechanism.
- **Stopped state**: The timer state in which the countdown is not actively decrementing.
- **Running state**: The timer state in which the countdown is actively decrementing every second.
- **Light theme**: The default visual theme using light background colors.
- **Dark theme**: An alternative visual theme using dark background colors.

## Requirements

### Requirement 1: Greeting Widget — Time & Date Display

**User Story:** As a user, I want to see the current time and date on the dashboard, so that I am always aware of the current moment without checking another app.

#### Acceptance Criteria

1. WHEN the page loads, THE system SHALL display the current time in 24-hour HH:MM format (e.g., 14:05).
2. WHILE the page is open, THE system SHALL update the displayed time every 60 seconds.
3. WHEN the page loads, THE system SHALL display the full current date (e.g., Thursday, November 19, 2026).

---

### Requirement 2: Greeting Widget — Time-Based Greeting

**User Story:** As a user, I want to see a greeting that reflects the time of day, so that the dashboard feels personal and contextually relevant.

#### Acceptance Criteria

1. WHEN the current time is between 05:00 and 11:59, THE system SHALL display "Good Morning".
2. WHEN the current time is between 12:00 and 17:59, THE system SHALL display "Good Afternoon".
3. WHEN the current time is between 18:00 and 20:59, THE system SHALL display "Good Evening".
4. WHEN the current time is between 21:00 and 04:59, THE system SHALL display "Good Night".
5. WHEN the time crosses a boundary (e.g., 11:59 → 12:00), THE system SHALL update the greeting on the next 60-second tick.

---

### Requirement 3: Focus Timer — Display & Behavior

**User Story:** As a user, I want a 25-minute countdown timer, so that I can use the Pomodoro technique to stay focused.

#### Acceptance Criteria

1. WHEN the page loads, THE system SHALL initialize the timer at 25:00 (MM:SS format).
2. WHILE the timer is running, THE system SHALL decrement the display by one second each second.
3. WHEN the timer reaches 00:00, THE system SHALL stop automatically without going below 00:00.
4. **Correctness Property — Timer Invariant:** AT ALL TIMES, the displayed timer value SHALL be between 00:00 and 25:00 inclusive.

---

### Requirement 4: Focus Timer — Controls

**User Story:** As a user, I want Start, Stop, and Reset controls for the timer, so that I can manage my focus sessions flexibly.

#### Acceptance Criteria

1. WHEN the timer is in the Stopped state, THE system SHALL enable the Start button and disable the Stop button.
2. WHEN the timer is in the Running state, THE system SHALL enable the Stop button and disable the Start button.
3. WHEN the user clicks Reset, THE system SHALL reset the timer to 25:00 and set state to Stopped.
4. WHEN the timer reaches 00:00, THE system SHALL transition to the Stopped state.

---

### Requirement 5: To-Do List — Add Tasks

**User Story:** As a user, I want to add tasks to my to-do list, so that I can track what I need to accomplish.

#### Acceptance Criteria

1. WHEN the user submits a non-empty task description, THE system SHALL add it to the task list.
2. WHEN the user submits the task (via button click or Enter key), THE system SHALL clear the input field.
3. IF the user submits an empty or whitespace-only input, THE system SHALL reject the input and display a validation message.

---

### Requirement 6: To-Do List — Edit Tasks

**User Story:** As a user, I want to edit existing task descriptions, so that I can correct mistakes or update task details.

#### Acceptance Criteria

1. WHEN the user activates the edit action on a task, THE system SHALL allow inline editing of that task's description.
2. WHEN the user saves an edit with a non-empty value, THE system SHALL update the task description.
3. IF the user saves an edit with an empty or whitespace-only value, THE system SHALL reject the edit and restore the original description.
4. WHEN the user saves an edited task description, IF the new description matches any other existing task description (case-insensitive, trimmed), THE system SHALL reject the edit and display a duplicate warning message. The task being edited is excluded from the duplicate check.

---

### Requirement 7: To-Do List — Complete & Delete

**User Story:** As a user, I want to mark tasks as done and delete tasks, so that I can manage the state and size of my list.

#### Acceptance Criteria

1. WHEN the user marks a task as complete, THE system SHALL apply a visual strikethrough or equivalent style to the task description.
2. WHEN the user marks a completed task as incomplete, THE system SHALL remove the strikethrough style.
3. WHEN the user deletes a task, THE system SHALL permanently remove it from the list.

---

### Requirement 8: To-Do List — Persistence

**User Story:** As a user, I want my tasks to be saved automatically, so that my list is not lost when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN the task list changes (add, edit, complete, delete), THE system SHALL save the updated list to Local Storage.
2. WHEN the page loads, THE system SHALL retrieve and render any tasks previously saved to Local Storage.
3. IF Local Storage contains no task data or malformed data, THE system SHALL initialize with an empty task list.
4. **Correctness Property — Round-Trip Persistence:** FOR ANY set of tasks saved to Local Storage, WHEN the page is reloaded, THE system SHALL render exactly those tasks with their original descriptions and completion statuses.

---

### Requirement 9: To-Do List — Prevent Duplicate Tasks

**User Story:** As a user, I want the system to prevent duplicate task descriptions, so that my list stays clean and unambiguous.

#### Acceptance Criteria

1. WHEN the user attempts to add a task, IF a task with the same description already exists in the list (case-insensitive, trimmed), THE system SHALL reject the input and display a duplicate warning message.
2. The duplicate check SHALL apply to both active (incomplete) and completed tasks.
3. WHEN the user saves an edited task description, IF the new description matches any other existing task description (case-insensitive, trimmed), THE system SHALL reject the edit and display a duplicate warning message. The task being edited is excluded from the duplicate check.
4. **Correctness Property — Duplicate Invariant:** AT ALL TIMES, no two tasks in the list SHALL share the same description (case-insensitive, trimmed).

---

### Requirement 10: To-Do List — Sort Tasks

**User Story:** As a user, I want to sort my tasks, so that I can view them in the order most useful to me.

#### Acceptance Criteria

1. THE system SHALL provide at least three sort options: creation order (default), alphabetical (A–Z), and completion status (incomplete first).
2. WHEN sorting by completion status, tasks with the same completion status SHALL retain their original creation order relative to each other.
3. WHEN the user selects a sort option, THE system SHALL reorder the visible task list accordingly.
4. The sort SHALL be a view-only operation: THE system SHALL NOT mutate or rewrite the stored task order in Local Storage when a sort is applied.
5. THE system SHALL visually indicate the currently active sort option.

---

### Requirement 11: Quick Links — Add & Open

**User Story:** As a user, I want to add quick-access link buttons for my favorite websites, so that I can navigate to them in one click.

#### Acceptance Criteria

1. WHEN the user submits a name and URL, THE system SHALL add a link button to the Quick Links section.
2. WHEN the user clicks a Quick Link button, THE system SHALL open the target URL in a new browser tab.
3. IF the submitted URL does not begin with "http://" or "https://", THE system SHALL prepend "https://" automatically.
4. IF the submitted URL is not a valid URL format after normalization, THE system SHALL reject the input and display a validation message.
5. IF the submitted name is empty or whitespace-only, THE system SHALL reject the input and display a validation message.

---

### Requirement 12: Quick Links — Delete & Persistence

**User Story:** As a user, I want to delete quick links and have them persist across sessions, so that my link collection is always up to date.

#### Acceptance Criteria

1. WHEN the user deletes a Quick Link, THE system SHALL permanently remove it from the list.
2. WHEN the Quick Links list changes (add, delete), THE system SHALL save the updated list to Local Storage.
3. WHEN the page loads, THE system SHALL retrieve and render any Quick Links previously saved to Local Storage.
4. IF Local Storage contains no Quick Links data or malformed data, THE system SHALL initialize with an empty Quick Links list.
5. **Correctness Property — Round-Trip Persistence:** FOR ANY set of Quick Links saved to Local Storage, WHEN the page is reloaded, THE system SHALL render exactly those links with their original names and URLs.

---

### Requirement 13: Light / Dark Mode

**User Story:** As a user, I want to switch between a light theme and a dark theme, so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE system SHALL provide a clearly visible toggle control (button or switch) to switch between light and dark themes.
2. WHEN the user activates the theme toggle, THE system SHALL switch the active theme between light and dark.
3. ALL sections (Greeting, Focus Timer, To-Do List, Quick Links) SHALL update their colors and styles when the theme changes.
4. WHEN the page loads, THE system SHALL apply the last saved theme from Local Storage. IF no theme is saved, THE system SHALL default to the light theme.
5. **Correctness Property — Theme Persistence Invariant:** AT ALL TIMES, the theme stored in Local Storage SHALL match the theme currently rendered on the page.

---

### Requirement 14: Technical Constraints

**User Story:** As a developer, I want the project to follow a strict, minimal file structure using only Vanilla JavaScript, so that the codebase is simple, portable, and beginner-friendly.

#### Acceptance Criteria

1. THE system SHALL be built using only HTML, CSS, and Vanilla JavaScript — no external frameworks, libraries, or build tools.
2. THE system SHALL consist of exactly one HTML file (index.html), exactly one CSS file inside the css/ directory, and exactly one JavaScript file inside the js/ directory.
3. THE system SHALL use the browser Local Storage API as the sole persistence mechanism — no backend server, database, or network requests after initial page load.
4. THE system SHALL function correctly in modern versions of Chrome, Firefox, Edge, and Safari.
5. No test framework or test setup is required. The project SHALL run without any build step or configuration.

---

### Requirement 15: Non-Functional Requirements

**User Story:** As a user, I want the dashboard to feel fast, clean, and easy to use, so that it doesn't get in the way of my productivity.

#### Acceptance Criteria

1. THE system SHALL load and render fully without any perceptible delay on a modern device.
2. UI interactions (adding tasks, toggling theme, starting timer) SHALL feel immediately responsive with no noticeable lag.
3. THE system SHALL present a clean, minimal interface with clear visual hierarchy.
4. THE system SHALL use readable typography with sufficient contrast in both light and dark themes.
5. THE layout SHALL be usable on screen widths from 320px to 1920px.
