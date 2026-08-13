// Dark Mode Toggle Script
(function() {
  const DARK_MODE_KEY = 'spatio-temporal-basu-dark-mode';
  
  function enableDarkMode() {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
    document.body.style.backgroundColor = '#1a1a1a';
    document.body.style.color = '#e0e0e0';
    localStorage.setItem(DARK_MODE_KEY, 'enabled');
    updateToggleButton();
  }
  
  function disableDarkMode() {
    document.documentElement.classList.remove('dark-mode');
    document.body.classList.remove('dark-mode');
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#1a1a1a';
    localStorage.setItem(DARK_MODE_KEY, 'disabled');
    updateToggleButton();
  }
  
  function updateToggleButton() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
      const isDark = document.body.classList.contains('dark-mode');
      toggle.textContent = isDark ? '☀️' : '🌙';
    }
  }
  
  function setupToggleButton() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
      toggle.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (document.body.classList.contains('dark-mode')) {
          disableDarkMode();
        } else {
          enableDarkMode();
        }
      };
    }
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupToggleButton);
  } else {
    setupToggleButton();
  }
})();
