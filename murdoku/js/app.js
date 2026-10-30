/* ============================================================
   Murdoku · La Búsqueda del Tesoro — lógica de juego
   ============================================================ */
(function () {
  "use strict";

  const N = PUZZLE.n;
  const TREASURE = PUZZLE.treasure;
  const STORAGE_KEY = "murdoku-tesoro-v1";
  const HOW_KEY = "murdoku-tesoro-how-hidden";
  const IDS = PERSON_IDS;
  const BY_ID = PEOPLE_BY_ID;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clone = (v) => JSON.parse(JSON.stringify(v));

  const els = {
    board: $("#board"),
    cells: $("#cells"),
    tokens: $("#tokens"),
    roster: $("#roster"),
    clues: $("#clues"),
    colLabels: $("#colLabels"),
    rowLabels: $("#rowLabels"),
    placedCount: $("#placedCount"),
    usedCount: $("#usedCount"),
    timer: $("#timer"),
    treasureCard: $("#treasureCard"),
    treasureLock: $("#treasureLock"),
    treasureCoords: $("#treasureCoords"),
    crossOverlay: $("#crossOverlay"),
    crossRow: $("#crossRow"),
    crossCol: $("#crossCol"),
    treasureBurst: $("#treasureBurst"),
    boardToast: $("#boardToast"),
    toast: $("#toast"),
    btnUndo: $("#btnUndo"),
    btnRedo: $("#btnRedo"),
    btnCheck: $("#btnCheck"),
    btnHint: $("#btnHint"),
    btnReveal: $("#btnReveal"),
    btnReset: $("#btnReset"),
    btnHow: $("#btnHow"),
    btnFullscreen: $("#btnFullscreen"),
    placingBadge: $("#placingBadge"),
    placingName: $("#placingName"),
    placingDot: $("#placingDot"),
    placingClear: $("#placingClear"),
    modalHow: $("#modalHow"),
    modalConfirm: $("#modalConfirm"),
    modalVictory: $("#modalVictory"),
    confirmTitle: $("#confirmTitle"),
    confirmText: $("#confirmText"),
    confirmOk: $("#confirmOk"),
    confirmCancel: $("#confirmCancel"),
    victoryCoords: $("#victoryCoords"),
    victorySub: $("#victorySub"),
    victoryStats: $("#victoryStats"),
    victoryClose: $("#victoryClose"),
    victoryAgain: $("#victoryAgain"),
    dontShowHow: $("#dontShowHow")
  };

  /* ---------------- Estado ---------------- */

  function defaultState() {
    return {
      placements: {},   // id -> { r, c }  (1-indexed)
      notes: {},        // "r,c" -> [id, ...]
      xmarks: {},       // "r,c" -> true
      used: {},         // id -> true
      selected: null,
      tool: "note",
      filter: "all",
      startedAt: null,
      elapsed: 0,
      solved: false,
      revealed: false,
      hints: 0
    };
  }

  let state = defaultState();
  let history = [];
  let future = [];
  let drag = null;
  let confirmAction = null;
  let currentModal = null;
  let lastFocus = null;
  let allPlacedTimer = null;
  const timers = { toast: null, boardToast: null, save: null, tick: null };

  /* ---------------- Utilidades ---------------- */

  const keyOf = (r, c) => `${r},${c}`;
  const nameOf = (id) => BY_ID[id] ? BY_ID[id].name : id;
  const initialOf = (id) => nameOf(id).charAt(0).toUpperCase();
  const colorOf = (id) => BY_ID[id] ? BY_ID[id].color : "#333";
  const solutionOf = (id) => ({ r: BY_ID[id].solution[0], c: BY_ID[id].solution[1] });
  const isSolvedPlacement = (id) => {
    const p = state.placements[id];
    const s = solutionOf(id);
    return !!p && p.r === s.r && p.c === s.c;
  };
  const placementCount = () => Object.keys(state.placements).length;
  const usedCount = () => IDS.filter(id => state.used[id]).length;

  function idAt(r, c) {
    for (const id of Object.keys(state.placements)) {
      const p = state.placements[id];
      if (p.r === r && p.c === c) return id;
    }
    return null;
  }

  function formatTime(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function currentElapsed() {
    if (state.startedAt && !state.solved) {
      return (Date.now() - state.startedAt) / 1000;
    }
    return state.elapsed;
  }

  function startTimer() {
    if (!state.solved && !state.startedAt) {
      state.startedAt = Date.now() - (state.elapsed || 0) * 1000;
    }
  }

  function cellAt(r, c) {
    const idx = (r - 1) * N + (c - 1);
    return els.cells.children[idx] || null;
  }

  function pulseCell(r, c, ms = 1000) {
    const cell = cellAt(r, c);
    if (!cell) return;
    cell.classList.add("hint-pulse");
    setTimeout(() => cell.classList.remove("hint-pulse"), ms);
  }

  function flashWrong(ids) {
    const cells = [];
    ids.forEach(id => {
      const p = state.placements[id];
      if (!p) return;
      const cell = cellAt(p.r, p.c);
      if (cell) { cell.classList.add("wrong"); cells.push(cell); }
    });
    const tokens = ids.map(id => els.tokens.querySelector(`.token[data-id="${id}"]`)).filter(Boolean);
    tokens.forEach(t => t.classList.add("wrong-token"));
    setTimeout(() => {
      cells.forEach(c => c.classList.remove("wrong"));
      tokens.forEach(t => t.classList.remove("wrong-token"));
    }, 2200);
  }

  /* ---------------- Toasts ---------------- */

  function toast(text, ms = 2600) {
    clearTimeout(timers.toast);
    els.toast.textContent = text;
    els.toast.classList.add("show");
    timers.toast = setTimeout(() => els.toast.classList.remove("show"), ms);
  }

  function boardToast(text, ms = 1700) {
    clearTimeout(timers.boardToast);
    els.boardToast.textContent = text;
    els.boardToast.classList.add("show");
    timers.boardToast = setTimeout(() => els.boardToast.classList.remove("show"), ms);
  }

  /* ---------------- Persistencia ---------------- */

  function saveNow() {
    try {
      const data = {
        v: 1,
        placements: state.placements,
        notes: state.notes,
        xmarks: state.xmarks,
        used: state.used,
        startedAt: state.startedAt,
        elapsed: state.elapsed,
        solved: state.solved,
        revealed: state.revealed,
        hints: state.hints
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* localStorage puede fallar en file:// o en modo privado */
    }
  }

  function save() {
    clearTimeout(timers.save);
    timers.save = setTimeout(saveNow, 220);
  }

  function loadState() {
    let data = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      data = JSON.parse(raw);
    } catch (e) {
      return false;
    }
    if (!data || data.v !== 1) return false;

    const next = defaultState();

    if (data.placements && typeof data.placements === "object") {
      for (const id of IDS) {
        const p = data.placements[id];
        if (p && Number.isInteger(p.r) && Number.isInteger(p.c) && p.r >= 1 && p.r <= N && p.c >= 1 && p.c <= N) {
          next.placements[id] = { r: p.r, c: p.c };
        }
      }
    }
    if (data.notes && typeof data.notes === "object") {
      for (const k of Object.keys(data.notes)) {
        const arr = data.notes[k];
        if (!Array.isArray(arr)) continue;
        const [r, c] = k.split(",").map(Number);
        if (!(r >= 1 && r <= N && c >= 1 && c <= N)) continue;
        const clean = arr.filter(id => IDS.includes(id));
        if (clean.length) next.notes[k] = Array.from(new Set(clean));
      }
    }
    if (data.xmarks && typeof data.xmarks === "object") {
      for (const k of Object.keys(data.xmarks)) {
        if (!data.xmarks[k]) continue;
        const [r, c] = k.split(",").map(Number);
        if (r >= 1 && r <= N && c >= 1 && c <= N) next.xmarks[k] = true;
      }
    }
    if (data.used && typeof data.used === "object") {
      for (const id of IDS) if (data.used[id]) next.used[id] = true;
    }
    if (Number.isFinite(data.elapsed)) next.elapsed = Math.max(0, data.elapsed);
    if (Number.isFinite(data.startedAt)) next.startedAt = data.startedAt;
    if (Number.isFinite(data.hints)) next.hints = Math.max(0, data.hints);
    next.solved = !!data.solved;
    next.revealed = !!data.revealed;

    // Al recargar, el cronómetro continúa desde el tiempo guardado,
    // no cuenta el tiempo que la página estuvo cerrada.
    if (next.startedAt && !next.solved) {
      next.startedAt = Date.now() - next.elapsed * 1000;
    }

    // Coherencia: si dice resuelto, debe tener las 23 posiciones correctas.
    if (next.solved) {
      const allOk = IDS.every(id => {
        const p = next.placements[id];
        const s = solutionOf(id);
        return p && p.r === s.r && p.c === s.c;
      });
      if (!allOk) next.solved = false;
    }

    state = next;
    return placementCount() > 0 || usedCount() > 0 || state.solved;
  }

  /* ---------------- Construcción estática ---------------- */

  function buildLabels() {
    els.colLabels.innerHTML = "";
    els.rowLabels.innerHTML = "";
    for (let c = 1; c <= N; c++) {
      const s = document.createElement("span");
      s.textContent = String(c);
      s.title = `Columna ${c}`;
      s.dataset.col = String(c);
      els.colLabels.appendChild(s);
    }
    for (let r = 1; r <= N; r++) {
      const s = document.createElement("span");
      s.textContent = String(r);
      s.title = `Fila ${r}`;
      s.dataset.row = String(r);
      els.rowLabels.appendChild(s);
    }
  }

  function buildCells() {
    const frag = document.createDocumentFragment();
    for (let r = 1; r <= N; r++) {
      for (let c = 1; c <= N; c++) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "cell";
        b.dataset.r = String(r);
        b.dataset.c = String(c);
        b.setAttribute("aria-label", `Fila ${r}, columna ${c}`);
        frag.appendChild(b);
      }
    }
    els.cells.appendChild(frag);
  }

  function buildRoster() {
    els.roster.innerHTML = "";
    for (const p of PUZZLE.people) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "person-card";
      card.dataset.id = p.id;
      card.setAttribute("aria-pressed", "false");
      card.innerHTML = `
        <span class="thumb">
          <img src="assets/portraits/${p.id}.webp?v=${ASSET_VERSION}" alt="Retrato de ${p.name}" loading="lazy" draggable="false">
        </span>
        <span class="check" hidden>✓</span>
        <span class="name-row">
          <span class="name">${p.name}</span>
          <span class="pos" hidden></span>
        </span>
        <span class="tag">${p.tag}</span>
        <span class="clue-snippet">${p.clue}</span>
      `;
      els.roster.appendChild(card);
    }
  }

  function buildClues() {
    els.clues.innerHTML = "";
    for (const p of PUZZLE.people) {
      const card = document.createElement("div");
      card.className = "clue-card";
      card.dataset.id = p.id;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Pista de ${p.name}: ${p.clue}`);
      card.style.setProperty("--c", p.color);
      card.innerHTML = `
        <div class="clue-face">
          <img src="assets/portraits/${p.id}.webp?v=${ASSET_VERSION}" alt="" loading="lazy" draggable="false">
        </div>
        <div class="clue-body">
          <div class="clue-name">${p.name} <span class="tag">${p.tag}</span></div>
          <div class="clue-text">${p.clue}</div>
        </div>
        <button class="clue-check" type="button" aria-label="Marcar pista de ${p.name} como usada" aria-pressed="false">✓</button>
      `;
      els.clues.appendChild(card);
    }
  }

  /* ---------------- Render ---------------- */

  function syncAll() {
    syncTokens();
    syncRoster();
    syncClues();
    syncCounts();
    syncPlacing();
    syncTreasure();
    syncUndoRedo();
    syncTimer();
  }

  function syncTokens() {
    els.tokens.innerHTML = "";

    const placedCells = new Map();
    for (const id of Object.keys(state.placements)) {
      const p = state.placements[id];
      placedCells.set(keyOf(p.r, p.c), id);
    }

    for (const [k, id] of placedCells) {
      const { r, c } = parseKey(k);
      const p = BY_ID[id];
      const token = document.createElement("div");
      token.className = "token";
      token.dataset.id = id;
      token.style.left = `${((c - 1) / N) * 100}%`;
      token.style.top = `${((r - 1) / N) * 100}%`;
      token.style.width = `${100 / N}%`;
      token.style.height = `${100 / N}%`;
      token.style.setProperty("--c", p.color);
      token.innerHTML = `
        <div class="token-inner">
          <div class="token-face" style="background-image:url('assets/portraits/${id}.webp?v=${ASSET_VERSION}')"></div>
          <span class="token-badge">${initialOf(id)}</span>
        </div>
      `;
      els.tokens.appendChild(token);
    }

    for (const k of Object.keys(state.notes)) {
      if (placedCells.has(k)) continue;
      const arr = state.notes[k];
      if (!arr || !arr.length) continue;
      const { r, c } = parseKey(k);
      const notes = document.createElement("div");
      notes.className = "notes" + (arr.length === 1 ? " one" : "");
      notes.style.left = `${((c - 1) / N) * 100}%`;
      notes.style.top = `${((r - 1) / N) * 100}%`;
      notes.style.width = `${100 / N}%`;
      notes.style.height = `${100 / N}%`;
      const shown = arr.slice(0, 4);
      for (const id of shown) {
        const s = document.createElement("span");
        s.className = "note";
        s.textContent = initialOf(id);
        s.style.setProperty("--c", colorOf(id));
        s.title = nameOf(id);
        notes.appendChild(s);
      }
      if (arr.length > 4) {
        const m = document.createElement("span");
        m.className = "note more";
        m.textContent = `+${arr.length - 3}`;
        notes.appendChild(m);
      }
      els.tokens.appendChild(notes);
    }

    for (const k of Object.keys(state.xmarks)) {
      if (!state.xmarks[k] || placedCells.has(k)) continue;
      const { r, c } = parseKey(k);
      const x = document.createElement("div");
      x.className = "xmark";
      x.textContent = "✕";
      x.style.left = `${((c - 1) / N) * 100}%`;
      x.style.top = `${((r - 1) / N) * 100}%`;
      x.style.width = `${100 / N}%`;
      x.style.height = `${100 / N}%`;
      els.tokens.appendChild(x);
    }

    // accesibilidad de las casillas
    for (let r = 1; r <= N; r++) {
      for (let c = 1; c <= N; c++) {
        const cell = cellAt(r, c);
        if (!cell) continue;
        const k = keyOf(r, c);
        const pid = placedCells.get(k);
        const notes = state.notes[k];
        let label = `Fila ${r}, columna ${c}`;
        if (pid) label += `, ${nameOf(pid)}`;
        if (notes && notes.length && !pid) label += `, notas: ${notes.map(nameOf).join(", ")}`;
        if (state.xmarks[k] && !pid) label += `, marcada como imposible`;
        cell.setAttribute("aria-label", label);
      }
    }
  }

  function syncRoster() {
    for (const card of $$(".person-card", els.roster)) {
      const id = card.dataset.id;
      const p = state.placements[id];
      card.classList.toggle("selected", state.selected === id);
      card.classList.toggle("placed", !!p);
      card.setAttribute("aria-pressed", state.selected === id ? "true" : "false");
      const pos = $(".pos", card);
      const check = $(".check", card);
      if (pos) {
        if (p) {
          pos.hidden = false;
          pos.textContent = `F${p.r} C${p.c}`;
        } else {
          pos.hidden = true;
          pos.textContent = "";
        }
      }
      if (check) check.hidden = !p;
    }
  }

  function syncClues() {
    for (const card of $$(".clue-card", els.clues)) {
      const id = card.dataset.id;
      const used = !!state.used[id];
      card.classList.toggle("used", used);
      card.classList.toggle("selected", state.selected === id);
      const btn = $(".clue-check", card);
      if (btn) btn.setAttribute("aria-pressed", used ? "true" : "false");
      const show = state.filter === "all" || (state.filter === "used" ? used : !used);
      card.hidden = !show;
    }
  }

  function syncCounts() {
    els.placedCount.textContent = String(placementCount());
    els.usedCount.textContent = String(usedCount());
  }

  function syncTimer() {
    els.timer.textContent = `⏱ ${formatTime(state.elapsed)}`;
  }

  function syncPlacing() {
    const id = state.selected;
    if (id) {
      els.placingBadge.hidden = false;
      els.placingName.textContent = nameOf(id);
      els.placingDot.style.setProperty("--c", colorOf(id));
    } else {
      els.placingBadge.hidden = true;
      els.placingName.textContent = "";
      els.placingDot.style.removeProperty("--c");
    }
    els.board.classList.toggle("has-selection", !!id);
    for (const btn of $$(".tool")) {
      const active = btn.dataset.tool === state.tool;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    }
    els.board.dataset.tool = state.tool;
  }

  function syncTreasure() {
    const solved = state.solved;
    els.treasureCard.classList.toggle("solved", solved);
    if (els.treasureLock) els.treasureLock.style.display = solved ? "none" : "grid";

    if (solved) {
      els.treasureCoords.textContent = `Fila ${TREASURE.row} · Columna ${TREASURE.col}`;
      els.crossOverlay.hidden = false;
      els.crossRow.style.top = `${((TREASURE.row - 1) / N) * 100}%`;
      els.crossRow.style.height = `${100 / N}%`;
      els.crossCol.style.left = `${((TREASURE.col - 1) / N) * 100}%`;
      els.crossCol.style.width = `${100 / N}%`;
      els.treasureBurst.style.left = `${((TREASURE.col - 1) / N) * 100}%`;
      els.treasureBurst.style.top = `${((TREASURE.row - 1) / N) * 100}%`;
      els.treasureBurst.style.width = `${100 / N}%`;
      els.treasureBurst.style.height = `${100 / N}%`;
      const col = els.colLabels.children[TREASURE.col - 1];
      const row = els.rowLabels.children[TREASURE.row - 1];
      if (col) col.classList.add("highlight");
      if (row) row.classList.add("highlight");
    } else {
      els.treasureCoords.textContent = "La última casilla libre";
      els.crossOverlay.hidden = true;
      const col = els.colLabels.children[TREASURE.col - 1];
      const row = els.rowLabels.children[TREASURE.row - 1];
      if (col) col.classList.remove("highlight");
      if (row) row.classList.remove("highlight");
    }
  }

  function syncUndoRedo() {
    els.btnUndo.disabled = history.length === 0;
    els.btnRedo.disabled = future.length === 0;
  }

  /* ---------------- Historial ---------------- */

  function snapshot() {
    return {
      placements: clone(state.placements),
      notes: clone(state.notes),
      xmarks: clone(state.xmarks),
      used: clone(state.used),
      startedAt: state.startedAt,
      elapsed: state.elapsed,
      solved: state.solved,
      revealed: state.revealed,
      hints: state.hints
    };
  }

  function pushHistory() {
    history.push(snapshot());
    if (history.length > 80) history.shift();
    future = [];
    syncUndoRedo();
  }

  function restoreSnapshot(snap) {
    state.placements = clone(snap.placements);
    state.notes = clone(snap.notes);
    state.xmarks = clone(snap.xmarks);
    state.used = clone(snap.used);
    state.startedAt = snap.startedAt;
    state.elapsed = snap.elapsed;
    state.solved = snap.solved;
    state.revealed = snap.revealed;
    state.hints = snap.hints;
    if (state.selected && !BY_ID[state.selected]) state.selected = null;
  }

  function undo() {
    if (!history.length) return;
    drag = null;
    future.push(snapshot());
    restoreSnapshot(history.pop());
    syncAll();
    save();
    toast("Deshecho");
  }

  function redo() {
    if (!future.length) return;
    drag = null;
    history.push(snapshot());
    restoreSnapshot(future.pop());
    syncAll();
    save();
    toast("Rehecho");
  }

  /* ---------------- Acciones ---------------- */

  function selectPerson(id, scroll = true) {
    state.selected = state.selected === id ? null : id;
    syncPlacing();
    syncRoster();
    syncClues();
    if (state.selected) {
      const id2 = state.selected;
      if (scroll) {
        const card = els.roster.querySelector(`.person-card[data-id="${id2}"]`);
        if (card) card.scrollIntoView({ block: "nearest", behavior: "smooth" });
        const clue = els.clues.querySelector(`.clue-card[data-id="${id2}"]`);
        if (clue && !clue.hidden) clue.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
      const p = state.placements[id2];
      if (p) boardToast(`${nameOf(id2)} está en F${p.r} C${p.c}. Toca otra casilla para moverlo.`);
      else boardToast(`${nameOf(id2)} seleccionado. Toca para anotar; mantén para colocar.`);
    } else {
      boardToast("");
    }
  }

  function setTool(tool) {
    if (!["note", "place", "x", "erase"].includes(tool)) return;
    state.tool = tool;
    if (tool === "x" || tool === "erase") {
      state.selected = null;
    }
    syncPlacing();
    const messages = {
      note: "Notas: toca para anotar; mantén pulsada una casilla para colocar.",
      place: "Colocar: toca una casilla para poner al sospechoso seleccionado.",
      x: "X: marca casillas imposibles. Vuelve a tocar para quitar la marca.",
      erase: "Borrar: toca una casilla para limpiarla."
    };
    toast(messages[tool], 2200);
  }

  function addNote(id, r, c) {
    const k = keyOf(r, c);
    if (idAt(r, c)) return false;
    if (state.solved) return false;
    if (state.xmarks[k]) delete state.xmarks[k];
    const arr = state.notes[k] ? state.notes[k].slice() : [];
    if (arr.includes(id)) return false;
    arr.push(id);
    arr.sort((a, b) => IDS.indexOf(a) - IDS.indexOf(b));
    state.notes[k] = arr;
    startTimer();
    return true;
  }

  function toggleNote(id, r, c) {
    if (state.solved) return;
    const k = keyOf(r, c);
    const occupied = idAt(r, c);
    if (occupied) {
      toast(`Casilla ocupada por ${nameOf(occupied)}.`);
      return;
    }
    pushHistory();
    const arr = state.notes[k] ? state.notes[k].slice() : [];
    const idx = arr.indexOf(id);
    if (idx >= 0) {
      arr.splice(idx, 1);
      if (arr.length) state.notes[k] = arr;
      else delete state.notes[k];
    } else {
      delete state.xmarks[k];
      arr.push(id);
      arr.sort((a, b) => IDS.indexOf(a) - IDS.indexOf(b));
      state.notes[k] = arr;
      startTimer();
    }
    syncTokens();
    save();
  }

  function toggleX(r, c) {
    if (state.solved) return;
    const occupied = idAt(r, c);
    if (occupied) {
      toast(`Quita primero a ${nameOf(occupied)}.`);
      return;
    }
    pushHistory();
    const k = keyOf(r, c);
    if (state.xmarks[k]) {
      delete state.xmarks[k];
    } else {
      state.xmarks[k] = true;
      delete state.notes[k];
      startTimer();
    }
    syncTokens();
    save();
  }

  function clearCell(r, c) {
    if (state.solved) return;
    const k = keyOf(r, c);
    const pid = idAt(r, c);
    if (!pid && !state.notes[k] && !state.xmarks[k]) return;
    pushHistory();
    if (pid) delete state.placements[pid];
    delete state.notes[k];
    delete state.xmarks[k];
    syncAll();
    save();
    boardToast(pid ? `${nameOf(pid)} retirado` : "Casilla limpiada");
  }

  function placePerson(id, r, c) {
    if (state.solved) {
      toast("Puzle resuelto. Reinicia para volver a jugar.");
      return;
    }
    const other = idAt(r, c);
    if (other && other !== id) {
      toast(`Casilla ocupada por ${nameOf(other)}.`);
      return;
    }
    const prev = state.placements[id];
    if (prev && prev.r === r && prev.c === c) {
      boardToast(`${nameOf(id)} ya está en F${r} C${c}.`);
      return;
    }
    pushHistory();

    // quitar al sospechoso de su casilla anterior
    delete state.placements[id];
    // quitar sus notas de todas las casillas
    for (const k of Object.keys(state.notes)) {
      const arr = state.notes[k].filter(x => x !== id);
      if (arr.length) state.notes[k] = arr;
      else delete state.notes[k];
    }
    // limpiar la casilla destino
    delete state.notes[keyOf(r, c)];
    delete state.xmarks[keyOf(r, c)];

    state.placements[id] = { r, c };
    state.selected = id;
    startTimer();
    syncAll();
    save();
    pulseCell(r, c, 900);
    boardToast(`${nameOf(id)} → Fila ${r}, Columna ${c}`, 1500);
    clearTimeout(allPlacedTimer);
    if (placementCount() === IDS.length) {
      allPlacedTimer = setTimeout(() => boardToast("¡Los 23 sospechosos están colocados! Pulsa Comprobar.", 3000), 500);
    }
  }

  /* ---------------- Comprobar / resolver ---------------- */

  function checkSolution() {
    clearTimeout(allPlacedTimer);
    if (state.solved) {
      toast("El puzle ya está resuelto. Puedes reiniciar para jugar otra vez.");
      return;
    }
    const count = placementCount();
    if (count < IDS.length) {
      toast(`Faltan ${IDS.length - count} sospechoso${IDS.length - count === 1 ? "" : "s"} por colocar.`);
      return;
    }

    // Una persona por fila y columna
    const rowMap = new Map();
    const colMap = new Map();
    const dup = new Set();
    for (const id of IDS) {
      const p = state.placements[id];
      if (!p) continue;
      if (rowMap.has(p.r)) { dup.add(id); dup.add(rowMap.get(p.r)); }
      else rowMap.set(p.r, id);
      if (colMap.has(p.c)) { dup.add(id); dup.add(colMap.get(p.c)); }
      else colMap.set(p.c, id);
    }
    if (dup.size) {
      flashWrong(Array.from(dup));
      toast("Hay dos personas en la misma fila o columna. Corrige las marcas rojas.");
      return;
    }

    const wrong = IDS.filter(id => !isSolvedPlacement(id));
    if (!wrong.length) {
      solve(false);
      return;
    }
    flashWrong(wrong);
    const word = wrong.length === 1 ? "colocación" : "colocaciones";
    const verb = wrong.length === 1 ? "coincide" : "coinciden";
    toast(`${wrong.length} ${word} no ${verb} con las pistas. Revisa las casillas marcadas.`, 3600);
  }

  function solve(fromReveal) {
    if (state.solved) return;
    const elapsed = currentElapsed();
    state.solved = true;
    state.revealed = !!fromReveal || !!state.revealed;
    state.elapsed = elapsed;
    state.startedAt = null;
    IDS.forEach(id => { state.used[id] = true; });
    state.filter = "all";
    $$(".clue-filters .chip").forEach(c => c.classList.toggle("active", c.dataset.filter === "all"));
    syncAll();
    saveNow();
    showVictory();
    confetti();
    boardToast(`¡Tesoro encontrado! Fila ${TREASURE.row}, Columna ${TREASURE.col}`, 4200);
  }

  function hint() {
    if (state.solved) {
      toast("El puzle ya está resuelto.");
      return;
    }
    const pending = IDS.filter(id => !isSolvedPlacement(id));
    if (!pending.length) {
      solve(false);
      return;
    }
    // Preferir una pista cuya casilla no esté ocupada por otra persona.
    const freeTargets = pending.filter(id => {
      const s = solutionOf(id);
      const other = idAt(s.r, s.c);
      return !other || other === id;
    });
    const pool = freeTargets.length ? freeTargets : pending;
    const id = pool[Math.floor(Math.random() * pool.length)];
    const s = solutionOf(id);
    const other = idAt(s.r, s.c);
    pushHistory();
    if (other && other !== id) delete state.placements[other];
    // limpiar notas y X de la casilla
    delete state.notes[keyOf(s.r, s.c)];
    delete state.xmarks[keyOf(s.r, s.c)];
    // quitar notas del jugador
    for (const k of Object.keys(state.notes)) {
      const arr = state.notes[k].filter(x => x !== id);
      if (arr.length) state.notes[k] = arr;
      else delete state.notes[k];
    }
    state.placements[id] = { r: s.r, c: s.c };
    state.selected = id;
    state.hints = (state.hints || 0) + 1;
    startTimer();
    syncAll();
    save();
    pulseCell(s.r, s.c, 2400);
    toast(`Pista: ${nameOf(id)} va en Fila ${s.r}, Columna ${s.c}.`, 3200);
  }

  function revealSolution() {
    if (state.solved) {
      toast("La solución ya está en el tablero.");
      return;
    }
    askConfirm(
      "¿Revelar la solución?",
      "Se colocarán los 23 sospechosos en su posición correcta y aparecerá el cofre. Tu progreso actual se puede deshacer.",
      "Sí, revelar",
      () => {
        pushHistory();
        state.placements = {};
        state.notes = {};
        state.xmarks = {};
        for (const id of IDS) {
          const s = solutionOf(id);
          state.placements[id] = { r: s.r, c: s.c };
        }
        state.revealed = true;
        syncAll();
        solve(true);
      }
    );
  }

  function resetPuzzle(skipConfirm = false) {
    const doReset = () => {
      clearTimeout(allPlacedTimer);
      state = defaultState();
      history = [];
      future = [];
      drag = null;
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      closeModal("modalVictory");
      closeModal("modalConfirm");
      syncAll();
      saveNow();
      toast("Puzle reiniciado. ¡Buena suerte!");
      boardToast("Tablero vacío");
    };
    if (skipConfirm) {
      doReset();
      return;
    }
    askConfirm(
      "¿Reiniciar el puzle?",
      "Se borrarán todas las notas, marcas y colocaciones. Esta acción no se puede deshacer.",
      "Sí, reiniciar",
      doReset
    );
  }

  /* ---------------- Modales ---------------- */

  function openModal(id) {
    if (currentModal && currentModal !== id) closeModal(currentModal, false);
    const modal = document.getElementById(id);
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    currentModal = id;
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      const focusable = modal.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      if (focusable) focusable.focus({ preventScroll: true });
    }, 40);
  }

  function closeModal(id, restoreFocus = true) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = true;
    if (currentModal === id) currentModal = null;
    if (!document.querySelector(".modal:not([hidden])")) {
      document.body.style.overflow = "";
    }
    if (id === "modalConfirm") confirmAction = null;
    if (id === "modalHow" && els.dontShowHow) {
      try {
        if (els.dontShowHow.checked) localStorage.setItem(HOW_KEY, "1");
        else localStorage.removeItem(HOW_KEY);
      } catch (e) {}
    }
    if (restoreFocus && lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
  }

  function askConfirm(title, text, okLabel, cb) {
    els.confirmTitle.textContent = title;
    els.confirmText.textContent = text;
    els.confirmOk.textContent = okLabel;
    confirmAction = cb;
    openModal("modalConfirm");
  }

  function showHow() {
    try {
      els.dontShowHow.checked = localStorage.getItem(HOW_KEY) === "1";
    } catch (e) {
      els.dontShowHow.checked = false;
    }
    openModal("modalHow");
  }

  function syncFullscreenLabel() {
    if (!els.btnFullscreen) return;
    const on = !!(document.fullscreenElement || document.webkitFullscreenElement);
    els.btnFullscreen.innerHTML = on
      ? '<span aria-hidden="true">⛶</span> Salir de pantalla completa'
      : '<span aria-hidden="true">⛶</span> Pantalla completa';
  }

  function toggleFullscreen() {
    const root = document.documentElement;
    const isFull = document.fullscreenElement || document.webkitFullscreenElement;
    try {
      if (!isFull) {
        const request = root.requestFullscreen || root.webkitRequestFullscreen;
        if (!request) {
          toast("Tu navegador no permite pantalla completa.");
          return;
        }
        const result = request.call(root);
        if (result && result.catch) result.catch(() => toast("No se pudo activar la pantalla completa."));
      } else {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) exit.call(document);
      }
    } catch (e) {
      toast("No se pudo cambiar el modo de pantalla completa.");
    }
  }

  function showVictory() {
    els.victoryCoords.textContent = `Fila ${TREASURE.row} · Columna ${TREASURE.col}`;
    els.victorySub.textContent = state.revealed
      ? "Solución revelada. El cofre estaba en la única casilla que no comparte fila ni columna con ningún sospechoso."
      : "La única casilla que no comparte fila ni columna con ningún sospechoso.";
    const stats = [
      { label: "Tiempo", value: formatTime(state.elapsed) },
      { label: "Pistas", value: String(state.hints || 0) },
      { label: "Sospechosos", value: "23/23" }
    ];
    els.victoryStats.innerHTML = stats
      .map(s => `<div class="victory-stat"><b>${s.value}</b>${s.label}</div>`)
      .join("");
    setTimeout(() => { if (state.solved) openModal("modalVictory"); }, 260);
  }

  function confetti() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#c9a227", "#b23a3a", "#3f7d5a", "#3e6f9a", "#d96c9e", "#f4d47a", "#8e6bbf"];
    const layer = document.createElement("div");
    layer.className = "confetti";
    for (let i = 0; i < 90; i++) {
      const piece = document.createElement("i");
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = `${5 + Math.random() * 7}px`;
      piece.style.height = `${8 + Math.random() * 10}px`;
      piece.style.animationDuration = `${2.6 + Math.random() * 2.6}s`;
      piece.style.animationDelay = `${Math.random() * 0.7}s`;
      piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 220}px`);
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      layer.appendChild(piece);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 7000);
  }

  /* ---------------- Interacción con el tablero ---------------- */

  function onPointerDown(e) {
    if (state.solved) {
      toast("Puzle resuelto. Reinicia para volver a jugar.");
      return;
    }
    if (e.button !== undefined && e.button !== 0) return;
    const cell = e.target.closest(".cell");
    if (!cell) return;
    const r = Number(cell.dataset.r);
    const c = Number(cell.dataset.c);

    if (state.tool === "x") {
      e.preventDefault();
      toggleX(r, c);
      return;
    }
    if (state.tool === "erase") {
      e.preventDefault();
      clearCell(r, c);
      return;
    }

    const id = state.selected;
    if (!id) {
      const placed = idAt(r, c);
      if (placed) {
        selectPerson(placed);
      } else {
        toast("Selecciona primero un sospechoso en la lista.");
      }
      return;
    }

    if (state.tool === "place") {
      e.preventDefault();
      placePerson(id, r, c);
      return;
    }

    // Herramienta de notas: toque = nota; mantener = colocar; arrastrar = pintar notas.
    if (idAt(r, c)) {
      const other = idAt(r, c);
      toast(`Casilla ocupada por ${nameOf(other)}.`);
      return;
    }
    e.preventDefault();
    drag = {
      pointerId: e.pointerId,
      id,
      start: { r, c },
      last: { r, c },
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      longPressed: false,
      historyPushed: false,
      timer: null
    };
    const delay = e.pointerType === "touch" ? 430 : 380;
    drag.timer = setTimeout(() => {
      if (!drag || drag.moved) return;
      drag.longPressed = true;
      placePerson(id, r, c);
      if (navigator.vibrate) navigator.vibrate(12);
    }, delay);
    try { cell.setPointerCapture(e.pointerId); } catch (err) {}
  }

  function onPointerMove(e) {
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (drag.longPressed) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 8) return;

    if (!drag.moved) {
      drag.moved = true;
      clearTimeout(drag.timer);
      drag.timer = null;
      if (!drag.historyPushed) {
        pushHistory();
        drag.historyPushed = true;
      }
      // incluir la casilla inicial al empezar a pintar
      addNote(drag.id, drag.start.r, drag.start.c);
      syncTokens();
    }

    const under = document.elementFromPoint(e.clientX, e.clientY);
    const cell = under && under.closest ? under.closest(".cell") : null;
    if (!cell) return;
    const r = Number(cell.dataset.r);
    const c = Number(cell.dataset.c);
    if (r === drag.last.r && c === drag.last.c) return;
    drag.last = { r, c };
    const added = addNote(drag.id, r, c);
    if (added) {
      syncTokens();
    }
  }

  function onPointerUp(e) {
    if (!drag || drag.pointerId !== e.pointerId) return;
    clearTimeout(drag.timer);
    drag.timer = null;
    if (!drag.moved && !drag.longPressed) {
      toggleNote(drag.id, drag.start.r, drag.start.c);
    } else if (drag.moved) {
      save();
    }
    drag = null;
  }

  function onPointerCancel() {
    if (drag) clearTimeout(drag.timer);
    drag = null;
  }

  function onContextMenu(e) {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    e.preventDefault();
    if (state.solved) return;
    clearCell(Number(cell.dataset.r), Number(cell.dataset.c));
  }

  /* ---------------- Eventos ---------------- */

  function bindEvents() {
    // Herramientas
    for (const btn of $$(".tool")) {
      btn.addEventListener("click", () => setTool(btn.dataset.tool));
    }

    // Tablero
    els.cells.addEventListener("pointerdown", onPointerDown);
    els.cells.addEventListener("pointermove", onPointerMove);
    els.cells.addEventListener("pointerup", onPointerUp);
    els.cells.addEventListener("pointercancel", onPointerCancel);
    els.cells.addEventListener("contextmenu", onContextMenu);

    // Roster
    els.roster.addEventListener("click", (e) => {
      const card = e.target.closest(".person-card");
      if (!card) return;
      selectPerson(card.dataset.id);
    });

    // Pistas
    els.clues.addEventListener("click", (e) => {
      const check = e.target.closest(".clue-check");
      const card = e.target.closest(".clue-card");
      if (!card) return;
      const id = card.dataset.id;
      if (check) {
        e.stopPropagation();
        state.used[id] = !state.used[id];
        if (!state.used[id]) delete state.used[id];
        syncClues();
        syncCounts();
        save();
        return;
      }
      selectPerson(id);
    });

    els.clues.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest(".clue-card");
      if (!card || e.target.closest(".clue-check")) return;
      e.preventDefault();
      selectPerson(card.dataset.id);
    });

    // Filtros
    for (const chip of $$(".clue-filters .chip")) {
      chip.addEventListener("click", () => {
        state.filter = chip.dataset.filter;
        $$(".clue-filters .chip").forEach(c => c.classList.toggle("active", c === chip));
        syncClues();
      });
    }

    // Botones
    els.btnUndo.addEventListener("click", undo);
    els.btnRedo.addEventListener("click", redo);
    els.btnCheck.addEventListener("click", checkSolution);
    els.btnHint.addEventListener("click", hint);
    els.btnReveal.addEventListener("click", revealSolution);
    els.btnReset.addEventListener("click", () => resetPuzzle(false));
    els.btnHow.addEventListener("click", showHow);
    if (els.btnFullscreen) {
      if (!document.documentElement.requestFullscreen && !document.documentElement.webkitRequestFullscreen) {
        els.btnFullscreen.style.display = "none";
      } else {
        els.btnFullscreen.addEventListener("click", toggleFullscreen);
        document.addEventListener("fullscreenchange", syncFullscreenLabel);
        document.addEventListener("webkitfullscreenchange", syncFullscreenLabel);
      }
    }
    els.placingClear.addEventListener("click", () => {
      state.selected = null;
      syncPlacing();
      syncRoster();
      syncClues();
    });

    // Modales
    $$("[data-close]").forEach(el => {
      el.addEventListener("click", () => closeModal(el.dataset.close));
    });
    els.confirmCancel.addEventListener("click", () => {
      confirmAction = null;
      closeModal("modalConfirm");
    });
    els.confirmOk.addEventListener("click", () => {
      const cb = confirmAction;
      confirmAction = null;
      closeModal("modalConfirm");
      if (cb) cb();
    });
    els.victoryClose.addEventListener("click", () => closeModal("modalVictory"));
    els.victoryAgain.addEventListener("click", () => {
      closeModal("modalVictory");
      resetPuzzle(true);
    });
    if (els.dontShowHow) {
      els.dontShowHow.addEventListener("change", () => {
        try {
          if (els.dontShowHow.checked) localStorage.setItem(HOW_KEY, "1");
          else localStorage.removeItem(HOW_KEY);
        } catch (e) {}
      });
    }

    // Teclado
    document.addEventListener("keydown", (e) => {
      const tag = (e.target && e.target.tagName) || "";
      const typing = /INPUT|TEXTAREA|SELECT/.test(tag) || (e.target && e.target.isContentEditable);
      if (e.key === "Escape") {
        if (currentModal) {
          closeModal(currentModal);
          e.preventDefault();
        } else if (state.selected) {
          state.selected = null;
          syncPlacing();
          syncRoster();
          syncClues();
          e.preventDefault();
        }
        return;
      }
      if (typing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        showHow();
        return;
      }
      const k = e.key.toLowerCase();
      if (k === "n") { setTool("note"); e.preventDefault(); }
      else if (k === "p") { setTool("place"); e.preventDefault(); }
      else if (k === "x") { setTool("x"); e.preventDefault(); }
      else if (k === "e") { setTool("erase"); e.preventDefault(); }
    });

    // Guardar al salir / ocultar
    const saveWithTime = () => {
      if (state.startedAt && !state.solved) state.elapsed = currentElapsed();
      saveNow();
    };
    window.addEventListener("beforeunload", saveWithTime);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") saveWithTime();
    });
  }

  /* ---------------- Inicio ---------------- */

  function startTick() {
    clearInterval(timers.tick);
    timers.tick = setInterval(() => {
      if (state.startedAt && !state.solved) {
        state.elapsed = (Date.now() - state.startedAt) / 1000;
        syncTimer();
      }
    }, 500);
  }

  function init() {
    buildLabels();
    buildCells();
    buildRoster();
    buildClues();
    bindEvents();

    const params = new URLSearchParams(window.location.search);
    const skipIntro = params.get("intro") === "0";

    const restored = loadState();

    // Modo de demostración para capturas: ?demo=solved
    if (params.get("demo") === "solved") {
      state.placements = {};
      for (const id of IDS) {
        const s = solutionOf(id);
        state.placements[id] = { r: s.r, c: s.c };
      }
      state.solved = true;
      state.elapsed = 754;
      state.startedAt = null;
      IDS.forEach(id => { state.used[id] = true; });
    }

    syncAll();
    startTick();

    if (params.get("demo") === "solved") {
      // Sin modal de victoria para poder ver el tablero completo.
      return;
    }

    if (restored) {
      if (state.solved) {
        // El tablero se muestra resuelto, sin abrir el modal automáticamente.
        setTimeout(() => toast("Progreso restaurado: puzle resuelto.", 3200), 400);
      } else {
        setTimeout(() => toast("Progreso restaurado. Sigue donde lo dejaste.", 2600), 400);
      }
    } else {
      let hideHow = false;
      try { hideHow = localStorage.getItem(HOW_KEY) === "1"; } catch (e) {}
      if (!hideHow && !skipIntro) {
        setTimeout(() => openModal("modalHow"), 450);
      } else {
        setTimeout(() => toast("Selecciona un sospechoso y toca una casilla para empezar.", 3600), 700);
      }
    }
  }

  init();
})();
