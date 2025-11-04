/* ===================================================
 * 🌿 마인드톡 v2025.2 — 마음 리마인드 버전
 * 규칙:
 *  - 12문항 / 5지선다(0~4: 전혀/아니다/보통/그렇다/매우 그렇다)
 *  - 응답시간 보조 ±20%(선택 우선, 뒤엎지 않음)
 *  - 축 4개: M(동기/의욕), R(관계/교류), P(방향/진로감), C(자기돌봄)
 *  - 분류: 단일형(뚜렷) + 상위 2축 하이브리드(접전) → 6~8유형
 *  - 결과 섹션: 제목/인용문/설명/감정상태 요약(2줄)/마음 리마인드/상태 미터/버튼
 *  - 숫자 단독 노출 금지(라벨 중심, %는 보조)
 * =================================================== */

document.addEventListener('DOMContentLoaded', ()=>{

  const Q = [
    // M(동기)
    {k:'M', q:'지금은 “바로 시작”이 비교적 수월하다.'},
    {k:'M', q:'작은 성공이 금방 의욕으로 이어진다.'},
    {k:'M', q:'해야 할 일의 첫 단계를 떠올리면 금방 그릴 수 있다.'},
    // R(관계)
    {k:'R', q:'마음을 나눌 상대가 떠오르고 연락이 당기기도 한다.'},
    {k:'R', q:'대화·소통이 에너지를 주는 느낌이다.'},
    {k:'R', q:'부드러운 톤으로 내 생각을 전할 수 있다.'},
    // P(방향/진로)
    {k:'P', q:'지금 중요한 우선순위를 비교적 선명하게 알고 있다.'},
    {k:'P', q:'결정이 필요하면 기준을 세워 선택할 수 있다.'},
    {k:'P', q:'장기 목표보다 오늘의 한 걸음이 뚜렷하다.'},
    // C(자기돌봄)
    {k:'C', q:'수면·식사·호흡 같은 기본 케어를 챙길 수 있다.'},
    {k:'C', q:'과부하 신호를 눈치채면 속도를 낮출 수 있다.'},
    {k:'C', q:'나에게 다정한 말 한마디를 건네는 편이다.'},
  ];

  // 상태
  let idx=0, start=Date.now();
  const ans=[], times=[];
  const score={M:0,R:0,P:0,C:0}, cnt={M:0,R:0,P:0,C:0};

  // DOM
  const step=document.getElementById('stepLabel');
  const bar=document.getElementById('barFill');
  const qText=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const card=document.getElementById('card');
  const result=document.getElementById('result');
  const prev=document.getElementById('prev');
  const skip=document.getElementById('skip');

  /* ---------------- 공통 가중치 ---------------- */
  function weight(sec){
    if(sec<1) return 0.9;
    if(sec<4) return 1.0;
    if(sec<8) return 1.15;
    return 1.10;
  }

  /* ---------------- 렌더링 ---------------- */
  function render(){
    step.textContent=`${idx+1} / ${Q.length}`;
    bar.style.width=`${(idx/Q.length)*100}%`;
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
      btn.addEventListener('click', ()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),160);
      });
    });

    start=Date.now();
  }

  function choose(s){
    const sec=(Date.now()-start)/1000;
    const w=weight(sec);
    ans[idx]=s; times[idx]=sec;

    const k=Q[idx].k;
    const adjusted = s + (s*(w-1)*0.2); // ±20% 보조(선택 우선)
    score[k]+=adjusted; cnt[k]+=1;

    next();
  }
  function next(){ idx++; if(idx<Q.length) render(); else finish(); }

  prev?.addEventListener('click', ()=>{
    if(idx===0) return;
    idx--;
    recalc(idx);
    render();
  });

  skip?.addEventListener('click', ()=>{
    ans[idx]=0; times[idx]=(Date.now()-start)/1000;
    next();
  });

  function recalc(end){
    score.M=score.R=score.P=score.C=0;
    cnt.M=cnt.R=cnt.P=cnt.C=0;
    for(let i=0;i<end;i++){
      const s=ans[i]??0; const t=times[i]??3; const k=Q[i].k;
      const w=weight(t);
      const adjusted = s + (s*(w-1)*0.2);
      score[k]+=adjusted; cnt[k]+=1;
    }
  }

  /* ---------------- 분류 & tie-break ---------------- */
  // 정규화(축별 평균 0~1)
  function normed(){
    return {
      M: clamp((score.M/Math.max(1,cnt.M))/4,0,1),
      R: clamp((score.R/Math.max(1,cnt.R))/4,0,1),
      P: clamp((score.P/Math.max(1,cnt.P))/4,0,1),
      C: clamp((score.C/Math.max(1,cnt.C))/4,0,1),
    };
  }
  function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }

  function classify(){
    const n=normed();
    const arr=Object.entries(n).sort((a,b)=>b[1]-a[1]);
    let [k1,v1]=arr[0], [k2,v2]=arr[1], [k3,v3]=arr[2], [k4,v4]=arr[3];

    const diff12=v1-v2, spread=v1-v4;
    const allMid=(x)=>x>=0.35 && x<=0.65;

    // 진정한 균형(희귀) — 네 축 모두 중간대역 + 전체 스프레드 작음
    if(spread<0.15 && [n.M,n.R,n.P,n.C].every(allMid)){
      return {type:'BALANCE', top:[k1,k2], n};
    }

    // tie-break (접전): 최근 3문항 + 시간 보조
    if(diff12<0.08){
      const last3=Math.max(0,Q.length-3);
      let delta=0;
      for(let i=last3;i<Q.length;i++){
        const k=Q[i].k;
        const s=ans[i]??0;
        const w=weight(times[i]??3);
        const adj=s + (s*(w-1)*0.2);
        if(k===k1) delta+=adj;
        else if(k===k2) delta-=adj;
      }
      if(delta<0){ const tmp=k1; k1=k2; k2=tmp; }
    }

    // 단일형 임계
    if((v1-v2)>=0.12){
      return {type:singleMap[k1], top:[k1,k2], n};
    }
    // 하이브리드(상위 2축)
    const pair=[k1,k2].sort().join('');
    return {type:hybridMap[pair], top:[k1,k2], n};
  }

  const singleMap = { M:'SPARK', R:'BRIDGE', P:'COMPASS', C:'COZY' };
  const hybridMap = {
    MC:'SPARK-COZY', MR:'SPARK-BRIDGE', MP:'SPARK-COMPASS',
    RC:'BRIDGE-COZY', RP:'BRIDGE-COMPASS', CP:'COZY-COMPASS'
  };

  /* ---------------- 카피 & 빌더 ---------------- */
  const COPY = {
    SPARK: {
      title:'✨ 스파크(동기)형', quote:'“작게 시작하면 불꽃은 금방 붙는다.”',
      desc:'의욕을 불러오는 점화력이 장점. 첫 단추만 끼우면 빠르게 온도가 오른다.',
      mood:['동기 — 높음','관계 — 보통','방향 — 적정','돌봄 — 적정'],
      remind:['첫 단추 3분만','작게 성공하고 칭찬 한 줄','잠깐의 걸음으로 기세 연결'],
    },
    BRIDGE: {
      title:'🤝 브리지(관계)형', quote:'“마음은 나누면 가벼워진다.”',
      desc:'따뜻한 교류로 에너지가 도는 타입. 대화의 체온을 잘 맞춘다.',
      mood:['동기 — 적정','관계 — 높음','방향 — 보통','돌봄 — 적정'],
      remind:['안부 한 줄 보내기','고마운 점 1가지 말하기','대화 전 컨디션 체크'],
    },
    COMPASS: {
      title:'🧭 컴퍼스(방향)형', quote:'“기준 한 줄이 길을 만든다.”',
      desc:'우선순위와 기준을 세워 흔들림을 줄인다.',
      mood:['동기 — 보통','관계 — 적정','방향 — 높음','돌봄 — 적정'],
      remind:['기준 1줄 작성','해야/하고싶다 구분','오늘 한 걸음만'],
    },
    COZY: {
      title:'🫧 코지(돌봄)형', quote:'“낮춘 속도가, 멀리 가게 한다.”',
      desc:'자기돌봄과 회복에 강점. 과부하 인지 후 회복 루틴을 켠다.',
      mood:['동기 — 적정','관계 — 보통','방향 — 적정','돌봄 — 높음'],
      remind:['호흡 4·6·4','미지근한 물 한 잔','스크린 10분 덜 보기'],
    },
    'SPARK-COZY': {
      title:'🌤 스파크·코지', quote:'“부드럽게 점화.”',
      desc:'작게 켜고, 무리 없이 이어가는 리듬.',
      mood:['동기 — 높음','돌봄 — 높음','관계/방향 — 적정'],
      remind:['3분 시작 → 1분 휴식','완벽 말고 반복','작은 칭찬 메모'],
    },
    'SPARK-BRIDGE': {
      title:'🎈 스파크·브리지', quote:'“함께 시작하면 더 가볍다.”',
      desc:'표현+교류로 에너지가 상승.',
      mood:['동기/관계 — 높음','방향/돌봄 — 적정'],
      remind:['짝과 공동시작','짧은 피드백 루프','성공 공유'],
    },
    'SPARK-COMPASS': {
      title:'🚀 스파크·컴퍼스', quote:'“기준이 점화의 연료.”',
      desc:'명확한 기준으로 실행이 빠르다.',
      mood:['동기/방향 — 높음','관계/돌봄 — 적정'],
      remind:['기준 1줄 → 10분 착수','방해 요소 1개 차단','작업 끝나면 한 줄 회고'],
    },
    'BRIDGE-COZY': {
      title:'☁️ 브리지·코지', quote:'“따뜻함으로 속도를 맞춘다.”',
      desc:'교류와 돌봄의 균형으로 안정감을 만든다.',
      mood:['관계/돌봄 — 높음','동기/방향 — 적정'],
      remind:['긴 대화 전 컨디션 합의','연락 리듬 가볍게 고정','쉼표 알림'],
    },