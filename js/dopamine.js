/* =========================================================
 * 내 안의 ‘도파민 공장장’ — 몽실몽실 v2025.8 (Emoji + 양극성 득점)
 * - 12문항 / 5지선다(0~4) + 반응시간 보조(±20%, 선택 우선)
 * - 문항별 긍정/부정 축 지정 → 부정 시 반대 축 가산 (NEG_WEIGHT=0.6)
 * - 분류 4종: ROLLER / SOCIAL / KNOW / AVOHA
 * - 하이브리드: 진짜 근소차일 때만 표시
 * ========================================================= */
(function bootstrapDopamine(){
  if (window.__dopamine_booted) return;
  window.__dopamine_booted = true;

  const boot = () => {
    try {
      // ---------- 문항(12): 긍정 pos / 부정 neg ----------
      const Q = [
        {k:"N", pos:"N", neg:"B", q:"새로운 장소·경험을 찾아 나서는 편이다."},
        {k:"N", pos:"N", neg:"B", q:"지루하면 즉시 자극적인 것을 찾는다(영상·게임·간식 등)."},
        {k:"S", pos:"S", neg:"B", q:"사람들과의 상호작용이 기분 좋은 에너지를 준다."},
        {k:"S", pos:"S", neg:"B", q:"‘좋아요/댓글/메시지’ 알림이 오면 바로 확인한다."},
        {k:"K", pos:"K", neg:"B", q:"궁금한 건 끝까지 파고들어 지식으로 쌓는다."},
        {k:"K", pos:"K", neg:"B", q:"정보 정리나 아카이빙을 습관처럼 한다."},
        {k:"B", pos:"B", neg:"N", q:"루틴(수면·식사·운동)을 유지하려 노력한다."},
        {k:"B", pos:"B", neg:"N", q:"즉흥적 충동이 와도 한 번 멈추고 선택하려 한다."},
        {k:"N", pos:"N", neg:"B", q:"즉석 결정을 즐기는 편이다."},
        {k:"S", pos:"S", neg:"B", q:"모임·행사·네트워킹이 기대된다."},
        {k:"K", pos:"K", neg:"B", q:"새 개념을 이해했을 때 쾌감이 크다."},
        {k:"B", pos:"B", neg:"N", q:"작은 보상(차·산책·스트레칭)으로 스스로를 달랜다."}
      ];

      // ---------- 상태 ----------
      let idx = 0, startedAt = Date.now();
      const score = {N:0, S:0, K:0, B:0};
      const count = {N:0, S:0, K:0, B:0};
      const ans = [], times = [];

      // ---------- DOM ----------
      const $ = id => document.getElementById(id);
      const stepLabel=$("stepLabel"), bar=$("bar"), qText=$("qText"), wrap=$("choiceWrap");
      const card=$("card"), result=$("result");
      const rEmoji=$("rEmoji"), rTitle=$("rTitle"), rQuote=$("rQuote"), rDesc=$("rDesc");
      const rSummary=$("res-summary"), rMeter=$("rMeter"), rMind=$("rMind");
      const prevBtn=$("prev"), skipBtn=$("skip");
      if (!stepLabel||!bar||!qText||!wrap||!card||!result) return;

      // ---------- 시간 가중 ----------
      const tWeight = (sec)=> sec<1?0.9 : sec<4?1.0 : sec<8?1.15 : 1.10;
      const NEG_WEIGHT = 0.6; // 부정 시 반대 축 가중치

      function render(){
        stepLabel.textContent = `문항 ${idx+1} / ${Q.length}`;
        bar.style.width = `${(idx/Q.length)*100}%`;
        qText.textContent = Q[idx].q;
        wrap.innerHTML = `
          <div class="choice"><button class="btn" data-s="4" type="button">매우 그렇다</button></div>
          <div class="choice"><button class="btn" data-s="3" type="button">그렇다</button></div>
          <div class="choice"><button class="btn" data-s="2" type="button">보통이다</button></div>
          <div class="choice"><button class="btn ghost" data-s="1" type="button">아니다</button></div>
          <div class="choice"><button class="btn ghost" data-s="0" type="button">전혀 아니다</button></div>
        `;
        const prevSel = ans[idx];
        if (prevSel!==undefined){
          wrap.querySelectorAll(".btn").forEach(b=>{
            if (Number(b.dataset.s)===prevSel) b.classList.add("selected");
          });
        }
        wrap.querySelectorAll(".btn").forEach(btn=>{
          btn.addEventListener("click", ()=>{
            wrap.querySelectorAll(".btn").forEach(c=>c.classList.remove("selected"));
            btn.classList.add("selected");
            setTimeout(()=>choose(Number(btn.dataset.s)), 120);
          }, {passive:true});
        });
        startedAt = Date.now();
      }

      function applyScore(s, q, sec){
        const w = tWeight(sec);
        const posAdj = s + (s*(w-1)*0.2);             // 동의 기여
        const inv = 4 - s;
        const negAdj = (inv + (inv*(w-1)*0.2))*NEG_WEIGHT; // 부동의 기여(반대축)
        score[q.pos]+=posAdj; count[q.pos]+=1;
        score[q.neg]+=negAdj; count[q.neg]+=1;
      }

      function choose(s){
        const sec=(Date.now()-startedAt)/1000;
        applyScore(s, Q[idx], sec);
        ans[idx]=s; times[idx]=sec;
        if (++idx<Q.length) render(); else finish();
      }

      prevBtn?.addEventListener("click", ()=>{
        if (idx===0) return;
        idx--;
        score.N=score.S=score.K=score.B=0;
        count.N=count.S=count.K=count.B=0;
        for (let i=0;i<idx;i++){
          const s=ans[i]??0, sec=times[i]??3;
          applyScore(s, Q[i], sec);
        }
        render();
      });

      skipBtn?.addEventListener("click", ()=>{
        const sec=(Date.now()-startedAt)/1000;
        applyScore(2, Q[idx], sec); // 스킵=중립
        ans[idx]=2; times[idx]=sec;
        if (++idx<Q.length) render(); else finish();
      });

      // ---------- 정규화 ----------
      const clamp01=v=>Math.max(0,Math.min(1,v));
      function normalize(){
        return {
          N: clamp01((score.N/Math.max(1,count.N))/4),
          S: clamp01((score.S/Math.max(1,count.S))/4),
          K: clamp01((score.K/Math.max(1,count.K))/4),
          B: clamp01((score.B/Math.max(1,count.B))/4),
        };
      }

      // ---------- 메타/카피 ----------
      const TYPE = {
        ROLLER:{title:"🎢 롤러코스터", emoji:"🎢"},
        KNOW:  {title:"📚 지식 부자",   emoji:"📚"},
        SOCIAL:{title:"🎉 인싸 제조기", emoji:"🎉"},
        AVOHA: {title:"🧘 현자 · 안전주의", emoji:"🧘"},
      };
      const COPY = {
        ROLLER:{quote:"오늘의 재미는 오늘 만든다!",
          desc:"새로움과 강한 자극에 빠르게 반응하는 유형. 계획보다 실행이 앞서요. 과열되기 전 스스로 식히는 버튼이 필요해요.",
          summary:["자극 선호","즉흥 실행","새로움 탐색"],
          remind:["15분 즐기고 멈추기","낮 시간 설탕/카페인 최소화"]},
        KNOW:{quote:"이해의 순간, 보상은 터진다.",
          desc:"지식을 쌓고 연결할 때 큰 보상. 과몰입으로 리듬이 깨지지 않게 휴식 타이밍을 설계해요.",
          summary:["지식 보상 큼","정리/아카이빙 선호","깊은 집중"],
          remind:["50/10(집중/휴식)","오늘 배운 1가지 기록"]},
        SOCIAL:{quote:"사람 사이를 잇는 도파민.",
          desc:"상호작용·인정·함께함에서 에너지가 솟아요. 알림과 감정 리듬을 주기적으로 정돈해두면 더 오래 갑니다.",
          summary:["상호작용 보상","인정 민감","네트워킹 동력"],
          remind:["알림 묶음 확인","오늘 대화 1건 성의 있게"]},
        AVOHA:{quote:"작은 행복을 꾸준히.",
          desc:"루틴·안정·절제가 도파민 밸런스를 잡아주는 유형. 의도적인 새로움을 가끔 섞어 활력을 보강해요.",
          summary:["루틴 보상","안정 추구","지속성 강점"],
          remind:["산책 10분 + 물 1컵","루틴에 ‘새로움 1개’"]},
      };

      // ---------- 하이브리드/타이브레이커 ----------
      function recentPref(Q, answers, take=6){
        const recent=[]; for (let i=answers.length-1;i>=0&&recent.length<take;i--){
          const s=answers[i]; if (typeof s==='number') recent.push({dim:Q[i].pos, s});
        }
        if (!recent.length) return null;
        const agg={N:0,S:0,K:0,B:0,cN:0,cS:0,cK:0,cB:0};
        recent.forEach(r=>{ agg[r.dim]+=r.s; agg['c'+r.dim]++; });
        const means=['N','S','K','B'].map(d=>({d,m:agg['c'+d]?agg[d]/agg['c'+d]:-1})).sort((a,b)=>b.m-a.m);
        if (means[0].m<0) return null;
        if (means.length>1 && Math.abs(means[0].m-means[1].m)<0.25) return null;
        return means[0].d;
      }

      function classifyEnhanced(n, raw, Q, answers){
        const ranks=[
          {k:'ROLLER', v:n.N, raw:raw.N},
          {k:'SOCIAL', v:n.S, raw:raw.S},
          {k:'KNOW',   v:n.K, raw:raw.K},
          {k:'AVOHA',  v:n.B, raw:raw.B},
        ].sort((a,b)=>b.v-a.v);
        const [top, second] = ranks;
        const gap = top.v-second.v;

        const vals=[n.N,n.S,n.K,n.B];
        const mean=(vals[0]+vals[1]+vals[2]+vals[3])/4;
        const variance=vals.reduce((s,x)=>s+Math.pow(x-mean,2),0)/4;
        const flat = variance < 0.0036; // std≈0.06

        if (flat){
          const rawRanks=[
            {k:'ROLLER', raw:raw.N},{k:'SOCIAL', raw:raw.S},{k:'KNOW', raw:raw.K},{k:'AVOHA', raw:raw.B},
          ].sort((a,b)=>b.raw-a.raw);
          let main = rawRanks[0].k;
          if (Math.abs(rawRanks[0].raw-rawRanks[1].raw)<0.05){
            const prefDim=recentPref(Q,answers);
            if (prefDim){
              main = (prefDim==='N')?'ROLLER':(prefDim==='S')?'SOCIAL':(prefDim==='K')?'KNOW':'AVOHA';
            }
          }
          return {main, hybrid:null, n};
        }

        const allowHybrid = (gap<0.06)&&(top.v>=0.45)&&(second.v>=0.45);
        if (!allowHybrid) return {main:top.k, hybrid:null, n};

        const prefDim=recentPref(Q,answers);
        if (prefDim){
          const prefType=(prefDim==='N')?'ROLLER':(prefDim==='S')?'SOCIAL':(prefDim==='K')?'KNOW':'AVOHA';
          if (prefType===top.k || prefType===second.k) return {main:prefType, hybrid:null, n};
        }
        return {main:top.k, hybrid:second.k, n};
      }

      function labelOf(p){
        return p>=0.76?'매우 높음'
             : p>=0.56?'높음'
             : p>=0.36?'보통'
             : p>=0.21?'낮음'
             : '아주 낮음';
      }

      function finish(){
        bar.style.width="100%";
        card.style.display="none";
        const n=normalize();
        const res=classifyEnhanced(n, score, Q, ans);
        const key=res.main, meta=TYPE[key], info=COPY[key], hybrid=res.hybrid;

        rEmoji.textContent = meta.emoji || "☁️";
        rTitle.textContent = meta.title + (hybrid? ` · ${TYPE[hybrid].title.replace(/^[^ ]+ /,'')}` : "");
        rQuote.textContent = `“${info.quote}”`;
        rDesc.textContent = info.desc;

        rSummary.innerHTML =
          info.summary.map(t=>`<span class="pill">${t}</span>`).join('') +
          (hybrid? `<span class="pill" style="background:#f4eeff">하이브리드 성향</span>` : '');

        const pairs = Object.entries(n).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([name,val])=>{
          const tag=labelOf(val), pct=Math.round(val*100);
          const labelMap={N:'자극성', S:'사회성', K:'지식추구', B:'균형도'};
          return `
            <div class="row">
              <span><b>${labelMap[name]||name}</b></span>
              <div class="bar"><span class="fill" style="width:${pct}%"></span></div>
              <span class="meter-label">${tag} (${pct}%)</span>
            </div>`;
        }).join('');
        rMeter.innerHTML=pairs;

        rMind.innerHTML = info.remind.map(t=>`<div>${t}</div>`).join('');
        result.hidden=false;
      }

      render();
    } catch (e) { console.error('[dopamine] 초기화 실패:', e); }
  };

  if (document.readyState!=='loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();