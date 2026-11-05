(() => {
  const canvas = document.getElementById('particle-drift-canvas');
  const field = canvas?.parentElement;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !field || !ctx) return;

  // The initial constellation changes with each Chicago calendar day.
  const previewDate = new URLSearchParams(location.search).get('artDate');
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const part = name => parts.find(item => item.type === name)?.value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(previewDate || '') ? previewDate : today;
  let seed = 2166136261;
  for (const letter of date) seed = Math.imul(seed ^ letter.charCodeAt(0), 16777619);
  const random = () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*()';
  const mouse = { x: -1000, y: -1000 };
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0;
  let height = 0;
  let nodes = [];
  let frame = 0;
  let visible = true;
  let lastTime = 0;

  function initialize() {
    const bounds = field.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const areaScale = width * height / (1440 * 650);
    const nodeCount = Math.min(185, Math.max(55, Math.round(90 * areaScale)));
    nodes = Array.from({ length: nodeCount }, () => ({
      x: random() * width,
      y: random() * height,
      speed: random() * .36 + .12,
      char: random() < .6 ? characters[Math.floor(random() * characters.length)] : ''
    }));
    draw(0);
  }

  function draw(step) {
    ctx.clearRect(0, 0, width, height);

    for (const node of nodes) {
      node.y += node.speed * step;
      if (node.y > height + 20) {
        node.y = -20;
        node.x = random() * width;
      }
    }

    ctx.lineWidth = .7;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const first = nodes[i];
        const second = nodes[j];
        const distance = Math.hypot(first.x - second.x, first.y - second.y);
        if (distance > 150) continue;
        ctx.strokeStyle = `rgba(96,165,250,${.035 + .18 * (1 - distance / 150)})`;
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(second.x, second.y);
        ctx.stroke();
      }
    }

    ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const node of nodes) {
      const distance = Math.hypot(mouse.x - node.x, mouse.y - node.y);
      if (node.char && step && (distance < 180 || random() > .992)) {
        node.char = characters[Math.floor(random() * characters.length)];
      }
      ctx.fillStyle = distance < 180 ? '#83bdff' : 'rgba(127,183,238,.56)';
      if (node.char) ctx.fillText(node.char, node.x, node.y);
      else {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function tick(time) {
    frame = 0;
    if (document.hidden || !visible || motion.matches) return;
    const step = Math.min(2, (time - (lastTime || time)) / 16.67);
    lastTime = time;
    draw(step);
    frame = requestAnimationFrame(tick);
  }

  function updateAnimation() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (motion.matches) draw(0);
    else if (!document.hidden && visible) frame = requestAnimationFrame(tick);
  }

  window.addEventListener('pointermove', event => {
    const bounds = canvas.getBoundingClientRect();
    mouse.x = event.clientX - bounds.left;
    mouse.y = event.clientY - bounds.top;
  }, { passive: true });
  window.addEventListener('pointerout', event => {
    if (!event.relatedTarget) mouse.x = mouse.y = -1000;
  });
  document.addEventListener('visibilitychange', updateAnimation);
  motion.addEventListener('change', updateAnimation);
  new ResizeObserver(initialize).observe(field);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateAnimation();
  }).observe(field);
  initialize();
  updateAnimation();
})();
