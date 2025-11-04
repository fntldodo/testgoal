/* ===================================================
 * 감정 vs 논리 테스트 — 몽실몽실 v2025.2 (마음 리마인드)
 * ---------------------------------------------------
 * - 12문항 / 5지선다(0~4)
 * - 감정형(E), 논리형(L), 조화형(B)
 * - 반응시간 ±20% 가중
 * =================================================== */

document.addEventListener("DOMContentLoaded", () => {
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

  let idx = 0;
  const score = {E:0, L:0, B:0};
  const count = {E:0, L:0, B:0};
  const ans = [];
  const times = [];
  let startTime = Date.now();

  const stepLabel = document.getElementById("stepLabel");
  const barFill = document.getElementById("barFill");
  const qText = document.getElementById("qText");
  const wrap = document.getElementById("choiceWrap");
  const card = document.getElementById("card");
  const resultBox = document.getElementById("result");
  const prevBtn = document.getElementById("prev");
  const skipBtn = document.getElementById("skip");

  function render(){
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width = `${(idx/Q.length)*100}%`;
    qText.textContent = Q[idx].q;
    wrap.innerHTML = `
      <button class="choice" data-s="4">매우 그렇다</button>
      <button class="choice" data-s="3">그렇다</button>
      <button class="choice" data-s="2">보통이다</button>
      <button class="choice ghost" data-s="1">아니다</button>
      <button class="choice ghost" data-s="0">전혀 아니다</button>
    `;

    const prevSel = ans[idx];
    if(prevSel!==undefined)
      [...wrap.children].forEach(b=>{ if(Number(b.dataset.s)===prevSel) b.classList.add("selected"); });

    [...wrap.children].forEach(btn=>{
      btn.addEventListener("click",()=>{
        [...wrap.children].forEach(c=>c.classList.remove("selected"));
        btn.classList.add("selected");
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      });
    });
    startTime=Date.now();
  }

  function choose(s){
    const elapsed=(Date.now()-startTime)/1000;
    const w=getWeight(elapsed);
    const k=Q[idx].k;
    const adj=s+(s*(w-1)*0.2);
    score[k]+=adj; count[k]+=1; ans[idx]=s; times[idx]=elapsed;
    idx<Q.length-1? (idx++,render()):finish();
  }

  function getWeight(sec){
    if(sec<1) return 0.9;
    if(sec<4) return 1.0;
    if(sec<8) return 1.15;
    return 1.1;
  }

  function normalize(){
    return {
      E:(score.E/Math.max(1,count.E))/4,
      L:(score.L/Math.max(1,count.L))/4,
      B:(score.B/Math.max(1,count.B))/4
    };
  }

  function classify(){
    const n=normalize();
    const arr=Object.entries(n).sort((a,b)=>b[1]-a[1]);
    const [k1,v1]=arr[0],[k2,v2]=arr[1];
    if(Math.abs(v1-v2)<0.08) return "조화형";
    if(k1==="E") return "감정형";
    if(k1==="L") return "논리형";
    return "조화형";
  }

  const RESULT={
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
      desc:"감정과 논리 모두를 존중하는 균형형. 상황에 따라 유연하게 전환하며, 타인 관계에서도 안정된 조율을 보입니다.",
      mood:["감정 — 조화","논리 — 조화","균형 — 안정적"],
      remind:"하루 끝, 마음과 생각이 같은 말을 하고 있나요? 그게 평온의 기준이에요 ☁️"
    }
  };

  function finish(){
    card.style.display="none";
    barFill.style.width="100%";
    const type=classify();
    const info=RESULT[type];
    const mood=`• ${info.mood.join("  • ")}`;
    resultBox.innerHTML=`
      <div class="result-card mind">
        <div class="result-hero">
          <img src="../assets/plant.png" alt="감정형 테스트">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>
        <p>${info.desc}</p>
        <div class="pill">${mood}</div>
        <div class="mind-remind"><b>🌿 마음 리마인드:</b> ${info.remind}</div>
        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>`;
    resultBox.style.display="block";
  }

  render();
});
