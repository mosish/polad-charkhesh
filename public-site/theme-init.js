// Run before paint using visitor-local time, not server time.
(function () {
  const root = document.documentElement;
  if (/^\/admin(?:\/|$)/.test(location.pathname)) {
    root.dataset.theme = 'dark';
    return;
  }
  const valid = value => value === 'light' || value === 'dark' ? value : 'auto';
  const saved = () => {
    try { return valid(localStorage.getItem('pc-theme')); } catch { return 'auto'; }
  };
  let preference = saved();
  const refresh = () => {
    const hour = new Date().getHours();
    const theme = preference === 'auto' ? (hour >= 7 && hour < 19 ? 'light' : 'dark') : preference;
    if (root.dataset.theme === theme && root.dataset.themeMode === preference) return;
    root.dataset.theme = theme;
    root.dataset.themeMode = preference;
    window.dispatchEvent(new Event('polad-theme-change'));
  };
  window.poladTheme = {
    setPreference(value) {
      preference = valid(value);
      try { localStorage.setItem('pc-theme', preference); } catch { /* Keep the override for this visit. */ }
      refresh();
    },
    refresh,
  };
  window.addEventListener('storage', event => {
    if (event.key === 'pc-theme' || event.key === null) { preference = saved(); refresh(); }
  });
  window.addEventListener('focus', refresh);
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', refresh);
  const schedule = () => {
    window.setTimeout(() => { refresh(); schedule(); }, 60000 - Date.now() % 60000);
  };
  refresh();
  schedule();
}());
