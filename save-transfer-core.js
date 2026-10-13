(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LumiAndroidSaveTransfer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const KEY = 'word-platformer-v2';
  const BACKUP_PREFIX = KEY + '-android-backup-';
  const MAX_BYTES = 2 * 1024 * 1024;
  const LANGUAGES = ['kbd', 'krc', 'ce', 'os', 'ab', 'abq', 'av'];
  const FORBIDDEN = new Set(['__proto__', 'prototype', 'constructor']);
  const own = (v, k) => Object.prototype.hasOwnProperty.call(v, k);
  const record = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const nonnegative = v => Number.isSafeInteger(v) && v >= 0;
  const strings = v => Array.isArray(v) && v.every(x => typeof x === 'string');
  function fail(code) { const error = new Error(code); error.code = code; throw error; }
  function require(ok, code = 'invalid-save') { if (!ok) fail(code); }
  function bytes(raw) { return new TextEncoder().encode(raw).byteLength; }
  function safeTree(value) {
    let count = 0;
    function visit(v, depth) {
      require(depth <= 24 && ++count <= 100000, 'save-too-complex');
      if (typeof v === 'number') require(Number.isFinite(v));
      if (typeof v === 'string') require(v.length <= 65536, 'save-too-complex');
      if (v && typeof v === 'object') {
        require(Object.getPrototypeOf(v) === (Array.isArray(v) ? Array.prototype : Object.prototype));
        for (const [key, child] of Object.entries(v)) {
          require(!FORBIDDEN.has(key), 'unsafe-save-key');
          visit(child, depth + 1);
        }
      }
    }
    visit(value, 0);
  }
  function validateMode(m, mustBePlayable) {
    require(record(m));
    // Inactive profiles/archives can contain older partial modes, even ones
    // with a level. Validate every present recognized field without inventing
    // absent progression. The selected playable mode must be complete.
    if (mustBePlayable) require(['level','gate','phase','x','y','vy','known','review','rewards'].every(k => own(m,k)), 'incomplete-active-save');
    if (m.level !== undefined) require(nonnegative(m.level));
    if (m.gate !== undefined) require(nonnegative(m.gate) && m.gate <= 3);
    if (m.phase !== undefined) require(['run', 'gate', 'finish', 'dead'].includes(m.phase));
    require((m.phase !== 'gate' || m.gate < 3) && (m.phase !== 'finish' || m.gate === 3));
    for (const key of ['x','y','vy']) if (m[key] !== undefined) require(Number.isFinite(m[key]));
    for (const key of ['known', 'review']) if (m[key] !== undefined) require(strings(m[key]));
    for (const key of ['coinKeys', 'purchases', 'creditedGates', 'hiddenDecor'])
      if (m[key] !== undefined) require(strings(m[key]));
    if (m.rewards !== undefined) require(Array.isArray(m.rewards) && m.rewards.every(nonnegative));
    for (const key of ['tokens', 'defeatedMonsters'])
      if (m[key] !== undefined) require(Array.isArray(m[key]) && m[key].every(nonnegative));
    if (m.economy !== undefined) require(record(m.economy) &&
      ['balance', 'answers', 'coins', 'spent'].every(k =>
        (!mustBePlayable && m.economy[k] === undefined) || (Number.isFinite(m.economy[k]) && m.economy[k] >= 0)));
    if (m.question !== null && m.question !== undefined) require(record(m.question) &&
      typeof m.question.id === 'string' && ['learn', 'test'].includes(m.question.stage) && nonnegative(m.question.mistakes));
    for (const key of ['nextCard', 'attemptCard']) if (m[key] !== undefined) require(nonnegative(m[key]));
    if (m.worldTime !== undefined) require(Number.isFinite(m.worldTime) && m.worldTime >= 0);
    if (m.buildings !== undefined) require(record(m.buildings) && Object.entries(m.buildings).every(([id, stage]) =>
      ({cottage: 3, stone: 4, tower: 6}[id] !== undefined) && nonnegative(stage) && stage <= ({cottage: 3, stone: 4, tower: 6}[id])));
    if (m.houseChoice !== undefined) require(['cottage', 'stone', 'tower'].includes(m.houseChoice));
    if (m.decorPositions !== undefined) require(record(m.decorPositions) && Object.values(m.decorPositions).every(pos =>
      record(pos) && Number.isFinite(pos.x) && Number.isFinite(pos.y)));
    if (m.estateWalk !== undefined) require(record(m.estateWalk) && Number.isFinite(m.estateWalk.x) &&
      typeof m.estateWalk.inside === 'boolean' && (m.estateWalk.y === undefined || Number.isFinite(m.estateWalk.y)));
  }
  function parseSave(raw) {
    require(typeof raw === 'string' && raw.length > 0, 'empty-save');
    require(raw.length <= MAX_BYTES && bytes(raw) <= MAX_BYTES, 'save-too-large');
    let data;
    try { data = JSON.parse(raw); } catch { fail('invalid-json'); }
    safeTree(data);
    require(record(data));
    if (Number.isSafeInteger(data.version) && data.version > 2) fail('future-save-version');
    require(data.version === 2 && LANGUAGES.includes(data.lang) && record(data.players));
    const playableLanguage = ['kbd','krc'].includes(data.lang) ? data.lang : 'kbd';
    const ids = Object.keys(data.players);
    require(ids.length > 0 && ids.length <= 100 && typeof data.active === 'string' && own(data.players, data.active));
    for (const [id, p] of Object.entries(data.players)) {
      require(id.length > 0 && id.length <= 256 && record(p) && typeof p.name === 'string' && p.name.length <= 256 && record(p.modes));
      if (p.ageBand !== undefined) require(['under8', '8plus'].includes(p.ageBand));
      for (const [lang, mode] of Object.entries(p.modes)) {
        require(LANGUAGES.includes(lang));
        validateMode(mode, id === data.active && lang === playableLanguage);
      }
    }
    if (data.lumiTransferReceipts !== undefined) {
      require(Array.isArray(data.lumiTransferReceipts) && data.lumiTransferReceipts.length <= 500);
      for (const entry of data.lumiTransferReceipts) require(record(entry) && typeof entry.sourceId === 'string' &&
        entry.sourceId.length <= 256 && record(entry.sourcePlayer) && typeof entry.targetId === 'string' && entry.targetId.length <= 256);
    }
    return data;
  }
  function read(storage, key) {
    try { return storage.getItem(key); } catch { fail('storage-unavailable'); }
  }
  function playableImport(data) {
    for (const player of Object.values(data.players)) for (const [language,mode] of Object.entries(player.modes)) {
      if (!['kbd','krc'].includes(language)) continue;
      try { validateMode(mode,true); }
      catch (error) { if (error.code === 'incomplete-active-save') fail('incomplete-playable-profile');throw error; }
    }
    return data;
  }
  function prepareReplace(storage, incomingRaw) {
    const incoming = playableImport(parseSave(incomingRaw));
    const previousRaw = read(storage, KEY);
    let current = null;
    if (previousRaw !== null) {
      try { current = parseSave(previousRaw); }
      catch (error) { fail(error.code === 'future-save-version' ? 'future-current-version' : 'invalid-current-save'); }
    }
    return {kind:'replace', previousRaw, resultRaw:incomingRaw,
      previousSummary:current ? summary(current) : [], incomingSummary:summary(incoming),
      sourceProfiles:Object.keys(incoming.players).length,
      destinationProfiles:current ? Object.keys(current.players).length : 0,
      noop:previousRaw === incomingRaw};
  }
  function backupKeys(id) {
    require(typeof id === 'string' && /^[a-z0-9-]{8,80}$/.test(id), 'invalid-backup-id');
    const prefix = BACKUP_PREFIX + id;
    return {before:prefix+'-before', incoming:prefix+'-incoming', meta:prefix+'-meta'};
  }
  function backupInfo(storage, id) {
    const keys = backupKeys(id);
    let meta;
    try { meta = JSON.parse(read(storage, keys.meta)); } catch { fail('invalid-backup'); }
    require(record(meta) && meta.format === 'lumi-local-backup-v1' && meta.id === id &&
      typeof meta.createdAt === 'string' && typeof meta.hadPrevious === 'boolean', 'invalid-backup');
    const before = read(storage, keys.before);
    require(meta.hadPrevious ? before !== null : before === null, 'invalid-backup');
    if (before !== null) parseSave(before);
    return {id, createdAt:meta.createdAt, before, keys};
  }
  function prepareRollback(storage, id) {
    const backup = backupInfo(storage, id);
    if (backup.before !== null) playableImport(parseSave(backup.before));
    const previousRaw = read(storage, KEY);
    const current = previousRaw === null ? null : parseSave(previousRaw);
    return {kind:'rollback', backupId:id, previousRaw, resultRaw:backup.before,
      previousSummary:current ? summary(current) : [],
      incomingSummary:backup.before === null ? [] : summary(parseSave(backup.before)),
      sourceProfiles:backup.before === null ? 0 : Object.keys(parseSave(backup.before).players).length,
      destinationProfiles:current ? Object.keys(current.players).length : 0,
      noop:previousRaw === backup.before};
  }
  function commitReplace(storage, prepared, options) {
    require(options && options.confirmed === true, 'confirmation-required');
    const keys = backupKeys(options.id);
    require(record(prepared) && ['replace','rollback'].includes(prepared.kind), 'invalid-preview');
    // Revalidate immutable raw inputs and compare the current destination while
    // the caller holds the shared Web Lock. Never trust mutated preview fields.
    const expected = prepared.kind === 'rollback' ? prepareRollback(storage, prepared.backupId) :
      prepareReplace(storage, prepared.resultRaw);
    require(expected.previousRaw === prepared.previousRaw && expected.resultRaw === prepared.resultRaw, 'destination-changed');
    if (expected.noop) return {noop:true, profiles:expected.sourceProfiles, backupId:null};
    try {
      for (const key of Object.values(keys)) require(read(storage, key) === null, 'backup-id-used');
      for (const [key, raw] of [[keys.before,expected.previousRaw],[keys.incoming,expected.resultRaw]]) {
        if (raw === null) continue;
        storage.setItem(key, raw);
        require(read(storage,key) === raw, 'backup-verification-failed');
      }
      const meta = JSON.stringify({format:'lumi-local-backup-v1',id:options.id,
        createdAt:new Date().toISOString(),hadPrevious:expected.previousRaw !== null});
      storage.setItem(keys.meta, meta);
      require(read(storage,keys.meta) === meta, 'backup-verification-failed');
      require(read(storage,KEY) === expected.previousRaw, 'destination-changed');
    } catch (error) {
      if (error.code) throw error;
      fail('backup-storage-failed');
    }
    try {
      // A localStorage write/removal changes this single document atomically.
      if (expected.resultRaw === null) storage.removeItem(KEY);
      else storage.setItem(KEY, expected.resultRaw);
      require(read(storage,KEY) === expected.resultRaw, 'save-verification-failed');
    } catch (error) {
      let restored = false;
      try {
        const current = read(storage,KEY);
        if (current === expected.resultRaw) {
          if (expected.previousRaw === null) storage.removeItem(KEY);
          else storage.setItem(KEY,expected.previousRaw);
        }
        restored = read(storage,KEY) === expected.previousRaw;
      } catch { /* Both exact raw copies remain in the verified backup. */ }
      fail(restored ? 'commit-failed-restored' : 'commit-failed-backup-retained');
    }
    return {noop:false, profiles:expected.sourceProfiles, backupId:options.id};
  }
  function listBackups(storage) {
    const result=[];
    try {
      for (let i=0;i<storage.length;i++) {
        const key=storage.key(i);
        if (!key || !key.startsWith(BACKUP_PREFIX) || !key.endsWith('-meta')) continue;
        const id=key.slice(BACKUP_PREFIX.length,-5);
        try { const b=backupInfo(storage,id);result.push({id,createdAt:b.createdAt,hadPrevious:b.before!==null}); }
        catch { /* An incomplete/untrusted backup never becomes a rollback target. */ }
      }
    } catch { fail('storage-unavailable'); }
    return result.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  }
  function points(mode) {
    const e = mode.economy;
    if (!e || e.answerReward !== 5 || !nonnegative(mode.level) || !nonnegative(mode.gate) || !Array.isArray(mode.coinKeys)) return null;
    const n = e.balance + (mode.level * 3 + mode.gate - e.answers) * 5 + mode.coinKeys.length - e.coins - e.spent;
    return Number.isFinite(n) ? n : null;
  }
  function summary(data) {
    return Object.entries(data.players).map(([id, p]) => ({id, name: p.name, active: id === data.active,
      modes: Object.entries(p.modes).map(([language, mode]) => ({language, stars: points(mode),
        purchases: Array.isArray(mode.purchases) ? mode.purchases.length : null}))}));
  }
  return Object.freeze({KEY, BACKUP_PREFIX, MAX_BYTES, LANGUAGES: Object.freeze(LANGUAGES), parseSave, prepareReplace, commitReplace, prepareRollback, backupInfo, listBackups, summary});
});
