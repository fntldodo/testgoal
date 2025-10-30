document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    {k:'E', q:'감정이 풍부하다는 말을 자주 듣는다.'},
    {k:'E', q:'타인의 기분이 쉽게 전염된다.'},
    {k:'E', q:'결정할 때 마음의 소리를 따른다.'},
    {k:'E', q:'감정 표현을 솔직하게 하는 편이다.'},
    {k:'E', q:'감정 기복이 비교적 큰 편이다.'},
    {k:'L', q:'논리적으로 설득하는 편이다.'},
    {k:'L', q:'감정보다는 원인을 분석하려 한다.'},
    {k:'L', q:'논리적 근거가 없는 이야기는 불편하다.'},
    {k:'L', q:'문제 해결 시 계획부터 세운다.'},
    {k:'L', q:'감정보다 효율이 우선이다.'},
    {k:'B', q:'감정과 이성을 균형 있게 쓰려 노력한다.'},
    {k:'B', q:'상황에 따라 마음과 논리를 조율한다.'},
    {k:'B', q:'갈등 시 중간 입장에서 조정하는 편이다.'},
    {k:'B', q:'공감과 판단을 동시에 고려한다.'},
    {k:'B', q:'감정과 논리 모두 중요하다고 생각한다.'}
  ];

  let idx = 0;
  const score = {E:0, L:0, B:0};
  const ans = [];

  const stepLabel = document.getElementById('stepLabel');
  const barFill = document.getElementById('barFill');
  const qText = document.getElementById('qText');
  const wrap = document.getElementById('choiceWrap');
  const card = document.getElementById('card');
  const resultBox = document.getElementById('result');

  function render() {
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width = `${(idx/Q.length)*100}%`;
    qText.textContent = Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="3">매우 그렇다</button>
      <button class="choice" data-s="2">그렇다</button>
      <button class="choice ghost" data-s="1">아니다</button>
      <button class="choice ghost" data-s="0">전혀 아니다</button>`;

    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),200);
      });
    });
  }

  function choose(s){
    ans[idx] = s;
    score[Q[idx].k] += s;
    next();
  }

  function next(){
    idx++;
    if(idx < Q.length) render();
    else finish();
  }

  function recalcTo(end){
    score.E=score.L=score.B=0;
    for(let i=0;i<end;i++){
      const v = ans[i] ?? 0;
      score[Q[i].k]+=v;
    }
  }

  document.getElementById('prev').addEventListener('click',()=>{
    if(idx===0) return;
    idx--;
    recalcTo(idx);
    render();
  });
  document.getElementById('skip').addEventListener('click',()=>{
    ans[idx]=0;
    next();
  });

  function classify(sc){
    const e=sc.E,l=sc.L,b=sc.B;
    const max=Math.max(e,l,b);
    const spread=max-Math.min(e,l,b);
    if(spread<=3) return 'BALANCE';
    if(max===e) return 'EMOTION';
    if(max===l) return 'LOGIC';
    if(max===b) return 'HARMONY';
  }

  const PLANTS={
    EMOTION:{ 
      title:'🌹 장미형', 
      desc:'감정이 풍부하고 따뜻한 사람. 사랑과 공감의 향기를 퍼뜨리는 타입.', 
      reason:'장미는 풍부한 감정과 따뜻한 정서를 상징해요. 감정의 온도가 높은 사람일수록 주변을 따뜻하게 물들입니다.',
      img:'../assets/plants/rose.png'
    },
    LOGIC:{
      title:'🌵 선인장형',
      desc:'논리적이고 자립적인 사고형. 외로움 속에서도 스스로 서는 힘이 강한 사람.',
      reason:'선인장은 메마른 환경에서도 논리적으로 생존하는 식물이에요. 이성적인 사고로 감정보다 구조를 중시합니다.',
      img:'../assets/plants/cactus.png'
    },
    HARMONY:{
      title:'🌿 고사리형',
      desc:'감정과 논리를 유연하게 넘나드는 조화로운 사람.',
      reason:'고사리는 그늘에서도 푸르름을 잃지 않아요. 균형 잡힌 사고와 부드러운 조율의 상징이에요.',
      img:'../assets/plants/fern.png'
    },
    BALANCE:{
      title:'🎋 대나무형',
      desc:'안정과 균형을 중시하는 중심 잡힌 사람.',
      reason:'대나무는 유연하지만 쉽게 부러지지 않아요. 감정과 논리를 고르게 다루는 부드러운 강인함을 가졌습니다.',
      img:'../assets/plants/bamboo.png'
    },
    EMO_STRONG:{
      title:'🌼 민들레형',
      desc:'감정에 진심인 사람. 어디서든 다시 피어나는 회복력.',
      reason:'민들레는 작은 바람에도 피어나는 생명력의 상징이에요. 공감과 희망이 강한 사람에게 어울립니다.',
      img:'../assets/plants/dandelion.png'
    },
    LOGI_STRONG:{
      title:'🌲 소나무형',
      desc:'원칙과 신념이 확고한 사람. 꾸준하고 신뢰할 수 있는 유형.',
      reason:'소나무는 사계절 변함없는 상록의 상징이에요. 논리와 원칙을 지키며 꾸준히 나아가는 성향입니다.',
      img:'../assets/plants/pine.png'
    }
  };

  function finish(){
    card.style.display='none';
    barFill.style.width='100%';

    const type = classify(score);
    let final = type;
    // 세부 분화 (감정 강하면 장미/민들레, 논리 강하면 선인장/소나무)
    if(type==='EMOTION') final = score.E>30 ? 'EMO_STRONG' : 'EMOTION';
    if(type==='LOGIC') final = score.L>30 ? 'LOGI_STRONG' : 'LOGIC';

    const c = PLANTS[final];
    const html = `
      <div class="result-card">
        <div class="result-hero">
          <img src="${c.img}" alt="${c.title}">
          <div>
            <div class="result-title">${c.title}</div>
          <div class="result-desc">${c.desc}</div>
          </div>
        </div>
        <p style="margin:8px 0">${c.reason}</p>
        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>`;
    resultBox.innerHTML = html;
    resultBox.style.display='block';
  }

  render();
});
