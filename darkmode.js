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
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      toggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }

  function setupToggleButton() {
    let toggle = document.getElementById('dark-mode-toggle');
    const search = document.getElementById('quarto-search');

    if (!toggle && search?.parentNode) {
      toggle = document.createElement('button');
      toggle.id = 'dark-mode-toggle';
      toggle.type = 'button';
      toggle.className = 'btn btn-link navbar-dark-toggle';
      search.parentNode.insertBefore(toggle, search);
    }

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

  function restoreSavedPreference() {
    if (localStorage.getItem(DARK_MODE_KEY) === 'enabled') {
      enableDarkMode();
    } else {
      updateToggleButton();
    }
  }

  function initialize() {
    setupToggleButton();
    restoreSavedPreference();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
