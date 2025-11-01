document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    {k:'A', q:'산책하거나 몸을 움직이면 기분이 확 풀린다.'},
    {k:'A', q:'새로운 활동에 참여하면 활력이 생긴다.'},
    {k:'E', q:'사람과 감정을 나눌 때 에너지가 충전된다.'},
    {k:'E', q:'감정 표현을 솔직히 하면 마음이 가벼워진다.'},
    {k:'S', q:'누군가와 함께 대화하거나 협업할 때 즐겁다.'},
    {k:'S', q:'혼자보다는 여럿이서 있을 때 더 편안하다.'},
    {k:'C', q:'조용한 카페나 방에서 혼자 있는 게 가장 회복된다.'},
    {k:'C', q:'하루 중 고요한 순간이 꼭 필요하다.'},
    {k:'F', q:'무언가에 몰입하면 시간 가는 줄 모른다.'},
    {k:'F', q:'집중해서 무언가를 끝냈을 때 에너지가 차오른다.'},
    {k:'I', q:'혼자 생각을 정리하는 시간이 충전의 시간이다.'},
    {k:'I', q:'감정보다 내면의 흐름을 관찰할 때 마음이 편해진다.'},
    {k:'D', q:'SNS, 유튜브 같은 디지털 활동으로 기분 전환한다.'},
    {k:'D', q:'좋아하는 음악·영상 콘텐츠가 나를 살린다.'},
    {k:'M', q:'에너지가 떨어지면 일단 조용히 쉬고 싶다.'}
  ];

  const score = {A:0, E:0, S:0, C:0, F:0, I:0, D:0, M:0};
  let idx=0;
  const ans=[];

  const stepLabel=document.getElementById('stepLabel');
  const barFill=document.getElementById('barFill');
  const qText=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const card=document.getElementById('card');
  const resultBox=document.getElementById('result');
  const prevBtn=document.getElementById('prev');
  const skipBtn=document.getElementById('skip');

  function render(){
    stepLabel.textContent=`${idx+1} / ${Q.length}`;
    barFill.style.width=`${(idx/Q.length)*100}%`;
    qText.textContent=Q[idx].q;
    wrap.innerHTML=`
      <button class="choice" data-s="4">매우 그렇다</button>
      <button class="choice" data-s="3">그렇다</button>
      <button class="choice" data-s="2">보통이다</button>
      <button class="choice ghost" data-s="1">아니다</button>
      <button class="choice ghost" data-s="0">전혀 아니다</button>`;
    const prevSel=ans[idx];
    if(prevSel!==undefined){
      Array.from(wrap.children).forEach(b=>{if(Number(b.dataset.s)===prevSel)b.classList.add('selected')});
    }
    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click',()=>{
        Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),200);
      });
    });
  }

  function choose(s){
    ans[idx]=s;
    score[Q[idx].k]+=s;
    next();
  }

  function next(){
    idx++;
    if(idx<Q.length) render();
    else finish();
  }

  prevBtn.addEventListener('click',()=>{
    if(idx===0)return;
    idx--;
    recalcTo(idx);
    render();
  });
  skipBtn.addEventListener('click',()=>{
    ans[idx]=0;
    next();
  });

  function recalcTo(end){
    for(const k in score) score[k]=0;
    for(let i=0;i<end;i++){
      const s=ans[i]??0;
      score[Q[i].k]+=s;
    }
  }

  function classify(sc){
    const sorted = Object.entries(sc).sort((a,b)=>b[1]-a[1]);
    return sorted[0][0]; // 최고점 유형 반환
  }

  const TYPES = {
    A:{
      title:'🔥 활동형 — 움직일수록 충전되는 사람',
      img:'../assets/energy.png',
      desc:`당신은 ‘정적인 쉼’보다 ‘행동하는 쉼’을 선호하는 사람입니다.  
      머리로만 생각하기보단 몸을 먼저 움직여야 에너지가 돌아오죠.  
      새로운 일, 여행, 사람, 경험이 곧 당신의 배터리입니다.  
      하루 종일 가만히 있을 때보다 짧게라도 ‘직접 체험’할 때 활력이 솟아요.  
      이 타입은 행동이 곧 회복의 과정이에요. 오늘의 충전 팁은 ‘생각 말고 발부터 움직이기!’입니다.`
    },
    E:{
      title:'☕ 감성형 — 마음의 교류로 충전되는 사람',
      img:'../assets/energy.png',
      desc:`당신은 감정의 흐름에 민감하고, 누군가와의 대화 속에서 회복됩니다.  
      마음이 힘들 때, 대화를 통해 감정을 나누면 마치 안개가 걷히듯 가벼워지죠.  
      진심 어린 공감, 따뜻한 위로, 작은 말 한마디가 당신의 배터리를 채워줍니다.  
      오늘의 충전 팁은 ‘혼자 버티지 말고, 따뜻한 대화를 나누는 것’.  
      감정이 당신의 힘이자 언어예요.`
    },
    S:{
      title:'📱 소통형 — 사람들과 연결될 때 빛나는 사람',
      img:'../assets/energy.png',
      desc:`사람 속에서 피어나는 활력이 당신의 에너지입니다.  
      웃음소리, 대화, 협업, 문자 한 줄에도 행복을 느끼죠.  
      관계의 온도를 느낄 때 가장 생생하게 살아있음을 느끼는 타입이에요.  
      다만, ‘지나친 연결’은 방전의 원인이 될 수 있으니 리듬을 조절하세요.  
      오늘의 충전 팁은 ‘너무 많은 소통보다 깊은 소통 하나’.`
    },
    C:{
      title:'🪴 고요형 — 조용함과 단순함 속에서 안정되는 사람',
      img:'../assets/energy.png',
      desc:`당신은 빠름보다 느림, 시끄러움보다 고요함을 사랑합니다.  
      복잡한 일상보단 단순하고 차분한 루틴 속에서 마음이 편안하죠.  
      작은 소음 대신 잔잔한 음악, 화려한 불빛보다 따뜻한 조명이 어울리는 사람입니다.  
      오늘의 충전 팁은 ‘하루에 단 10분이라도 완전한 정적을 선물하기’.  
      그 시간이 당신의 마음을 다시 평화로 채워줍니다.`
    },
    F:{
      title:'🎧 몰입형 — 무언가에 집중할 때 에너지가 차오르는 사람',
      img:'../assets/energy.png',
      desc:`당신은 집중의 세계에서 충전되는 사람입니다.  
      좋아하는 일, 공부, 예술, 취미에 깊게 빠질 때 마음이 맑아져요.  
      몰입은 당신에게 ‘회복’이자 ‘명상’입니다.  
      세상과 단절된 그 시간 속에서 오히려 자기 자신과 다시 만나게 됩니다.  
      오늘의 충전 팁은 ‘하루에 한 가지, 끝까지 해보기’.`
    },
    I:{
      title:'🌌 내면형 — 생각을 정리하며 재충전하는 사람',
      img:'../assets/energy.png',
      desc:`당신은 고요한 내면의 대화를 통해 회복하는 사람입니다.  
      혼자 있는 시간은 외로움이 아니라, 당신만의 ‘정화의 시간’이에요.  
      타인의 시선보다 자기 마음의 리듬을 따르는 사람이죠.  
      당신의 중심은 내면의 평온에서 시작됩니다.  
      오늘의 충전 팁은 ‘하루의 끝에 조용히 나에게 인사하기’.`
    }
  };

  function finish(){
    card.style.display='none';
    barFill.style.width='100%';

    const typeKey = classify(score);
    const t = TYPES[typeKey];
    const html = `
      <div class="result-card">
        <div class="result-hero">
          <img src="${t.img}" alt="${t.title}">
          <div>
            <div class="result-title">${t.title}</div>
          </div>
        </div>
        <div class="result-desc" style="white-space:pre-line;margin-top:8px;">${t.desc}</div>
        <div class="result-actions" style="margin-top:16px;">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
        <p class="note" style="margin-top:10px">* 자기보고식 경향 파악 도구이며, 임상 진단이 아닙니다.</p>
      </div>`;
    resultBox.innerHTML=html;
    resultBox.style.display='block';
  }

  render();
});