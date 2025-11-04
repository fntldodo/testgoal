/* ===================================================
 * 🔤 MBTI 12문항 — v2025.2 마음 리마인드 버전 (FIX)
 * - 5지선다(0~4), 응답시간 보조 ±20%(선택 우선)
 * - 4축 쌍(E/I, S/N, T/F, J/P)에서 큰 쪽 1글자만 선택 → 대문자 4글자
 * - 점수 숫자 직접 노출 금지 (상태 라벨만)
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 각 문항은 어떤 축에 어느 쪽을 밀어주는지 지정(a: 축의 한쪽 키)
  const Q = [
    {axis:'EI', a:'E', q:'사람 많은 자리에서 에너지가 오른다.'},
    {axis:'EI', a:'I', q:'혼자만의 시간이 꼭 필요하다.'},
    {axis:'EI', a:'E', q:'처음 본 사람에게 먼저 말을 거는 편이다.'},

    {axis:'SN', a:'S', q:'사실·경험이 중요하다. 추상은 답답하다.'},
    {axis:'SN', a:'N', q:'가능성과 아이디어를 이야기하는 게 즐겁다.'},
    {axis:'SN', a:'S', q:'새 개념은 구체적 예시가 있을 때 이해가 쉽다.'},

    {axis:'TF', a:'T', q:'의사결정에서 논리/정확성이 우선이다.'},
    {axis:'TF', a:'F', q:'사람들의 감정과 관계 영향을 먼저 본다.'},
    {axis:'TF', a:'T', q:'논리적 모순을 보면 바로 잡고 싶다.'},

    {axis:'JP', a:'J', q:'계획표/마감이 있어야 마음이 편하다.'},
    {axis:'JP', a:'P', q:'상황 따라 즉흥적으로 움직이는 편이다.'},
    {axis:'JP', a:'J', q:'할 일을 미리 정리하고 진행한다.'}
  ];

  // 상태
  let idx=0, start=Date.now();
  const ans=[], times=[];
  // 8글자 축 점수(각 쪽에 누적) — 상태라벨만 쓰므로 내부 누적값은 숫자지만 노출하지 않음
  const S = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
  const step = document.getElementById('stepLabel');
  const bar  = document.getElementById('barFill');
  const qTxt = document.getElementById('qText');
  const wrap = document.getElementById('choiceWrap');
  const card = document.getElementById('card');
  const result = document.getElementById('result');
  const prev = document.getElementById('prev');
  const skip = document.getElementById('skip');

  function weight(sec){
    if(sec < 1) return 0.9;       // 너무 빠름 → -10%
    if(sec < 4) return 1.0;       // 정상
    if(sec < 8) return 1.15;      // 숙고 +
    return 1.10;                   // 과숙고 약 +
  }

  function render(){
    step.textContent = `${idx+1} / ${Q.length}`;
    bar.style.width  = `${(idx/Q.length)*100}%`;
    qTxt.textContent = Q[idx].q;
    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;
    const prevSel = ans[idx];
    if(prevSel !== undefined){
      [...wrap.children].forEach(b => { if(Number(b.dataset.s)===prevSel) b.classList.add('selected'); });
    }
    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click', ()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      });
    });
    start = Date.now();
  }

  function choose(s){
    const sec = (Date.now()-start)/1000;
    const w   = weight(sec);
    const adj = s + (s * (w - 1) * 0.2);  // ±20% 캡 (선택 우선)
    ans[idx]  = s; times[idx] = sec;

    const side = Q[idx].a;    // 예: 'E'
    S[side] += adj;

    next();
  }

  function next(){
    idx++;
    if(idx < Q.length) render();
    else finish();
  }

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
    // 초기화
    S.E=S.I=S.S=S.N=S.T=S.F=S.J=S.P=0;
    for(let i=0;i<end;i++){
      const sec = times[i] ?? 3;
      const w   = weight(sec);
      const s   = ans[i] ?? 0;
      const adj = s + (s * (w - 1) * 0.2);
      S[Q[i].a] += adj;
    }
  }

  // 한 축의 양쪽을 비교해 큰 쪽의 '한 글자'만 선택
  function pickPair(left, right){
    const lv = S[left], rv = S[right];
    if (Math.abs(lv - rv) < 0.01) {
      // 타이: 최근 3문항 중 해당 축 관련 선택을 미세 가중 (tie-break)
      const recent = Math.max(0, idx - 3);
      let d = 0;
      for(let i=recent;i<idx;i++){
        const side = Q[i]?.a;
        if(side===left || side===right){
          const sec = times[i] ?? 3;
          const w   = weight(sec);
          d += (side===left ? 1 : -1) * w;
        }
      }
      return d >= 0 ? left : right;
    }
    return (lv >= rv) ? left : right;
  }

  // 상태 라벨(숫자 대신 문장형)
  function labelPair(left, right){
    const lv=S[left], rv=S[right];
    const total = (lv+rv) || 1;
    const dom = Math.max(lv, rv) / total; // 0.5~1.0
    if(dom>=0.75) return '매우 강함';
    if(dom>=0.60) return '강함';
    if(dom>=0.45) return '균형';
    if(dom>=0.30) return '약함';
    return '매우 약함';
  }

  function finish(){
    card.style.display='none';
    bar.style.width='100%';

    const EI = pickPair('E','I');
    const SN = pickPair('S','N');
    const TF = pickPair('T','F');
    const JP = pickPair('J','P');
    const code = `${EI}${SN}${TF}${JP}`; // 예: ISTJ

    // 간단 유머 라벨/설명(숫자 미노출)
    const briefMap={
      ENFP:'🌈 아이디어 스파크러 — 자유와 사람, 둘 다 소중!',
      ENTP:'⚡ 변화를 즐기는 토론가 — 논리로 새판짜기',
      ENFJ:'☀️ 분위기 리더 — 사람을 연결하는 다정한 리더',
      ENTJ:'🚀 추진력 전략가 — 목표를 계획으로 바꾸는 사람',
      ESFP:'🎉 현장 텐션업 — 지금 이 순간을 즐기는 감각파',
      ESTP:'🏃 액션 플레어 — 생각보다 먼저 움직이는 해결사',
      ESFJ:'🤝 케어 코디 — 팀의 체온을 지키는 실용형 다정가',
      ESTJ:'📋 질서 설계자 — 시스템으로 안정 주는 실행가',
      INFP:'🌙 마음 디자이너 — 가치와 의미로 채우는 몽상가',
      INTP:'🧩 개념 탐험가 — 구조와 원리를 파헤치는 분석가',
      INFJ:'🌿 조용한 조율가 — 깊이와 방향을 제시하는 안내자',
      INTJ:'🛰️ 계획 건축가 — 장기 플랜에 강한 전략가',
      ISFP:'🍃 부드러운 실천가 — 따뜻하지만 자유로운 예술가',
      ISTP:'🛠️ 조용한 해결사 — 손으로 증명하는 분석 실용가',
      ISFJ:'🏠 든든한 보호자 — 신뢰와 성실의 디테일 장인',
      ISTJ:'🧭 원칙 수호자 — 규칙과 안정의 기준점'
    };

    const pairState = [
      {name:'E/I', left:'E', right:'I'},
      {name:'S/N', left:'S', right:'N'},
      {name:'T/F', left:'T', right:'F'},
      {name:'J/P', left:'J', right:'P'},
    ].map(p=>{
      return `<div class="row" style="display:flex;justify-content:space-between;align-items:center;margin:6px 0">
        <span><b>${p.name}</b></span>
        <span class="pill" style="margin-left:8px">${labelPair(p.left,p.right)}</span>
      </div>`;
    }).join('');

    result.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/mbti.png" alt="MBTI 아이콘" onerror="this.src='../assets/mongsil.png'">
          <div>
            <div class="result-title">나의 MBTI: <b>${code}</b></div>
            <div class="result-desc">${briefMap[code] || '☁️ 균형형 — 상황에 맞게 톤을 바꾸는 유연한 타입!'}</div>
          </div>
        </div>

        <p style="margin:8px 0">
          결과는 ‘점수’ 대신 상태 라벨로만 표현돼요.  
          각 축에서 어느 쪽이 **상대적으로** 두드러지는지 한눈에 확인해보세요.
        </p>

        <div class="state-meter" style="margin-top:6px">
          ${pairState}
        </div>

        <div class="mind-remind" style="margin:10px 0 8px;color:var(--text-soft)">
          <b>🌿 마음 리마인드:</b> 타입은 ‘성향의 힌트’일 뿐, 정답이 아니에요.  
          오늘의 나에게 맞는 페이스로 천천히 시도해봐요.
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;

    result.style.display='block';
  }

  render();
});