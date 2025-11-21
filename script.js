let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let darkMode = true;
let editIndex = null;
const taskInput = document.getElementById('taskInput');
const priceInput = document.getElementById('priceInput');
const addBtn = document.getElementById('addBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const totalTasksEl = document.getElementById('totalTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const completedTasksEl = document.getElementById('completedTasks');
const totalPriceEl = document.getElementById('totalPrice');
const completedTotalEl = document.getElementById('completedTotal');
const completedTotalValueEl = document.getElementById('completedTotalValue');

function save(){ 
  localStorage.setItem("tasks", JSON.stringify(tasks)); 
  updateStats();
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.done).length;
  const pending = total - completed;
  const totalPrice = tasks.reduce((sum, task) => sum + (task.price || 0), 0);
  const completedTotal = tasks
    .filter(t => t.done)
    .reduce((sum, task) => sum + (task.price || 0), 0);
  
  totalTasksEl.textContent = total;
  pendingTasksEl.textContent = pending;
  completedTasksEl.textContent = completed;
  totalPriceEl.textContent = `RS: ${totalPrice.toLocaleString()}`;
  
  // Show/hide completed total
  if (completed > 0) {
    completedTotalEl.style.display = 'block';
    completedTotalValueEl.textContent = completedTotal.toLocaleString();
  } else {
    completedTotalEl.style.display = 'none';
  }

  // Show/hide clear all button
  if (total > 0) {
    clearAllBtn.style.display = 'flex';
  } else {
    clearAllBtn.style.display = 'none';
  }
}

function render(){
  const taskList = document.getElementById("taskList");
  const completedList = document.getElementById("completedList");
  taskList.innerHTML = "";
  completedList.innerHTML = "";
  
  let pendingExists = false;
  let completedExists = false;

  tasks.forEach((t, i) => {
    const div = document.createElement("div");
    div.className = "task";
    
    const priceDisplay = t.price ? `<span class="task-price">₨${t.price.toLocaleString()}</span>` : '';
    
    if(!t.done){
      div.innerHTML = `
        <div class="task-content">
          <input type='checkbox' onchange='toggleDone(${i})' />
          <span class="task-text">${t.text} ${priceDisplay}</span>
        </div>
        <div class='actions'>
          <button class='edit-btn' onclick='editTask(${i})'>
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class='delete-btn' onclick='removeTask(${i})'>
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>`;
      taskList.appendChild(div);
      pendingExists = true;
    } else {
      div.innerHTML = `
        <div class="task-content">
          <span class="task-text completed">${t.text} ${priceDisplay}</span>
        </div>
        <div class='actions'>
          <button class='uncheck-btn' onclick='uncheck(${i})'>
            <i class="fas fa-undo"></i> Undo
          </button>
          <button class='delete-btn' onclick='removeTask(${i})'>
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>`;
      completedList.appendChild(div);
      completedExists = true;
    }
  });

  // Show empty states if no tasks
  if (!pendingExists) {
    taskList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <p>No tasks yet. Add one above!</p>
      </div>`;
  }
  
  if (!completedExists) {
    completedList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-check-circle"></i>
        <p>No completed tasks yet.</p>
      </div>`;
  }
  
  updateStats();
}

function addTask(){
  const value = taskInput.value.trim();
  const price = parseFloat(priceInput.value) || 0;
  
  if(!value) {
    // Add shake animation to input
    taskInput.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
      taskInput.style.animation = '';
    }, 500);
    return;
  }
  
  if(editIndex !== null){
    tasks[editIndex].text = value;
    tasks[editIndex].price = price;
    editIndex = null;
    addBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
  } else {
    tasks.push({text: value, price: price, done: false});
  }
  
  taskInput.value = '';
  priceInput.value = '';
  save();
  render();
}

function toggleDone(i){ 
  tasks[i].done = true; 
  save(); 
  render(); 
}

function uncheck(i){ 
  tasks[i].done = false; 
  save(); 
  render(); 
}

function editTask(i){
  taskInput.value = tasks[i].text;
  priceInput.value = tasks[i].price || '';
  taskInput.focus();
  editIndex = i;
  addBtn.innerHTML = '<i class="fas fa-save"></i> Save';
}

function removeTask(i){ 
  // Add fade out animation
  const taskElement = document.querySelectorAll('.task')[i];
  if (taskElement) {
    taskElement.style.transform = 'translateX(100%)';
    taskElement.style.opacity = '0';
    
    setTimeout(() => {
      tasks.splice(i, 1); 
      save(); 
      render(); 
      if(editIndex === i){ 
        editIndex = null; 
        taskInput.value = ''; 
        priceInput.value = '';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add'; 
      }
    }, 300);
  } else {
    tasks.splice(i, 1); 
    save(); 
    render(); 
    if(editIndex === i){ 
      editIndex = null; 
      taskInput.value = ''; 
      priceInput.value = '';
      addBtn.innerHTML = '<i class="fas fa-plus"></i> Add'; 
    }
  }
}

function clearAllTasks() {
  if (tasks.length === 0) return;
  
  if (confirm("Are you sure you want to delete all tasks? This action cannot be undone.")) {
    // Add fade out animation to all tasks
    const allTasks = document.querySelectorAll('.task');
    allTasks.forEach((task, index) => {
      setTimeout(() => {
        task.style.transform = 'translateX(-100%)';
        task.style.opacity = '0';
      }, index * 100);
    });
    
    setTimeout(() => {
      tasks = [];
      save();
      render();
    }, allTasks.length * 100 + 300);
  }
}

function toggleTheme(){
  const body = document.body;
  const container = document.getElementById('mainContainer');
  body.classList.toggle('light-theme');
  darkMode = !darkMode;
  
  // Add theme transition animation
  container.style.transform = 'scale(0.98)';
  setTimeout(() => {
    container.style.transform = 'scale(1)';
  }, 300);
}

// Add shake animation for empty input
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);

// Allow adding tasks with Enter key
taskInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    addTask();
  }
});

priceInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    addTask();
  }
});

// Initial render
render();