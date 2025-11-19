(function () {
  const THEME_ID = 'gitstyles-theme';


  function applyTheme(themeName) {
    const existingLink = document.getElementById(THEME_ID);

    if (themeName && themeName !== 'default') {
      const themeFile = `styles/${themeName}.css`;

      if (existingLink) {
        // If the theme file is different, update it
        if (!existingLink.href.includes(themeFile)) {
          existingLink.href = chrome.runtime.getURL(themeFile);
        }
      } else {
        const link = document.createElement('link');
        link.href = chrome.runtime.getURL(themeFile);
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
