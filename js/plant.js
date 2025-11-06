/* ===================================================
 * 감정 vs 논리 테스트 — 몽실몽실 v2025.2 (마음 리마인드)
 * ---------------------------------------------------
 * - 12문항 / 5지선다(0~4) + 응답시간 보조 ±20%(선택 우선)
 * - 분류: 감정형(E) / 논리형(L) / 조화형(B)
 * - 결과: 제목/인용/설명/리마인드/식물매칭(assets/plants/*.png)
 * - 절대규칙: 기존 기능 삭제·축소 금지 / 변경은 추가 방식
 * =================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // ---------- 문항 ----------
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
  let idx = 0;
  const score = {E:0, L:0, B:0};
  const count = {E:0, L:0, B:0};
  const ans = [];
  const times = [];
  let startTime = Date.now();

  // ---------- DOM ----------
  const stepLabel = document.getElementById("stepLabel");
  const barFill   = document.getElementById("barFill");
  const qText     = document.getElementById("qText");
  const wrap      = document.getElementById("choiceWrap");
  const card      = document.getElementById("card");
  const resultBox = document.getElementById("result");
  const prevBtn   = document.getElementById("prev");
  const skipBtn   = document.getElementById("skip");

  // ---------- 시간가중 ----------
  function getWeight(sec){
    if(sec < 1) return 0.9;
    if(sec < 4) return 1.0;
    if(sec < 8) return 1.15;
    return 1.10;
  }

  // ---------- 렌더 ----------
  function render(){
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width   = `${(idx/Q.length)*100}%`;
    qText.textContent     = Q[idx].q;

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
        if(Number(b.dataset.s)===prevSel) b.classList.add("selected");
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
    const elapsed = (Date.now()-startTime)/1000;
    const w   = getWeight(elapsed);
    const k   = Q[idx].k;
    const adj = s + (s*(w-1)*0.2); // 선택 우선, ±20% 캡

    score[k]+= adj;
    count[k]+= 1;
    ans[idx]  = s;
    times[idx]= elapsed;

    if(++idx < Q.length) render();
    else finish();
  }

  prevBtn?.addEventListener("click", ()=>{
    if(idx===0) return;
    idx--;
    // 재계산(절대규칙: 기능 유지)
    score.E=score.L=score.B=0; count.E=count.L=count.B=0;
    for(let i=0;i<idx;i++){
      const s = ans[i] ?? 0;
      const w = getWeight(times[i] ?? 3);
      const k = Q[i].k;
      const adj = s + (s*(w-1)*0.2);
      score[k]+= adj; count[k]+=1;
    }
    render();
  });

  skipBtn?.addEventListener("click", ()=>{
    ans[idx]=0; times[idx]=(Date.now()-startTime)/1000;
    if(++idx < Q.length) render(); else finish();
  });

  // ---------- 정규화 ----------
  function normalize(){
    return {
      E: (score.E/Math.max(1,count.E))/4,
      L: (score.L/Math.max(1,count.L))/4,
      B: (score.B/Math.max(1,count.B))/4
    };
  }

  // ---------- 분류 ----------
  function classify(){
    const n   = normalize();
    const arr = Object.entries(n).sort((a,b)=>b[1]-a[1]); // desc
    const [k1,v1] = arr[0], [k2,v2] = arr[1];
    const diff = v1 - v2; // 강도

    let type;
    if (Math.abs(v1-v2) < 0.08) type = "조화형";
    else if (k1==="E") type = "감정형";
    else if (k1==="L") type = "논리형";
    else type = "조화형";

    return { type, diff, n };
  }

  // ---------- 식물 매핑 (assets/plants/*.png) ----------
  // 강도(diff) 0.10 이상이면 '강', 아니면 '부드러움' 버전 사용
  const PLANT_MAP = {
    "감정형": { strong:"../assets/plants/rose.png",      soft:"../assets/plants/dandelion.png" },
    "논리형": { strong:"../assets/plants/cactus.png",    soft:"../assets/plants/pine.png" },
    "조화형": { strong:"../assets/plants/fern.png",      soft:"../assets/plants/bamboo.png" }
  };

  // ---------- 카피 ----------
  const RESULT = {
    "감정형":{
      title:"💧 감정형 몽실",
      quote:"“마음이 먼저 움직여야 세상이 따라온다.”",
      desc:"감정의 온도에 따라 세상을 느끼는 감성 중심형. 직감과 공감에 강하며, 다른 사람의 기분을 빠르게 읽습니다.",
      mood:["감정 — 풍부","논리 — 유연","균형 — 감성 우세"],
      remind:"감정은 나침반이에요. 다만 방향은 내가 잡는 것, 숨 고르고 천천히 🌿"
    },
    "논리형":{
      title:"🧠 논리형 몽실",
      quote:"“감정도 분석의 일부일 뿐.”",
      desc:"상황을 구조적으로 해석하고 판단하는 이성 중심형. 불필요한 감정 소모를 줄이며 명확한 근거로 결정합니다.",
      mood:["감정 — 절제","논리 — 강함","균형 — 분석적"],
      remind:"감정은 무시가 아니라 데이터예요. 느낄 시간도 결과에 포함시켜요 ☕"
    },
    "조화형":{
      title:"🌸 조화형 몽실",
      quote:"“이해와 판단, 둘 다 내 안에 있다.”",
      desc:"감정과 논리를 함께 존중하는 균형형. 상황에 따라 유연하게 전환하며, 관계에서도 안정된 조율을 보입니다.",
      mood:["감정 — 조화","논리 — 조화","균형 — 안정적"],
      remind:"하루 끝, 마음과 생각이 같은 말을 하고 있나요? 그게 평온의 기준이에요 ☁️"
    }
  };

  // ---------- 결과 렌더 ----------
  function finish(){
    card.style.display = "none";
    barFill.style.width = "100%";

    const { type, diff, n } = classify();
    const info = RESULT[type];
    const mood = `• ${info.mood.join("  • ")}`;

    // 식물 이미지 선택(강/부드러움)
    const plantSet = PLANT_MAP[type] ?? {strong:"../assets/plant.png", soft:"../assets/plant.png"};
    const imgSrc   = (diff >= 0.10 ? plantSet.strong : plantSet.soft);

    resultBox.innerHTML = `
      <div class="result-card mind">
        <div class="result-hero">
          <img src="${imgSrc}" alt="${info.title}"
               onerror="this.onerror=null; this.src='../assets/plant.png'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>

        <p style="margin:8px 0">${info.desc}</p>
        <div class="pill" style="margin:8px 0 2px">${mood}</div>

        <div class="mind-remind" style="margin:6px 0 10px;color:var(--text-soft)">
          <b>🌿 마음 리마인드:</b> ${info.remind}
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;
    resultBox.style.display = "block";
  }

  // 시작
  render();
});