/* 관계/가스라이팅 ‘하는 쪽’ 가능성 v2025.8 — ScoreKit 템플릿 */
(function(){
  if (window.__rl_gaslighter__) return; window.__rl_gaslighter__=true;

  // 축: C(통제·조종), E(공감/배려), T(투명/정직), B(타인의 경계 존중)
  const Q = [
    {pos:'C', neg:'E', q:'상대가 내 의도대로 움직이도록 말의 방향을 설계한다.'},
    {pos:'C', neg:'B', q:'상대의 선택지가 적어 보이게 말해 본 적이 있다.'},
    {pos:'C', neg:'T', q:'상황에 따라 사실 일부만 말해 유리하게 만든 적이 있다.'},
    {pos:'C', neg:'E', q:'상대의 감정보다 결과를 우선해 설득을 밀어붙인다.'},
    {pos:'C', neg:'B', q:'상대의 약점을 기억해 두었다가 결정적 순간에 사용한다.'},

    {pos:'T', neg:'C', q:'불리해도 사실을 명확히 밝히려 한다.'},
    {pos:'E', neg:'C', q:'상대의 해석이 다르면 한 번 더 공감으로 되묻는다.'},
    {pos:'B', neg:'C', q:'상대의 경계선(휴식/공간/속도)을 존중하려 노력한다.'},

    {pos:'C', neg:'T', q:'말을 바꿔도 상대가 기억 못 하게 흐림 처리를 한다.'},
    {pos:'C', neg:'E', q:'상대의 자존을 낮추는 농담/비유를 사용한 적이 있다.'},
    {pos:'C', neg:'B', q:'“네가 기억을 잘못한 거야” 식으로 회유해본 적이 있다.'},

    {pos:'T', neg:'C', q:'증거/근거로 대화의 기준을 맞추려 한다.'},
    {pos:'E', neg:'C', q:'상대의 감정 요약(“그래서 속상했구나”)을 시도한다.'},
    {pos:'B', neg:'C', q:'동의하지 않아도 상대의 선택을 수용하고 끝낸다.'},

    {pos:'C', neg:'E', q:'상대가 의심을 보이면 죄책감을 느끼게 만드는 편이다.'},
  ];

  const TYPE = {
    HIGH : {title:'🚨 가스라이팅 가능성 높음', emoji:'🚨'},
    MID  : {title:'⚠️ 주의 필요',         emoji:'⚠️'},
    LOW  : {title:'🙂 낮음',               emoji:'🙂'},
  };

  const COPY = {
    HIGH:{
      quote:'설득이 통제가 되는 순간, 관계는 손상된다.',
      desc:'통제/조종(C)이 공감(E)·경계(B)·투명성(T)을 앞설 가능성이 높습니다.',
      summary:['통제 경향 높음','사실 왜곡 위험','타경계 침범 우려'],
      remind:['대화 기준: 사실·느낌 분리','검증 질문 후 결론','사과/회수 문장 준비'],
    },
    MID:{
      quote:'설득과 존중의 경계선 위.',
      desc:'상황에 따라 통제적 전략이 섞입니다. 공감/투명성을 의식적으로 끌어올려 균형을 맞추세요.',
      summary:['상황가변적','설득 강도 조절 필요','검증·회수 훈련'],
      remind:['요약 후 확인(“맞아?”)','결정 전 상대 속도 묻기','농담의 경계 점검'],
    },
    LOW:{
      quote:'설득보다 관계의 안전이 먼저.',
      desc:'공감·투명·경계 존중이 우세합니다. 드물게 통제가 섞일 때만 스스로 점검하면 충분합니다.',
      summary:['공감 우세','투명 대화','경계 존중'],
      remind:['근거-감정-요청 순서','상대 기억에 의존 금지','권한·선택지 명시'],
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
    wrap.innerHTML=[4,3,2,1,0].map(s=>{
      const label=s===4?'매우 그렇다':s===3?'그렇다':s===2?'보통이다':s===1?'아니다':'전혀 아니다';
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
    // 위험지표: C 높고(E,B,T 낮음)일수록 ↑
    const risk = (n.C || 0) - ((n.E||0)+(n.B||0)+(n.T||0))/3;
    let key = risk >= 0.18 ? 'HIGH' : risk >= 0.04 ? 'MID' : 'LOW';

    const meta=TYPE[key], info=COPY[key];
    document.getElementById('rEmoji').textContent = meta.emoji;
    document.getElementById('rTitle').textContent = meta.title;
    document.getElementById('rQuote').textContent = `“${info.quote}”`;
    document.getElementById('rDesc').textContent  = info.desc;
    document.getElementById('res-summary').innerHTML = info.summary.map(t=>`<span class="pill">${t}</span>`).join('');

    const triples = [
      ['통제/조종(C)', n.C||0],
      ['공감(E)',      n.E||0],
      ['경계 존중(B)', n.B||0],
      ['투명/정직(T)', n.T||0],
    ].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([label,v])=>{
      const pct=Math.round(v*100);
      const tag = pct>=76?'매우 높음':pct>=56?'높음':pct>=36?'보통':pct>=21?'낮음':'아주 낮음';
      return `<div class="row"><span><b>${label}</b></span><div class="bar"><span class="fill" style="width:${pct}%"></span></div><span class="meter-label">${tag} (${pct}%)</span></div>`;
    }).join('');
    document.getElementById('rMeter').innerHTML = triples;

    document.getElementById('rMind').innerHTML = info.remind.map(t=>`<div>${t}</div>`).join('');
    document.getElementById('result').hidden=false;
  }

  if (document.readyState!=='loading') render();
  else document.addEventListener('DOMContentLoaded', render);
})();