/* 콜드리딩 감지력 — ScoreKit v2025.8 (양극성, 15문항)
 * 분류 4종:
 *  - 🔎 정밀 디텍터 (고감도·근거 기반, 균형)
 *  - 🌿 균형형 (직감↔근거 조화)
 *  - 🌫️ 추측 과다 (성급한 일반화/오독 위험)
 *  - 🐢 신호 저감 (감지 민감도 낮음)
 * 규칙: 5지선다(0~4) + 반응시간 보조(±20%, 선택 우선), 하이브리드 남발 방지
 * 결과 포맷: 제목/인용/설명/요약키워드/마음리마인드/메인·다시 — 몽실1프롬프트 준수
 */
(function(){
  if (window.__relationship_coldreading_boot__) return;
  window.__relationship_coldreading_boot__ = true;

  // 축 의미:
  // K(근거/분석), S(사회적 신호 감지), N(성급/추측), B(균형/검증·회수)
  const Q = [
    // 사회적 신호 감지 (동의→S, 부정→B)
    {pos:'S', neg:'B', q:'표정·목소리 톤의 작은 변화로 감정선 변화를 알아차린다.'},
    {pos:'S', neg:'B', q:'제스처/시선 방향에서 관심 주제를 감지한다.'},
    {pos:'S', neg:'B', q:'대화 중 상대의 “경계 신호(짧은 답·몸을 뒤로)”를 캐치한다.'},

    // 근거·분석 (동의→K, 부정→N)
    {pos:'K', neg:'N', q:'애매한 말은 확인 질문으로 구체화해 나간다.'},
    {pos:'K', neg:'N', q:'빗나간 가설은 깔끔히 철회하고 다른 가설로 전환한다.'},
    {pos:'K', neg:'N', q:'대화 후 메모·기록으로 다음 대화를 준비한다.'},
    {pos:'K', neg:'N', q:'정보가 부족할 때는 “일반적 통계”를 근거로 가설을 좁힌다.'},

    // 균형·검증/회수 (동의→B, 부정→N)
    {pos:'B', neg:'N', q:'무례하지 않게 거절/회수하는 문장을 준비해둔다.'},
    {pos:'B', neg:'N', q:'확정적 단정보다, 넓게 던지고 반응으로 좁혀간다.'},

    // 성급/추측 (동의→N, 부정→B)
    {pos:'N', neg:'B', q:'첫인상/한두 신호로 결론을 빨리 내리는 편이다.'},
    {pos:'N', neg:'B', q:'상대 반응을 충분히 듣기 전, 내 해석을 밀어붙인 적이 있다.'},
    {pos:'N', neg:'B', q:'모호한 피드백도 내 해석에 유리한 단서로 간주하곤 한다.'},

    // 통합 항목 (상황 적응/조화)
    {pos:'S', neg:'N', q:'상대가 반응한 포인트를 기억해 즉시 질문 흐름을 조정한다.'},
    {pos:'K', neg:'N', q:'단정 대신 가설들을 나열한 후 반응에 따라 선택한다.'},
    {pos:'B', neg:'N', q:'안전한 주제부터 접근해 관계와 정확도를 함께 지킨다.'},
  ];

  const TYPE = {
    DETECT : { title:'🔎 정밀 디텍터', emoji:'🔎' },
    BAL    : { title:'🌿 균형형', emoji:'🌿' },
    OVER   : { title:'🌫️ 추측 과다', emoji:'🌫️' },
    LOW    : { title:'🐢 신호 저감', emoji:'🐢' },
  };

  const COPY = {
    DETECT: {
      quote:'감지 — 확인 — 조정의 선순환.',
      desc:'신호 민감도(S)와 근거(K)가 함께 높고, 검증(B)으로 속도를 조절합니다. 오독 위험이 낮고 관계 손실도 적습니다.',
      summary:['신호 민감','근거 기반','검증·회수'],
      remind:['확인 질문 1회 후 해석','과잉 읽기 말고, 맥락 확인'],
    },
    BAL: {
      quote:'직감과 근거의 호흡.',
      desc:'직감(S)과 분석(K)을 주고받으며 진행합니다. 상황 적응력이 좋아 대화의 리듬을 살립니다.',
      summary:['상황 적응','직감↔근거 조화','관계 리듬'],
      remind:['핵심 단서만 2개 적재','모호함은 메모로 보류'],
    },
    OVER: {
      quote:'빠른 추측은 쉬워도, 좋은 추론은 어렵다.',
      desc:'N(성급/추측)이 높고 B(검증)가 낮아 오독 위험이 큽니다. 단정 전 “확인-회수” 절차를 의식하세요.',
      summary:['성급한 일반화','오독 위험','검증 약함'],
      remind:['확인 질문 후 결론','회수 문장 상시 준비'],
    },
    LOW: {
      quote:'감지력은 천천히 자라난다.',
      desc:'신호 감지와 분석이 낮아 해석이 느릴 수 있습니다. 안전한 주제에서 감각을 키워보세요.',
      summary:['민감도 낮음','정보 수집 우선','안전 접근'],
      remind:['표정/톤·단어 라벨링','작은 단서 2개로 시작'],
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

  // 분류 로직:
  // K·S 높고 B도 준수 → DETECT
  // N 높고 B 낮음 → OVER
  // 전반 낮음 → LOW
  // 나머지 → BAL
  function classify(n){
    const k=n.K, s=n.S, b=n.B, nn=n.N;
    const high = (v)=>v>=0.56, mid=(v)=>v>=0.36;

    // 정밀 디텍터
    if (high(k) && high(s) && mid(b)) return {main:'DETECT', hybrid:null, n};
    // 추측 과다
    if (nn>=0.50 && b<0.45) return {main:'OVER', hybrid:null, n};
    // 신호 저감(전반 낮음)
    const vals=[n.N,n.S,n.K,n.B];
    const mean=(vals[0]+vals[1]+vals[2]+vals[3])/4;
    if (mean < 0.32) return {main:'LOW', hybrid:null, n};

    // 근소차/중간대 → 균형형
    return {main:'BAL', hybrid:null, n};
  }

  function finish(){
    $("bar").style.width="100%";
    $("card").style.display="none";

    const n = scorer.normalize();
    const res = classify(n);
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
        ['신호 민감(S)', n.S],
        ['근거/분석(K)', n.K],
        ['균형/검증(B)', n.B],
        ['성급/추측(N)', n.N],
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