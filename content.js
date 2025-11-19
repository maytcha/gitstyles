(function() {
  const THEME_ID = 'gitstyles-theme';
  const THEME_FILE = 'styles/maytcha.css';

  function applyTheme(themeName) {
    const existingLink = document.getElementById(THEME_ID);
    if (themeName === 'maytcha') {
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = chrome.runtime.getURL(THEME_FILE);
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.id = THEME_ID;
        document.head.appendChild(link);
      }
    } else {
      if (existingLink) {
        existingLink.remove();
      }
    }
  }

  // Initial load
  chrome.storage.local.get(['theme'], (result) => {
    applyTheme(result.theme);
  });

  // Listen for changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.theme) {
      applyTheme(changes.theme.newValue);
    }
  });
})();
