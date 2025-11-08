/* =========================================================
 * 몽실 도트 히어로 v2025.3 — 독립형 모듈
 * - MongsilDot.mount({ key, seed, mode, container })
 * - key: 'rose'|'fern'|'cactus'|'dandelion'|'bamboo'|'pine' 등
 * ========================================================= */
(function (w) {
  const NS = 'MongsilDot';

  const PALETTE = {
    rose:      ['#ffe6e1','#ffd8c4','#ffba9d','#ff9468'],
    fern:      ['#e9fbf4','#cff2e4','#a5e3c5','#67c5a1'],
    cactus:    ['#e8f6f0','#c5e6d6','#9dd8c4','#67c5a1'],
    dandelion: ['#fffdf7','#fff5dc','#ffe6a8','#ffcf60'],
    bamboo:    ['#e9fbf4','#cff2e4','#a5e3c5','#7ec8ac'],
    pine:      ['#edf7ff','#cfe9ff','#a8d6ff','#6cb7f0'],
    _default:  ['#e9fbf4','#cff2e4','#a5e3c5','#67c5a1'],
  };

  function rngFactory(seedStr){
    let h = 2166136261 >>> 0;
    for (let i=0;i<seedStr.length;i++){
      h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619);
    }
    return () => {
      h ^= h >>> 15; h = Math.imul(h, 2246822507);
      h ^= h >>> 13; h = Math.imul(h, 3266489909);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967295;
    };
  }

  function drawDotArt(canvas, key='fern', seed='mongsil'){
    const ctx = canvas.getContext('2d', { alpha: true });
    const W = canvas.width = 360, H = canvas.height = 360;
    ctx.clearRect(0,0,W,H);

    const palette = PALETTE[key] || PALETTE._default;
    const biasTable = {
      rose:      { radial: 1.0, bands: 0.15, spokes: 6 },
      fern:      { radial: 0.6, bands: 0.35, spokes: 4 },
      cactus:    { radial: 0.4, bands: 0.6,  spokes: 8 },
      dandelion: { radial: 0.9, bands: 0.15, spokes: 12 },
      bamboo:    { radial: 0.5, bands: 0.55, spokes: 16 },
      pine:      { radial: 0.7, bands: 0.25, spokes: 3 },
      _default:  { radial: 0.6, bands: 0.35, spokes: 5 },
    };
    const bias = biasTable[key] || biasTable._default;

    const rnd = rngFactory('mongsil:'+key+':'+seed);
    const cols = 24, rows = 24;
    const cell = Math.min(W/cols, H/rows);
    const rBase = cell*0.26;
    const cx = W/2, cy = H/2;
    const maxR = Math.hypot(W,H)/2;

    for(let y=0;y<rows;y++){
      for(let x=0;x<cols;x++){
        const px = (x+0.5)*cell, py = (y+0.5)*cell;
        const dx = px-cx, dy = py-cy;
        const dist = Math.hypot(dx,dy)/maxR;
        const ang = (Math.atan2(dy,dx)+Math.PI*2)%(Math.PI*2);

        const spoke = Math.cos(ang*bias.spokes) ** 2;
        const band  = Math.cos(dist*Math.PI*4) ** 2;
        const mask  = bias.radial*spoke + bias.bands*band;
        const show  = mask > 0.45 + rnd()*0.12;
        if(!show) continue;

        const cIdx = Math.min(palette.length-1, Math.floor(mask*palette.length));
        const color = palette[cIdx];
        const r = rBase*(0.75 + 0.6*mask);

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(px,py,r,0,Math.PI*2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(94,73,61,0.08)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }

    ctx.strokeStyle = 'rgba(94,73,61,0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1,1,W-2,H-2);
  }

  function mount(opts={}){
    const {
      key='fern',
      seed=String(Date.now()),
      mode='replace',           // 'replace' | 'overlay'
      container='.result-hero',
    } = opts;

    const hero = document.querySelector(container);
    if(!hero) return console.warn('[dot-hero] container not found:', container);

    const holder = document.createElement('div');
    holder.className = 'dot-hero';
    const canvas = document.createElement('canvas');
    holder.appendChild(canvas);

    if(mode === 'replace'){
      const img = hero.querySelector('img');
      if(img) img.style.display = 'none';
      hero.insertBefore(holder, hero.firstChild);
    }else{
      hero.insertBefore(holder, hero.firstChild);
    }

    drawDotArt(canvas, key, seed);
  }

  w[NS] = { mount, draw: drawDotArt, palette: PALETTE };
})(window);
