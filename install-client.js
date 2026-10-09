(() => {
  'use strict';
  let installPrompt = null;
  const installed = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
  });
  const mount = () => {
    const adults = document.querySelector('.menu-adults');
    if (!adults || adults.querySelector('#lumi-install-options')) return;
    const section = document.createElement('details');
    section.id = 'lumi-install-options';
    section.innerHTML = '<summary>Установка и скачивание</summary><div class="actions"><button type="button" id="lumi-install">Установить на телефон</button></div><p id="lumi-install-help" hidden></p><p>На этом устройстве сохраняются звёзды, покупки и дом. Перед сменой телефона скачайте сохранение в разделе «Сменить игрока».</p><p><a href="lumi-offline.zip" download>Скачать копию для компьютера · ZIP</a></p><p><a href="install.html">Установка и перенос сохранения</a></p><p><a href="credits.html">Озвучка, источники и лицензии</a></p>';
    const button = section.querySelector('#lumi-install');
    const help = section.querySelector('#lumi-install-help');
    if (installed()) { button.textContent = 'Игра уже на главном экране'; button.disabled = true; }
    button.onclick = async () => {
      if (installPrompt) {
        const prompt = installPrompt;
        installPrompt = null;
        try { await prompt.prompt(); await prompt.userChoice; } catch { /* Manual instructions remain available. */ }
      }
      if (!installed()) {
        const apple = /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
        help.textContent = apple
          ? 'В Safari нажмите «Поделиться», затем «На экран Домой» и «Добавить». Если игру открыли внутри мессенджера, сначала откройте ссылку в Safari.'
          : 'Откройте меню браузера и выберите «Установить приложение» или «Добавить на главный экран». Если такого пункта нет, игру можно открывать по этой же ссылке.';
        help.hidden = false;
        help.scrollIntoView({block: 'nearest'});
      }
    };
    adults.append(section);
  };
  new MutationObserver(mount).observe(document.getElementById('panel'), {childList: true, subtree: true});
  window.addEventListener('appinstalled', () => {
    const button = document.getElementById('lumi-install');
    if (button) { button.textContent = 'Игра уже на главном экране'; button.disabled = true; }
  });
  mount();
})();
