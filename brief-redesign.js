(() => {
  const svg = document.querySelector('.decode-visual');
  const buttons = [...document.querySelectorAll('.decode-node')];
  const progress = document.querySelector('.decode-progress');
  const clue = document.querySelector('.decode-clue');
  const art = document.querySelector('.decode-art');
  const label = document.querySelector('.decode-artlabel');
  const primary = document.querySelector('.decode-primary');
  const live = document.querySelector('.decode-live');
  const eyebrow = document.querySelector('.decode-eyebrow');
  const consoleHead = document.querySelector('.decode-console-head > span:first-child');
  const consolePanel = document.querySelector('.decode-console');
  const footline = document.querySelector('.decode-footline > span:last-child');
  const resetButton = document.querySelector('.decode-reset');
  const hintButton = document.querySelector('.decode-hint');
  const transition = document.querySelector('.brief-transition');
  if (!svg || buttons.length !== 6) {
    document.documentElement.classList.remove('brief-locked');
    return;
  }

  const puzzleScene = document.createElement('div');
  puzzleScene.className = 'puzzle-scene';
  puzzleScene.inert = true;
  art.insertBefore(puzzleScene, svg);
  puzzleScene.append(svg, ...buttons);

  // One drawing per Chicago calendar day. artDate previews another day's design.
  const previewDate = new URLSearchParams(location.search).get('artDate');
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const part = name => parts.find(item => item.type === name)?.value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(previewDate || '')
    ? previewDate
    : today;
  const [year, month, day] = date.split('-').map(Number);
  const dayIndex = Math.floor(Date.UTC(year, month - 1, day) / 86400000);
  let seed = 2166136261;
  for (const char of date) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  const random = () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const n = (min, max) => Math.round(min + random() * (max - min));
  const mode = ((dayIndex % 5) + 5) % 5;
  const shuffle = items => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const gameType = ['pulse', 'pairs', 'route'][((dayIndex % 3) + 3) % 3];
  puzzleScene.dataset.game = gameType;
  const boardShapes = {
    pulse: [[165, 160], [435, 160], [165, 335], [435, 335]],
    pairs: [[135, 260], [210, 145], [390, 145], [465, 260], [390, 365], [210, 365]],
    route: [[135, 325], [185, 165], [300, 125], [415, 165], [465, 325]]
  };
  const points = boardShapes[gameType].map(([x, y]) => [
    gameType === 'route' && dayIndex % 2 ? 600 - x + n(-5, 5) : x + n(-5, 5),
    y + n(-5, 5)
  ]);
  const letters = shuffle('ABCDEF');
  const values = shuffle([1, 2, 3, 5, 8, 13]);
  const pairOrder = shuffle([0, 1, 2, 3, 4, 5]);
  const pairs = [0, 2, 4].map(i => [pairOrder[i], pairOrder[i + 1]]);
  const pulseOrder = shuffle([0, 1, 2, 3]);
  const edges = gameType === 'route'
    ? [[0, 1], [1, 2], [2, 3], [3, 4], [0, 2], [2, 4]]
    : gameType === 'pulse' ? [[0, 1], [1, 3], [3, 2], [2, 0]] : [];
  const connected = (a, b) => edges.some(([u, v]) => (u === a && v === b) || (u === b && v === a));
  const neighbors = id => edges.flatMap(([a, b]) => a === id ? [b] : b === id ? [a] : []);
  const angle = n(-10, 10);
  const offset = n(-17, 17);
  const radius = n(145, 169);

  // Five distinct families keep the odd geometry composed rather than fully random.
  const motifs = [
    `<g class="decode-drift"><circle class="form" cx="300" cy="251" r="${radius}"/><ellipse class="soft" cx="300" cy="251" rx="208" ry="96" transform="rotate(${angle} 300 251)"/><path class="form" d="M 111 250 C 171 70 414 62 492 247"/><path class="ghost" d="M 93 289 C 159 461 421 449 507 280"/><circle class="fill" cx="${n(440, 475)}" cy="${n(101, 138)}" r="8"/></g><path class="axis" d="M 286 65 h 28 M 300 51 v 28 M 81 250 h 32 M 487 250 h 32"/>`,
    `<g class="decode-drift"><path class="form" d="M 107 369 C 88 244 168 111 303 101 C 433 91 521 189 484 309 C 460 388 361 435 270 406"/><path class="soft" d="M 128 341 C 146 189 251 126 372 150 C 467 169 475 271 408 337"/><path class="form" d="M 127 369 L 304 89 L 495 365 Z"/><circle class="ghost" cx="303" cy="259" r="${radius}"/><path class="axis" d="M 201 97 h 54 M 201 97 v 48 M 449 400 h -50 M 449 400 v -45"/><circle class="fill" cx="${397 + offset}" cy="${120 + n(-7, 7)}" r="7"/></g>`,
    `<g class="decode-drift"><path class="form" d="M 66 335 C 149 113 250 132 299 264 S 452 450 540 129"/><path class="soft" d="M 72 360 C 153 139 247 155 302 288 S 451 468 531 163"/><path class="soft" d="M 84 389 C 160 175 250 182 307 313 S 448 480 522 193"/><circle class="ghost" cx="301" cy="260" r="${radius}"/><path class="axis" d="M 107 111 h 72 M 107 111 v 71 M 480 396 h -72 M 480 396 v -71"/><rect class="fill" x="${n(414, 451)}" y="${n(94, 122)}" width="11" height="11" transform="rotate(23 430 110)"/></g>`,
    `<g class="decode-drift"><rect class="form" x="164" y="108" width="272" height="310" rx="${n(78, 110)}" transform="rotate(${angle} 300 263)"/><rect class="soft" x="203" y="146" width="194" height="232" rx="${n(45, 78)}" transform="rotate(${-angle} 300 263)"/><path class="form" d="M 111 241 Q 300 57 490 241 Q 300 453 111 241 Z"/><path class="ghost" d="M 72 260 H 528 M 300 56 V 454"/><circle class="fill" cx="${300 + offset}" cy="${n(107, 135)}" r="8"/></g>`,
    `<g class="decode-drift"><path class="form" d="M 106 350 L 167 123 L 328 88 L 486 177 L 444 410 L 218 428 Z"/><path class="soft" d="M 167 123 L 444 410 M 106 350 L 486 177 M 328 88 L 218 428"/><circle class="ghost" cx="300" cy="259" r="${radius}"/><circle class="soft" cx="300" cy="259" r="${Math.round(radius * .57)}"/><path class="form" d="M 187 307 Q 302 169 408 303 Q 291 390 187 307 Z"/><path class="axis" d="M 82 113 h 75 M 82 113 v 75 M 518 407 h -75 M 518 407 v -75"/><circle class="fill" cx="${n(109, 146)}" cy="${n(138, 177)}" r="8"/></g>`
  ];
  const signature = Array.from({ length: 10 }, (_, i) => {
    const x = 110 + i * 13;
    const height = n(8, 26);
    return `M ${x} 463 v -${height}`;
  }).join(' ');
  const dailyArt = window.createDailyArt?.(date);
  const gameCopy = {
    pulse: {
      name: 'Pulse Memory', heading: 'Repeat the pulse',
      instruction: 'Press PLAY SIGNAL. Watch four flashes, then repeat them.',
      action: 'Play signal'
    },
    pairs: {
      name: 'Sum Cipher', heading: 'Open three number locks',
      instruction: 'Choose two numbers that add up to the target.',
      action: 'Start the cipher'
    },
    route: {
      name: 'Constellation Route', heading: 'Trace five signals',
      instruction: 'ENTRY → all five nodes → EXIT. Follow the blue lines.',
      action: 'Start routing'
    }
  };
  const copy = gameCopy[gameType];
  const actionSignal = '<span class="decode-action-signal" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
  const network = edges.map(([a, b]) =>
    `<line class="signal-edge" x1="${points[a][0]}" y1="${points[a][1]}" x2="${points[b][0]}" y2="${points[b][1]}"/>`
  ).join('');
  const orbit = gameType === 'pairs'
    ? '<ellipse class="signal-orbit" cx="300" cy="255" rx="182" ry="125"/>' : '';
  svg.innerHTML = `<g class="decode-motif">${motifs[mode]}</g>${orbit}<g class="signal-back-network">${network}</g><g class="signal-network">${network}</g><g class="signal-energy-network">${network}</g><g class="signal-solved-lines"></g><polyline class="signal-path" points=""/><path class="axis" d="${signature}"/>`;
  svg.setAttribute('aria-label', `${copy.name.toLowerCase()} for ${date}. ${copy.instruction}`);
  label.textContent = `FIG 01 / ${copy.name} / ${date.replaceAll('-', '.')}`;
  const puzzleArtLabel = svg.getAttribute('aria-label');
  if (dailyArt) svg.innerHTML += dailyArt.markup;
  let renderStage = null;
  let renderImage = null;
  let renderHalo = null;
  let wireRenderer = null;
  if (dailyArt?.render) {
    renderStage = document.createElement('div');
    renderStage.className = 'daily-render-stage has-authored-image';
    renderStage.dataset.motion = dailyArt.render.motion;
    renderHalo = document.createElement('div');
    renderHalo.className = 'daily-render-halo';
    renderImage = document.createElement('img');
    renderImage.className = 'daily-render-image';
    renderImage.src = dailyArt.render.src;
    renderImage.alt = dailyArt.render.description;
    renderImage.decoding = 'async';
    renderImage.loading = 'eager';
    renderImage.addEventListener('error', () => renderImage.remove());
    renderStage.append(renderHalo, renderImage);
  } else if (dailyArt) {
    renderStage = document.createElement('div');
    renderStage.className = 'daily-render-stage';
    renderStage.dataset.motion = 'wire';
    renderHalo = document.createElement('div');
    renderHalo.className = 'daily-render-halo';
    renderStage.append(renderHalo);
  }
  if (dailyArt && window.createDailyWireRender) {
    if (!renderStage) {
      renderStage = document.createElement('div');
      renderStage.className = 'daily-render-stage';
    }
    const canvas = document.createElement('canvas');
    canvas.className = 'daily-wire-canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `${(dailyArt.render?.name || dailyArt.name).toLowerCase()}, a living three-dimensional line sculpture for ${date}`);
    renderStage.append(canvas);
    wireRenderer = window.createDailyWireRender(canvas, date, dailyArt.mode, { authored: !!dailyArt.render });
  }
  if (renderStage) {
    art.append(renderStage);
    art.classList.add('has-daily-render');
  }
  let puzzleRenderer = null;
  if (window.createDailyWireRender) {
    const puzzleCanvas = document.createElement('canvas');
    puzzleCanvas.className = 'puzzle-depth-canvas';
    puzzleCanvas.setAttribute('aria-hidden', 'true');
    puzzleScene.prepend(puzzleCanvas);
    const puzzleMode = gameType === 'pairs' ? 4 : gameType === 'route' ? 3 : 7;
    puzzleRenderer = window.createDailyWireRender(puzzleCanvas, `${date}:puzzle:${gameType}`, puzzleMode);
  }
  const count = points.length;
  buttons.forEach((button, id) => {
    button.hidden = id >= count;
    if (button.hidden) return;
    button.style.left = `${points[id][0] / 6}%`;
    button.style.top = `${points[id][1] / 5.2}%`;
    button.style.setProperty('--node-index', id);
    button.innerHTML = `<span class="decode-node-symbol">${gameType === 'pairs' ? values[id] : letters[id]}</span>`;
    button.classList.toggle('is-entry', gameType === 'route' && id === 0);
    button.classList.toggle('is-exit', gameType === 'route' && id === 4);
    button.classList.toggle('is-number', gameType === 'pairs');
    const connections = gameType === 'route' ? ` Connected to ${neighbors(id).map(next => letters[next]).join(', ')}.` : '';
    button.setAttribute('aria-label', gameType === 'pairs'
      ? `Number ${values[id]}`
      : `Node ${letters[id]}${gameType === 'route' && id === 0 ? ', entry' : gameType === 'route' && id === 4 ? ', exit' : ''}.${connections}`);
  });

  const trace = svg.querySelector('.signal-path');
  const solvedLines = svg.querySelector('.signal-solved-lines');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = window.BriefMotion?.animate;
  const storageKey = `brief-unlocked-v3:${location.pathname}:${date}`;
  const html = document.documentElement;
  let unlocked = false;
  let puzzleStarted = false;
  let transitioning = false;
  let wrongTimer = 0;
  let hintTimer = 0;
  let route = [];
  let pairRound = 0;
  let pairSelected = -1;
  let pairSolved = new Set();
  let pulseIndex = 0;
  let pulseReady = false;
  let pulsePlaying = false;
  let pulseRun = 0;
  let revealAnimation;
  let artLoop;
  let artRingLoop;
  let artSpecificLoops = [];
  let puzzleLoop;
  let tiltFrame = 0;
  let pointerX = 0;
  let pointerY = 0;

  art.addEventListener('pointermove', event => {
    if (unlocked || reducedMotion.matches || event.pointerType === 'touch') return;
    const bounds = art.getBoundingClientRect();
    pointerX = (event.clientX - bounds.left) / bounds.width - .5;
    pointerY = (event.clientY - bounds.top) / bounds.height - .5;
    if (tiltFrame) return;
    tiltFrame = requestAnimationFrame(() => {
      tiltFrame = 0;
      puzzleScene.style.setProperty('--puzzle-tilt-x', `${(-pointerY * 12).toFixed(2)}deg`);
      puzzleScene.style.setProperty('--puzzle-tilt-y', `${(pointerX * 12).toFixed(2)}deg`);
      puzzleScene.style.setProperty('--puzzle-back-x', `${(-pointerX * 46).toFixed(1)}px`);
      puzzleScene.style.setProperty('--puzzle-back-y', `${(-pointerY * 34).toFixed(1)}px`);
      puzzleScene.style.setProperty('--puzzle-light-x', `${(pointerX * 180).toFixed(1)}px`);
      puzzleScene.style.setProperty('--puzzle-light-y', `${(pointerY * 140).toFixed(1)}px`);
    });
  });
  art.addEventListener('pointerleave', () => {
    cancelAnimationFrame(tiltFrame);
    tiltFrame = 0;
    puzzleScene.style.setProperty('--puzzle-tilt-x', '0deg');
    puzzleScene.style.setProperty('--puzzle-tilt-y', '0deg');
    puzzleScene.style.setProperty('--puzzle-back-x', '0px');
    puzzleScene.style.setProperty('--puzzle-back-y', '0px');
    puzzleScene.style.setProperty('--puzzle-light-x', '0px');
    puzzleScene.style.setProperty('--puzzle-light-y', '0px');
  });

  function animateNode(id) {
    if (reducedMotion.matches || !motion) return;
    const symbol = buttons[id]?.querySelector('.decode-node-symbol');
    if (symbol) motion(symbol, { scale: [1, 1.42, 1] }, { type: 'spring', bounce: 0.26, visualDuration: 0.44 });
  }

  function startPuzzleMotion() {
    puzzleRenderer?.start();
    if (reducedMotion.matches || !motion) return;
    puzzleLoop?.stop();
    buttons.slice(0, count).forEach((button, id) => {
      motion(button, { opacity: [0, 1] }, { duration: 0.48, delay: 0.12 + id * 0.075, ease: 'easeOut' });
    });
    const orbit = svg.querySelector('.signal-orbit');
    if (orbit) puzzleLoop = motion(orbit, { opacity: [0.22, 0.7, 0.22] }, { duration: 3.8, repeat: Infinity, ease: 'easeInOut' });
    else {
      const edges = svg.querySelectorAll('.signal-network .signal-edge');
      if (edges.length) puzzleLoop = motion(edges, { opacity: [0.3, 0.82, 0.3] }, { duration: 3.6, repeat: Infinity, ease: 'easeInOut' });
    }
  }

  function revealPuzzle() {
    if (puzzleStarted || unlocked) return;
    puzzleStarted = true;
    puzzleScene.inert = false;
    art.classList.remove('puzzle-awaiting');
    startPuzzleMotion();
  }

  function startArtworkMotion() {
    if (!dailyArt) return;
    wireRenderer?.start();
    if (wireRenderer && !renderImage) return;
    if (reducedMotion.matches || !motion) return;
    art.classList.add('motion-ready');
    artLoop?.stop();
    artRingLoop?.stop();
    artSpecificLoops.forEach(animation => animation.stop());
    artSpecificLoops = [];
    if (renderImage && renderStage && art.classList.contains('has-daily-render')) {
      const isFold = dailyArt.render.motion === 'fold';
      artLoop = motion(renderImage, isFold
        ? { rotateY: [-3, 3, -3], rotateZ: [-1, 1, -1], scale: [1, 1.045, 1.005, 1.03, 1] }
        : { rotateY: [-7, 7, -7], rotateX: [2, -2, 2], rotateZ: [-1.5, 1.5, -1.5], scale: [1, 1.025, 1] },
      { duration: isFold ? 4.2 : 9, repeat: Infinity, ease: 'easeInOut' });
      artRingLoop = motion(renderHalo, isFold
        ? { scale: [.84, 1.16, .87, 1.09, .84], opacity: [.18, .48, .2, .38, .18] }
        : { x: [-24, 24, -24], scale: [.9, 1.1, .9], opacity: [.17, .42, .17] },
      { duration: isFold ? 4.2 : 9, repeat: Infinity, ease: 'easeInOut' });
      return;
    }
    const core = svg.querySelector('.daily-art-core');
    const ring = svg.querySelector('.daily-art-pulse-ring');
    const mode = dailyArt.mode;
    const movements = [
      { y: [0, -7, 4, 0], scale: [1, 1.035, 1] },
      { scale: [1, 1.075, 1.01, 1.055, 1] },
      { rotate: [-1.5, 1.5, -1.5], scale: [1, 1.025, 1] },
      { scale: [1, 1.025, 1] },
      { x: [-4, 4, -4], scale: [1, 1.02, 1] },
      { scale: [1, 1.035, 1] },
      { y: [0, 5, -5, 0], scale: [1, 1.025, 1] },
      { rotate: [-2, 2, -2], scale: [1, 1.065, 1] }
    ];
    const duration = mode === 1 ? 3.8 : 5.6;
    if (core) artLoop = motion(core, movements[mode], { duration, repeat: Infinity, ease: 'easeInOut' });
    if (ring) artRingLoop = motion(ring, { scale: [0.62, 1, 1.48], opacity: [0, 0.5, 0] }, { duration, times: [0, 0.2, 0.75], repeat: Infinity, ease: 'easeOut' });
    const loop = (selector, keyframes, options) => {
      const element = svg.querySelector(selector);
      if (element) artSpecificLoops.push(motion(element, keyframes, { repeat: Infinity, ...options }));
    };
    switch (mode) {
      case 0:
        loop('.daily-art-waves', { x: [-10, 10, -10] }, { duration: 7.2, ease: 'easeInOut' });
        loop('.daily-art-orb', { opacity: [0.55, 0.95, 0.55] }, { duration: 4.4, ease: 'easeInOut' });
        break;
      case 1:
        loop('.daily-art-petals', { rotate: [-2, 3, -2], scale: [1, 1.04, 1] }, { duration: 6.8, ease: 'easeInOut' });
        loop('.daily-art-center', { scale: [1, 1.12, 1, 1.08, 1] }, { duration: 3.8, times: [0, .12, .26, .38, 1], ease: 'easeInOut' });
        break;
      case 2:
        loop('.daily-art-shards', { rotate: [-2, 2, -2] }, { duration: 8.2, ease: 'easeInOut' });
        loop('.daily-art-sheen', { x: [-22, 20, -22], opacity: [.1, .8, .1] }, { duration: 5.2, ease: 'easeInOut' });
        break;
      case 3:
        loop('.daily-art-orbits', { rotate: [0, 360] }, { duration: 36, ease: 'linear' });
        break;
      case 4:
        loop('.daily-art-lattice', { opacity: [.44, .92, .44] }, { duration: 5.4, ease: 'easeInOut' });
        loop('.daily-art-stars', { scale: [.98, 1.07, .98], opacity: [.56, 1, .56] }, { duration: 4.2, ease: 'easeInOut' });
        break;
      case 5:
        loop('.daily-art-corona', { scale: [.96, 1.07, .96], opacity: [.7, 1, .7] }, { duration: 7.8, ease: 'easeInOut' });
        loop('.daily-art-occluder', { x: [-7, 7, -7] }, { duration: 11, ease: 'easeInOut' });
        break;
      case 6:
        loop('.daily-art-ribbons', { y: [-9, 9, -9], rotate: [-1.5, 1.5, -1.5] }, { duration: 7.3, ease: 'easeInOut' });
        loop('.daily-art-glint', { scale: [.8, 1.24, .8], opacity: [.4, .94, .4] }, { duration: 4.4, ease: 'easeInOut' });
        break;
      case 7:
        loop('.daily-art-spokes', { rotate: [-4, 4, -4], opacity: [.55, .95, .55] }, { duration: 12, ease: 'easeInOut' });
        loop('.daily-art-stars', { scale: [.94, 1.08, .94], opacity: [.55, 1, .55] }, { duration: 4.7, ease: 'easeInOut' });
        break;
    }
    if (dailyArt.variation) loop('.daily-art-variation', { opacity: [.17, .45, .17], rotate: [-1, 1, -1] }, { duration: 9, ease: 'easeInOut' });
  }

  const target = () => values[pairs[pairRound][0]] + values[pairs[pairRound][1]];
  const prompt = () => gameType === 'pairs'
    ? `LOCK ${pairRound + 1} / 3 · Make ${target()} with two numbers.`
    : copy.instruction;

  function setLockedCopy() {
    consolePanel?.setAttribute('aria-label', "Solve today's mini game");
    if (eyebrow) eyebrow.textContent = copy.name;
    if (consoleHead) consoleHead.textContent = copy.heading;
    if (footline) footline.textContent = 'SOLVE TODAY’S GAME TO CONTINUE ↓';
    if (live) live.textContent = 'BRIEF LOCKED';
    if (primary) primary.innerHTML = `${copy.action} ${actionSignal}`;
    if (resetButton) resetButton.textContent = gameType === 'pulse' ? 'Replay signal ↺' : gameType === 'pairs' ? 'Reset cipher ↺' : 'Reset route ↺';
    if (hintButton) hintButton.hidden = gameType === 'pulse';
    clue.textContent = gameType === 'pairs' ? prompt() : copy.instruction;
  }

  function updateVisual() {
    if (gameType === 'route') {
      trace.setAttribute('points', route.map(id => points[id].join(',')).join(' '));
      progress.textContent = `${String(route.length).padStart(2, '0')} / 05`;
      buttons.forEach((button, id) => button.setAttribute('aria-pressed', String(route.includes(id))));
      art.classList.toggle('has-progress', route.length > 0);
      if (resetButton) resetButton.hidden = !unlocked && route.length === 0;
    } else if (gameType === 'pairs') {
      solvedLines.innerHTML = pairs.slice(0, pairRound).map(([a, b]) =>
        `<line class="signal-match" x1="${points[a][0]}" y1="${points[a][1]}" x2="${points[b][0]}" y2="${points[b][1]}"/>`
      ).join('');
      progress.textContent = `${String(pairRound).padStart(2, '0')} / 03`;
      buttons.forEach((button, id) => {
        button.classList.toggle('is-solved', pairSolved.has(id));
        button.setAttribute('aria-pressed', String(pairSolved.has(id) || pairSelected === id));
        button.disabled = pairSolved.has(id) && !unlocked;
      });
      art.classList.toggle('has-progress', pairRound > 0 || pairSelected >= 0);
      if (resetButton) resetButton.hidden = !unlocked && pairRound === 0 && pairSelected < 0;
    } else {
      progress.textContent = `${String(pulseIndex).padStart(2, '0')} / 04`;
      buttons.slice(0, 4).forEach((button, id) =>
        button.setAttribute('aria-pressed', String(pulseOrder.slice(0, pulseIndex).includes(id))));
      art.classList.toggle('has-progress', pulseIndex > 0);
      if (resetButton) resetButton.hidden = false;
    }
  }

  function showError(message) {
    clearTimeout(wrongTimer);
    clue.textContent = message;
    art.classList.add('is-wrong');
    if (!reducedMotion.matches && motion) motion(art.querySelector('.decode-console'), { x: [0, -7, 6, -4, 3, 0] }, { duration: 0.34 });
    wrongTimer = setTimeout(() => art.classList.remove('is-wrong'), 600);
  }

  function showHint(id, message) {
    clearTimeout(hintTimer);
    buttons.forEach(button => button.classList.remove('is-hint'));
    buttons[id]?.classList.add('is-hint');
    animateNode(id);
    clue.textContent = message;
    hintTimer = setTimeout(() => buttons[id]?.classList.remove('is-hint'), 1500);
  }

  function showSolvedBoard() {
    if (gameType === 'route') route = [0, 1, 2, 3, 4];
    if (gameType === 'pairs') {
      pairRound = 3;
      pairSelected = -1;
      pairSolved = new Set([0, 1, 2, 3, 4, 5]);
    }
    if (gameType === 'pulse') pulseIndex = 4;
    updateVisual();
  }

  function keepHeroInView() {
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    html.style.scrollBehavior = previous;
  }

  function openBrief({ animate = false, remember = false } = {}) {
    unlocked = true;
    puzzleStarted = false;
    puzzleScene.inert = true;
    art.classList.remove('puzzle-awaiting');
    puzzleRenderer?.stop();
    if (buttons.includes(document.activeElement)) document.activeElement.blur();
    puzzleLoop?.stop();
    pulseRun += 1;
    pulsePlaying = false;
    showSolvedBoard();
    art.classList.add('is-complete');
    const artName = dailyArt?.render && art.classList.contains('has-daily-render') ? dailyArt.render.name : dailyArt?.name || 'DAILY SIGNAL';
    if (dailyArt) {
      svg.setAttribute('aria-label', `${artName.toLowerCase()}, original abstract artwork for ${date}`);
      label.textContent = `FIG 02 / ${artName} / ${date.replaceAll('-', '.')}`;
    }
    progress.textContent = date.slice(5).replace('-', ' / ');
    clue.textContent = dailyArt?.render?.caption || dailyArt?.concept.replace(' + ', ' · ') || 'An original artwork for this morning.';
    if (consoleHead) consoleHead.textContent = artName.toLowerCase().replace(/\b[a-z]/g, character => character.toUpperCase());
    consolePanel?.setAttribute('aria-label', `${artName.toLowerCase()} artwork`);
    if (live) live.textContent = 'BRIEF UNLOCKED';
    if (eyebrow) eyebrow.textContent = 'Morning decoded';
    if (footline) footline.textContent = 'BRIEF UNLOCKED · SCROLL TO CONTINUE ↓';
    if (primary) primary.innerHTML = `Enter the brief ${actionSignal}`;
    if (resetButton) {
      resetButton.textContent = 'Replay puzzle ↺';
      resetButton.hidden = false;
    }
    if (hintButton) hintButton.hidden = true;
    if (remember) {
      try { sessionStorage.setItem(storageKey, '1'); } catch (_) { /* Storage is optional. */ }
    }
    if (animate && !reducedMotion.matches) {
      transitioning = true;
      html.classList.add('brief-transitioning');
      transition?.setAttribute('aria-hidden', 'false');
      setTimeout(() => {
        html.classList.remove('brief-locked');
        html.classList.add('brief-open');
        keepHeroInView();
      }, 650);
      setTimeout(() => {
        html.classList.remove('brief-transitioning');
        transition?.setAttribute('aria-hidden', 'true');
        transitioning = false;
        keepHeroInView();
        if (window.BriefMotion?.animate) {
          revealAnimation?.stop();
          revealAnimation = window.BriefMotion.animate(renderStage && art.classList.contains('has-daily-render') ? renderStage : svg, { opacity: [0, 1], scale: [0.87, 1] }, { duration: 0.85, ease: 'easeOut' });
        }
        startArtworkMotion();
      }, 1700);
    } else {
      html.classList.remove('brief-locked');
      html.classList.add('brief-open');
      startArtworkMotion();
    }
  }

  function resetGame() {
    if (transitioning) return;
    revealAnimation?.stop();
    artLoop?.stop();
    artRingLoop?.stop();
    artSpecificLoops.forEach(animation => animation.stop());
    artSpecificLoops = [];
    wireRenderer?.stop();
    art.classList.remove('motion-ready');
    svg.style.opacity = '';
    svg.style.transform = '';
    if (renderStage) {
      renderStage.style.opacity = '';
      renderStage.style.transform = '';
      if (renderImage) renderImage.style.transform = '';
      if (renderHalo) renderHalo.style.transform = '';
    }
    pulseRun += 1;
    pulsePlaying = false;
    pulseReady = false;
    pulseIndex = 0;
    route = [];
    pairRound = 0;
    pairSelected = -1;
    pairSolved = new Set();
    try { sessionStorage.removeItem(storageKey); } catch (_) { /* Storage is optional. */ }
    unlocked = false;
    puzzleStarted = false;
    puzzleScene.inert = true;
    buttons.forEach(button => {
      button.disabled = false;
      button.classList.remove('is-flash', 'is-hint', 'is-solved');
    });
    art.classList.remove('is-complete', 'is-wrong');
    art.classList.add('puzzle-awaiting');
    svg.setAttribute('aria-label', puzzleArtLabel);
    label.textContent = `FIG 01 / ${copy.name} / ${date.replaceAll('-', '.')}`;
    html.classList.remove('brief-open');
    html.classList.add('brief-locked');
    setLockedCopy();
    updateVisual();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function playPulse() {
    if (unlocked || pulsePlaying) return;
    pulseRun += 1;
    const run = pulseRun;
    pulsePlaying = true;
    pulseReady = false;
    pulseIndex = 0;
    updateVisual();
    if (reducedMotion.matches) {
      clue.textContent = `Signal: ${pulseOrder.map(id => letters[id]).join(' → ')}. Repeat it.`;
      pulsePlaying = false;
      pulseReady = true;
      return;
    }
    clue.textContent = 'Watch the four flashes.';
    for (const id of pulseOrder) {
      await delay(260);
      if (run !== pulseRun) return;
      buttons[id].classList.add('is-flash');
      animateNode(id);
      clue.textContent = `Pulse ${letters[id]}`;
      await delay(500);
      if (run !== pulseRun) return;
      buttons[id].classList.remove('is-flash');
    }
    pulsePlaying = false;
    pulseReady = true;
    clue.textContent = 'Repeat the four flashes. Replay the signal if needed.';
  }

  primary?.addEventListener('click', event => {
    if (unlocked) return;
    event.preventDefault();
    revealPuzzle();
    if (gameType === 'pulse') {
      if (reducedMotion.matches) playPulse();
      else setTimeout(() => { if (puzzleStarted && !unlocked) playPulse(); }, 620);
    } else {
      setTimeout(() => { if (puzzleStarted && !unlocked) buttons[0].focus(); }, reducedMotion.matches ? 0 : 620);
    }
  });
  document.querySelectorAll('.decode-secondary, .decode-navlink').forEach(link => {
    link.addEventListener('click', event => {
      if (!unlocked) event.preventDefault();
    });
  });
  resetButton?.addEventListener('click', () => {
    if (unlocked) return resetGame();
    if (gameType === 'pulse') return playPulse();
    if (gameType === 'route') route = [];
    if (gameType === 'pairs') {
      pairRound = 0;
      pairSelected = -1;
      pairSolved = new Set();
    }
    buttons.forEach(button => button.disabled = false);
    updateVisual();
    clue.textContent = gameType === 'pairs' ? prompt() : copy.instruction;
    art.classList.remove('is-wrong');
  });
  hintButton?.addEventListener('click', () => {
    if (unlocked) return;
    if (gameType === 'pairs') {
      const id = pairs[pairRound][0];
      showHint(id, `Hint: ${values[id]} is one of the two numbers.`);
    } else if (gameType === 'route') {
      const id = route.length;
      showHint(id, `Hint: the next point is ${letters[id]}.`);
    }
  });

  buttons.forEach((button, id) => {
    button.addEventListener('click', () => {
      if (unlocked || transitioning || id >= count) return;
      animateNode(id);
      art.classList.remove('is-wrong');
      if (gameType === 'pulse') {
        if (!pulseReady || pulsePlaying) return showError('Press PLAY SIGNAL, then repeat the flashes.');
        if (id !== pulseOrder[pulseIndex]) {
          pulseIndex = 0;
          pulseReady = false;
          updateVisual();
          return showError('Not quite. Replay the signal and try again.');
        }
        pulseIndex += 1;
        updateVisual();
        if (pulseIndex === 4) return openBrief({ animate: true, remember: true });
        clue.textContent = `${pulseIndex} of 4 pulses matched.`;
        return;
      }
      if (gameType === 'pairs') {
        if (pairSolved.has(id)) return;
        if (pairSelected === id) {
          pairSelected = -1;
          updateVisual();
          clue.textContent = prompt();
          return;
        }
        if (pairSelected < 0) {
          pairSelected = id;
          updateVisual();
          clue.textContent = `${values[id]} selected. Find its partner for ${target()}.`;
          return;
        }
        const sum = values[pairSelected] + values[id];
        if (sum !== target()) {
          pairSelected = -1;
          updateVisual();
          return showError(`${sum} is not ${target()}. Choose another pair.`);
        }
        pairSolved.add(pairSelected);
        pairSolved.add(id);
        pairSelected = -1;
        pairRound += 1;
        updateVisual();
        if (!reducedMotion.matches && motion) {
          const line = solvedLines.querySelector('line:last-child');
          if (line) motion(line, { opacity: [0, 1] }, { duration: 0.55, ease: 'easeOut' });
          motion(progress, { scale: [1.3, 1] }, { duration: 0.4, ease: 'easeOut' });
        }
        if (pairRound === 3) return openBrief({ animate: true, remember: true });
        clue.textContent = `Lock ${pairRound} opened. ${prompt()}`;
        return;
      }
      if (!route.length) {
        if (id !== 0) return showError('Start at ENTRY.');
        route.push(id);
        updateVisual();
        clue.textContent = 'ENTRY found. Follow a line to the next point.';
        return;
      }
      const current = route[route.length - 1];
      if (id === current) {
        route.pop();
        updateVisual();
        clue.textContent = route.length ? `Backtracked. Choose another line from ${letters[route[route.length - 1]]}.` : copy.instruction;
        return;
      }
      if (route.includes(id)) return showError('That point is used. Tap the last point to backtrack.');
      if (!connected(current, id)) return showError(`No blue line connects ${letters[current]} to ${letters[id]}.`);
      if (id === 4 && route.length !== 4) return showError('EXIT comes last. Find another line.');
      route.push(id);
      updateVisual();
      if (!reducedMotion.matches && motion) motion(trace, { opacity: [0.25, 1] }, { duration: 0.45, ease: 'easeOut' });
      if (route.length === 5) return openBrief({ animate: true, remember: true });
      clue.textContent = `${route.length} of 5 points connected. Follow the next blue line.`;
    });
  });

  setLockedCopy();
  updateVisual();
  let alreadyUnlocked = false;
  try { alreadyUnlocked = sessionStorage.getItem(storageKey) === '1'; } catch (_) { /* Play normally. */ }
  if (alreadyUnlocked) openBrief();
})();
