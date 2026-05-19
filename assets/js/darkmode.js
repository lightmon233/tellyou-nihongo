(() => {
const mode = document.getElementById('mode');
const themeQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
const themeCycle = ['system', 'dark', 'light'];

function getThemePreference() {
  const theme = localStorage.getItem('theme');
  return themeCycle.includes(theme) ? theme : 'system';
}

function getSystemTheme() {
  return themeQuery && themeQuery.matches ? 'dark' : 'light';
}

function applyThemePreference(preference) {
  const resolvedTheme = preference === 'system' ? getSystemTheme() : preference;

  document.documentElement.setAttribute('data-theme-preference', preference);
  document.documentElement.toggleAttribute('data-dark-mode', resolvedTheme === 'dark');

  if (mode) {
    const nextPreference = themeCycle[(themeCycle.indexOf(preference) + 1) % themeCycle.length];
    const label = `Theme: ${preference}. Click to switch to ${nextPreference}.`;

    mode.setAttribute('aria-label', label);
    mode.setAttribute('title', label);
  }
}

if (mode) {

  if (themeQuery) {
    themeQuery.addEventListener('change', () => {

      if (getThemePreference() === 'system') {

        applyThemePreference('system');

      }

    });
  }

  mode.addEventListener('click', () => {

    const currentPreference = getThemePreference();
    const nextPreference = themeCycle[(themeCycle.indexOf(currentPreference) + 1) % themeCycle.length];

    localStorage.setItem('theme', nextPreference);
    applyThemePreference(nextPreference);

  });

  applyThemePreference(getThemePreference());

}
})();
