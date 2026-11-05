(() => {
  const field = document.querySelector('.ambient-flow');
  if (!field) return;

  function addGlow(host) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    host.appendChild(glow);
    return glow;
  }

  const globalGlow = addGlow(field);
  const localGlows = [...document.querySelectorAll('.constellation-layer')]
    .map(layer => ({ layer, glow: addGlow(layer) }));
  const pointer = { x: -1000, y: -1000, active: false };
  let scheduled = false;

  function update() {
    scheduled = false;
    globalGlow.style.opacity = pointer.active ? '1' : '0';
    globalGlow.style.transform = `translate3d(${pointer.x}px,${pointer.y}px,0) translate(-50%,-50%)`;

    for (const { layer, glow } of localGlows) {
      const bounds = layer.getBoundingClientRect();
      const inside = pointer.active && pointer.x >= bounds.left && pointer.x <= bounds.right
        && pointer.y >= bounds.top && pointer.y <= bounds.bottom;
      glow.style.opacity = inside ? '1' : '0';
      if (inside) {
        glow.style.transform = `translate3d(${pointer.x - bounds.left}px,${pointer.y - bounds.top}px,0) translate(-50%,-50%)`;
      }
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    schedule();
  }, { passive: true });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pointerout', event => {
    if (event.relatedTarget) return;
    pointer.active = false;
    schedule();
  });
})();
