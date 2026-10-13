(() => {
  'use strict';
  const core = window.LumiAndroidSaveTransfer;
  const $ = id => document.getElementById(id);
  const localApp = location.origin === 'https://appassets.androidplatform.net' &&
    location.pathname === '/assets/lumi/progress.html' && window === window.top;
  const exportOnly = !localApp;
  const native = localApp &&
    typeof window.LumiFileBridge?.postMessage === 'function';
  const names = {kbd:'Кабардинский',krc:'Балкарский',ce:'Чеченский',os:'Осетинский',ab:'Абхазский',abq:'Абазинский',av:'Аварский'};
  const pending = new Map();
  let prepared = null, generation = 0, busy = false;
  function status(message, error = false) {
    $('status').textContent = message;
    $('status').dataset.error = String(error);
  }
  function friendly(error) {
    const messages = {
      'empty-save':'На этом устройстве пока нет сохранения. Откройте игру в том же браузере, где играли.',
      'invalid-json':'Файл не похож на сохранение Луми. Выберите файл «lumi-save.json».',
      'invalid-save':'Не удалось проверить сохранение. Местный прогресс не изменён.',
      'incomplete-active-save':'Текущий игрок в файле содержит неполный прогресс. Местное сохранение не изменено.',
      'incomplete-playable-profile':'В файле есть неполный игровой профиль. Сохраните исходную копию; местный прогресс не изменён.',
      'unsafe-save-key':'В файле есть недопустимые поля. Местный прогресс не изменён.',
      'save-too-large':'Файл слишком большой. Максимальный размер — 2 МБ.',
      'save-too-complex':'Содержимое файла слишком сложное для безопасной проверки.',
      'future-save-version':'Файл создан более новой версией Луми. Обновите приложение; сохранение не изменено.',
      'future-current-version':'Местный прогресс создан более новой версией. Обновите приложение перед переносом.',
      'invalid-current-save':'Местную копию не удалось проверить. Она сохранена без изменений; не очищайте данные игры.',
      'storage-unavailable':'Хранение данных недоступно. Сохраните исходный файл и откройте игру в обычном браузере.',
      'destination-changed':'Местный прогресс изменился. Закройте другие окна игры и выберите файл снова.',
      'backup-storage-failed':'Не хватило места для резервной копии. Местный прогресс не изменён. Сначала скачайте его отдельно.',
      'backup-verification-failed':'Резервную копию не удалось проверить. Местный прогресс не изменён.',
      'commit-failed-restored':'Не удалось завершить перенос. Прежнее сохранение восстановлено.',
      'commit-failed-backup-retained':'Не удалось завершить перенос. Резервные копии сохранены; не очищайте данные приложения.',
      'invalid-backup':'Резервную копию не удалось проверить. Местный прогресс не изменён.',
      'invalid-encoding':'Файл имеет неподдерживаемую кодировку. Выберите исходный файл «lumi-save.json».',
      'cancelled':'Выбор файла отменён. Прогресс не изменён.',
      'file-unavailable':'Файл не удалось открыть или записать. Прогресс не изменён.',
      'native-timeout':'Результат выбора файла не получен. Проверьте выбранную папку и сохраните исходный файл.',
      'native-unavailable':'Системный модуль Android не поддерживает перенос файлов. Обновите Android System WebView и откройте приложение снова.'
    };
    return messages[error?.code] || 'Не удалось завершить действие. Сохраните исходный файл; местный прогресс не изменён.';
  }
  function nonce() {
    const value = new Uint8Array(16);
    crypto.getRandomValues(value);
    return [...value].map(x => x.toString(16).padStart(2,'0')).join('');
  }
  function ready() { return !busy && !!prepared && $('confirm-replace').checked && $('tabs-closed').checked; }
  function updateButtons() {
    $('export').disabled = busy || (localApp && !native);
    $('choose').disabled = busy;
    $('commit').disabled = !ready();
  }
  function clearPreview() {
    prepared = null; ++generation;
    $('preview').hidden = true;
    $('confirm-replace').checked = false;
    $('tabs-closed').checked = false;
    updateButtons();
  }
  function profiles(target, entries) {
    target.replaceChildren();
    if (!entries.length) {
      const li = document.createElement('li'); li.textContent = 'Сохранённых игроков нет.'; target.append(li); return;
    }
    for (const player of entries) {
      const li = document.createElement('li');
      const modes = player.modes.map(mode => (names[mode.language] || mode.language) +
        (mode.stars === null ? ' · история' : ' · ' + mode.stars + ' ⭐') +
        (mode.purchases === null ? '' : ' · покупок: ' + mode.purchases));
      li.textContent = player.name + (player.active ? ' · текущий игрок' : '') +
        (modes.length ? ': ' + modes.join('; ') : ' · новый профиль');
      target.append(li);
    }
  }
  function showPreview(value) {
    prepared = value;
    profiles($('current-profiles'),value.previousSummary);
    profiles($('incoming-profiles'),value.incomingSummary);
    $('replace-summary').textContent = 'Сейчас игроков: ' + value.destinationProfiles +
      '. После замены: ' + value.sourceProfiles + '.' +
      (value.kind === 'rollback' ? ' Выбрана копия до прежнего переноса.' : '') +
      (value.noop ? ' Эта копия уже сохранена; повторное применение ничего не начислит.' : '');
    $('commit').textContent = value.kind === 'rollback' ? 'Вернуть прежнее сохранение' : 'Заменить сохранение';
    $('confirm-replace').checked = false; $('tabs-closed').checked = false;
    $('preview').hidden = false; updateButtons();
    status('Копия проверена. Сверьте оба списка и подтвердите замену.');
    $('preview').scrollIntoView({block:'nearest'});
  }
  function prepare(raw) {
    if (exportOnly) return;
    clearPreview();
    showPreview(core.prepareReplace(localStorage,raw));
  }
  function requestNative(action, raw) {
    if (!native || pending.size) throw Object.assign(new Error(),{code:'file-unavailable'});
    const id = nonce(), message = {v:1,action,id};
    if (action === 'export') { message.filename = 'lumi-save.json'; message.raw = raw; }
    busy = true; updateButtons();
    return new Promise((resolve,reject) => {
      const timer = setTimeout(() => {
        pending.delete(id); busy = false; updateButtons();
        reject(Object.assign(new Error(),{code:'native-timeout'}));
      },300000);
      pending.set(id,{action,timer,resolve,reject});
      try { window.LumiFileBridge.postMessage(JSON.stringify(message)); }
      catch { clearTimeout(timer);pending.delete(id);busy=false;updateButtons();reject(Object.assign(new Error(),{code:'file-unavailable'})); }
    });
  }
  // Native calls only this public callback. It must not inject script fragments
  // from file text, and JavaScript rejects unsolicited or mismatched replies.
  Object.defineProperty(window,'LumiNativeFiles',{value:Object.freeze({receive(message) {
    if (!native || !message || typeof message !== 'object' || message.v !== 1 ||
      typeof message.id !== 'string' || typeof message.ok !== 'boolean') return;
    const waiting = pending.get(message.id);
    if (!waiting || message.action !== waiting.action) return;
    clearTimeout(waiting.timer); pending.delete(message.id); busy = false; updateButtons();
    if (!message.ok) waiting.reject(Object.assign(new Error(),{code:typeof message.code === 'string' ? message.code : 'file-unavailable'}));
    else if (waiting.action === 'import' && typeof message.raw !== 'string') waiting.reject(Object.assign(new Error(),{code:'invalid-save'}));
    else waiting.resolve(message);
  }}),writable:false,configurable:false});
  async function download(raw) {
    core.parseSave(raw);
    if (localApp && !native) throw Object.assign(new Error(),{code:'native-unavailable'});
    if (native) {
      await requestNative('export',raw);
      status('Запись файла «lumi-save.json» завершена. Сохраните его отдельно от приложения.');
    } else {
      const url = URL.createObjectURL(new Blob([raw],{type:'application/json'}));
      const link = document.createElement('a');link.href=url;link.download='lumi-save.json';link.click();
      setTimeout(() => URL.revokeObjectURL(url),2000);
      status('Скачивание начато. Проверьте файл «lumi-save.json» в загрузках браузера.');
    }
  }
  $('export').onclick = async () => {
    try { await download(localStorage.getItem(core.KEY)); }
    catch (error) { status(friendly(error),true); }
  };
  $('choose').onclick = async () => {
    if (exportOnly) return;
    clearPreview();
    if (!native) { $('file').value='';$('file').click();return; }
    try { const message = await requestNative('import');prepare(message.raw); }
    catch (error) { status(friendly(error),error?.code !== 'cancelled'); }
  };
  $('file').onchange = async () => {
    if (exportOnly) return;
    clearPreview(); const file = $('file').files[0], current = generation;
    if (!file) return;
    $('file').dataset.reading=String(current);
    try {
      if (file.size > core.MAX_BYTES) throw Object.assign(new Error(),{code:'save-too-large'});
      const raw = await file.text();
      if (generation === current) showPreview(core.prepareReplace(localStorage,raw));
    } catch (error) { if (generation === current) status(friendly(error),true); }
    finally { if ($('file').dataset.reading===String(current)) delete $('file').dataset.reading; }
  };
  $('confirm-replace').onchange = $('tabs-closed').onchange = updateButtons;
  $('cancel').onclick = () => {clearPreview();status('Перенос отменён. Местное сохранение не изменено.');};
  $('commit').onclick = async () => {
    if (exportOnly) return;
    if (!ready()) return;
    const value = prepared, current = generation;
    busy = true; updateButtons();
    try {
      const write = () => {
        if (current !== generation || value !== prepared) throw Object.assign(new Error(),{code:'destination-changed'});
        return core.commitReplace(localStorage,value,{id:nonce(),confirmed:true});
      };
      const result = typeof navigator.locks?.request === 'function' ?
        await navigator.locks.request('word-platformer-v2-write',write) : write();
      clearPreview();
      status(result.noop ? 'Эта копия уже сохранена. Игроки, покупки и звёзды не изменились.' :
        'Сохранение заменено и проверено. Можно вернуться в игру. Прежняя копия доступна ниже.');
      renderBackups();
    } catch (error) { clearPreview();status(friendly(error),true);renderBackups(); }
    finally { busy = false;updateButtons(); }
  };
  function renderBackups() {
    if (exportOnly) return;
    try {
      const list=core.listBackups(localStorage);$('backups').hidden=!list.length;$('backup-list').replaceChildren();
      for (const backup of list) {
        const row=document.createElement('div');row.className='backup';
        const label=document.createElement('p');
        label.textContent=new Date(backup.createdAt).toLocaleString('ru-RU') + (backup.hadPrevious ? ' · до переноса' : ' · до первого сохранения');
        row.append(label);
        if (backup.hadPrevious) {
          const save=document.createElement('button');save.type='button';save.className='secondary';save.textContent='Скачать прежнюю копию';
          save.onclick=async()=>{try{await download(core.backupInfo(localStorage,backup.id).before);}catch(error){status(friendly(error),true);}};
          row.append(save);
        }
        const restore=document.createElement('button');restore.type='button';restore.className='secondary';restore.textContent='Проверить и вернуть';
        restore.onclick=()=>{try{if(busy)return;clearPreview();showPreview(core.prepareRollback(localStorage,backup.id));}catch(error){status(friendly(error),true);}};
        row.append(restore);$('backup-list').append(row);
      }
    } catch { /* The export/import action will report storage access errors. */ }
  }
  window.addEventListener('storage',event=>{
    if (event.storageArea===localStorage && (event.key===core.KEY || event.key===null) && prepared) {
      clearPreview();status(friendly({code:'destination-changed'}),true);
    }
  });
  if (!exportOnly) $('import-section').hidden=false;
  if (native) $('source-help').textContent='Файл запишется в выбранную вами папку Android. Для переноса из браузера сначала скачайте копию в старой игре.';
  if (localApp && !native) status(friendly({code:'native-unavailable'}),true);
  if (exportOnly) $('source-help').textContent='Эта страница только скачивает копию. Для загрузки откройте «Сохранение и перенос» в Android-приложении. Прогресс браузера остаётся на прежнем адресе.';
  renderBackups();updateButtons();
})();
