(() => {
  const authoredRenders = {
    '2026-11-04': {
      name: 'FOLDED SIGNAL',
      src: 'artworks/2026-11-04-folded-signal.png',
      motion: 'fold',
      caption: 'Fine strands fold and breathe around a bright center.',
      description: 'A luminous blue three-dimensional sculpture made from folded strands'
    },
    '2026-11-05': {
      name: 'PRISMATIC LOOP',
      src: 'artworks/2026-11-05-prismatic-loop.png',
      motion: 'orbit',
      caption: 'Angular filaments circle a hollow blue core.',
      description: 'An angular blue three-dimensional loop woven from fine luminous strands'
    }
  };
  // A date always produces the same artwork; the next day produces a new one.
  window.createDailyArt = date => {
    let seed = 2166136261;
    for (const char of date + ':unlocked-art') seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
      return (seed >>> 0) / 4294967296;
    };
    const between = (min, max) => Math.round(min + random() * (max - min));
    const [year, month, day] = date.split('-').map(Number);
    const index = Math.floor(Date.UTC(year, month - 1, day) / 86400000);
    const mode = ((index % 8) + 8) % 8;
    const names = ['TIDAL FREQUENCY', 'BLUE BLOOM', 'LIGHT PRISM', 'ORBITAL HORIZON', 'SIGNAL LATTICE', 'SOFT ECLIPSE', 'RIBBON CURRENT', 'STAR CHOIR'];
    const concepts = ['parallel rhythm', 'organic repetition', 'refracted light', 'layered depth', 'connected signals', 'negative space', 'continuous motion', 'collective light'];
    const previousMode = (mode + 7) % 8;
    const variation = ((Math.floor(index / 8) % 5) + 5) % 5;
    const workNumber = index - Math.floor(Date.UTC(2026, 0, 1) / 86400000) + 1;
    const variationConcepts = ['pure form', 'nested arcs', 'crossed filaments', 'signal cluster', 'broken halo'];
    const accent = 'hsl(' + between(194, 216) + ' 100% ' + between(75, 84) + '%)';
    const tilt = between(-18, 18);
    let shapes = '';

    if (mode === 0) {
      shapes = '<g class="daily-art-waves">';
      const rows = between(9, 13);
      for (let i = 0; i < rows; i++) {
        const y = 88 + i * 340 / (rows - 1) + between(-7, 7);
        const bend = between(46, 86);
        shapes += '<path d="M 48 ' + y + ' C 148 ' + (y - bend) + ' 214 ' + (y + bend) + ' 300 ' + y + ' S 446 ' + (y - bend) + ' 552 ' + y + '" fill="none" stroke="url(#daily-line)" stroke-width="' + (i === Math.floor(rows / 2) ? 3.4 : 1.2) + '" opacity="' + (i === Math.floor(rows / 2) ? .96 : .57) + '"/>';
      }
      shapes += '</g><circle class="daily-art-orb" cx="300" cy="258" r="76" fill="url(#daily-orb)" opacity=".85"/>';
    } else if (mode === 1) {
      const petals = 7 + index % 3;
      shapes = '<g transform="rotate(' + tilt + ' 300 258)"><g class="daily-art-petals">';
      for (let i = 0; i < petals; i++) {
        shapes += '<path d="M 300 237 C 231 149 244 85 300 103 C 356 85 369 149 300 237 Z" transform="rotate(' + Math.round(i * 360 / petals) + ' 300 258)" fill="url(#daily-petal)" stroke="#a5d7ff" stroke-width="1" opacity=".76"/>';
      }
      shapes += '</g></g><g class="daily-art-center"><circle cx="300" cy="258" r="47" fill="#061527" stroke="#addcff" stroke-width="1.5"/><circle cx="300" cy="258" r="29" fill="url(#daily-orb)"/><circle cx="300" cy="258" r="7" fill="#e2f4ff"/></g>';
    } else if (mode === 2) {
      shapes = '<g transform="rotate(' + tilt + ' 300 258)"><g class="daily-art-shards"><path d="M 121 354 L 279 74 L 462 335 Z" fill="url(#daily-petal)" stroke="#a5d7ff" stroke-width="1.5"/><path d="M 152 236 L 477 178 L 335 445 Z" fill="url(#daily-petal)" stroke="#92ccff" stroke-width="1.2" opacity=".78"/><path d="M 279 74 L 335 445 M 121 354 L 477 178" stroke="url(#daily-bright)" stroke-width="3" fill="none" opacity=".9"/></g><path class="daily-art-sheen" d="M 234 103 L 361 414" fill="none" stroke="#e8f7ff" stroke-width="3" opacity=".5"/><circle cx="300" cy="258" r="57" fill="url(#daily-orb)" opacity=".78"/></g>';
    } else if (mode === 3) {
      shapes = '<g transform="rotate(' + tilt + ' 300 258)"><g class="daily-art-orbits"><ellipse cx="300" cy="258" rx="' + between(150, 180) + '" ry="' + between(150, 180) + '" fill="none" stroke="url(#daily-line)" stroke-width="1.5"/><ellipse cx="300" cy="258" rx="208" ry="79" fill="none" stroke="url(#daily-bright)" stroke-width="2.5" transform="rotate(-26 300 258)"/><ellipse cx="300" cy="258" rx="208" ry="79" fill="none" stroke="url(#daily-line)" stroke-width="1.2" transform="rotate(35 300 258)"/><circle cx="493" cy="180" r="5" fill="#c3e8ff"/></g><path d="M 94 300 Q 300 143 506 300" fill="none" stroke="#b8e1ff" stroke-width="1.4"/><circle cx="300" cy="258" r="72" fill="url(#daily-orb)"/><circle cx="300" cy="258" r="38" fill="#07172a" stroke="#b8e1ff" stroke-width="1.3"/></g>';
    } else if (mode === 4) {
      const points = Array.from({ length: 11 }, (_, i) => [95 + i * 41 + between(-12, 12), 112 + i % 3 * 115 + between(-25, 25)]);
      shapes = '<g class="daily-art-lattice" fill="none" stroke="url(#daily-line)" stroke-width="1.4">' + points.slice(1).map((point, i) => '<path d="M ' + points[i].join(' ') + ' L ' + point.join(' ') + '"/>').join('') + '</g><g class="daily-art-stars">' + points.map((point, i) => '<circle cx="' + point[0] + '" cy="' + point[1] + '" r="' + (i === 5 ? 11 : between(3, 6)) + '" fill="' + (i === 5 ? 'url(#daily-orb)' : '#a9dcff') + '"/>').join('') + '</g>';
    } else if (mode === 5) {
      const r = between(120, 150);
      shapes = '<g class="daily-art-corona"><circle cx="300" cy="258" r="' + (r + 25) + '" fill="url(#daily-orb)" opacity=".45"/><circle cx="300" cy="258" r="' + r + '" fill="none" stroke="url(#daily-bright)" stroke-width="6"/><circle cx="300" cy="258" r="' + (r + 43) + '" fill="none" stroke="url(#daily-line)" stroke-width="1.3" opacity=".56"/></g><circle class="daily-art-occluder" cx="' + (300 + between(-18, 18)) + '" cy="258" r="' + (r - 12) + '" fill="#07101f" stroke="#5b9dde" stroke-width=".8"/>';
    } else if (mode === 6) {
      const span = between(72, 106);
      shapes = '<g class="daily-art-ribbons" fill="none" stroke-linecap="round"><path d="M 63 312 C 187 ' + (258 - span) + ' 222 ' + (258 + span) + ' 300 258 S 423 ' + (258 - span) + ' 537 195" stroke="url(#daily-bright)" stroke-width="17" opacity=".71"/><path d="M 65 205 C 174 ' + (258 + span) + ' 227 ' + (258 - span) + ' 300 258 S 427 ' + (258 + span) + ' 536 318" stroke="url(#daily-line)" stroke-width="13" opacity=".77"/></g><circle class="daily-art-glint" cx="300" cy="258" r="39" fill="url(#daily-orb)"/>';
    } else {
      const rays = between(9, 13);
      shapes = '<g class="daily-art-spokes" stroke="url(#daily-line)" stroke-width="1.15">' + Array.from({ length: rays }, (_, i) => { const a = i * Math.PI * 2 / rays; return '<path d="M 300 258 L ' + Math.round(300 + Math.cos(a) * between(131, 207)) + ' ' + Math.round(258 + Math.sin(a) * between(110, 171)) + '"/>'; }).join('') + '</g><g class="daily-art-stars">' + Array.from({ length: rays }, (_, i) => { const a = i * Math.PI * 2 / rays; return '<circle cx="' + Math.round(300 + Math.cos(a) * 178) + '" cy="' + Math.round(258 + Math.sin(a) * 143) + '" r="' + between(3, 7) + '" fill="#a9dcff"/>'; }).join('') + '</g><circle cx="300" cy="258" r="45" fill="url(#daily-orb)"/>';
    }

    let details = '';
    for (let i = 0; i < 12; i++) {
      details += '<circle cx="' + between(60, 540) + '" cy="' + between(70, 450) + '" r="' + between(1, 2) + '" fill="#a9dcff" opacity="' + (0.18 + random() * 0.38).toFixed(2) + '"/>';
    }
    const echoes = ['<path d="M 0 -8 Q 12 -18 24 -8 M 0 8 Q 12 -2 24 8"/>', '<circle cx="12" r="8"/><circle cx="12" r="2"/>', '<path d="M 12 -11 L 23 9 L 1 9 Z"/>', '<ellipse cx="12" rx="12" ry="5"/>', '<path d="M 0 -7 L 12 7 L 24 -7"/>', '<circle cx="12" r="9"/><path d="M 4 7 Q 12 -4 20 7"/>', '<path d="M 0 -9 C 10 3 14 -3 24 9"/>', '<path d="M 12 -12 V 12 M 0 0 H 24"/>'];
    const echo = '<g class="daily-art-echo" transform="translate(495 92)" fill="none" stroke="#a9dcff" stroke-width="1.3" opacity=".46">' + echoes[previousMode] + '</g>';
    let markup = '<g class="daily-art" data-motion="' + mode + '"><defs><linearGradient id="daily-line" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2751bd"/><stop offset=".48" stop-color="#87c8ff"/><stop offset="1" stop-color="#3164bb"/></linearGradient><linearGradient id="daily-bright" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4a8aff"/><stop offset=".52" stop-color="#e2f5ff"/><stop offset="1" stop-color="#55b9f9"/></linearGradient><radialGradient id="daily-orb"><stop stop-color="#e3f7ff"/><stop offset=".21" stop-color="#75bfff"/><stop offset=".6" stop-color="#245ab8" stop-opacity=".6"/><stop offset="1" stop-color="#245ab8" stop-opacity="0"/></radialGradient><linearGradient id="daily-petal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a3d8ff" stop-opacity=".66"/><stop offset=".5" stop-color="#397bd6" stop-opacity=".35"/><stop offset="1" stop-color="#07152d" stop-opacity=".13"/></linearGradient><filter id="daily-halo"><feGaussianBlur stdDeviation="25"/></filter></defs><circle cx="300" cy="258" r="150" fill="#317fdf" opacity=".18" filter="url(#daily-halo)"/><g class="daily-art-core">' + shapes + '</g><circle class="daily-art-pulse-ring" cx="300" cy="258" r="62" fill="none" stroke="#a9dcff" stroke-width="1.5"/><g class="daily-art-details">' + details + '</g>' + echo + '</g>';
    const variationMarkup = [
      '',
      '<g class="daily-art-variation" fill="none" stroke="#8cc8ff" stroke-width="1" opacity=".35"><path d="M 85 210 Q 300 38 515 210"/><path d="M 105 314 Q 300 477 495 314"/></g>',
      '<g class="daily-art-variation" fill="none" stroke="#8cc8ff" stroke-width="1" opacity=".32"><path d="M 115 96 L 478 418 M 90 410 L 490 113"/></g>',
      '<g class="daily-art-variation" fill="#9dd5ff" opacity=".38"><circle cx="118" cy="138" r="4"/><circle cx="152" cy="117" r="2"/><circle cx="476" cy="363" r="4"/><circle cx="499" cy="394" r="2"/></g>',
      '<g class="daily-art-variation" fill="none" stroke="#8cc8ff" stroke-width="1.3" opacity=".37"><path d="M 112 193 A 202 202 0 0 1 406 79 M 489 323 A 202 202 0 0 1 188 434"/></g>'
    ][variation];
    markup = markup.slice(0, -4) + variationMarkup + '</g>';
    return { name: `${names[mode]} Nº ${String(workNumber).padStart(3, '0')}`, mode, variation, render: authoredRenders[date] || null, markup: markup.replaceAll('#87c8ff', accent).replaceAll('#a3d8ff', accent), concept: concepts[mode] + ' + ' + variationConcepts[variation], inheritedConcept: concepts[previousMode] };
  };
})();
