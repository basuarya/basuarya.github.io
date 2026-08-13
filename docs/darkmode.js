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

  function syncHomepageIntroCopy() {
    const path = window.location.pathname.replace(/\/+$/, '/');
    const isHomepage = path === '/' || path.endsWith('/index.html');
    if (!isHomepage) return;

    const main = document.getElementById('quarto-document-content');
    if (!main) return;

    const introParagraphs = Array.from(main.children).filter((element) => element.tagName === 'P').slice(0, 3);
    if (introParagraphs.length < 3) return;

    const hasOldIntro = introParagraphs[0].textContent.includes('innovative researcher and thought leader');
    if (!hasOldIntro) return;

    introParagraphs[0].textContent = 'Dr. Aryabrata Basu is an Assistant Professor of Computer Science at the University of Arkansas at Little Rock and a research fellow in the Emerging Analytics Center. His research examines how virtual, augmented, and mixed reality systems can support human spatial decision-making, training, and collaboration, with careful attention to responsible AI and human-centered design.';
    introParagraphs[1].textContent = 'At UA Little Rock, Dr. Basu leads Spatiotemporality, a research group exploring immersive systems as environments for learning, analysis, and public scholarship. His work brings together VR/AR/XR, human-computer interaction, spatial cognition, and AI policy to ask how emerging technologies can extend human capability while remaining inclusive and accountable.';
    introParagraphs[2].textContent = 'Explore the site for recent news, publications, selected media, and links to academic materials, collaborators, and affiliated research centers.';
  }

  function initialize() {
    setupToggleButton();
    syncHomepageIntroCopy();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
