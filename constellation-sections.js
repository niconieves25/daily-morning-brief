(() => {
  const ambient = document.querySelector('.ambient-flow');
  if (!ambient) return;

  const previewDate = new URLSearchParams(location.search).get('artDate');
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const part = name => parts.find(item => item.type === name)?.value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(previewDate || '') ? previewDate : today;
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*()';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x: -1000, y: -1000 };
  const states = [];
  let animationFrame = 0;
  let lastTime = 0;

  function seededRandom(key) {
    let seed = 2166136261;
    for (const letter of key) seed = Math.imul(seed ^ letter.charCodeAt(0), 16777619);
    return () => {
      seed = (seed + 0x6D2B79F5) | 0;
      let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function resize(state) {
    const bounds = state.layer.getBoundingClientRect();
    state.width = Math.max(1, bounds.width);
    state.height = Math.max(1, bounds.height);
    const ratio = Math.min(devicePixelRatio || 1, 2);
    state.canvas.width = Math.round(state.width * ratio);
    state.canvas.height = Math.round(state.height * ratio);
    state.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const random = seededRandom(`${date}:${state.section.id}`);
    const area = state.width * state.height / (1280 * 640);
    const limit = state.width < 768 ? 45 : 100;
    const count = Math.min(limit, Math.max(24, Math.round(75 * area)));
    state.nodes = Array.from({ length: count }, () => ({
      x: random() * state.width,
      y: random() * state.height,
      vx: (random() - .5) * .3,
      vy: (random() - .5) * .3,
      radius: random() * 1.7 + 1.4,
      glyph: random() < .52 ? characters[Math.floor(random() * characters.length)] : ''
    }));
    state.random = random;
    state.links = [];
    for (let i = 0; i < state.nodes.length; i++) {
      for (let j = i + 1; j < state.nodes.length; j++) {
        if (Math.hypot(state.nodes[i].x - state.nodes[j].x, state.nodes[i].y - state.nodes[j].y) < 150) state.links.push([i, j]);
      }
    }
    state.streams = Array.from({ length: Math.min(state.width < 768 ? 9 : 20, state.links.length) }, () => {
      const link = state.links[Math.floor(random() * state.links.length)];
      const forward = random() > .5;
      return {
        from: link[forward ? 0 : 1], to: link[forward ? 1 : 0],
        progress: random(), speed: .0018 + random() * .0013,
        glyph: characters[Math.floor(random() * characters.length)]
      };
    });
    draw(state, 0, 0);
  }

  function draw(state, step, time) {
    const { ctx, width, height, nodes } = state;
    ctx.clearRect(0, 0, width, height);
    const bounds = state.layer.getBoundingClientRect();
    const pointerX = pointer.x - bounds.left;
    const pointerY = pointer.y - bounds.top;

    for (const node of nodes) {
      node.x += node.vx * step;
      node.y += node.vy * step;
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;
      const distance = Math.hypot(node.x - pointerX, node.y - pointerY);
      // Render a small, bounded response without moving the node's actual path.
      // A stationary cursor must never gather the whole constellation into one spot.
      const lift = Math.max(0, 1 - distance / 220) * 18;
      node.renderX = node.x + (distance > 1 ? (node.x - pointerX) / distance * lift : 0);
      node.renderY = node.y + (distance > 1 ? (node.y - pointerY) / distance * lift : 0);
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const first = nodes[i];
        const second = nodes[j];
        const distance = Math.hypot(first.renderX - second.renderX, first.renderY - second.renderY);
        if (distance >= 160) continue;
        ctx.strokeStyle = `rgba(96,165,250,${.12 + (1 - distance / 160) * .43})`;
        ctx.beginPath();
        ctx.moveTo(first.renderX, first.renderY);
        ctx.lineTo(second.renderX, second.renderY);
        ctx.stroke();
      }
    }

    ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const stream of state.streams) {
      if (step) {
        stream.progress += stream.speed * step;
        if (stream.progress >= 1) {
          nodes[stream.to].glyph = stream.glyph;
          stream.progress -= 1;
          stream.from = stream.to;
          const choices = state.links.filter(([a, b]) => a === stream.from || b === stream.from);
          if (choices.length) {
            const next = choices[Math.floor(state.random() * choices.length)];
            stream.to = next[0] === stream.from ? next[1] : next[0];
          }
          stream.glyph = characters[Math.floor(state.random() * characters.length)];
        }
      }
      const from = nodes[stream.from];
      const to = nodes[stream.to];
      const p = reducedMotion.matches ? .5 : stream.progress;
      const x = from.renderX + (to.renderX - from.renderX) * p;
      const y = from.renderY + (to.renderY - from.renderY) * p;
      const glow = Math.sin(Math.PI * p);
      ctx.fillStyle = `rgba(115,193,255,${glow * .18})`;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(205,234,255,${.22 + glow * .58})`;
      ctx.fillText(stream.glyph, x, y);
    }
    for (const node of nodes) {
      const pulse = .78 + Math.sin(time * .001 + node.x) * .22;
      if (node.glyph) {
        ctx.fillStyle = `rgba(96,165,250,${pulse * .3})`;
        ctx.beginPath();
        ctx.arc(node.renderX, node.renderY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(155,213,255,${pulse * .95})`;
        ctx.fillText(node.glyph, node.renderX, node.renderY);
        continue;
      }
      ctx.fillStyle = `rgba(96,165,250,${pulse * .32})`;
      ctx.beginPath();
      ctx.arc(node.renderX, node.renderY, node.radius * 2.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(127,196,255,${pulse})`;
      ctx.beginPath();
      ctx.arc(node.renderX, node.renderY, node.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function tick(time) {
    animationFrame = 0;
    if (document.hidden || reducedMotion.matches) return;
    const step = Math.min(2, (time - (lastTime || time)) / 16.67);
    lastTime = time;
    for (const state of states) if (state.visible) draw(state, step, time);
    if (states.some(state => state.visible)) animationFrame = requestAnimationFrame(tick);
  }

  function syncAnimation() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    lastTime = 0;
    if (reducedMotion.matches) {
      for (const state of states) draw(state, 0, 0);
    } else if (!document.hidden && states.some(state => state.visible)) {
      animationFrame = requestAnimationFrame(tick);
    }
  }

  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const state = states.find(item => item.section === entry.target);
      if (state) state.visible = entry.isIntersecting;
    }
    syncAnimation();
  });

  const canvas = ambient.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const state = { section: ambient, layer: ambient, canvas, ctx, width: 0, height: 0, nodes: [], visible: false };
  states.push(state);
  new ResizeObserver(() => resize(state)).observe(ambient);
  resize(state);
  visibility.observe(ambient);

  window.addEventListener('pointermove', event => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });
  window.addEventListener('pointerout', event => {
    if (!event.relatedTarget) pointer.x = pointer.y = -1000;
  });
  document.addEventListener('visibilitychange', syncAnimation);
  reducedMotion.addEventListener('change', syncAnimation);
})();
