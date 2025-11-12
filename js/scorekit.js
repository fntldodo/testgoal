/* =========================================================
 * ScoreKit v2025.8 — 몽실 공용 점수 엔진 (UMD, 브라우저 전역)
 * - 양극성 점수화: 동의(pos) / 부동의(neg) 동시 가산
 * - 시간 가중(±20%, 선택 우선·뒤엎지 않음)
 * - 정규화(0~1), 근소차 하이브리드 제한, 최근경향 타이브레이커
 * - window.ScoreKit 으로 노출 (ESM/Bundler 없이 사용 가능)
 * ========================================================= */
(function (global){
  'use strict';

  const DEFAULTS = { NEG_WEIGHT: 0.6, RECENT_TAKE: 6 };

  function tWeight(sec){
    if (sec < 1) return 0.9;
    if (sec < 4) return 1.0;
    if (sec < 8) return 1.15;
    return 1.10;
  }

  function createScorer(opts={}){
    const cfg = { ...DEFAULTS, ...opts };
    const state = {
      score:{N:0,S:0,K:0,B:0},
      count:{N:0,S:0,K:0,B:0},
      ans:[],
      times:[]
    };

    function apply(s, q, sec){
      // s: 0~4, q: {pos, neg}
      const w = tWeight(sec);
      const posAdj = s + (s*(w-1)*0.2); // 동의 기여
      const inv = 4 - s;
      const negAdj = (inv + (inv*(w-1)*0.2)) * cfg.NEG_WEIGHT; // 부동의 기여

      state.score[q.pos] += posAdj; state.count[q.pos] += 1;
      state.score[q.neg] += negAdj; state.count[q.neg] += 1;
      return { posAdj, negAdj };
    }

    function normalize(){
      const clamp01 = v => Math.max(0, Math.min(1, v));
      const {score, count} = state;
      return {
        N: clamp01((score.N/Math.max(1,count.N))/4),
        S: clamp01((score.S/Math.max(1,count.S))/4),
        K: clamp01((score.K/Math.max(1,count.K))/4),
        B: clamp01((score.B/Math.max(1,count.B))/4),
      };
    }

    function recentPref(questions, answers, take=cfg.RECENT_TAKE){
      const recent = [];
      for (let i=answers.length-1; i>=0 && recent.length<take; i--){
        const s = answers[i];
        if (typeof s === 'number') recent.push({ dim: questions[i].pos, s });
      }
      if (!recent.length) return null;

      const agg = {N:0,S:0,K:0,B:0, cN:0,cS:0,cK:0,cB:0};
      recent.forEach(r=>{ agg[r.dim]+=r.s; agg['c'+r.dim]++; });

      const means = ['N','S','K','B']
        .map(d => ({ d, m: agg['c'+d] ? agg[d]/agg['c'+d] : -1 }))
        .sort((a,b)=> b.m - a.m);

      if (means[0].m < 0) return null;
      if (means.length>1 && Math.abs(means[0].m - means[1].m) < 0.25) return null;
      return means[0].d; // 'N' | 'S' | 'K' | 'B'
    }

    function classify(n, rawSums, questions, answers){
      // 하이브리드 제한 + 최근 경향 타이브레이커
      const ranks = [
        {k:'ROLLER', v:n.N, raw:rawSums.N},
        {k:'SOCIAL', v:n.S, raw:rawSums.S},
        {k:'KNOW',   v:n.K, raw:rawSums.K},
        {k:'AVOHA',  v:n.B, raw:rawSums.B},
      ].sort((a,b)=> b.v - a.v);

      const [top, second] = ranks;
      const gap = top.v - second.v;

      const vals = [n.N, n.S, n.K, n.B];
      const mean = (vals[0]+vals[1]+vals[2]+vals[3]) / 4;
      const variance = vals.reduce((s,x)=> s + Math.pow(x-mean,2), 0) / 4;
      const nearlyFlat = variance < 0.0036; // std ≈ 0.06

      const dimToType = d => d==='N'?'ROLLER':d==='S'?'SOCIAL':d==='K'?'KNOW':'AVOHA';

      if (nearlyFlat){
        const rawRanks = [
          {k:'ROLLER', raw:rawSums.N},
          {k:'SOCIAL', raw:rawSums.S},
          {k:'KNOW',   raw:rawSums.K},
          {k:'AVOHA',  raw:rawSums.B},
        ].sort((a,b)=> b.raw - a.raw);

        let main = rawRanks[0].k;
        if (Math.abs(rawRanks[0].raw - rawRanks[1].raw) < 0.05){
          const prefDim = recentPref(questions, answers);
          if (prefDim){
            main = dimToType(prefDim);
          }
        }
        return { main, hybrid:null, n };
      }

      const allowHybrid = (gap < 0.06) && (top.v >= 0.45) && (second.v >= 0.45);
      if (!allowHybrid) return { main: top.k, hybrid: null, n };

      const prefDim = recentPref(questions, answers);
      if (prefDim){
        const prefType = dimToType(prefDim);
        if (prefType===top.k || prefType===second.k) return { main: prefType, hybrid: null, n };
      }
      return { main: top.k, hybrid: second.k, n };
    }

    return { cfg, state, apply, normalize, recentPref, classify, tWeight };
  }

  // UMD export
  global.ScoreKit = { createScorer, DEFAULTS };
})(typeof window!=='undefined' ? window : globalThis);