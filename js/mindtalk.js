/* ===================================================
 * 마인드톡(한마디) — 몽실몽실 v2025.3 (자연 서술 + 마음 리마인드 개선)
 * ---------------------------------------------------
 * - 12문항 / 5지선다(0~4) + 응답시간 가중(±20%, 선택 우선)
 * - 축: 안도(RELIEF) / 동기(MOTIV) / 연결(CONNECT)
 * - 중립 편중 방지: 상위2축만 반영 + 최근3문항 타이브레이커
 * - 결과: 제목/인용문/설명/감정상태 요약/마음 리마인드/시각요소/버튼
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // [수정-추가] 질문 레이아웃 V2 적용 + 카테고리(동물=fun) 지정
  document.body.classList.add('layout-v2');
  document.body.setAttribute('data-theme','fun');

  const Q = [

    {k:'RELIEF', q:'요즘 “괜찮다”라는 말을 스스로에게 잘 건넬 수 있다.'},
    {k:'RELIEF', q:'잠시 멈추고 숨 고르면 마음이 풀리는 편이다.'},
    {k:'RELIEF', q:'실수해도 스스로를 과하게 비난하지 않는다.'},
    {k:'MOTIV',  q:'작게라도 오늘 시작할 수 있는 일이 떠오른다.'},
    {k:'MOTIV',  q:'해야 할 일을 “작은 단위”로 쪼개는 편이다.'},
    {k:'MOTIV',  q:'완벽보다는 진행을 택할 때가 많다.'},
    {k:'CONNECT',q:'힘들 땐 주변 사람에게 도움을 청할 수 있다.'},
    {k:'CONNECT',q:'하루에 한 번이라도 진심 어린 문장을 건넨다.'},
    {k:'CONNECT',q:'관계의 온도를 유지하려 작게라도 노력한다.'},
    {k:'RELIEF', q:'“지금 이만큼이면 충분해”라는 마음을 기억한다.'},
    {k:'MOTIV',  q:'시작을 위한 준비동작(5분 정리/호흡)을 사용한다.'},
    {k:'CONNECT',q:'내 마음을 한 문장으로 설명해보려 한다.'}
  ];

  let idx=0, startTime=Date.now();
  const score={RELIEF:0,MOTIV:0,CONNECT:0}, count={RELIEF:0,MOTIV:0,CONNECT:0};
  const ans=[], times=[], recent=[];

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
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;
    const prevSel=ans[idx];
    if(prevSel!==undefined){
      [...wrap.children].forEach(b=>{ if(Number(b.dataset.s)===prevSel) b.classList.add('selected');});
    }
    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click',()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      });
    });
    startTime=Date.now();
  }

  function getWeight(sec){
    if(sec<1) return 0.9;
    if(sec<4) return 1.0;
    if(sec<8) return 1.15;
    return 1.1;
  }

  function choose(s){
    const elapsed=(Date.now()-startTime)/1000;
    const k=Q[idx].k, w=getWeight(elapsed);
    const adjusted=s + (s*(w-1)*0.2);
    score[k]+=adjusted; count[k]+=1;
    ans[idx]=s; times[idx]=elapsed;
    recent.push({i:idx,k,s,sec:elapsed});
    if(recent.length>3) recent.shift();
    next();
  }

  function next(){
    idx++;
    if(idx<Q.length) render();
    else finish();
  }

  prevBtn?.addEventListener('click',()=>{
    if(idx===0) return;
    idx--;
    recalc(idx);
    render();
  });

  skipBtn?.addEventListener('click',()=>{
    ans[idx]=0; times[idx]=(Date.now()-startTime)/1000;
    next();
  });

  function recalc(end){
    score.RELIEF=score.MOTIV=score.CONNECT=0;
    count.RELIEF=count.MOTIV=count.CONNECT=0;
    for(let i=0;i<end;i++){
      const s=ans[i]??0; const k=Q[i].k; const w=getWeight(times[i]??0);
      const adjusted=s + (s*(w-1)*0.2);
      score[k]+=adjusted; count[k]+=1;
    }
  }

  function norm(){
    return {
      RELIEF:(score.RELIEF/Math.max(1,count.RELIEF))/4,
      MOTIV:(score.MOTIV/Math.max(1,count.MOTIV))/4,
      CONNECT:(score.CONNECT/Math.max(1,count.CONNECT))/4
    };
  }

  function tieBreak(topA, topB){
    let d=0;
    recent.forEach(r=>{
      const w=getWeight(r.sec);
      if(r.k===topA) d+=1*w;
      if(r.k===topB) d-=1*w;
    });
    return d>=0 ? topA : topB;
  }

  function classify(){
    const n=norm();
    const arr=Object.entries(n).sort((a,b)=>b[1]-a[1]);
    const [k1,v1]=arr[0], [k2,v2]=arr[1], diff=v1-v2;
    const main = (diff<0.08) ? tieBreak(k1,k2) : k1;

    if(main==='RELIEF') return '안도형';
    if(main==='MOTIV')  return '동기형';
    if(main==='CONNECT')return '연결형';
    return '안도형';
  }

  function label(p){
    if(p>=0.8) return '매우 풍족';
    if(p>=0.6) return '풍족';
    if(p>=0.4) return '보통';
    if(p>=0.2) return '부족';
    return '매우 부족';
  }

  function meters(n){
    const items=[
      {k:'RELIEF', name:'안도', val:n.RELIEF},
      {k:'MOTIV',  name:'동기', val:n.MOTIV},
      {k:'CONNECT',name:'연결', val:n.CONNECT}
    ];
    return items.map(it=>{
      const pct=Math.round(Math.max(0,Math.min(1,it.val))*100);
      return `
        <div style="margin:6px 0">
          <div style="display:flex;justify-content:space-between;font-weight:700">
            <span>${it.name} — ${label(pct/100)}</span>
            <span style="color:var(--text-soft)">${pct}%</span>
          </div>
          <div style="height:8px;background:var(--mint-200);border-radius:999px;overflow:hidden">
            <span style="display:block;height:100%;width:${pct}%;background:var(--mint-500)"></span>
          </div>
        </div>
      `;
    }).join('');
  }

  /* --- 자연스럽게 다듬은 결과 서술 --- */
  const COPY={
    '안도형':{
      title:'☁️ 안도형 한마디',
      quote:'“지금 이만큼이면 충분해요.”',
      desc:'마음을 다독이는 힘이 큰 타입이에요. 스스로를 인정할 때, 그 여유가 다시 추진력이 됩니다. 오늘은 천천히 숨 고르며 자신을 격려해보세요.',
      mood:['긴장 — 느슨해짐','호흡 — 안정','속도 — 천천히'],
      remindList:[
        '호흡 4-6, 세 번',
        '따뜻한 물 한 컵',
        '해야 할 일 1개만 적기'
      ]
    },
    '동기형':{
      title:'🔆 동기형 한마디',
      quote:'“지금, 작게라도 시작해요.”',
      desc:'작은 움직임에서 에너지를 얻는 타입이에요. 완벽보다 시도를 우선하면 흐름이 생깁니다. 오늘은 “딱 10분만”의 용기가 충분해요.',
      mood:['의욕 — 점화','단위 — 작게','연속 — 유지'],
      remindList:[
        '2분 정리 후 스타트',
        '타이머 10분',
        '끝나면 칭찬 한 줄'
      ]
    },
    '연결형':{
      title:'🤝 연결형 한마디',
      quote:'“따뜻한 한 줄이 누군가의 오늘을 살려요.”',
      desc:'관계의 온기가 나를 살리고, 나의 다정함이 타인을 살립니다. 작은 인사나 한 줄의 메시지가 오늘 하루의 공기를 부드럽게 바꿔줄 거예요.',
      mood:['관계 — 온기','언어 — 다정','리듬 — 잔잔'],
      remindList:[
        '안부 메시지 한 줄',
        '감사 1가지 적기',
        '대화 5분만 듣기'
      ]
    }
  };

  function makeLine(type){
    if(type==='안도형')   return '당신의 마음은 이미 충분히 괜찮아요.';
    if(type==='동기형')   return '작은 시도가 곧 흐름이 됩니다.';
    if(type==='연결형')   return '당신의 다정함이 오늘을 따뜻하게 만듭니다.';
    return '지금의 나에게 다정함을 허락해요.';
  }

  function finish(){
    card.style.display='none';
    barFill.style.width='100%';

    const type=classify();
    const n=norm();
    const info=COPY[type];
    const moodSummary=`• ${info.mood.join('  • ')}`;
    const oneLine=makeLine(type);

    resultBox.innerHTML=`
      <div class="result-card mind">
        <div class="result-hero">
          <img src="../assets/mindtalk.png" alt="마인드톡" onerror="this.src='../assets/mongsil.png'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">“${oneLine}”</div>
          </div>
        </div>

        <p style="margin:8px 0; line-height:1.7;">${info.desc}</p>

        <div class="pill" style="margin:8px 0 2px">${moodSummary}</div>

        <div class="mind-remind" style="margin:6px 0 10px;color:var(--text-soft);line-height:1.6;">
          <b>🌿 마음 리마인드:</b>
          ${info.remindList.map(t=>`<div class="pill" style="margin:4px 6px 0 0;display:inline-block">${t}</div>`).join('')}
        </div>

        <div style="margin-top:8px">${meters(n)}</div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;
    resultBox.style.display='block';
  }

  render();
});
