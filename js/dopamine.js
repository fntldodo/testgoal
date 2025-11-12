/* 도파민 공장장 v2025.8 — template 적용(ScoreKit) + 이모지 아이콘 */
(function(){
  if (window.__dopamine_boot__) return; window.__dopamine_boot__=true;

  // 축: N(자극성), S(사회성), K(지식추구), B(균형/루틴)
  const Q = [
    {pos:'N', neg:'B', q:'지루해지면 즉시 자극적인 것을 찾는다.'},
    {pos:'N', neg:'B', q:'즉석 결정을 즐기는 편이다.'},
    {pos:'S', neg:'B', q:'사람들과의 상호작용이 큰 에너지를 준다.'},
    {pos:'S', neg:'B', q:'알림(댓글/메시지)이 오면 바로 확인한다.'},
    {pos:'K', neg:'N', q:'궁금한 건 끝까지 파고들어 지식으로 쌓는다.'},
    {pos:'K', neg:'N', q:'정보 정리/아카이빙이 습관이다.'},
    {pos:'B', neg:'N', q:'루틴(수면·식사·운동)을 꾸준히 지킨다.'},
    {pos:'B', neg:'N', q:'즉흥 충동이 와도 한 번 멈추고 선택한다.'},
    {pos:'N', neg:'B', q:'새로운 장소/경험을 자주 시도한다.'},
    {pos:'S', neg:'B', q:'모임·행사·네트워킹이 기대된다.'},
    {pos:'K', neg:'N', q:'새 개념을 이해했을 때 보상이 크다.'},
    {pos:'B', neg:'N', q:'작은 보상(차·산책·스트레칭)으로 스스로를 달랜다.'},
  ];

  const TYPE = {
    ROLLER:{title:'🎢 롤러코스터', emoji:'🎢'},
    SOCIAL:{title:'🎉 인싸 제조기', emoji:'🎉'},
    KNOW  :{title:'📚 지식 부자',   emoji:'📚'},
    AVOHA :{title:'🥑 아보하 마스터',emoji:'🥑'},
  };

  const COPY = {
    ROLLER:{
      quote:'오늘의 재미는 오늘 만든다!',
      desc:'새로움/강한 자극에 반응. 실행 우선이 강점이지만 과열 전 쿨다운이 필요.',
      summary:['자극 선호','즉흥 실행','새로움 탐색'],
      remind:['15분 즐기고 멈춰보기','설탕·카페인 낮 시간 최소화'],
    },
    SOCIAL:{
      quote:'사람 사이를 잇는 도파민.',
      desc:'상호작용/인정에서 보상이 큼. 알림과 감정 리듬을 묶음 관리하면 오래 간다.',
      summary:['상호작용 보상','인정 민감','네트워킹 동력'],
      remind:['알림 묶음 확인(시간 지정)','오늘 대화 1건 성의 있게'],
    },
    KNOW:{
      quote:'이해의 순간, 보상은 터진다.',
      desc:'지식 연결/정리에 보상. 과몰입 방지용 휴식 리듬을 설계하세요.',
      summary:['지식 보상 큼','정리 습관','깊은 집중'],
      remind:['50/10 리듬(집중/휴식)','새로 배운 1가지 기록'],
    },
    AVOHA:{
      quote:'작은 행복을 꾸준히.',
      desc:'루틴과 소보상으로 안정 주행. 때때로 의도적 새로움으로 활력 플러스.',
      summary:['루틴 보상','안정 추구','지속성'],
      remind:['산책 10분 + 물 1컵','루틴에 “새로움 1개” 얹기'],
    },
  };

  const scorer = ScoreKit.createScorer({ NEG_WEIGHT: 0.6 });

  const $=id=>document.getElementById(id);
  let idx=0, startedAt=Date.now();

  function render(){
    $('stepLabel').textContent=`문항 ${idx+1} / ${Q.length}`;
    $('bar').style.width=`${(idx/Q.length)*100}%`;
    $('qText').textContent=Q[idx].q;

    const wrap=$('choiceWrap');
    wrap.innerHTML = [4,3,2,1,0].map(s=>{
      const label = s===4?'매우 그렇다':s===3?'그렇다':s===2?'보통이다':s===1?'아니다':'전혀 아니다';
      const ghost = s<=1?' ghost':'';
      return `<div class="choice"><button class="btn${ghost}" data-s="${s}">${label}</button></div>`;
    }).join('');
    wrap.querySelectorAll('.btn').forEach(b=>{
      b.addEventListener('click',()=>{
        wrap.querySelectorAll('.btn').forEach(x=>x.classList.remove('selected'));
        b.classList.add('selected');
        setTimeout(()=>choose(Number(b.dataset.s)),120);
      },{passive:true});
    });
    startedAt = Date.now();
  }

  function choose(s){
    const sec=(Date.now()-startedAt)/1000;
    scorer.apply(s, Q[idx], sec);
    if (++idx<Q.length) render(); else finish();
  }

  $('prev')?.addEventListener('click',()=>{
    if (idx===0) return;
    idx--;
    // 재계산
    scorer.state.score = Object.create(null);
    scorer.state.count = Object.create(null);
    for (let i=0;i<idx;i++){
      // 임시로 중립 가정(빠른 뒤로가기 안정성). 필요시 answers 배열로 보강 가능.
      scorer.apply(2, Q[i], 3);
    }
    render();
  });
  $('skip')?.addEventListener('click',()=>{
    scorer.apply(2, Q[idx], 3);
    if (++idx<Q.length) render(); else finish();
  });

  function labelOf(p){
    return p>=0.76?'매우 높음' : p>=0.56?'높음' : p>=0.36?'보통' : p>=0.21?'낮음' : '아주 낮음';
  }

  function classify(n){
    // 가장 높은 축으로 1차 분류, 근소차 하이브리드 억제
    const arr = [
      {k:'ROLLER', v:n.N},
      {k:'SOCIAL', v:n.S},
      {k:'KNOW',   v:n.K},
      {k:'AVOHA',  v:n.B},
    ].sort((a,b)=>b.v-a.v);
    const main = arr[0], second = arr[1], gap = main.v - second.v;
    const hybrid = gap<0.08 ? second.k : null; // 필요 시 표시만, 문구는 단일형 기준
    return { main: main.k, hybrid, n };
  }

  function finish(){
    $('bar').style.width='100%';
    document.getElementById('card').style.display='none';

    const n = scorer.normalize();
    const res = classify(n);
    const meta = TYPE[res.main], info=COPY[res.main];

    // 헤더
    document.getElementById('rEmoji').textContent = meta.emoji;
    document.getElementById('rTitle').textContent = meta.title;
    document.getElementById('rQuote').textContent = `“${info.quote}”`;
    document.getElementById('rDesc').textContent  = info.desc;

    // 요약 pill
    document.getElementById('res-summary').innerHTML =
      info.summary.map(t=>`<span class="pill">${t}</span>`).join('') +
      (res.hybrid ? `<span class="pill" style="background:#f4eeff">하이브리드 성향</span>` : '');

    // 상위 2막대
    const labelMap = {N:'자극성', S:'사회성', K:'지식추구', B:'균형도'};
    const rows = Object.entries(n)
      .sort((a,b)=>b[1]-a[1]).slice(0,2)
      .map(([k,v])=>{
        const pct=Math.round(v*100), tag=labelOf(v);
        return `
          <div class="row">
            <span><b>${labelMap[k]||k}</b></span>
            <div class="bar"><span class="fill" style="width:${pct}%"></span></div>
            <span class="meter-label">${tag} (${pct}%)</span>
          </div>`;
      }).join('');
    document.getElementById('rMeter').innerHTML = rows;

    // 마음 리마인드
    document.getElementById('rMind').innerHTML = info.remind.map(t=>`<div>${t}</div>`).join('');

    document.getElementById('result').hidden=false;
  }

  if (document.readyState !== 'loading') render();
  else document.addEventListener('DOMContentLoaded', render);
})();