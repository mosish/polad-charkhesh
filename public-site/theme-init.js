// Run before the stylesheet paints. Keep the established dark design as default.
(function () {
  let theme = 'dark';
  if (!/^\/admin(?:\/|$)/.test(location.pathname)) {
    try { if (localStorage.getItem('pc-theme') === 'light') theme = 'light'; } catch { /* Storage is optional. */ }
  }
  document.documentElement.dataset.theme = theme;
}());
