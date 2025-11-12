/* 관계 경계 점검 v2025.8 — 특정 인물 떠올리고 응답 */
(function(){
  if (window.__rl_boundary__) return; window.__rl_boundary__=true;

  // 축: B(자기경계), E(정서안전/공감 받음), T(투명성/합의), S(상호존중)
  const Q = [
    {pos:'B', q:'그 사람과 있을 때 나의 “싫음/원함”을 분명히 표현할 수 있다.'},
    {pos:'E', q:'감정이 폄하되거나 “예민해”로 치부되지 않는다.'},
    {pos:'T', q:'약속/합의가 바뀌면 서로 확인하고 기록한다.'},
    {pos:'S', q:'서로의 일정/공간/속도를 존중한다.'},
    {pos:'B', q:'부담스러운 요구에는 거절/대안을 제시할 수 있다.'},
    {pos:'E', q:'상대의 실수 지적이 “맞아”로 수용된다.'},
    {pos:'T', q:'메시지·통화 빈도는 합의된 수준을 유지한다.'},
    {pos:'S', q:'내 결정이 상대의 기분으로 자주 뒤집히지 않는다.'},
    {pos:'B', q:'내 과거/관계를 탐문당하는 느낌이 없다.'},
    {pos:'E', q:'가벼운 농담이 모욕/비하로 넘어가지 않는다.'},
    {pos:'T', q:'경제/일정 등 중요한 정보는 숨김없이 공유된다.'},
    {pos:'S', q:'갈등 후 회복 방법(대화 규칙)이 있다.'},
    {pos:'B', q:'내 휴식시간에 대한 침범이 드물다.'},
    {pos:'E', q:'의견충돌에서도 기본적인 다정함이 유지된다.'},
    {pos:'T', q:'중요한 결정 전, 충분한 설명·동의를 구한다.'},
  ];

  const TYPE = {
    SAFE  : {title:'🛟 경계 안전'},
    SWAY  : {title:'🌬️ 경계 흔들림'},
    RISK  : {title:'🚧 경계 위험'},
  };
  const COPY = {
    SAFE:{quote:'존중은 관계의 기본 보안장치.',
      desc:'표현-합의-회복 규칙이 작동합니다. 일시적 흔들림만 관리하면 충분해요.',
      summary:['표현 가능','합의 유지','회복 규칙'],
      remind:['휴식·속도 합의 확인','갈등 후 회복 루틴 유지','거절 문장 리허설']},
    SWAY:{quote:'지금은 “선 긋기” 리마인드가 필요.',
      desc:'표현/합의가 간헐적으로 무너집니다. 내 속도·공간을 재설정하세요.',
      summary:['의사표현 변동','합의 흔들림','속도 재조율 필요'],
      remind:['요청→합의→기록 순서','메시지 빈도 재합의','거절·대안 문장 준비']},
    RISK:{quote:'경계가 무너지면 마음은 지칩니다.',
      desc:'표현 억압·합의 회피가 잦을 수 있어요. 안전 규칙부터 복구하세요.',
      summary:['표현 억압','합의 회피','심리적 소진'],
      remind:['핵심 규칙 3가지 가시화','외부 지원(기록/상담) 고려','접촉 빈도 제한']},
  };

  const scorer = ScoreKit.createScorer({ NEG_WEIGHT: 0.4 });
  const $=id=>document.getElementById(id);
  let idx=0, startedAt=Date.now();

  function render(){
    $('stepLabel').textContent=`문항 ${idx+1} / ${Q.length}`;
    $('bar').style.width=`${(idx/Q.length)*100}%`;
    $('qText').textContent=Q[idx].q;
    const wrap=$('choiceWrap');
    wrap.innerHTML=[4,3,2,1,0].map(s=>{
      const label=s===4?'매우 그렇다':s===3?'그렇다':s===2?'보통이다':s===1?'아니다':'전혀 아니다';
      const ghost=s<=1?' ghost':'';
      return `<div class="choice"><button class="btn${ghost}" data-s="${s}">${label}</button></div>`;
    }).join('');
    wrap.querySelectorAll('.btn').forEach(b=>{
      b.addEventListener('click',()=>{
        wrap.querySelectorAll('.btn').forEach(x=>x.classList.remove('selected'));
        b.classList.add('selected');
        setTimeout(()=>choose(Number(b.dataset.s)),120);
      },{passive:true});
    });
    startedAt=Date.now();
  }
  function choose(s){
    const sec=(Date.now()-startedAt)/1000;
    // 이 테스트는 단극성(neg 미사용)
    scorer.apply(s, {pos:Q[idx].pos}, sec);
    if(++idx<Q.length) render(); else finish();
  }
  $('prev')?.addEventListener('click',()=>{ if(idx===0)return; idx--; scorer.state.score={}; scorer.state.count={}; for(let i=0;i<idx;i++) scorer.apply(2,{pos:Q[i].pos},3); render(); });
  $('skip')?.addEventListener('click',()=>{ scorer.apply(2,{pos:Q[idx].pos},3); if(++idx<Q.length) render(); else finish(); });

  function finish(){
    $('bar').style.width='100%';
    document.getElementById('card').style.display='none';

    const n = scorer.normalize();
    const safe = ((n.B||0)+(n.E||0)+(n.T||0)+(n.S||0))/4;
    const key = safe >= 0.62 ? 'SAFE' : safe >= 0.42 ? 'SWAY' : 'RISK';

    const meta=TYPE[key], info=COPY[key];
    document.getElementById('rTitle').textContent = meta.title;
    document.getElementById('rQuote').textContent = `“${info.quote}”`;
    document.getElementById('rDesc').textContent  = info.desc;
    document.getElementById('res-summary').innerHTML = info.summary.map(t=>`<span class="pill">${t}</span>`).join('');
    const triples = [
      ['자기경계(B)', n.B||0],
      ['정서안전(E)', n.E||0],
      ['투명/합의(T)', n.T||0],
      ['상호존중(S)', n.S||0],
    ].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([label,v])=>{
      const pct=Math.round(v*100), tag=pct>=76?'매우 높음':pct>=56?'높음':pct>=36?'보통':pct>=21?'낮음':'아주 낮음';
      return `<div class="row"><span><b>${label}</b></span><div class="bar"><span class="fill" style="width:${pct}%"></span></div><span class="meter-label">${tag} (${pct}%)</span></div>`;
    }).join('');
    document.getElementById('rMeter').innerHTML = triples;
    document.getElementById('rMind').innerHTML = info.remind.map(t=>`<div>${t}</div>`).join('');
    document.getElementById('result').hidden=false;
  }

  if (document.readyState!=='loading') render();
  else document.addEventListener('DOMContentLoaded', render);
})();