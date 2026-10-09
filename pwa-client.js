/* Installation and update UI are kept outside the gameplay bundle. */
(() => {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  let waitingWorker = null, reloadPending = false, applying = false;
  let previousController = navigator.serviceWorker.controller;
  const notice = document.createElement('button');
  notice.id = 'lumi-update';
  notice.hidden = true;
  notice.type = 'button';
  notice.textContent = 'Обновить игру · баллы и покупки сохранятся';
  notice.style.cssText = 'width:100%;margin:0 0 12px;padding:12px;border-radius:14px;background:#fff9e8;color:#174b45;border:2px solid #286c65;font:600 15px sans-serif';
  const panel = document.getElementById('panel');
  // The current screens save before opening. Gates and pause are not update points.
  const safeToUpdate = () => !!document.querySelector('#language-select,.finish-heading,#homebuttons,#housecards');
  const refresh = () => {
    notice.hidden = !(waitingWorker || reloadPending) || !safeToUpdate();
    notice.disabled = applying;
    // The game replaces panel contents on navigation; mount once after each render.
    if (!notice.hidden && notice.parentElement !== panel) panel.prepend(notice);
  };
  new MutationObserver(refresh).observe(panel, {childList: true, subtree: true});
  notice.onclick = async () => {
    if (applying || !safeToUpdate()) return;
    applying = true;
    refresh();
    // Allow the existing autosave to persist the current safe screen's state.
    await new Promise(resolve => setTimeout(resolve, 450));
    if (!safeToUpdate()) { applying = false; refresh(); return; }
    if (waitingWorker) waitingWorker.postMessage('activate');
    else if (reloadPending) location.reload();
    else { applying = false; refresh(); }
  };
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const hadController = !!previousController;
    previousController = navigator.serviceWorker.controller;
    if (!hadController) return; // First installation needs no reload.
    waitingWorker = null;
    reloadPending = true;
    if (applying && safeToUpdate()) location.reload();
    else { applying = false; refresh(); }
  });
  navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'}).then(registration => {
    const ready = worker => {
      if (worker && navigator.serviceWorker.controller) { waitingWorker = worker; refresh(); }
    };
    ready(registration.waiting);
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => { if (worker.state === 'installed') ready(worker); });
    });
    registration.update().catch(() => {});
  }).catch(error => console.warn('Offline installation unavailable:', error.message));
})();
