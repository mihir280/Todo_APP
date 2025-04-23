document.addEventListener('DOMContentLoaded', () => {
  // Initialize the application
  initApp();
  
  // Setup event listeners
  setupEventListeners();
  
  // Set up keyboard accessibility
  setupKeyboardAccessibility();
  
  // Check for offline status
  checkOfflineStatus();
  
  // Update progress bar
  updateProgressBar();
});

// Main initialization function
function initApp() {
  // Initialize theme from localStorage
  initTheme();
  
  // Initialize todo item features
  initTodoItems();
  
  // Check for offline cached todos
  checkOfflineCache();
}

// Initialize theme based on user preference or localStorage
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
    document.body.classList.add('dark-mode');
    updateThemeToggleIcon(true);
  } else {
    document.body.classList.remove('dark-mode');
    updateThemeToggleIcon(false);
  }
}

// Update theme toggle icon based on current theme
function updateThemeToggleIcon(isDark) {
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.innerHTML = isDark ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

// Set up all event listeners for the application
function setupEventListeners() {
  // Theme toggle button
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Todo form submission
  const todoForm = document.querySelector('.add-form');
  if (todoForm) {
    todoForm.addEventListener('submit', handleFormSubmit);
  }
  
  // Priority selection
  const prioritySelectors = document.querySelectorAll('.priority-select');
  prioritySelectors.forEach(selector => {
    selector.addEventListener('change', updatePriority);
  });
  
  // Mark as complete buttons
  const completeButtons = document.querySelectorAll('.btn-complete');
  completeButtons.forEach(btn => {
    btn.addEventListener('click', toggleComplete);
  });
  
  // Due date change
  const dueDateInputs = document.querySelectorAll('.due-date-input');
  dueDateInputs.forEach(input => {
    input.addEventListener('change', updateDueDate);
  });
  
  // Filter options
  const filterOptions = document.querySelectorAll('.filter-option');
  filterOptions.forEach(option => {
    option.addEventListener('click', handleFilterChange);
  });
}

// Toggle between light and dark theme
function toggleTheme() {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  updateThemeToggleIcon(isDarkMode);
}

// Handle the todo form submission
function handleFormSubmit(e) {
  // Get form data
  const todoInput = document.getElementById('newtodo');
  const prioritySelect = document.getElementById('priority');
  const dueDateInput = document.getElementById('due-date');
  
  // Validate input (optional step to prevent empty submissions)
  if (todoInput.value.trim() === '') {
    e.preventDefault();
    todoInput.classList.add('error');
    
    // Add error message if not already present
    let errorMessage = todoInput.parentNode.querySelector('.error-message');
    if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.className = 'error-message';
      errorMessage.textContent = 'Please enter a task';
      todoInput.parentNode.appendChild(errorMessage);
    }
    
    return;
  }
  
  // Remove error class and message if input is valid
  todoInput.classList.remove('error');
  const errorMessage = todoInput.parentNode.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
  
  // Store in local cache before submission
  storeTodoInCache({
    text: todoInput.value,
    priority: prioritySelect ? prioritySelect.value : 'medium',
    dueDate: dueDateInput ? dueDateInput.value : null,
    completed: false,
    timestamp: new Date().toISOString()
  });
}

// Initialize todo items with extra features
function initTodoItems() {
  const todoItems = document.querySelectorAll('.todo-item');
  
  todoItems.forEach(item => {
    // Check due dates and update visual indication
    const dueDate = item.querySelector('.due-date');
    if (dueDate) {
      const date = new Date(dueDate.dataset.date);
      if (date < new Date()) {
        dueDate.classList.add('overdue');
      }
    }
    
    // Check if the item is marked as completed from the server
    if (item.classList.contains('completed')) {
      const todoCheckbox = item.querySelector('.todo-checkbox');
      if (todoCheckbox) {
        todoCheckbox.checked = true;
      }
    }
  });
}

// Toggle the completed state of a todo item
function toggleComplete(e) {
  const todoItem = e.target.closest('.todo-item');
  if (todoItem) {
    todoItem.classList.toggle('completed');
    
    // Send the updated state to the server via fetch API
    const itemId = todoItem.dataset.id;
    const isCompleted = todoItem.classList.contains('completed');
    
    // Update progress bar
    updateProgressBar();
    
    fetch(`/todo/complete/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: isCompleted }),
    })
    .catch(error => {
      console.error('Error updating todo completion status:', error);
      // Revert UI change on error
      todoItem.classList.toggle('completed');
      updateProgressBar();
    });
  }
}

// Update the priority of a todo item
function updatePriority(e) {
  const todoItem = e.target.closest('.todo-item');
  const newPriority = e.target.value;
  
  if (todoItem) {
    // Remove existing priority classes
    todoItem.classList.remove('priority-high', 'priority-medium', 'priority-low');
    // Add new priority class
    todoItem.classList.add(`priority-${newPriority}`);
    
    // Update on server
    const itemId = todoItem.dataset.id;
    
    fetch(`/todo/priority/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priority: newPriority }),
    })
    .catch(error => {
      console.error('Error updating todo priority:', error);
    });
  }
}

// Update the due date of a todo item
function updateDueDate(e) {
  const todoItem = e.target.closest('.todo-item');
  const newDueDate = e.target.value;
  
  if (todoItem) {
    const dueDateDisplay = todoItem.querySelector('.due-date');
    if (dueDateDisplay) {
      dueDateDisplay.textContent = formatDate(newDueDate);
      dueDateDisplay.dataset.date = newDueDate;
      
      // Check if overdue
      const date = new Date(newDueDate);
      dueDateDisplay.classList.toggle('overdue', date < new Date());
    }
    
    // Update on server
    const itemId = todoItem.dataset.id;
    
    fetch(`/todo/duedate/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dueDate: newDueDate }),
    })
    .catch(error => {
      console.error('Error updating todo due date:', error);
    });
  }
}

// Format date for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Offline support with local storage cache
function storeTodoInCache(todo) {
  let cachedTodos = JSON.parse(localStorage.getItem('cachedTodos') || '[]');
  cachedTodos.push(todo);
  localStorage.setItem('cachedTodos', JSON.stringify(cachedTodos));
}

// Check for offline cached todos to sync with server when online
function checkOfflineCache() {
  const cachedTodos = JSON.parse(localStorage.getItem('cachedTodos') || '[]');
  
  if (cachedTodos.length > 0 && navigator.onLine) {
    syncCachedTodos(cachedTodos);
  }
  
  // Listen for online event to sync when connection is restored
  window.addEventListener('online', () => {
    const currentCachedTodos = JSON.parse(localStorage.getItem('cachedTodos') || '[]');
    if (currentCachedTodos.length > 0) {
      syncCachedTodos(currentCachedTodos);
    }
    
    // Hide offline indicator
    const offlineIndicator = document.getElementById('offline-indicator');
    if (offlineIndicator) {
      offlineIndicator.classList.remove('active');
    }
  });
}

// Sync cached todos with the server
function syncCachedTodos(cachedTodos) {
  const promises = cachedTodos.map(todo => 
    fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    })
  );
  
  Promise.allSettled(promises)
    .then(() => {
      // Clear cache after syncing
      localStorage.removeItem('cachedTodos');
      // Reload page to show updated todos
      window.location.reload();
    })
    .catch(error => {
      console.error('Error syncing cached todos:', error);
    });
}

// Add keyboard accessibility
function setupKeyboardAccessibility() {
  const todoItems = document.querySelectorAll('.todo-item');
  
  todoItems.forEach(item => {
    item.setAttribute('tabindex', '0');
    
    item.addEventListener('keydown', (e) => {
      // Enter key to toggle complete
      if (e.key === 'Enter') {
        const completeBtn = item.querySelector('.btn-complete');
        if (completeBtn) {
          completeBtn.click();
        }
      }
      
      // Delete key to delete
      if (e.key === 'Delete') {
        const deleteBtn = item.querySelector('.btn-delete');
        if (deleteBtn) {
          deleteBtn.click();
        }
      }
      
      // E key to edit
      if (e.key === 'e' || e.key === 'E') {
        const editBtn = item.querySelector('.btn-edit');
        if (editBtn) {
          editBtn.click();
        }
      }
    });
  });
}

// Handle filter option change
function handleFilterChange(e) {
  // Remove active class from all options
  document.querySelectorAll('.filter-option').forEach(option => {
    option.classList.remove('active');
  });
  
  // Add active class to clicked option
  e.target.classList.add('active');
  
  // Get filter value
  const filterValue = e.target.dataset.filter;
  
  // Filter todos
  filterTodos(filterValue);
}

// Filter todos based on selected filter
function filterTodos(filter) {
  const todoItems = document.querySelectorAll('.todo-item:not(.empty-list)');
  
  todoItems.forEach(item => {
    // Default show the item
    item.style.display = '';
    
    switch (filter) {
      case 'active':
        if (item.classList.contains('completed')) {
          item.style.display = 'none';
        }
        break;
      case 'completed':
        if (!item.classList.contains('completed')) {
          item.style.display = 'none';
        }
        break;
      case 'high':
        if (!item.classList.contains('priority-high')) {
          item.style.display = 'none';
        }
        break;
      case 'medium':
        if (!item.classList.contains('priority-medium')) {
          item.style.display = 'none';
        }
        break;
      case 'low':
        if (!item.classList.contains('priority-low')) {
          item.style.display = 'none';
        }
        break;
      case 'overdue':
        const dueDate = item.querySelector('.due-date');
        if (!dueDate || !dueDate.classList.contains('overdue')) {
          item.style.display = 'none';
        }
        break;
      case 'all':
      default:
        // Show all items
        break;
    }
  });
}

// Check offline status and show indicator
function checkOfflineStatus() {
  const updateOfflineStatus = () => {
    const offlineIndicator = document.getElementById('offline-indicator');
    if (!navigator.onLine && offlineIndicator) {
      offlineIndicator.classList.add('active');
    } else if (offlineIndicator) {
      offlineIndicator.classList.remove('active');
    }
  };
  
  // Initial check
  updateOfflineStatus();
  
  // Listen for online/offline events
  window.addEventListener('online', updateOfflineStatus);
  window.addEventListener('offline', updateOfflineStatus);
}

// Update progress bar based on completed todos
function updateProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  const todoItems = document.querySelectorAll('.todo-item:not(.empty-list)');
  
  if (progressBar && todoItems.length > 0) {
    const completedItems = document.querySelectorAll('.todo-item.completed').length;
    const percentage = (completedItems / todoItems.length) * 100;
    
    progressBar.style.width = `${percentage}%`;
  }
} 