/* Parent support is separate from gameplay and never reads player storage. */
(() => {
  'use strict';
  const panel = document.getElementById('panel');
  if (!panel) return;
  const mount = () => {
    const adults = panel.querySelector('.menu-adults');
    if (!adults || adults.querySelector('#lumi-parent-help')) return;
    const summary = adults.querySelector('summary');
    if (summary) summary.textContent = 'Для взрослых · словарь, голос и помощь';
    const link = document.createElement('a');
    link.id = 'lumi-parent-help';
    link.href = 'help.html';
    link.textContent = 'Помощь и обратная связь';
    link.style.cssText = 'display:flex;align-items:center;justify-content:center;min-height:48px;margin:12px 0;padding:12px 14px;border-radius:16px;background:#dfe8d4;color:#174b45;font:700 17px/1.4 system-ui,sans-serif;text-align:center;text-underline-offset:4px';
    adults.append(link);
  };
  mount();
  new MutationObserver(mount).observe(panel, {childList: true, subtree: true});
})();
