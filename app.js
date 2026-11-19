'use strict';

/* =========================================================
   Winkelfall auf Jagd – Essensplan & Einkaufsliste
   Daten: lokal im Browser, in der veröffentlichten Version zusätzlich geteilt in der Cloud.
   ========================================================= */

const STORE_KEY = 'winkelfall-auf-jagd-v1';

// Reihenfolge = Reihenfolge im Laden
const CATS = [
  { id: 'getraenke', name: 'Getränke', icon: '🥤', color: '#3a86c8' },
  { id: 'kuehl', name: 'Kühlregal', icon: '🧀', color: '#2a9bb0' },
  { id: 'tk', name: 'Tiefkühl', icon: '❄️', color: '#6a8fd6' },
  { id: 'nudeln', name: 'Nudeln, Reis & Soßen', icon: '🍝', color: '#d68f1f' },
  { id: 'gemuese', name: 'Gemüse', icon: '🥕', color: '#4f9a45' },
  { id: 'brot', name: 'Brot', icon: '🍞', color: '#b87a3d' },
  { id: 'snacks', name: 'Snacks', icon: '🍫', color: '#c95a8e' },
  { id: 'sonstiges', name: 'Sonstiges', icon: '🛒', color: '#8d8573' },
];
const CAT_BY_ID = Object.fromEntries(CATS.map(c => [c.id, c]));
const DEFAULT_GROUP = 'Sonstiges';

// Stichworte für automatische Kategorie (Reihenfolge = Priorität)
const CAT_KEYWORDS = [
  ['tk', ['tiefkühl', 'tk', 'lachs', 'fischstäbchen', 'pommes', 'spinat', 'erbsen', 'eis', 'kroketten', 'rahmspinat']],
  ['getraenke', ['wasser', 'saft', 'cola', 'bier', 'wein', 'limo', 'sprudel', 'tee', 'kaffee', 'schorle', 'fanta', 'sprite', 'eistee']],
  ['snacks', ['chips', 'schoko', 'keks', 'gummi', 'nüsse', 'popcorn', 'riegel', 'cracker', 'salzstangen', 'flips', 'süßigkeit', 'bonbon', 'erdnüsse']],
  ['nudeln', ['spaghetti', 'nudel', 'fusilli', 'penne', 'farfalle', 'makkaroni', 'tagliatelle', 'lasagne', 'tortellini', 'reis', 'sauce', 'soße', 'sosse', 'pesto', 'mehl', 'thunfisch', 'ketchup', 'öl', 'essig', 'gewürz', 'salz', 'pfeffer', 'zucker', 'brühe', 'linsen', 'bohnen', 'dose', 'mais', 'hefe', 'passata', 'passierte', 'couscous', 'bulgur', 'senf', 'mayo']],
  ['kuehl', ['käse', 'kaese', 'schinken', 'sahne', 'ei', 'butter', 'milch', 'joghurt', 'quark', 'feta', 'mozzarella', 'creme', 'crème', 'schmand', 'tofu', 'blätterteig', 'pizzateig', 'wurst', 'salami', 'speck', 'hack', 'hähnchen', 'huhn', 'pute', 'pudding', 'margarine', 'frischkäse', 'gnocchi']],
  ['brot', ['brot', 'brötchen', 'toast', 'baguette', 'wrap', 'tortilla', 'croissant', 'laugen']],
  ['gemuese', ['paprika', 'zwiebel', 'lauch', 'karotte', 'möhre', 'zucchini', 'zuccini', 'tomate', 'gurke', 'salat', 'kartoffel', 'knoblauch', 'pilz', 'champignon', 'brokkoli', 'blumenkohl', 'apfel', 'banane', 'zitrone', 'avocado', 'aubergine', 'kohl', 'obst', 'beeren', 'trauben', 'kräuter', 'petersilie', 'basilikum', 'ingwer', 'kürbis', 'spargel', 'radieschen']],
];

function guessCat(name) {
  const n = name.toLowerCase().trim();
  if (!n) return 'sonstiges';
  const words = n.split(/[^a-zäöüß]+/).filter(Boolean);
  for (const [cat, kws] of CAT_KEYWORDS) {
    for (const kw of kws) {
      if (kw.length <= 3) {
        if (words.some(w => w === kw || w === kw + 'er' || w === kw + 's')) return cat;
      } else if (n.includes(kw)) {
        return cat;
      }
    }
  }
  return 'sonstiges';
}

/* ---------- Startrezepte ---------- */
const ing = (name, cat, amount = 1) => ({ name, amount, cat });
const SEED_RECIPES = [
  { name: 'Spaghetti Carbonara', group: 'Nudelgerichte', ingredients: [ing('Spaghetti', 'nudeln'), ing('Schinkenwürfel', 'kuehl'), ing('Eier', 'kuehl'), ing('Sahne', 'kuehl'), ing('Reibekäse', 'kuehl')] },
  { name: 'Nudelauflauf', group: 'Nudelgerichte', ingredients: [ing('Fusilli', 'nudeln'), ing('Schinken', 'kuehl'), ing('Paprika', 'gemuese'), ing('Lauchzwiebeln', 'gemuese'), ing('Reibekäse', 'kuehl'), ing('Sahne', 'kuehl')] },
  { name: 'Blätterteigtaschen', group: 'Pizza & Gebackenes', ingredients: [ing('Blätterteig', 'kuehl'), ing('Spinat', 'tk'), ing('Feta', 'kuehl')] },
  { name: 'Pizza Lachs Spinat', group: 'Pizza & Gebackenes', ingredients: [ing('Mehl', 'nudeln'), ing('Crème fraîche', 'kuehl', 2), ing('Spinat', 'tk'), ing('Lachs', 'tk'), ing('Reibekäse', 'kuehl')] },
  { name: 'Thunfisch Nudeln', group: 'Nudelgerichte', ingredients: [ing('Fusilli', 'nudeln'), ing('Thunfisch', 'nudeln'), ing('Tomatensauce', 'nudeln'), ing('Reibekäse', 'kuehl'), ing('Paprika', 'gemuese')] },
  { name: 'Abendbrot', group: 'Schnell & Kalt', ingredients: [ing('Scheibenkäse', 'kuehl'), ing('Schinken', 'kuehl'), ing('Butter', 'kuehl')] },
  { name: 'Reispfanne', group: 'Pfanne & Reis', ingredients: [ing('Reis', 'nudeln'), ing('Paprika', 'gemuese'), ing('Lauchzwiebeln', 'gemuese'), ing('Karotten', 'gemuese'), ing('Tofu', 'kuehl')] },
  { name: 'Pizzabrötchen (Karotte, Zucchini)', group: 'Pizza & Gebackenes', ingredients: [ing('Tiefkühlbrötchen', 'tk'), ing('Karotten', 'gemuese'), ing('Zucchini', 'gemuese'), ing('Crème fraîche', 'kuehl', 2), ing('Reibekäse', 'kuehl'), ing('Schinkenwürfel', 'kuehl')] },
];

/* ---------- Helfer ---------- */
const $ = sel => document.querySelector(sel);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const norm = s => s.toLowerCase().trim().replace(/\s+/g, ' ');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAY_NAMES = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const DAY_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

function mondayOf(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const wd = (x.getDay() + 6) % 7; // Mo = 0
  x.setDate(x.getDate() - wd);
  return x;
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function keyOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fromKey(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }
function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
}
const fmt = d => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;
const groupOf = r => (r.group && r.group.trim()) || DEFAULT_GROUP;

// Rezepte nach Unterkategorie gruppieren (alphabetisch, "Sonstiges" zuletzt)
function groupRecipes(list) {
  const groups = new Map();
  [...list].sort((a, b) => a.name.localeCompare(b.name, 'de')).forEach(r => {
    const g = groupOf(r);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(r);
  });
  return [...groups.entries()].sort(([a], [b]) =>
    (a === DEFAULT_GROUP) - (b === DEFAULT_GROUP) || a.localeCompare(b, 'de'));
}
const allGroups = () => [...new Set(state.recipes.map(groupOf))].sort((a, b) => a.localeCompare(b, 'de'));

/* ---------- Zustand ---------- */
let state = load();
let currentTab = 'kalender';
let weekStart = mondayOf(new Date());
let recipeSearch = '';
let openRecipeId = null;

function normalizeState(s) {
  s.recipes ||= []; s.plans ||= {}; s.shopping ||= []; s.shoppingHidden ||= {};
  // Ältere Daten: Unterkategorien nachtragen
  s.recipes.forEach(r => {
    if (!r.group) r.group = SEED_RECIPES.find(x => x.name === r.name)?.group || DEFAULT_GROUP;
  });
  return s;
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch (e) { console.warn('Konnte Daten nicht laden', e); }
  return {
    // feste IDs, damit alle Geräte dieselben Startrezepte haben
    recipes: SEED_RECIPES.map((r, k) => ({ id: 'seed' + (k + 1), name: r.name, group: r.group, ingredients: r.ingredients.map(i => ({ ...i })) })),
    plans: {},
    shopping: [],
    shoppingHidden: {},
  };
}

// Alte Wochenpläne (älter als 10 Wochen) aufräumen, damit die Daten klein bleiben
function prunePlans() {
  const cutoff = keyOf(addDays(mondayOf(new Date()), -70));
  Object.keys(state.plans).forEach(k => { if (k < cutoff) delete state.plans[k]; });
}

function save() {
  prunePlans();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* kein lokaler Speicher */ }
  updateBadge();
  scheduleCloudWrite();
}

/* ---------- Cloud-Sync (nur in der veröffentlichten Version) ----------
   Ist die Speicher-Schnittstelle von claude.ai verfügbar, liegt der ganze
   Zustand als ein gemeinsames Dokument in der Cloud. Alle, mit denen die
   App geteilt ist, sehen Änderungen live. Ohne sie bleibt alles lokal. */
let cloudDoc = null;
let cloudReadOnly = false;
let cloudWriting = false;
let cloudDirty = false;
let cloudTimer = null;
let cloudRemotePending = false;
let cloudLastSent = null;
let cloudTimerPending = false;

function setSyncState(text, cls) {
  const el = $('#syncState');
  if (!el) return;
  el.hidden = !text;
  el.textContent = text || '';
  el.className = 'sync-pill ' + (cls || '');
}

function scheduleCloudWrite() {
  if (!cloudDoc || cloudReadOnly) return;
  clearTimeout(cloudTimer);
  cloudTimerPending = true;
  cloudTimer = setTimeout(() => { cloudTimerPending = false; flushCloud(); }, 500); // schnelle Klicks zu einem Speichern bündeln
}

async function flushCloud() {
  if (!cloudDoc || cloudReadOnly) return;
  if (cloudWriting) { cloudDirty = true; return; }
  cloudWriting = true;
  try {
    const json = JSON.stringify(state);
    cloudLastSent = json;
    await cloudDoc.set({ json, updated: Date.now() });
    setSyncState('☁️ Geteilt', 'ok');
  } catch (e) {
    if (e && e.code === 'invalid_argument') {
      cloudReadOnly = true;
      setSyncState('👀 Nur ansehen', 'warn');
      toast('Du kannst diese App nur ansehen, nicht ändern');
    } else if (e && e.code === 'unavailable') {
      cloudDirty = true;
      setTimeout(flushCloud, 1500 + Math.random() * 1500);
    } else {
      setSyncState('⚠️ Nicht gespeichert', 'warn');
    }
  }
  cloudWriting = false;
  if (cloudDirty) { cloudDirty = false; flushCloud(); }
}

function applyRemoteState(json) {
  if (json === JSON.stringify(state)) return;
  try { state = normalizeState(JSON.parse(json)); } catch { return; }
  try { localStorage.setItem(STORE_KEY, json); } catch { /* egal */ }
  // Nicht neu zeichnen, während jemand gerade tippt
  const a = document.activeElement;
  if (a && a.closest && a.closest('#view') && a.matches('input, select')) { cloudRemotePending = true; return; }
  render();
}

async function initCloud() {
  if (!window.claude || typeof window.claude.use !== 'function') return;
  let db = null;
  try { db = await window.claude.use('db'); } catch { db = null; }
  if (!db) return;
  cloudDoc = db.doc('app/state');
  setSyncState('⏳ Verbinde…', '');
  let loaded = false;
  const timer = setTimeout(() => {
    if (!loaded) setSyncState('📴 Offline – evtl. nicht aktuell', 'warn');
  }, 10000);
  cloudDoc.onSnapshot(snap => {
    if (!snap.metadata.fromCache) { loaded = true; clearTimeout(timer); }
    if (snap.metadata.hasPendingWrites) return; // eigene Änderung
    if (snap.exists) {
      const d = snap.data();
      // Eigene Bestätigung oder ungespeicherte lokale Änderungen: lokal gewinnt
      if (d && typeof d.json === "string" && d.json !== cloudLastSent && !cloudWriting && !cloudTimerPending) applyRemoteState(d.json);
    }
    if (loaded) setSyncState("☁️ Geteilt", "ok");
  }, err => {
    clearTimeout(timer);
    setSyncState(err && err.code === 'revoked' ? '' : '⚠️ Sync unterbrochen', 'warn');
  });
}

document.addEventListener('focusout', () => {
  if (cloudRemotePending) { cloudRemotePending = false; setTimeout(render, 0); }
});

const recipeById = id => state.recipes.find(r => r.id === id);

// Plan-Eintrag: null | 'skip' | { id, locked }
function getPlan(ws) {
  const k = keyOf(ws);
  if (!state.plans[k]) state.plans[k] = Array(7).fill(null);
  return state.plans[k];
}
function peekPlan(ws) { return state.plans[keyOf(ws)] || Array(7).fill(null); }
const entryRecipe = e => (e && e !== 'skip' ? recipeById(e.id) : null);

function lastWeekIds() {
  return new Set(peekPlan(addDays(weekStart, -7)).filter(e => e && e !== 'skip').map(e => e.id));
}

// Nach jeder Änderung am Wochenplan: Einkaufsliste mitziehen + speichern
function planChanged() {
  syncShopping(weekStart);
  save();
}

/* ---------- Zufallsgenerator ---------- */
function pickRandom(usedThisWeek) {
  const last = lastWeekIds();
  const all = state.recipes.map(r => r.id);
  let pool = all.filter(id => !last.has(id) && !usedThisWeek.has(id));
  if (!pool.length) pool = all.filter(id => !usedThisWeek.has(id));
  if (!pool.length) pool = all;
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function rollDay(i) {
  const plan = getPlan(weekStart);
  const used = new Set(plan.filter((e, j) => j !== i && e && e !== 'skip').map(e => e.id));
  // gleiches Rezept nicht nochmal am selben Tag, wenn möglich
  const cur = plan[i] && plan[i] !== 'skip' ? plan[i].id : null;
  if (cur && state.recipes.length > used.size + 1) used.add(cur);
  const id = pickRandom(used);
  if (!id) return toast('Erst Rezepte anlegen 🙂');
  plan[i] = { id, locked: false };
  planChanged();
  renderCalendar([i]);
}

function rollWeek() {
  if (!state.recipes.length) return toast('Erst Rezepte anlegen 🙂');
  const plan = getPlan(weekStart);
  const used = new Set(plan.filter(e => e && e !== 'skip' && e.locked).map(e => e.id));
  const rolled = [];
  plan.forEach((e, i) => {
    if (e === 'skip' || (e && e.locked)) return;
    const id = pickRandom(used);
    used.add(id);
    plan[i] = { id, locked: false };
    rolled.push(i);
  });
  planChanged();
  renderCalendar(rolled);
  if (!rolled.length) toast('Alle Tage sind festgepinnt 📌');
}

/* ---------- Einkaufsliste ----------
   Zutaten aus dem Wochenplan landen automatisch auf der Liste.
   Selbst hinzugefügte Sachen (manual) bleiben immer erhalten.
   Was man per 🗑️ löscht, merkt sich die App in shoppingHidden
   und trägt es erst wieder ein, wenn mehr davon gebraucht wird. */
function computeWeekItems(ws) {
  const map = new Map();
  peekPlan(ws).forEach(e => {
    const r = entryRecipe(e);
    if (!r) return;
    r.ingredients.forEach(g => {
      if (!g.name.trim()) return;
      const k = norm(g.name);
      if (!map.has(k)) map.set(k, { name: g.name.trim(), amount: 0, cat: g.cat || guessCat(g.name), sources: [] });
      const it = map.get(k);
      it.amount += Number(g.amount) || 1;
      if (!it.sources.includes(r.name)) it.sources.push(r.name);
    });
  });
  return map;
}

function syncShopping(ws) {
  const wk = keyOf(ws);
  const sameWeek = state.shoppingWeek === wk;
  if (!sameWeek) state.shoppingHidden = {};
  state.shoppingWeek = wk;
  const hidden = state.shoppingHidden;
  const map = computeWeekItems(ws);
  const old = sameWeek ? new Map(state.shopping.filter(i => !i.manual).map(i => [norm(i.name), i])) : new Map();

  const generated = [];
  for (const [k, it] of map) {
    if (hidden[k] !== undefined) {
      if (it.amount <= hidden[k]) continue;
      it.amount -= hidden[k]; // nur die zusätzlich benötigte Menge
    }
    const prev = old.get(k);
    generated.push({
      id: prev?.id || uid(), ...it,
      checked: !!prev && prev.checked && prev.amount >= it.amount,
      manual: false,
    });
  }
  Object.keys(hidden).forEach(k => { if (!map.has(k)) delete hidden[k]; });
  state.shopping = state.shopping.filter(i => i.manual).concat(generated);
}

function hideItem(item) {
  if (item.manual) return;
  const k = norm(item.name);
  state.shoppingHidden[k] = (state.shoppingHidden[k] || 0) + item.amount;
}

function addManualItem(name, cat) {
  name = name.trim();
  if (!name) return;
  const ex = state.shopping.find(i => norm(i.name) === norm(name));
  if (ex) { ex.amount = (ex.amount || 1) + 1; ex.checked = false; }
  else state.shopping.push({ id: uid(), name, amount: 1, cat, sources: [], checked: false, manual: true });
  save();
}

function shoppingText() {
  const lines = ['🛒 Einkaufsliste – Winkelfall auf Jagd', ''];
  CATS.forEach(c => {
    const items = state.shopping.filter(i => (i.cat || 'sonstiges') === c.id && !i.checked);
    if (!items.length) return;
    lines.push(`${c.icon} ${c.name}`);
    items.forEach(i => lines.push(`  ☐ ${i.amount > 1 ? i.amount + '× ' : ''}${i.name}`));
    lines.push('');
  });
  return lines.join('\n').trim();
}

/* ---------- Rendering ---------- */
function render() {
  document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === currentTab));
  $('#subtitle').textContent = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  if (currentTab === 'kalender') renderCalendar();
  else if (currentTab === 'rezepte') renderRecipes();
  else renderShopping();
  updateBadge();
}

function updateBadge() {
  const open = state.shopping.filter(i => !i.checked).length;
  const b = $('#shopBadge');
  b.hidden = !open;
  b.textContent = open;
}

function renderCalendar(rolled = []) {
  const plan = peekPlan(weekStart);
  const todayKey = keyOf(new Date());
  const isThisWeek = keyOf(weekStart) === keyOf(mondayOf(new Date()));
  const last = lastWeekIds();
  const freshCount = state.recipes.filter(r => !last.has(r.id)).length;
  const hasAny = plan.some(Boolean);

  let html = `
    <div class="card panel">
    <div class="weeknav">
      <button class="icon-btn" data-act="prev-week" aria-label="Vorige Woche">‹</button>
      <div class="mid">
        <b>KW ${isoWeek(weekStart)}${isThisWeek ? ' · diese Woche' : ''}</b>
        <small>${fmt(weekStart)} – ${fmt(addDays(weekStart, 6))}${weekStart.getFullYear()}</small>
        ${isThisWeek ? '' : '<br><button class="today-link" data-act="this-week">zur aktuellen Woche</button>'}
      </div>
      <button class="icon-btn" data-act="next-week" aria-label="Nächste Woche">›</button>
    </div>
    <div class="btn-row">
      <button class="btn gold" data-act="roll-week">🎲 Woche würfeln</button>
      <button class="btn danger" data-act="clear-week" ${hasAny ? '' : 'disabled'}>🗑️ Woche leeren</button>
    </div>
    </div>
    <p class="hint">Tippe auf einen Tag, um selbst ein Essen auszuwählen. 📌 = festgepinnt, wird beim Würfeln nicht überschrieben. Die Zutaten landen automatisch auf der Einkaufsliste.
    ${last.size ? `Rezepte von letzter Woche werden beim Würfeln möglichst ausgelassen (${freshCount} von ${state.recipes.length} verfügbar).` : ''}</p>
    <div class="days">`;

  plan.forEach((e, i) => {
    const d = addDays(weekStart, i);
    const r = entryRecipe(e);
    const today = keyOf(d) === todayKey;
    const tTag = today ? '<span class="today-tag">HEUTE</span>' : '';
    let mealHtml;
    if (e === 'skip') mealHtml = `<div class="meal skip">${tTag}<div class="title">🍽️ Frei / Auswärts</div></div>`;
    else if (r) mealHtml = `<div class="meal">${tTag}<div class="title">${esc(r.name)}</div><div class="sub">${esc(r.ingredients.map(g => g.name).join(', '))}</div></div>`;
    else mealHtml = `<div class="meal none">${tTag}<div class="title">noch nichts geplant</div></div>`;

    const lockBtn = r
      ? `<button class="icon-btn ${e.locked ? 'lock-on' : 'lock-off'}" data-act="lock" data-i="${i}" title="Festpinnen">📌</button>`
      : '';
    html += `
      <div class="card day ${today ? 'today' : ''} ${rolled.includes(i) ? 'rolled' : ''}" data-act="pick" data-i="${i}">
        <div class="dname"><b>${DAY_SHORT[i]}</b><small>${fmt(d)}</small></div>
        ${mealHtml}
        ${lockBtn}
        ${e !== 'skip' ? `<button class="icon-btn" data-act="roll-day" data-i="${i}" title="Würfeln">🎲</button>` : ''}
        ${e ? `<button class="icon-btn clear" data-act="clear-day" data-i="${i}" title="Tag leeren">✕</button>` : ''}
      </div>`;
  });
  html += '</div>';
  $('#view').innerHTML = html;
}

function renderRecipes() {
  const q = norm(recipeSearch);
  const list = state.recipes.filter(r =>
    !q || norm(r.name).includes(q) || norm(groupOf(r)).includes(q) || r.ingredients.some(g => norm(g.name).includes(q)));

  let html = `
    <div class="card panel">
      <input type="search" id="recipeSearch" placeholder="🔍 Rezept, Kategorie oder Zutat suchen…" value="${esc(recipeSearch)}">
      <div class="btn-row" style="margin-bottom:0">
        <button class="btn primary" data-act="new-recipe">＋ Neues Rezept</button>
      </div>
    </div>
    <p class="hint">${state.recipes.length} Rezepte · Tippe auf ein Rezept für Zutaten &amp; Bearbeiten.</p>`;

  if (!list.length) html += `<div class="empty"><span class="big">📖</span>Keine Rezepte gefunden.</div>`;
  groupRecipes(list).forEach(([group, recipes]) => {
    html += `<section class="cat-group">
      <div class="cat-title">📂 ${esc(group)} <span class="n">${recipes.length}</span></div>
      <div class="recipes">`;
    recipes.forEach(r => {
      const open = openRecipeId === r.id;
      html += `
        <div class="card recipe">
          <div class="recipe-head" data-act="toggle-recipe" data-id="${r.id}">
            <h3>${esc(r.name)}</h3>
            <span class="count">${r.ingredients.length} Zutaten</span>
            <span class="chev ${open ? 'open' : ''}">▾</span>
          </div>
          ${open ? `
            <ul class="ings">${r.ingredients.map(g => `<li class="chip">${CAT_BY_ID[g.cat]?.icon || '🛒'} ${g.amount > 1 ? g.amount + '× ' : ''}${esc(g.name)}</li>`).join('')}</ul>
            <div class="btn-row">
              <button class="btn small" data-act="edit-recipe" data-id="${r.id}">✏️ Bearbeiten</button>
              <button class="btn small" data-act="plan-recipe" data-id="${r.id}">📅 Einplanen</button>
              <button class="btn small danger" data-act="delete-recipe" data-id="${r.id}">🗑️ Löschen</button>
            </div>` : ''}
        </div>`;
    });
    html += `</div></section>`;
  });
  html += `
    ${cloudDoc ? "" : `<div class="footer-tools">
      <button class="btn small ghost" data-act="export">💾 Daten sichern</button>
      <button class="btn small ghost" data-act="import">📂 Daten laden</button>
    </div>`}`;
  $('#view').innerHTML = html;
}

function catOptions(selected) {
  return CATS.map(c => `<option value="${c.id}" ${c.id === selected ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('');
}

function renderShopping() {
  const total = state.shopping.length;
  const done = state.shopping.filter(i => i.checked).length;
  let weekInfo = '';
  if (state.shoppingWeek) {
    const ws = fromKey(state.shoppingWeek);
    weekInfo = `Wochenplan KW ${isoWeek(ws)} (${fmt(ws)} – ${fmt(addDays(ws, 6))})`;
  }

  let html = `
    <div class="card panel">
    <form class="add-row" id="addForm" autocomplete="off">
      <input type="text" id="addName" placeholder="Etwas hinzufügen…">
      <select id="addCat">${catOptions('sonstiges')}</select>
      <button class="btn primary" type="submit" aria-label="Hinzufügen">＋</button>
    </form>
    <div class="btn-row">
      <button class="btn small" data-act="rebuild-list">🔄 Neu aus Wochenplan</button>
      <button class="btn small" data-act="clear-done" ${done ? '' : 'disabled'}>✓ Abgehakte weg</button>
      <button class="btn small" data-act="share" ${total ? '' : 'disabled'}>📤 Teilen</button>
      <button class="btn small danger" data-act="clear-all" ${total ? '' : 'disabled'}>🗑️ Alles löschen</button>
    </div>
    </div>`;

  if (!total) {
    html += `<div class="empty"><span class="big">🛒</span>Die Liste ist leer.<br>Plant im Kalender eure Woche – die Zutaten landen dann automatisch hier.</div>`;
    $('#view').innerHTML = html;
    return;
  }

  html += `
    <div class="progress-wrap">
      <div class="progress"><div style="width:${Math.round(done / total * 100)}%"></div></div>
      <b>${Math.round(done / total * 100)} %</b>
    </div>
    <p class="hint">${done} von ${total} erledigt${weekInfo ? ' · ' + weekInfo : ''}</p>`;

  CATS.forEach(c => {
    const items = state.shopping
      .filter(i => (i.cat || 'sonstiges') === c.id)
      .sort((a, b) => (a.checked - b.checked) || a.name.localeCompare(b.name, 'de'));
    if (!items.length) return;
    const open = items.filter(i => !i.checked).length;
    html += `
      <section class="cat-group" style="--c:${c.color}">
        <div class="cat-title">${c.icon} ${c.name} <span class="n">${open}/${items.length}</span></div>
        <div class="card items">
          ${items.map(i => `
            <div class="item ${i.checked ? 'done' : ''}">
              <label>
                <input type="checkbox" data-act="check" data-id="${i.id}" ${i.checked ? 'checked' : ''}>
                <span class="txt">
                  <span class="name">${i.amount > 1 ? `<span class="amt">${i.amount}×</span>` : ''}${esc(i.name)}</span>
                  ${i.sources?.length ? `<div class="src">für ${esc(i.sources.join(', '))}</div>` : ''}
                </span>
              </label>
              <button class="icon-btn trash" data-act="del-item" data-id="${i.id}" aria-label="Löschen">🗑️</button>
            </div>`).join('')}
        </div>
      </section>`;
  });
  $('#view').innerHTML = html;
}

/* ---------- Dialoge ---------- */
function openSheet(html) {
  $('#sheet').innerHTML = html;
  $('#sheetBackdrop').hidden = false;
}
function closeSheet() {
  $('#sheetBackdrop').hidden = true;
  $('#sheet').innerHTML = '';
  pendingConfirm = null;
}

// Eigene Sicherheitsabfrage (funktioniert auch dort, wo confirm() blockiert ist)
let pendingConfirm = null;
function askConfirm(message, okLabel, onOk) {
  openSheet(`
    <h2>Sicher? <button class="icon-btn" data-act="close">✕</button></h2>
    <p class="confirm-text">${esc(message).replace(/\n/g, '<br>')}</p>
    <div class="btn-row">
      <button class="btn ghost" data-act="close">Abbrechen</button>
      <button class="btn danger-fill" data-act="confirm-ok">${esc(okLabel)}</button>
    </div>`);
  pendingConfirm = onOk;
}

function openPicker(i) {
  const plan = getPlan(weekStart);
  const cur = plan[i];
  const last = lastWeekIds();
  const usedWeek = new Set(plan.filter((e, j) => j !== i && e && e !== 'skip').map(e => e.id));
  const d = addDays(weekStart, i);
  openSheet(`
    <h2>${DAY_NAMES[i]}, ${fmt(d)} <button class="icon-btn" data-act="close">✕</button></h2>
    <div class="pick-list">
      ${groupRecipes(state.recipes).map(([group, recipes]) => `
        <div class="pick-group">📂 ${esc(group)}</div>
        ${recipes.map(r => `
          <button class="pick ${cur && cur !== 'skip' && cur.id === r.id ? 'current' : ''} ${last.has(r.id) || usedWeek.has(r.id) ? 'muted' : ''}" data-act="choose" data-i="${i}" data-id="${r.id}">
            <span class="pn">${esc(r.name)}</span>
            ${usedWeek.has(r.id) ? '<span class="tag">schon diese Woche</span>' : ''}
            ${last.has(r.id) ? '<span class="tag">letzte Woche</span>' : ''}
          </button>`).join('')}`).join('')}
      <div class="pick-group">Sonstiges</div>
      <button class="pick" data-act="choose-skip" data-i="${i}"><span class="pn">🍽️ Frei / Auswärts essen</span></button>
      <button class="pick" data-act="clear-day" data-i="${i}"><span class="pn">✕ Tag leeren</span></button>
    </div>`);
}

function openPlanRecipe(id) {
  const r = recipeById(id);
  const plan = peekPlan(weekStart);
  openSheet(`
    <h2>„${esc(r.name)}“ einplanen <button class="icon-btn" data-act="close">✕</button></h2>
    <p class="hint">KW ${isoWeek(weekStart)} (${fmt(weekStart)} – ${fmt(addDays(weekStart, 6))})</p>
    <div class="pick-list">
      ${plan.map((e, i) => {
        const cr = entryRecipe(e);
        return `<button class="pick" data-act="choose" data-i="${i}" data-id="${id}">
          <span class="pn">${DAY_NAMES[i]} <small style="color:var(--muted);font-weight:400">${fmt(addDays(weekStart, i))}</small></span>
          <span class="tag">${e === 'skip' ? 'frei' : cr ? esc(cr.name) : 'leer'}</span></button>`;
      }).join('')}
    </div>`);
}

function ingRowHtml(g = { name: '', amount: 1, cat: 'sonstiges' }, auto = true) {
  return `
    <div class="ing-row" data-auto="${auto ? 1 : 0}">
      <input type="text" class="ing-name" placeholder="Zutat" value="${esc(g.name)}">
      <input type="number" class="ing-amt" min="1" step="1" value="${g.amount || 1}" title="Menge">
      <select class="ing-cat">${catOptions(g.cat)}</select>
      <button type="button" class="icon-btn trash" data-act="rm-ing" aria-label="Zutat entfernen">🗑️</button>
    </div>`;
}

function openRecipeEditor(id) {
  const r = id ? recipeById(id) : null;
  const groups = allGroups();
  openSheet(`
    <h2>${r ? 'Rezept bearbeiten' : 'Neues Rezept'} <button class="icon-btn" data-act="close">✕</button></h2>
    <form id="recipeForm" data-id="${r ? r.id : ''}" autocomplete="off">
      <label class="field"><span>Name</span>
        <input type="text" id="rName" required placeholder="z. B. Chili con Carne" value="${r ? esc(r.name) : ''}">
      </label>
      <label class="field"><span>Unterkategorie (auswählen oder neue eintippen)</span>
        <input type="text" id="rGroup" list="groupList" placeholder="z. B. Nudelgerichte" value="${r ? esc(groupOf(r)) : ''}">
        <datalist id="groupList">${groups.map(g => `<option value="${esc(g)}">`).join('')}</datalist>
      </label>
      <div class="group-chips">
        ${groups.map(g => `<button type="button" class="chip" data-act="set-group" data-group="${esc(g)}">${esc(g)}</button>`).join('')}
      </div>
      <div class="field"><span>Zutaten · Menge · Bereich im Laden</span>
        <div id="ingRows">
          ${(r ? r.ingredients : [undefined, undefined, undefined]).map(g => ingRowHtml(g, !r)).join('')}
        </div>
        <button type="button" class="btn small" data-act="add-ing">＋ Zutat</button>
      </div>
      <div class="btn-row">
        <button type="button" class="btn ghost" data-act="close">Abbrechen</button>
        <button type="submit" class="btn primary">Speichern</button>
      </div>
    </form>`);
  if (!r) setTimeout(() => $('#rName').focus(), 50);
}

function saveRecipeForm(form) {
  const name = $('#rName').value.trim();
  if (!name) return toast('Bitte einen Namen eingeben');
  const group = $('#rGroup').value.trim() || DEFAULT_GROUP;
  const ingredients = [...form.querySelectorAll('.ing-row')].map(row => ({
    name: row.querySelector('.ing-name').value.trim(),
    amount: Math.max(1, parseInt(row.querySelector('.ing-amt').value, 10) || 1),
    cat: row.querySelector('.ing-cat').value,
  })).filter(g => g.name);
  const id = form.dataset.id;
  if (id) {
    Object.assign(recipeById(id), { name, group, ingredients });
    resyncShoppingWeek();
  } else {
    const nr = { id: uid(), name, group, ingredients };
    state.recipes.push(nr);
    openRecipeId = nr.id;
  }
  save();
  closeSheet();
  renderRecipes();
  toast(id ? 'Rezept gespeichert ✓' : 'Neues Rezept angelegt 🎉');
}

// Wenn sich ein Rezept ändert, die Liste der zuletzt geplanten Woche anpassen
function resyncShoppingWeek() {
  if (state.shoppingWeek) syncShopping(fromKey(state.shoppingWeek));
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2200);
}

/* ---------- Export / Import ---------- */
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `winkelfall-backup-${keyOf(new Date())}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function importData() {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'application/json,.json';
  inp.onchange = async () => {
    try {
      const data = JSON.parse(await inp.files[0].text());
      if (!Array.isArray(data.recipes)) throw new Error('kein Backup');
      askConfirm('Alle aktuellen Daten durch das Backup ersetzen?', 'Ersetzen', () => {
        data.recipes.forEach(r => { r.group ||= DEFAULT_GROUP; });
        state = {
          recipes: data.recipes, plans: data.plans || {}, shopping: data.shopping || [],
          shoppingWeek: data.shoppingWeek, shoppingHidden: data.shoppingHidden || {},
        };
        save(); render(); toast('Backup geladen ✓');
      });
    } catch { toast('Datei konnte nicht gelesen werden'); }
  };
  inp.click();
}

/* ---------- Events ---------- */
document.querySelector('.tabbar').addEventListener('click', e => {
  const b = e.target.closest('button[data-tab]');
  if (!b) return;
  currentTab = b.dataset.tab;
  render();
  window.scrollTo(0, 0);
});

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) {
    if (e.target.id === 'sheetBackdrop') closeSheet();
    return;
  }
  const act = el.dataset.act;
  const i = el.dataset.i !== undefined ? Number(el.dataset.i) : null;
  const id = el.dataset.id;

  switch (act) {
    // Kalender
    case 'prev-week': weekStart = addDays(weekStart, -7); renderCalendar(); break;
    case 'next-week': weekStart = addDays(weekStart, 7); renderCalendar(); break;
    case 'this-week': weekStart = mondayOf(new Date()); renderCalendar(); break;
    case 'roll-week': rollWeek(); break;
    case 'roll-day': rollDay(i); break;
    case 'lock': {
      const p = getPlan(weekStart)[i];
      if (p && p !== 'skip') { p.locked = !p.locked; save(); renderCalendar(); toast(p.locked ? 'Festgepinnt 📌' : 'Wird wieder mitgewürfelt 🎲'); }
      break;
    }
    case 'pick': openPicker(i); break;
    case 'choose':
      getPlan(weekStart)[i] = { id, locked: true };
      planChanged(); closeSheet();
      if (currentTab === 'kalender') renderCalendar([i]);
      toast(`${DAY_NAMES[i]} eingeplant – Zutaten auf der Liste 🛒`);
      break;
    case 'choose-skip': getPlan(weekStart)[i] = 'skip'; planChanged(); closeSheet(); renderCalendar(); break;
    case 'clear-day':
      getPlan(weekStart)[i] = null; planChanged(); closeSheet(); renderCalendar();
      toast(`${DAY_NAMES[i]} geleert`);
      break;
    case 'clear-week':
      askConfirm(`Ganze Woche KW ${isoWeek(weekStart)} leeren?\nAuch festgepinnte Tage werden entfernt.`, 'Woche leeren', () => {
        state.plans[keyOf(weekStart)] = Array(7).fill(null);
        planChanged(); renderCalendar(); toast('Woche geleert');
      });
      break;

    // Rezepte
    case 'toggle-recipe': openRecipeId = openRecipeId === id ? null : id; renderRecipes(); break;
    case 'new-recipe': openRecipeEditor(null); break;
    case 'edit-recipe': openRecipeEditor(id); break;
    case 'plan-recipe': openPlanRecipe(id); break;
    case 'set-group': $('#rGroup').value = el.dataset.group; break;
    case 'delete-recipe': {
      const r = recipeById(id);
      if (!r) break;
      askConfirm(`„${r.name}“ wirklich löschen?`, 'Löschen', () => {
        state.recipes = state.recipes.filter(x => x.id !== id);
        Object.values(state.plans).forEach(p => p.forEach((en, j) => { if (en && en !== 'skip' && en.id === id) p[j] = null; }));
        resyncShoppingWeek();
        save(); renderRecipes(); toast('Rezept gelöscht');
      });
      break;
    }
    case 'add-ing': {
      $('#ingRows').insertAdjacentHTML('beforeend', ingRowHtml());
      const rows = document.querySelectorAll('#ingRows .ing-name');
      rows[rows.length - 1].focus();
      break;
    }
    case 'rm-ing': el.closest('.ing-row').remove(); break;
    case 'export': exportData(); break;
    case 'import': importData(); break;

    // Einkauf
    case 'check': {
      const it = state.shopping.find(x => x.id === id);
      if (it) {
        it.checked = el.checked;
        save();
        setTimeout(renderShopping, 180);
        if (it.checked && state.shopping.every(x => x.checked)) setTimeout(celebrate, 350);
      }
      break;
    }
    case 'del-item': {
      const it = state.shopping.find(x => x.id === id);
      if (it) hideItem(it);
      state.shopping = state.shopping.filter(x => x.id !== id);
      save(); renderShopping();
      break;
    }
    case 'clear-done':
      state.shopping.filter(x => x.checked).forEach(hideItem);
      state.shopping = state.shopping.filter(x => !x.checked);
      save(); renderShopping(); toast('Abgehakte entfernt');
      break;
    case 'clear-all':
      askConfirm('Die ganze Einkaufsliste löschen?', 'Alles löschen', () => {
        state.shopping.forEach(hideItem);
        state.shopping = [];
        save(); renderShopping(); toast('Einkaufsliste geleert');
      });
      break;
    case 'rebuild-list':
      state.shoppingHidden = {};
      state.shoppingWeek = null; // erzwingt frischen Aufbau
      syncShopping(weekStart);
      save(); renderShopping();
      toast(state.shopping.length ? `Liste aus KW ${isoWeek(weekStart)} erstellt 🛒` : 'Diese Woche ist noch nichts geplant');
      break;
    case 'share': {
      const text = shoppingText();
      const copy = () => navigator.clipboard?.writeText(text).then(() => toast("Liste kopiert 📋 – jetzt z. B. in WhatsApp einfügen"), () => toast("Kopieren nicht möglich"));
      if (navigator.share) navigator.share({ title: "Einkaufsliste", text }).catch(e => { if (!e || e.name !== "AbortError") copy(); });
      else copy();
      break;
    }

    case 'confirm-ok': {
      const fn = pendingConfirm;
      closeSheet();
      if (fn) fn();
      break;
    }
    case 'close': closeSheet(); break;
    case 'close-celebrate': closeCelebrate(); break;
  }
});

document.addEventListener('submit', e => {
  e.preventDefault();
  if (e.target.id === 'addForm') {
    addManualItem($('#addName').value, $('#addCat').value);
    renderShopping();
    $('#addName').focus();
  } else if (e.target.id === 'recipeForm') {
    saveRecipeForm(e.target);
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'recipeSearch') {
    recipeSearch = e.target.value;
    const pos = e.target.selectionStart;
    renderRecipes();
    const s = $('#recipeSearch'); s.focus(); s.setSelectionRange(pos, pos);
  } else if (e.target.id === 'addName') {
    $('#addCat').value = guessCat(e.target.value);
  } else if (e.target.classList.contains('ing-name')) {
    const row = e.target.closest('.ing-row');
    if (row.dataset.auto === '1') row.querySelector('.ing-cat').value = guessCat(e.target.value);
  }
});

document.addEventListener('change', e => {
  if (e.target.classList.contains('ing-cat')) e.target.closest('.ing-row').dataset.auto = '0';
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#celebrate').hidden) closeCelebrate();
  else if (!$('#sheetBackdrop').hidden) closeSheet();
});

/* ---------- Feier: Einkauf erledigt (Küken + Konfetti) ---------- */
const CONFETTI_COLORS = ['#f0a93b', '#3f8a66', '#ffd23f', '#d65a4a', '#3a86c8', '#c95a8e', '#7cc49a'];
let confettiRaf = null;

function celebrate() {
  const box = $('#celebrate');
  if (!box.hidden) return;
  box.hidden = false;
  if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
  startConfetti();
  setTimeout(() => box.querySelector('.celebrate-close').focus(), 50);
}

function closeCelebrate() {
  $('#celebrate').hidden = true;
  cancelAnimationFrame(confettiRaf);
  confettiRaf = null;
}

function startConfetti() {
  const canvas = $('#confetti');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  let W, H;
  const resize = () => {
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const pieces = [];
  const spawn = (n, burst) => {
    for (let k = 0; k < n; k++) {
      pieces.push({
        x: burst ? W / 2 + (Math.random() - .5) * 60 : Math.random() * W,
        y: burst ? H * .45 : -20 - Math.random() * H * .3,
        vx: burst ? (Math.random() - .5) * 16 : (Math.random() - .5) * 2,
        vy: burst ? -Math.random() * 14 - 4 : Math.random() * 2 + 2,
        w: 6 + Math.random() * 7, h: 8 + Math.random() * 10,
        rot: Math.random() * Math.PI, vr: (Math.random() - .5) * .3,
        tilt: Math.random() * Math.PI * 2,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        round: Math.random() < .25,
      });
    }
  };
  spawn(140, true);   // Explosion aus der Mitte
  spawn(120, false);  // Regen von oben

  const start = performance.now();
  cancelAnimationFrame(confettiRaf);
  const frame = now => {
    if ($('#celebrate').hidden) return;
    if (canvas.clientWidth !== W || canvas.clientHeight !== H) resize();
    // Die ersten 4 Sekunden weiter nachrieseln lassen
    if (now - start < 4000 && Math.random() < .5) spawn(3, false);
    ctx.clearRect(0, 0, W, H);
    for (let k = pieces.length - 1; k >= 0; k--) {
      const p = pieces[k];
      p.vy += 0.25;            // Schwerkraft
      p.vx *= 0.985; p.vy *= 0.985;
      p.vy = Math.min(p.vy, 5.5);
      p.tilt += 0.08;
      p.x += p.vx + Math.sin(p.tilt) * 0.8;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > H + 30) { pieces.splice(k, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.scale(1, Math.cos(p.tilt)); // flattern
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    confettiRaf = requestAnimationFrame(frame);
  };
  confettiRaf = requestAnimationFrame(frame);
}

/* ---------- Start ---------- */
render();
initCloud();
try {
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
} catch { /* in eingebetteten Ansichten nicht erlaubt */ }
