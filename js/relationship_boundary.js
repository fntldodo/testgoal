/* 관계 경계 점검 — ScoreKit v2025.8 적용 (양극성, 15문항)
 * 분류 4종:
 *  - 🛡️ 단단한 경계(Healthy Boundaries)
 *  - 🌿 유연한 경계(Adaptive Boundaries)
 *  - 🌊 취약한 경계(Thin/Porous)
 *  - 🧱 과도한 경계(Rigid)
 * 규칙: 5지선다(0~4) + 반응시간 보조(±20%, 선택 우선), 하이브리드 남발 방지
 * 결과 구조: 제목/인용/설명/요약키워드/마음리마인드/메인·다시 버튼 — 몽실1프롬프트 준수
 */
(function(){
  if (window.__relationship_boundary_boot__) return;
  window.__relationship_boundary_boot__ = true;

  // pos=동의 시 가산되는 축 / neg=부동의 시 가산되는 축
  // 경계 안정은 B(균형/절제), 대인 의존/맞춤 과다 성향은 S, 충동/자극은 N, 지식/근거는 K로 둡니다.
  const Q = [
    // 경계·NO 말하기(동의→B, 부정→S)
    {pos:'B', neg:'S', q:'부담스러운 부탁에는 “지금은 어려워요”라고 말할 수 있다.'},
    {pos:'B', neg:'S', q:'상대가 서운해할까 봐 원치 않는 약속을 잡지 않는다.'},
    {pos:'B', neg:'S', q:'관계가 좋아도 내 시간·우선순위를 우선 지킨다.'},

    // 경계 운영(일관/복구)
    {pos:'B', neg:'S', q:'연락 빈도/시간대를 스스로 정하고 지키는 편이다.'},
    {pos:'B', neg:'S', q:'상대의 감정이 격해져도 내 감정까지 무너뜨리진 않는다.'},

    // 취약 경계(타인 기준에 끌림 – 동의→S, 부정→B)
    {pos:'S', neg:'B', q:'부탁을 거절하면 바로 미움받을 것 같아 두렵다.'},
    {pos:'S', neg:'B', q:'상대의 반응을 지나치게 살피다 내 결정을 바꾸곤 한다.'},
    {pos:'S', neg:'B', q:'대화에서 불편해도 분위기 깰까 봐 의견 표현을 미룬다.'},

    // 과도 경계(닫힘/고립 – 동의→N, 부정→B)
    {pos:'N', neg:'B', q:'내 영역에 들어오려 하면 누가 됐든 본능적으로 밀쳐낸다.'},
    {pos:'N', neg:'B', q:'도움을 요청하면 약점 드러나는 것 같아 웬만하면 참는다.'},

    // 근거 기반(기준/사실 – 동의→K, 부정→S)
    {pos:'K', neg:'S', q:'요청을 받을 때 기준(시간·비중·역할)을 먼저 확인한다.'},
    {pos:'K', neg:'S', q:'감정보다 사실·상황을 정리해 대화하려 한다.'},

    // 즉흥 수락(후회 – 동의→N, 부정→B)
    {pos:'N', neg:'B', q:'부탁에 즉흥적으로 OK 해놓고 나중에 후회한 적이 잦다.'},
    {pos:'N', neg:'B', q:'분위기에 휩쓸려 계획을 자주 무너뜨린다.'},

    // 회복·조정(복구 – 동의→B, 부정→S)
    {pos:'B', neg:'S', q:'한번 흔들린 경계도 대화로 다시 조정할 수 있다.'},
    {pos:'B', neg:'S', q:'상대와 나의 필요를 “함께” 맞추는 연습을 해본다.'},
  ];

  const TYPE = {
    FIRM   : { title:'🛡️ 단단한 경계', emoji:'🛡️' },
    FLEX   : { title:'🌿 유연한 경계', emoji:'🌿' },
    THIN   : { title:'🌊 취약한 경계', emoji:'🌊' },
    RIGID  : { title:'🧱 과도한 경계', emoji:'🧱' },
  };

  const COPY = {
    FIRM: {
      quote:'상대도 나도 지키는 선.',
      desc:'요구와 감정을 구분하고, 기준에 맞춰 조율합니다. 관계 속 피로 누수도 적고 회복도 빠릅니다.',
      summary:['NO 말하기','역할/시간 기준','조율 능력'],
      remind:['요청은 “기준 먼저” 확인','조정안 제시: 대안·범위·시점'],
    },
    FLEX: {
      quote:'필요에 맞게 휘고 펴는 힘.',
      desc:'정서·상황에 따라 경계를 조정할 줄 압니다. 다만 과도한 맞춤으로 기울지 않게 기준표를 곁들여요.',
      summary:['상황 적응','공감+기준 병행','관계 유지력'],
      remind:['주간 기준표 업데이트','감정 라벨링 후 합의'],
    },
    THIN: {
      quote:'좋은 마음이 새지 않게.',
      desc:'거절 불안과 과잉 맞춤으로 피로가 누적되기 쉽습니다. “짧고 선명한 NO” 연습이 회복의 시작입니다.',
      summary:['거절 어려움','눈치 과다','피로 누수'],
      remind:['짧은 NO 문장 2개 준비','응답 지연(“내일 알려줄게”)'],
    },
    RIGID: {
      quote:'안전을 지키되, 연결을 잃지 않기.',
      desc:'자기보호가 강점이나 고립으로 번질 수 있습니다. 안전을 유지하되 작은 도움 요청을 시도해보세요.',
      summary:['자기보호','닫힘 경향','의존 회피'],
      remind:['도움 요청 1건 시도','신뢰 인물 리스트 만들기'],
    },
  };

  const scorer = ScoreKit.createScorer({ NEG_WEIGHT: 0.6 });

  let idx=0, startedAt=Date.now();
  const ans=[], times=[];
  const $=id=>document.getElementById(id);

  function render(){
    $("stepLabel").textContent = `문항 ${idx+1} / ${Q.length}`;
    $("bar").style.width = `${(idx/Q.length)*100}%`;
    $("qText").textContent = Q[idx].q;

    const wrap=$("choiceWrap");
    wrap.innerHTML = `
      <div class="choice"><button class="btn" data-s="4">매우 그렇다</button></div>
      <div class="choice"><button class="btn" data-s="3">그렇다</button></div>
      <div class="choice"><button class="btn" data-s="2">보통이다</button></div>
      <div class="choice"><button class="btn ghost" data-s="1">아니다</button></div>
      <div class="choice"><button class="btn ghost" data-s="0">전혀 아니다</button></div>
    `;
    wrap.querySelectorAll(".btn").forEach(b=>{
      b.addEventListener("click",()=>{
        wrap.querySelectorAll(".btn").forEach(c=>c.classList.remove("selected"));
        b.classList.add("selected");
        setTimeout(()=>choose(Number(b.dataset.s)),120);
      },{passive:true});
    });
    startedAt = Date.now();
  }

  function choose(s){
    const sec=(Date.now()-startedAt)/1000;
    scorer.apply(s, Q[idx], sec);
    ans[idx]=s; times[idx]=sec;
    if (++idx<Q.length) render(); else finish();
  }

  $("prev")?.addEventListener("click",()=>{
    if (idx===0) return;
    idx--;
    scorer.state.score={N:0,S:0,K:0,B:0};
    scorer.state.count={N:0,S:0,K:0,B:0};
    for (let i=0;i<idx;i++){
      scorer.apply(ans[i]??0, Q[i], times[i]??3);
    }
    render();
  });

  $("skip")?.addEventListener("click",()=>{
    const sec=(Date.now()-startedAt)/1000;
    scorer.apply(2, Q[idx], sec); // 중립
    ans[idx]=2; times[idx]=sec;
    if (++idx<Q.length) render(); else finish();
  });

  function labelOf(p){
    return p>=0.76?'매우 높음' : p>=0.56?'높음' : p>=0.36?'보통' : p>=0.21?'낮음' : '아주 낮음';
  }

  // 분류 로직: B(경계 안정) 높으면 FIRM, S 높으면 THIN,
  // N이 높고 B 낮으면 RIGID 경향, 중간대/근소차면 FLEX
  function classifyBoundary(n){
    const b=n.B, s=n.S, nn=n.N;

    if (b>=0.56 && b> s && b> nn) return {main:'FIRM', hybrid:null, n};
    if (s>=0.56 && s> b)          return {main:'THIN', hybrid:null, n};
    if (nn>=0.50 && b<0.45)       return {main:'RIGID', hybrid:null, n};

    // 근소차/중간대 → FLEX
    const vals=[n.N,n.S,n.K,n.B];
    const mean=(vals[0]+vals[1]+vals[2]+vals[3])/4;
    const variance=vals.reduce((acc,x)=>acc+Math.pow(x-mean,2),0)/4;
    if (variance < 0.0036) return {main:'FLEX', hybrid:null, n};

    return {main:'FLEX', hybrid:null, n};
  }

  function finish(){
    $("bar").style.width="100%";
    $("card").style.display="none";

    const n = scorer.normalize();
    const res = classifyBoundary(n);
    const key = res.main, meta=TYPE[key], info=COPY[key];

    const rEmoji=$("rEmoji"), rTitle=$("rTitle"), rQuote=$("rQuote"), rDesc=$("rDesc");
    const rSummary=$("res-summary"), rMeter=$("rMeter"), rMind=$("rMind");

    if (rEmoji) rEmoji.textContent = meta.emoji;
    if (rTitle) rTitle.textContent = meta.title;
    if (rQuote) rQuote.textContent = `“${info.quote}”`;
    if (rDesc)  rDesc.textContent  = info.desc;

    if (rSummary){
      rSummary.innerHTML = info.summary.map(t=>`<span class="pill">${t}</span>`).join('');
    }

    if (rMeter){
      const rows = [
        ['경계 안정(B)', n.B],
        ['대인 의존/맞춤(S)', n.S],
        ['충동/회피(N)', n.N],
        ['근거/기준(K)', n.K],
      ].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([label,val])=>{
        const pct=Math.round(val*100), tag=labelOf(val);
        return `
          <div class="row">
            <span><b>${label}</b></span>
            <div class="bar"><span class="fill" style="width:${pct}%"></span></div>
            <span class="meter-label">${tag} (${pct}%)</span>
          </div>`;
      }).join('');
      rMeter.innerHTML = rows;
    }

    if (rMind){
      rMind.innerHTML = info.remind.map(t=>`<div>${t}</div>`).join('');
    }
    $("result").hidden=false;
  }

  if (document.readyState!=='loading') render();
  else document.addEventListener('DOMContentLoaded', render);
})();