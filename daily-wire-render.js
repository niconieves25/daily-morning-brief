(() => {
  function seededRandom(key) {
    let seed = 2166136261;
    for (const char of key) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
    return () => {
      seed = (seed + 0x6D2B79F5) | 0;
      let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
      value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  window.createDailyWireRender = (canvas, date, mode) => {
    const ctx = canvas.getContext('2d');
    const random = seededRandom(`${date}:architectural-wire:v1`);
    const groups = mode === 1 ? 7 : mode === 7 ? 8 : 3 + mode % 2;
    const strandsPerGroup = mode === 1 || mode === 7 ? 9 : 21 + mode % 4 * 3;
    const twist = .48 + random() * .62;
    const shape = .85 + random() * .3;
    const phase = random() * Math.PI * 2;
    const baseHue = 196 + Math.round(random() * 25);
    const speed = [0.00009, 0.00013, 0.0001, 0.00018, 0.00008, 0.00011, 0.00016, 0.00012][mode];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let lastDraw = 0;
    let active = false;
    let elapsed = 0;
    let previousTime = 0;
    const position = [0, 0, 0];
    const projected = [0, 0, 0];

    // Each family has a distinct spatial silhouette. Points flex within the form
    // while it turns, rather than moving one flat drawing as a whole.
    function point(u, v, group, t) {
      const a = u * Math.PI * 2;
      const groupAngle = group * Math.PI * 2 / groups + phase;
      if (mode === 0) {
        const flow = a * 1.3 - t * .47 + phase;
        position[0] = (u * 2 - 1) * 1.42;
        position[1] = Math.sin(flow) * .39 * shape + v * .58 * Math.cos(flow * .53);
        position[2] = Math.cos(flow) * .39 + v * .48 * shape * Math.sin(flow * .53);
      }
      else if (mode === 1) {
        const spread = v * .31 * Math.sin(Math.PI * u) * (1 + .15 * Math.sin(t * 1.7));
        const radius = .12 + u * 1.3 * shape * (1 + .035 * Math.sin(t * 1.7));
        position[0] = Math.cos(groupAngle + spread) * radius;
        position[1] = Math.sin(groupAngle + spread) * radius * .92;
        position[2] = .32 * Math.sin(Math.PI * u) + v * .27 * Math.sin(u * 4 - t * .85 + group);
      }
      else if (mode === 2) {
        const side = Math.min(2, Math.floor(u * 3));
        const f = u * 3 - side;
        const a0 = side * Math.PI * 2 / 3 + groupAngle * .1;
        const a1 = (side + 1) * Math.PI * 2 / 3 + groupAngle * .1;
        const radius = (1.13 + v * .17) * shape;
        const fold = .12 * Math.sin(a * 1.5 + t * .7 + group);
        position[0] = (Math.cos(a0) * (1 - f) + Math.cos(a1) * f) * radius + fold;
        position[1] = (Math.sin(a0) * (1 - f) + Math.sin(a1) * f) * radius + fold;
        position[2] = v * .72 + .14 * Math.sin(a * 2 - t * .5);
      }
      else if (mode === 3) {
        const minor = v * Math.PI + groupAngle + t * .42;
        const radius = 1 + .28 * shape * Math.cos(minor);
        position[0] = radius * Math.cos(a);
        position[1] = radius * Math.sin(a);
        position[2] = .54 * Math.sin(minor);
      }
      else if (mode === 4) {
        const angle = groupAngle + v * 1.5 + (u - .5) * twist * 2 + .09 * Math.sin(t * .58 + u * 5);
        const waist = .65 + .52 * shape * (u * 2 - 1) ** 2;
        position[0] = Math.cos(angle) * waist;
        position[1] = Math.sin(angle) * waist;
        position[2] = (u * 2 - 1) * 1.05;
      }
      else if (mode === 5) {
        const latitude = v * 1.15 + (group - 1.5) * .24;
        const radius = Math.cos(latitude) * shape * (1 + .05 * Math.sin(t + a * 2));
        position[0] = radius * Math.cos(a);
        position[1] = radius * Math.sin(a);
        position[2] = Math.sin(latitude) * .94 + .09 * Math.sin(a * 3 - t);
      }
      else if (mode === 6) {
        const across = v * .43 * shape;
        const halfTwist = a * .5 + .15 * Math.sin(t * .6);
        const radius = 1 + across * Math.cos(halfTwist);
        position[0] = radius * Math.cos(a);
        position[1] = radius * Math.sin(a);
        position[2] = across * Math.sin(halfTwist) * 1.6;
      }
      else {
        const angle = groupAngle + v * .25;
        const radius = .12 + u * 1.32 * shape;
        position[0] = Math.cos(angle) * radius;
        position[1] = Math.sin(angle) * radius;
        position[2] = .37 * Math.sin(u * Math.PI * 1.6 + group * .6 - t * .7) + v * .27;
      }
      return position;
    }

    function draw(time = 0) {
      if (!ctx) return;
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width, height) * .38;
      const motion = reducedMotion.matches ? 0 : time * speed;
      const t = reducedMotion.matches ? 0 : time / 1000;
      const ax = (mode === 3 ? .58 : .25) + .13 * Math.sin(motion * .7);
      const ay = motion;
      const az = -.15 + .12 * Math.sin(motion * .4);
      const sinX = Math.sin(ax), cosX = Math.cos(ax);
      const sinY = Math.sin(ay), cosY = Math.cos(ay);
      const sinZ = Math.sin(az), cosZ = Math.cos(az);
      const project = point => {
        const ry = point[1] * cosX - point[2] * sinX;
        const rz = point[1] * sinX + point[2] * cosX;
        const rx = point[0] * cosY + rz * sinY;
        const depth = -point[0] * sinY + rz * cosY;
        const turnedX = rx * cosZ - ry * sinZ;
        const turnedY = rx * sinZ + ry * cosZ;
        const perspective = 3.8 / (3.8 + depth * .34);
        projected[0] = width * .5 + turnedX * scale * perspective;
        projected[1] = height * .5 + turnedY * scale * perspective;
        projected[2] = depth;
        return projected;
      };

      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = 'screen';
      for (let group = 0; group < groups; group++) {
        for (let i = 0; i < strandsPerGroup; i++) {
          const v = (i + .5) / strandsPerGroup * 2 - 1;
          ctx.beginPath();
          let depth = 0;
          const steps = mode === 1 || mode === 7 ? 30 : 45;
          for (let step = 0; step <= steps; step++) {
            const p = project(point(step / steps, v, group, t));
            if (step === 0) ctx.moveTo(p[0], p[1]);
            else ctx.lineTo(p[0], p[1]);
            depth += p[2];
          }
          depth /= steps + 1;
          const light = Math.max(55, Math.min(84, 70 + depth * 8));
          const alpha = Math.max(.32, Math.min(.78, .5 + depth * .1));
          ctx.strokeStyle = `hsla(${baseHue + group * 7 + i % 5},100%,${light}%,${alpha})`;
          ctx.lineWidth = i % 9 === 0 ? 1.25 : .78;
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    function tick(time) {
      frame = 0;
      if (!active || document.hidden || reducedMotion.matches) return;
      if (previousTime) elapsed += Math.min((time - previousTime) / 1000, .06);
      previousTime = time;
      if (time - lastDraw >= 32) {
        draw(elapsed * 1000);
        lastDraw = time;
      }
      frame = requestAnimationFrame(tick);
    }

    const renderer = {
      start() {
        active = true;
        cancelAnimationFrame(frame);
        previousTime = 0;
        draw(elapsed * 1000);
        if (!reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(tick);
      },
      stop() { active = false; cancelAnimationFrame(frame); frame = 0; previousTime = 0; },
      draw
    };
    document.addEventListener('visibilitychange', () => { if (active && !document.hidden) renderer.start(); });
    reducedMotion.addEventListener('change', () => { if (active) renderer.start(); });
    return renderer;
  };
})();
