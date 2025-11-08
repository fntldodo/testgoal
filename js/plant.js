/* ===== plant.safe.js — IIFE + #plant-app 내부 요소만 조작 ===== */
(function(){
  const SCOPE = document.getElementById("plant-app");
  if(!SCOPE) return; // 다른 페이지 영향 0

  // DOM 헬퍼(스코프 한정)
  const $ = sel => SCOPE.querySelector(sel);

  // DOM 요소
  const stepLabel = $("#stepLabel");
  const barFill   = $("#barFill");
  const qText     = $("#qText");
  const wrap      = $("#choiceWrap");
  const card      = $("#card");
  const resultBox = $("#result");
  const prevBtn   = $("#prev");
  const skipBtn   = $("#skip");
  if(!stepLabel||!barFill||!qText||!wrap||!card||!resultBox) return;

  // 문항(12)
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

  // 상태
  let idx = 0, startTime = Date.now();
  const score = {E:0,L:0,B:0}, count = {E:0,L:0,B:0};
  const ans=[], times=[];

  // 시간 가중
  function weight(sec){
    if(sec<1) return 0.9;
    if(sec<4) return 1.0;
    if(sec<8) return 1.15;
    return 1.10;
  }

  // 렌더
  function render(){
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width = `${(idx/Q.length)*100}%`;
    qText.textContent = Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;

    const prevSel = ans[idx];
    if(prevSel!==undefined){
      [...wrap.children].forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add("selected");
      });
    }

    [...wrap.children].forEach(btn=>{
      btn.addEventListener("click", ()=>{
        [...wrap.children].forEach(c=>c.classList.remove("selected"));
        btn.classList.add("selected");
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      }, {passive:true});
    });

    startTime = Date.now();
  }

  // 응답
  function choose(s){
    const sec=(Date.now()-startTime)/1000;
    const w=weight(sec);
    const k=Q[idx].k;
    const adj = s + (s*(w-1)*0.2);
    score[k]+=adj; count[k]+=1;
    ans[idx]=s; times[idx]=sec;

    if(++idx<Q.length) render(); else finish();
  }

  prevBtn?.addEventListener("click", ()=>{
    if(idx===0) return;
    idx--;
    score.E=score.L=score.B=0; count.E=count.L=count.B=0;
    for(let i=0;i<idx;i++){
      const s=ans[i]??0, k=Q[i].k, w=weight(times[i]??3);
      const adj=s + (s*(w-1)*0.2);
      score[k]+=adj; count[k]+=1;
    }
    render();
  });

  skipBtn?.addEventListener("click", ()=>{
    ans[idx]=0; times[idx]=(Date.now()-startTime)/1000;
    if(++idx<Q.length) render(); else finish();
  });

  // 정규화
  const norm01=v=>Math.max(0,Math.min(1,v));
  function normalize(){
    return {
      E:norm01((score.E/Math.max(1,count.E))/4),
      L:norm01((score.L/Math.max(1,count.L))/4),
      B:norm01((score.B/Math.max(1,count.B))/4)
    };
  }

 // 파일 존재: bamboo.png, cactus.png, dandelion.png, fern.png, pine.png, rose.png
const PLANT_BASE = "../assets/plants/";
  const TYPE = {
    rose:      {title:"🌹 감정형(따뜻)",  ko:"장미",     img:PLANT_BASE+"rose.png"},
    fern:      {title:"🌿 감정형(섬세)",  ko:"양치",     img:PLANT_BASE+"fern.png"},
    cactus:    {title:"🌵 논리형(분석)",  ko:"선인장",   img:PLANT_BASE+"cactus.png"},
    dandelion: {title:"🌼 논리형(실용)",  ko:"민들레",   img:PLANT_BASE+"dandelion.png"},
    bamboo:    {title:"🎋 조화형(유연)",  ko:"대나무",   img:PLANT_BASE+"bamboo.png"},
    pine:      {title:"🌲 조화형(안정)",  ko:"소나무",   img:PLANT_BASE+"pine.png"}
  };

  // 분류(6)
  function classify6(n){
    const e=n.E,l=n.L,diff=e-l,gap=Math.abs(diff),mean=(e+l)/2;
    if(gap<0.10) return mean>=0.55?"bamboo":"pine";
    if(diff>0)   return (e>=0.65 && l<=0.45)?"rose":"fern";
    return (l>=0.65 && e<=0.45)?"cactus":"dandelion";
  }

  // 카피
  const COPY = {
    rose:{quote:"“마음의 온기가 방향을 정해요.”",
      desc:"따뜻한 공감이 큰 힘이 되는 타입입니다. 관계의 온도를 높이고 주변의 미세한 신호를 잘 포착하죠. 스스로의 에너지를 지키는 경계를 세우면 지속력이 좋아집니다.",
      remind:["감정을 한 문장으로 적어보기","반응 전 호흡 3회 · 어깨 이완"]},
    fern:{quote:"“섬세함은 힘이다.”",
      desc:"뉘앙스를 읽고 부드럽게 조율하는 능력이 뛰어납니다. 말보다 분위기를 먼저 감지하고, 정보 과적재를 줄이면 선택 피로가 줄어듭니다.",
      remind:["느낌/사실 분리 기록","몰입 신호 체크(속도·어깨·호흡)"]},
    cactus:{quote:"“빨리보다 정확하게.”",
      desc:"근거·구조·일관성을 중시하는 분석가형. 핵심을 뽑아내는 장점이 있으며, 감정 데이터도 결과의 일부로 보완하면 설득력이 커집니다.",
      remind:["결정 전 30초 멈춤","감정 한 단어 기록 → 반영"]},
    dandelion:{quote:"“가볍게, 그러나 명확하게.”",
      desc:"실용과 실행에 강해 추진력이 돋보입니다. “충분히 좋음” 기준을 세우면 속도와 품질이 함께 올라갑니다.",
      remind:["해야 할 일 1개만 착수","대화 전 톤·속도 10% 낮추기"]},
    bamboo:{quote:"“바람 따라 흔들려도, 다시 곧게.”",
      desc:"상황에 따라 감정/논리를 유연하게 전환하는 조화형. 리듬을 일정하게 유지하면 성과 분산이 줄고 안정감이 커집니다.",
      remind:["25-3 타이머 1세트","하루 끝 체크: 마음=생각?"]},
    pine:{quote:"“느리지만 멀리 간다.”",
      desc:"안정과 일관성을 중시하는 균형형. 속도가 느려 보여도 흔들림이 적고, 루틴이 쌓일수록 강해집니다.",
      remind:["루틴 1개만 고정","과제 난이도 80%로 조정"]}
  };

  const pillList = list => `
    <div class="remind-list">
      ${list.map(t=>`
        <div class="remind-item">
          <span class="remind-bullet" aria-hidden="true"></span>
          <span class="remind-text">${t}</span>
        </div>
      `).join("")}
    </div>
  `;

  // 결과
  function finish(){
    card.style.display="none";
    barFill.style.width="100%";

    const n   = normalize();
    const key = classify6(n);
    const info= COPY[key];
    const meta= TYPE[key];

    // 좌우 분할: 합 100%로 가시화
    let ePct = Math.round(n.E*100);
    let lPct = Math.round(n.L*100);
    if(ePct + lPct === 0){ ePct=50; lPct=50; }
    else { const sum=ePct+lPct; ePct=Math.round(ePct/sum*100); lPct=100-ePct; }

    const hint = (()=>{
      const gap=Math.abs(n.E-n.L);
      if(gap<0.1) return "두 성향이 고르게 나타납니다. 상황에 따라 전환이 유연해요.";
      if(n.E>n.L) return "감정 신호에 더 민감합니다. 온기를 살리되, 근거 한 줄을 덧붙이면 좋아요.";
      return "논리·근거가 앞섭니다. 구조를 살리되, 감정 데이터를 곁들이면 설득력이 커집니다.";
    })();

    const plantLabel = `${meta.title} · <span class="result-sub">(${meta.ko} / ${key})</span>`;

    resultBox.innerHTML = `
      <div class="result-card mind">
        <div class="result-hero">
          <img src="${meta.img}" alt="${meta.title}"
               onerror='this.onerror=null; this.src="./assets/plant.png"'>
          <div>
            <div class="result-title">${plantLabel}</div>
            <div class="result-sub">“${info.quote}”</div>
          </div>
        </div>

        <p class="result-desc" style="margin:8px 0 6px">${info.desc}</p>
        <p class="result-desc" style="margin:6px 0 10px;opacity:.9">
          지금의 당신은 <b>${
            key==='rose'?'따뜻함':
            key==='fern'?'섬세함':
            key==='cactus'?'정확성':
            key==='dandelion'?'실용성':
            key==='bamboo'?'유연성':'안정성'
          }</b>이 도드라져요. 이 기조를 지키면서 작은 루틴 하나를 더해 리듬을 가볍게 정돈해보면 좋아요.
        </p>

        <div class="mind-remind">
          <b>🌿 마음 리마인드</b>
          ${pillList(info.remind)}
        </div>

        <div class="split-meter" role="group" aria-label="감정과 논리 비율">
          <div class="labels">
            <span>감정</span>
            <span>논리</span>
          </div>
          <div class="bar" aria-hidden="true">
            <span class="left" style="width:${ePct}%"></span>
            <span class="right" style="width:${lPct}%"></span>
            <span class="center-line"></span>
          </div>
          <div class="perc">
            <span>감정 ${ePct}%</span>
            <span>논리 ${lPct}%</span>
          </div>
          <div class="hint">${hint}</div>
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;

    resultBox.style.display="block";
  }

  // 시작
  render();
})();