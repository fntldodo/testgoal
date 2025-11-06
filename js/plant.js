/* ===================================================
 * 감정 vs 논리 테스트 — 몽실몽실 v2025.3 (6결과·식물매칭)
 * ---------------------------------------------------
 * - 12문항 / 5지선다(0~4) + 반응시간 보조(±20%, 선택 우선)
 * - 결과 6종: rose / fern / cactus / dandelion / bamboo / pine
 * - 절대규칙: 기존 구조 유지, 기능은 '추가'만
 * =================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // ---------- 문항(12) ----------
  const Q = [
    {k:"E", q:"대화 중 상대의 감정에 쉽게 공감한다."},
    {k:"E", q:"감정 표현을 솔직히 하는 편이다."},
    {k:"E", q:"타인의 표정과 말투 변화에 예민하게 반응한다."},
    {k:"E", q:"상황보다 감정이 판단에 영향을 주곤 한다."},
    {k:"L", q:"문제 상황에서도 감정보다 논리를 먼저 본다."},
    {k:"L", q:"결정을 내릴 때 근거를 중요시한다."},
    {k:"L", q:"감정보다는 사실이나 데이터에 신뢰를 둔다."},
    {k:"L", q:"감정보다는 효율성을 우선시한다."},
    {k:"B", q:"감정을 느끼되, 표현은 조절하려 한다."},
    {k:"B", q:"의사결정 시 감정과 논리를 균형 있게 고려한다."},
    {k:"B", q:"감정이 앞서도, 일정 시간 뒤엔 합리적으로 정리한다."},
    {k:"B", q:"타인의 입장을 고려하면서도 내 판단을 유지한다."}
  ];

  // ---------- 상태 ----------
  let idx = 0, startTime = Date.now();
  const score = {E:0, L:0, B:0}, count = {E:0, L:0, B:0};
  const ans = [], times = [];

  // ---------- DOM ----------
  const stepLabel = document.getElementById("stepLabel");
  const barFill   = document.getElementById("barFill");
  const qText     = document.getElementById("qText");
  const wrap      = document.getElementById("choiceWrap");
  const card      = document.getElementById("card");
  const resultBox = document.getElementById("result");
  const prevBtn   = document.getElementById("prev");
  const skipBtn   = document.getElementById("skip");

  // ---------- 시간 가중(±20% 캡) ----------
  function weight(sec){
    if(sec < 1) return 0.9;
    if(sec < 4) return 1.0;
    if(sec < 8) return 1.15;
    return 1.10;
  }

  // ---------- 렌더 ----------
  function render(){
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width    = `${(idx/Q.length)*100}%`;
    qText.textContent      = Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;

    const prevSel = ans[idx];
    if(prevSel !== undefined){
      [...wrap.children].forEach(b=>{
        if(Number(b.dataset.s) === prevSel) b.classList.add("selected");
      });
    }

    [...wrap.children].forEach(btn=>{
      btn.addEventListener("click", ()=>{
        [...wrap.children].forEach(c=>c.classList.remove("selected"));
        btn.classList.add("selected");
        setTimeout(()=>choose(Number(btn.dataset.s)), 150);
      }, {passive:true});
    });

    startTime = Date.now();
  }

  // ---------- 응답 ----------
  function choose(s){
    const sec = (Date.now() - startTime)/1000;
    const w   = weight(sec);
    const k   = Q[idx].k;

    const adj = s + (s*(w-1)*0.2); // 선택 우선, 뒤엎지 않음
    score[k] += adj;
    count[k] += 1;

    ans[idx]   = s;
    times[idx] = sec;

    if(++idx < Q.length) render();
    else finish();
  }

  prevBtn?.addEventListener("click", ()=>{
    if(idx===0) return;
    idx--;
    // 재계산(절대규칙: 기존 로직 유지)
    score.E=score.L=score.B=0; count.E=count.L=count.B=0;
    for(let i=0;i<idx;i++){
      const s = ans[i] ?? 0;
      const k = Q[i].k;
      const w = weight(times[i] ?? 3);
      const adj = s + (s*(w-1)*0.2);
      score[k]+=adj; count[k]+=1;
    }
    render();
  });

  skipBtn?.addEventListener("click", ()=>{
    ans[idx]=0; times[idx]=(Date.now()-startTime)/1000;
    if(++idx < Q.length) render(); else finish();
  });

  // ---------- 정규화 ----------
  function norm01(v){ return Math.max(0, Math.min(1, v)); }
  function normalize(){
    return {
      E: norm01((score.E/Math.max(1,count.E))/4),
      L: norm01((score.L/Math.max(1,count.L))/4),
      B: norm01((score.B/Math.max(1,count.B))/4) // 균형 감각 참고용
    };
  }

  // ---------- 분류(6종) ----------
  // 파일 존재: bamboo.png, cactus.png, dandelion.png, fern.png, pine.png, rose.png
  const TYPE = {
    rose:      {title:"🌹 감정형(따뜻)",  img:"../assets/plants/rose.png"},
    fern:      {title:"🌿 감정형(섬세)",  img:"../assets/plants/fern.png"},
    cactus:    {title:"🌵 논리형(분석)",  img:"../assets/plants/cactus.png"},
    dandelion: {title:"🌼 논리형(실용)",  img:"../assets/plants/dandelion.png"},
    bamboo:    {title:"🎋 조화형(유연)",  img:"../assets/plants/bamboo.png"},
    pine:      {title:"🌲 조화형(안정)",  img:"../assets/plants/pine.png"}
  };

  function classify6(n){
    const e=n.E, l=n.L;
    const diff = e - l;
    const gap  = Math.abs(diff);
    const mean = (e + l)/2;

    // 균형대역
    if(gap < 0.10){
      return mean >= 0.55 ? "bamboo" : "pine";
    }
    // 감정 우세
    if(diff > 0){
      if(e >= 0.65 && l <= 0.45) return "rose";
      return "fern";
    }
    // 논리 우세
    if(l >= 0.65 && e <= 0.45) return "cactus";
    return "dandelion";
  }

  // ---------- 결과 카피 ----------
  const COPY = {
    rose: {
      quote:'“마음의 온기가 방향을 정해요.”',
      desc:'따뜻한 공감이 큰 힘이 되는 타입. 사람과 순간에 민감하고, 진심 어린 표현으로 관계의 온도를 올립니다.',
      remind:['감정을 문장 1줄로 적기','반응 전 호흡 3회']
    },
    fern: {
      quote:'“섬세함은 힘이다.”',
      desc:'상대의 뉘앙스를 잘 읽고 조율하는 타입. 다만 과기대(과도한 기대/대입)를 줄이면 균형이 더 좋아집니다.',
      remind:['느낌/사실 분리해서 적기','과몰입 신호 체크(어깨, 속도)']
    },
    cactus: {
      quote:'“빨리보다 정확하게.”',
      desc:'근거와 구조로 판단하는 타입. 효율적이지만, 감정 데이터도 결과의 일부임을 기억하면 설득력이 커집니다.',
      remind:['결정 전 30초 정지','감정 한 단어 기록 → 반영']
    },
    dandelion: {
      quote:'“가볍게, 그러나 명확하게.”',
      desc:'실용과 판단에 강해 실행이 빠릅니다. 때로는 여유를 두고 감정 신호를 들으면 관계가 더 부드러워집니다.',
      remind:['해야할 일 1개만 착수','대화 전 톤·속도 10% 낮추기']
    },
    bamboo: {
      quote:'“바람 따라 흔들려도, 다시 곧게.”',
      desc:'감정과 논리를 상황에 맞게 전환하는 유연형. 리듬을 일정하게만 유지해도 퍼포먼스가 안정적입니다.',
      remind:['25-3 타이머 1세트','하루 끝 체크: 마음=생각?']
    },
    pine: {
      quote:'“느리지만 멀리 간다.”',
      desc:'안정과 일관성을 중시하는 균형형. 속도가 느려 보여도 흔들림이 적고, 꾸준한 누적이 강점입니다.',
      remind:['루틴 1개만 고정','과제 난이도 80%로 조정']
    }
  };

  function pillList(list){
    return list.map(t=>`<span class="pill" style="margin-right:6px">${t}</span>`).join('');
  }

  // ---------- 결과 ----------
  function finish(){
    card.style.display = "none";
    barFill.style.width = "100%";

    const n   = normalize();
    const key = classify6(n);
    const info= COPY[key];
    const meta= TYPE[key];

    const moodSummary = (()=>{
      const ePct = Math.round(n.E*100);
      const lPct = Math.round(n.L*100);
      // 그래프 라벨용 간단 설명(중복 제거, 카드 하단 라벨로 이동)
      return [
        `감정 — ${ePct}%`,
        `논리 — ${lPct}%`
      ];
    })();

    resultBox.innerHTML = `
      <div class="result-card mind">
        <div class="result-hero">
          <img src="${meta.img}" alt="${meta.title}"
               onerror="this.onerror=null; this.src='../assets/plant.png'">
          <div>
            <div class="result-title">${meta.title}</div>
            <div class="result-desc">“${info.quote}”</div>
          </div>
        </div>

        <p style="margin:8px 0">${info.desc}</p>

        <!-- 마음 리마인드: 문장형, 2개만 -->
        <div class="mind-remind" style="margin:8px 0 10px;color:var(--text-soft)">
          <b>🌿 마음 리마인드:</b> ${pillList(info.remind)}
        </div>

        <!-- 상태 미터(라벨: 수치 옆 설명) -->
        <div class="state-meter">
          ${[['감정',n.E],['논리',n.L]].map(([name,val])=>{
            const pct = Math.round(val*100);
            const tag = pct>=76?'매우 높음': pct>=56?'높음': pct>=36?'보통': pct>=21?'낮음':'아주 낮음';
            return `
              <div class="row">
                <span><b>${name}</b></span>
                <div class="bar"><span class="fill" style="width:${pct}%"></span></div>
                <span class="meter-label">${tag} (${pct}%)</span>
              </div>
            `;
          }).join('')}
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;

    resultBox.style.display = "block";
  }

  // ---------- 시작 ----------
  render();
});