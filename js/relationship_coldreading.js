/* 콜드리딩 감지력 v2025.8 — ScoreKit 템플릿 */
(function(){
  if (window.__rl_cold__) return; window.__rl_cold__=true;

  // 축: S(신호 민감), K(근거/분석), B(검증/회수), N(성급/추측)
  const Q = [
    {pos:'S', neg:'B', q:'표정·목소리 톤의 작은 변화를 알아차린다.'},
    {pos:'S', neg:'B', q:'제스처/시선에서 관심 주제를 감지한다.'},
    {pos:'S', neg:'B', q:'상대의 경계 신호(짧은 답/몸을 뒤로)를 캐치한다.'},
    {pos:'K', neg:'N', q:'애매한 말은 확인 질문으로 구체화한다.'},
    {pos:'K', neg:'N', q:'빗나간 가설은 깔끔히 철회한다.'},
    {pos:'K', neg:'N', q:'대화 후 메모로 다음 대화를 준비한다.'},
    {pos:'K', neg:'N', q:'정보 부족 시 일반 통계로 가설 범위를 좁힌다.'},
    {pos:'B', neg:'N', q:'무례하지 않게 거절/회수 문장을 준비한다.'},
    {pos:'B', neg:'N', q:'넓게 던지고 반응으로 좁혀간다.'},
    {pos:'N', neg:'B', q:'첫인상/한두 신호로 결론을 빨리 낸다.'},
    {pos:'N', neg:'B', q:'상대 반응 전 내 해석을 밀어붙인 적이 있다.'},
    {pos:'N', neg:'B', q:'모호한 피드백도 내 해석에 유리하게 읽는다.'},
    {pos:'S', neg:'N', q:'반응 포인트를 기억해 즉시 질문 흐름을 조정한다.'},
    {pos:'K', neg:'N', q:'단정 대신 가설을 나열하고 반응으로 선택한다.'},
    {pos:'B', neg:'N', q:'안전한 주제부터 접근한다.'},
  ];

  const TYPE = {
    DETECT:{title:'🔎 정밀 디텍터'},
    BAL   :{title:'🌿 균형형'},
    OVER  :{title:'🌫️ 추측 과다'},
    LOW   :{title:'🐢 신호 저감'},
  };
  const COPY = {
    DETECT:{quote:'감지 — 확인 — 조정의 선순환.',
      desc:'신호(S)와 근거(K)가 높고 검증(B)으로 속도를 조절합니다.',
      summary:['신호 민감','근거 기반','검증·회수'],
      remind:['확인 질문 1회','맥락 확인 후 해석']},
    BAL:{quote:'직감과 근거의 호흡.',
      desc:'직감과 분석을 주고받으며 진행합니다.',
      summary:['상황 적응','직감↔근거 조화','관계 리듬'],
      remind:['핵심 단서 2개만','모호함은 메모로 보류']},
    OVER:{quote:'빠른 추측은 쉬워도, 좋은 추론은 어렵다.',
      desc:'성급(N)↑, 검증(B)↓. 단정 전 확인 절차가 필요합니다.',
      summary:['성급 일반화','오독 위험','검증 약함'],
      remind:['확인 질문 후 결론','회수 문장 상시 준비']},
    LOW:{quote:'감지력은 천천히 자라난다.',
      desc:'신호/분석이 전반 낮습니다. 안전 주제로 감각을 키워보세요.',
      summary:['민감도 낮음','정보 수집','안전 접근'],
      remind:['표정·톤 라벨링','작은 단서 2개로 시작']},
  };

  const scorer = ScoreKit.createScorer({ NEG_WEIGHT: 0.6 });
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
    scorer.apply(s, Q[idx], sec);
    if(++idx<Q.length) render(); else finish();
  }
  $('prev')?.addEventListener('click',()=>{ if(idx===0)return; idx--; scorer.state.score={}; scorer.state.count={}; for(let i=0;i<idx;i++) scorer.apply(2,Q[i],3); render(); });
  $('skip')?.addEventListener('click',()=>{ scorer.apply(2,Q[idx],3); if(++idx<Q.length) render(); else finish(); });

  function finish(){
    $('bar').style.width='100%';
    document.getElementById('card').style.display='none';
    const n = scorer.normalize();
    const k=n.K||0, s=n.S||0, b=n.B||0, nn=n.N||0;
    let key;
    if (k>=0.56 && s>=0.56 && b>=0.36) key='DETECT';
    else if (nn>=0.50 && b<0.45) key='OVER';
    else if (((k+s+b+nn)/4) < 0.32) key='LOW';
    else key='BAL';

    const meta=TYPE[key], info=COPY[key];
    document.getElementById('rTitle').textContent = meta.title;
    document.getElementById('rQuote').textContent = `“${info.quote}”`;
    document.getElementById('rDesc').textContent  = info.desc;
    document.getElementById('res-summary').innerHTML = info.summary.map(t=>`<span class="pill">${t}</span>`).join('');
    const rows=[
      ['신호 민감(S)', s],
      ['근거/분석(K)', k],
      ['검증/회수(B)', b],
      ['성급/추측(N)', nn],
    ].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([label,v])=>{
      const pct=Math.round(v*100), tag=pct>=76?'매우 높음':pct>=56?'높음':pct>=36?'보통':pct>=21?'낮음':'아주 낮음';
      return `<div class="row"><span><b>${label}</b></span><div class="bar"><span class="fill" style="width:${pct}%"></span></div><span class="meter-label">${tag} (${pct}%)</span></div>`;
    }).join('');
    document.getElementById('rMeter').innerHTML = rows;
    document.getElementById('rMind').innerHTML = info.remind.map(t=>`<div>${t}</div>`).join('');
    document.getElementById('result').hidden=false;
  }

  if (document.readyState!=='loading') render();
  else document.addEventListener('DOMContentLoaded', render);
})();