// ===== Storage helpers =====
const STORAGE_KEY = "todo_tasks_v1";

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ===== DOM =====
const form = document.getElementById("form");
const input = document.getElementById("taskInput");
const listEl = document.getElementById("taskList");
const emptyEl = document.getElementById("emptyState");
const counterEl = document.getElementById("counter");
const clearDoneBtn = document.getElementById("clearDone");
const clearAllBtn = document.getElementById("clearAll");
const filterBtns = document.querySelectorAll("[data-filter]");

// ===== State =====
let tasks = loadTasks(); // { id, text, done, createdAt }
let filter = "all";

// ===== Utils =====
function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function getFilteredTasks() {
  if (filter === "open") return tasks.filter(t => !t.done);
  if (filter === "done") return tasks.filter(t => t.done);
  return tasks;
}

function updateCounter() {
  const openCount = tasks.filter(t => !t.done).length;
  const total = tasks.length;
  counterEl.textContent = `${openCount} abertas / ${total} total`;
}

function setEmptyState() {
  const visible = getFilteredTasks().length === 0;
  emptyEl.style.display = visible ? "block" : "none";
}

// ===== Render =====
function render() {
  const visibleTasks = getFilteredTasks();
  listEl.innerHTML = "";

  visibleTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `item ${task.done ? "done" : ""}`;

    // checkbox
    const check = document.createElement("button");
    check.className = "check";
    check.type = "button";
    check.title = "Concluir/Desfazer";
    check.innerHTML = "<span>✓</span>";
    check.addEventListener("click", () => toggleTask(task.id));

    // text
    const text = document.createElement("div");
    text.className = "text";
    text.textContent = task.text;
    text.title = "Clique para editar";
    text.addEventListener("click", () => startEdit(task.id));

    // right buttons
    const right = document.createElement("div");
    right.className = "right";

    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn";
    editBtn.type = "button";
    editBtn.textContent = "Editar";
    editBtn.addEventListener("click", () => startEdit(task.id));

    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn delete";
    delBtn.type = "button";
    delBtn.textContent = "Excluir";
    delBtn.addEventListener("click", () => deleteTask(task.id));

    right.appendChild(editBtn);
    right.appendChild(delBtn);

    li.appendChild(check);
    li.appendChild(text);
    li.appendChild(right);

    listEl.appendChild(li);
  });

  saveTasks(tasks);
  updateCounter();
  setEmptyState();
}

// ===== Actions =====
function addTask(text) {
  const clean = text.trim();
  if (!clean) return;

  tasks.unshift({
    id: uid(),
    text: clean,
    done: false,
    createdAt: Date.now()
  });

  render();
}

function toggleTask(id) {
  tasks = tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t));
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  render();
}

function clearDone() {
  tasks = tasks.filter(t => !t.done);
  render();
}

function clearAll() {
  tasks = [];
  render();
}

// ===== Edit =====
function startEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newText = prompt("Editar tarefa:", task.text);
  if (newText === null) return; // cancelou

  const clean = newText.trim();
  if (!clean) return;

  tasks = tasks.map(t => (t.id === id ? { ...t, text: clean } : t));
  render();
}

// ===== Events =====
form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask(input.value);
  input.value = "";
  input.focus();
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Escape") input.value = "";
});

clearDoneBtn.addEventListener("click", clearDone);
clearAllBtn.addEventListener("click", clearAll);

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;

    filterBtns.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    render();
  });
});

// init
render();
