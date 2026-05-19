(() => {
const themeQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

function getThemePreference() {
  const theme = localStorage.getItem('theme');
  return ['light', 'dark', 'system'].includes(theme) ? theme : 'system';
}

function getSystemTheme() {
  return themeQuery && themeQuery.matches ? 'dark' : 'light';
}

function applyThemePreference(preference) {
  const resolvedTheme = preference === 'system' ? getSystemTheme() : preference;

  document.documentElement.setAttribute('data-theme-preference', preference);
  document.documentElement.toggleAttribute('data-dark-mode', resolvedTheme === 'dark');
}

applyThemePreference(getThemePreference());
})();
