/* ===================================================
 * 자립 지수 체크 — 몽실몽실 v2025.2.4 (마음 리마인드, UI 개선)
 * ---------------------------------------------------
 * - 요약칩 제거
 * - 그래프 하단에 각 축별 설명 추가
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    {k:'R', q:'기상·취침 시간이 비교적 일정하다.'},
    {k:'R', q:'할 일/일정을 스스로 계획해 실행한다.'},
    {k:'R', q:'예산·지출을 기록하거나 관리한다.'},
    {k:'R', q:'작은 일도 마감 기한을 정해두면 잘 끝낸다.'},
    {k:'R', q:'정리정돈과 환경 정비를 자주 한다.'},
    {k:'D', q:'중요한 일의 최종 결정은 스스로 내리는 편이다.'},
    {k:'D', q:'원치 않는 부탁은 정중히 거절할 수 있다.'},
    {k:'D', q:'선호/가치를 분명히 알고 선택에 반영한다.'},
    {k:'D', q:'타인의 비판에도 내 기준을 쉽게 놓지 않는다.'},
    {k:'D', q:'정보를 모으고 비교해 합리적 결정을 내린다.'},
    {k:'E', q:'스트레스를 느껴도 호흡/휴식으로 진정시킨다.'},
    {k:'E', q:'감정이 격해져도 말투·행동을 조절하려 노력한다.'},
    {k:'E', q:'실수/실패를 오래 끌지 않고 학습으로 전환한다.'},
    {k:'E', q:'불안할 때 도움 요청이나 상담을 시도할 수 있다.'},
    {k:'E', q:'몸 컨디션(수면/식사/운동)으로 마음을 관리한다.'},
  ];

  let idx = 0, t0 = Date.now();
  const score={R:0,D:0,E:0}, count={R:0,D:0,E:0}, ans=[], times=[];
  const step=document.getElementById('stepLabel');
  const bar=document.getElementById('barFill');
  const qTxt=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const card=document.getElementById('card');
  const box=document.getElementById('result');
  const prev=document.getElementById('prev');
  const skip=document.getElementById('skip');

  const weight=sec=>sec<1?0.9:sec<4?1.0:sec<8?1.15:1.10;

  function render(){
    step.textContent=`${idx+1} / ${Q.length}`;
    bar.style.width=`${(idx/Q.length)*100}%`;
    qTxt.textContent=Q[idx].q;
    wrap.innerHTML=`
      <button class="choice" data-s="4">매우 그렇다</button>
      <button class="choice" data-s="3">그렇다</button>
      <button class="choice" data-s="2">보통이다</button>
      <button class="choice ghost" data-s="1">아니다</button>
      <button class="choice ghost" data-s="0">전혀 아니다</button>`;
    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click',()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      });
    });
    t0=Date.now();
  }

  function choose(s){
    const sec=(Date.now()-t0)/1000, w=weight(sec);
    const adj=s+(s*(w-1)*0.2);
    const k=Q[idx].k;
    score[k]+=adj; count[k]+=1;
    ans[idx]=s; times[idx]=sec;
    next();
  }
  const next=()=>{idx++; (idx<Q.length)?render():finish();};
  prev?.addEventListener('click',()=>{if(idx>0){idx--;recalc(idx);render();}});
  skip?.addEventListener('click',()=>{ans[idx]=0;times[idx]=(Date.now()-t0)/1000;next();});
  const recalc=end=>{
    score.R=score.D=score.E=0; count.R=count.D=count.E=0;
    for(let i=0;i<end;i++){
      const s=ans[i]??0,k=Q[i].k,sec=times[i]??3,w=weight(sec);
      const adj=s+(s*(w-1)*0.2); score[k]+=adj; count[k]+=1;
    }
  };

  const clamp=v=>Math.max(0,Math.min(1,v));
  const normalized=()=>({
    R:clamp((score.R/Math.max(1,count.R))/4),
    D:clamp((score.D/Math.max(1,count.D))/4),
    E:clamp((score.E/Math.max(1,count.E))/4)
  });

  function tieBreak(k1,k2){
    let bias=0;
    for(let i=Q.length-1;i>=Q.length-3;i--){
      const s=ans[i]??0,sec=times[i]??3,w=weight(sec),ax=Q[i].k;
      const mag=(s>=3?1:(s===2?0.3:0.1));
      if(ax===k1) bias+=1*w*mag;
      if(ax===k2) bias-=1*w*mag;
    }
    return bias>=0?k1:k2;
  }

  function classify(){
    const n=normalized();
    const arr=Object.entries(n).sort((a,b)=>b[1]-a[1]);
    let [k1,v1]=arr[0],[k2,v2]=arr[1],[,v3]=arr[2];
    const diff=v1-v2,spread=v1-v3;
    const inMid=x=>x>=0.35&&x<=0.65;
    if(spread<0.12&&inMid(n.R)&&inMid(n.D)&&inMid(n.E))return{type:'BALANCE',n};
    if(diff<0.1){const w=tieBreak(k1,k2);if(w!==k1)[k1,k2]=[k2,k1];}
    if(Math.abs(v1-v2)<0.1){
      const p=[k1,k2].sort().join('');
      const map={DR:'ROUTINE-DECIDER',ER:'ROUTINE-CALMER',DE:'DECIDER-CALMER'};
      return{type:map[p]||'ROUTINE-DECIDER',n};
    }
    return{type:{R:'ROUTINE',D:'DECIDER',E:'CALMER'}[k1],n};
  }

  const COPY={
    ROUTINE:{title:'🗓️ 루틴몽실형',quote:'“작은 루틴이 큰 평온을 만든다.”',
      desc:'규칙과 정리가 힘이 되는 타입이에요. 일정한 리듬이 잡히면 컨디션이 안정되고 일의 마감도 자연스럽게 붙습니다.',
      remind:['오늘 루틴 1개만 완주','완벽은 금지, 80% 완료면 칭찬']},
    DECIDER:{title:'🧭 결정몽실형',quote:'“YES/NO 대신, 내 기준 한 줄.”',
      desc:'정보와 가치를 비교해 방향을 잡는 힘이 커요. 방향이 정리되면 실행이 빨라지고 흔들림이 적습니다.',
      remind:['선택 전 기준 1줄 적기','거절 문장 1개 미리 준비']},
    CALMER:{title:'🌿 평온몽실형',quote:'“감정은 없애는 게 아니라 다루는 것.”',
      desc:'호흡·걷기·수면으로 회복 탄력이 좋습니다. 속도를 낮추면 사고가 선명해지고 대화도 부드러워집니다.',
      remind:['4-6 호흡 3회 + 물 한 컵','화면 밝기·알림 10분 줄이기']},
    'ROUTINE-DECIDER':{title:'🔧 루틴·결정 하이브리드',quote:'“정리하고, 정하고, 실행!”',
      desc:'루틴의 안정감과 결단의 선명함을 함께 쓰는 조합이에요. 체크리스트를 짧게 하면 실행력이 오릅니다.',
      remind:['중요·짧음·지금 3개만 체크','마감 전 10분 리뷰']},
    'ROUTINE-CALMER':{title:'🌤️ 루틴·평온 하이브리드',quote:'“잔잔하지만 꾸준하게.”',
      desc:'가벼운 반복으로 평온을 키우는 조합이에요. 난도를 낮춰도 꾸준하면 목표는 붙습니다.',
      remind:['루틴 난도 80%로','성공 경험 먼저 쌓기']},
    'DECIDER-CALMER':{title:'🫶 결정·평온 하이브리드',quote:'“내 속도, 내 선택.”',
      desc:'상황을 가라앉혀 본 뒤 선택하는 스타일이에요. 회복을 고려한 결정으로 후회가 적고 지속력이 생깁니다.',
      remind:['선택 전 30초 멈춤','핵심 3문장 프레이밍']},
    BALANCE:{title:'☁️ 균형몽실형 (레어)',quote:'“균형은 작은 습관의 합.”',
      desc:'세 축이 고르게 발달해 상황 조절이 유연해요. 조급함만 줄이면 장기 목표에 강합니다.',
      remind:['분기별 업데이트 데이 — 세 축 점검']}
  };

  const AXIS_TAG={
    R:'루틴 — 일정과 생활 패턴 관리 능력',
    D:'결정 — 선택의 명확성과 주체성',
    E:'평온 — 감정 조절과 회복 탄력성'
  };

  function meters(n){
    const items=[
      {k:'R',name:'루틴',val:Math.round(n.R*100)},
      {k:'D',name:'결정',val:Math.round(n.D*100)},
      {k:'E',name:'평온',val:Math.round(n.E*100)}
    ];
    return `
      <div class="state-meter">
        ${items.map(it=>`
          <div class="row">
            <span><b>${it.name}</b></span>
            <div class="bar"><span class="fill" style="width:${it.val}%"></span></div>
            <span class="meter-label">${it.val}%</span>
          </div>
          <p class="axis-desc">${AXIS_TAG[it.k]}</p>
        `).join('')}
      </div>`;
  }

  function finish(){
    card.style.display='none'; bar.style.width='100%';
    const {type,n}=classify(), info=COPY[type];
    const remindList=info.remind.map(r=>`<li>${r}</li>`).join('');
    box.innerHTML=`
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/independence.png" alt="자립 캐릭터" onerror="this.style.display='none'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>
        <p style="margin:8px 0">${info.desc}</p>
        <div class="mind-remind tidy">
          <b>🌿 마음 리마인드</b>
          <ul>${remindList}</ul>
        </div>
        ${meters(n)}
        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>`;
    box.style.display='block';
  }

  render();
});