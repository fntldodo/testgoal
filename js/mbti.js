/* ===================================================
 * MBTI 빠른 테스트 — v2025.3
 * - 5지선다(0~4) + 응답시간 보조 ±20% (선택 우선, 뒤엎지 않음)
 * - 축: E/I, S/N, T/F, J/P
 * - 강도 모드: 라이트(8문항) / 보통(12문항) / 심화(24문항 예정)
 * - 숫자 점수 직접 노출 금지(퍼센트는 라벨과 함께 보조만)
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 레이아웃 V2 적용
  document.body.classList.add('layout-v2');
  document.body.setAttribute('data-theme','fun');

  /* ---------- 0. 강도 모드 관련 ---------- */
  const MODE_META = {
    light:  { label: '라이트 · 8문항',  len: 8 },
    normal: { label: '보통 · 12문항', len: 12 },
    deep:   { label: '심화 · 24문항', len: 24 },
  };
  let MODE = 'normal';

  // 강도 선택 버튼
  const modeCard   = document.getElementById('modeCard');
  const modeLight  = document.getElementById('modeLight');
  const modeNormal = document.getElementById('modeNormal');
  const modeDeep   = document.getElementById('modeDeep');
  const modeLabel  = document.getElementById('modeLabel');
  const metaBox    = document.getElementById('metaBox');

  /* ---------- 1. 문항 세트 정의 ---------- */
  // 기본 12문항 세트 (보통)
  const Q_BASE = [
    // E / I
    {axis:'EI', p:'E', q:'새로운 사람과 대화할 때 금세 에너지가 붙는다.'},
    {axis:'EI', p:'I', q:'혼자만의 시간이 있어야 생각이 정리된다.'},
    {axis:'EI', p:'E', q:'모임에서 먼저 분위기를 띄우는 편이다.'},

    // S / N
    {axis:'SN', p:'S', q:'추상적인 얘기보다 구체적인 사례가 편하다.'},
    {axis:'SN', p:'N', q:'가능성을 떠올리며 상상하는 시간이 즐겁다.'},
    {axis:'SN', p:'N', q:'패턴을 보고 큰 그림을 재빨리 파악한다.'},

    // T / F
    {axis:'TF', p:'T', q:'판단할 때 감정보다 기준/원칙을 우선한다.'},
    {axis:'TF', p:'F', q:'상대 감정의 파장까지 고려해 결정을 조율한다.'},
    {axis:'TF', p:'F', q:'갈등이 생기면 관계의 온도를 먼저 살핀다.'},

    // J / P
    {axis:'JP', p:'J', q:'계획표와 체크리스트가 있어야 마음이 놓인다.'},
    {axis:'JP', p:'P', q:'계획이 있어도 상황에 따라 유연하게 바꾼다.'},
    {axis:'JP', p:'J', q:'기한이 있으면 미리미리 처리해두는 편이다.'},
  ];

  // 라이트: 각 축당 2문항만 뽑은 버전 (총 8문항)
  const Q_LIGHT = [
    Q_BASE[0], // EI - E
    Q_BASE[1], // EI - I
    Q_BASE[3], // SN - S
    Q_BASE[4], // SN - N
    Q_BASE[6], // TF - T
    Q_BASE[7], // TF - F
    Q_BASE[9], // JP - J
    Q_BASE[10] // JP - P
  ];

  // 심화: 추후 24문항으로 확장 예정. 지금은 기본 12문항을 두 번 반복(자리만 잡아둠).
  const Q_DEEP = [...Q_BASE, ...Q_BASE]; // TODO: 실제 심화 문항으로 교체

  // 현재 진행에 사용할 문항 배열 (모드에 따라 교체)
  let Q = Q_BASE;

  /* ---------- 2. 상태 ---------- */
  let idx=0, start=Date.now();
  const ans=[], times=[];
  const accum = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
  const count = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};

  /* ---------- 3. DOM 요소 ---------- */
  const step=document.getElementById('stepLabel');
  const bar=document.getElementById('barFill');
  const qText=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const card=document.getElementById('card');
  const result=document.getElementById('result');
  const prev=document.getElementById('prev');
  const skip=document.getElementById('skip');

  // 시작 시 질문·진행률은 숨겨둔다 (모드 선택 후 표시)
  card.style.display = 'none';
  metaBox.style.display = 'none';
  result.style.display = 'none';
  bar.style.width = '0%';

  /* ---------- 4. 시간 가중 ---------- */
  function weight(sec){
    if(sec<1) return 0.9;
    if(sec<4) return 1.0;
    if(sec<8) return 1.15;
    return 1.10;
  }

  /* ---------- 5. 공통 유틸 ---------- */
  function resetState(){
    idx=0; start=Date.now();
    ans.length=0; times.length=0;
    for(const k in accum){accum[k]=0;}
    for(const k in count){count[k]=0;}
  }

  /* ---------- 6. 렌더 ---------- */
  function render(){
    step.textContent=`${idx+1} / ${Q.length}`;
    bar.style.width=`${(idx/Q.length)*100}%`;
    qText.textContent=Q[idx].q;
    wrap.innerHTML=`
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>`;

    const prevSel=ans[idx];
    if(prevSel!==undefined){
      [...wrap.children].forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }
    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click',()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      });
    });
    start=Date.now();
  }

  /* ---------- 7. 선택 ---------- */
  function choose(s){
    const sec=(Date.now()-start)/1000, w=weight(sec);
    const adj = s + (s*(w-1)*0.2); // 보조 가중
    const {axis,p} = Q[idx];

    const a1 = axis[0], a2 = axis[1];
    if(p === a1){
      accum[a1]+=adj; count[a1]+=1;
      count[a2]+=1;
    }else{
      accum[a2]+=adj; count[a2]+=1;
      count[a1]+=1;
    }

    ans[idx]=s; times[idx]=sec;
    next();
  }
  function next(){ idx++; if(idx<Q.length) render(); else finish(); }

  /* ---------- 8. 이전/건너뛰기 ---------- */
  prev?.addEventListener('click',()=>{
    if(idx===0) return;
    idx--;
    for(const k in accum){accum[k]=0;}
    for(const k in count){count[k]=0;}
    for(let i=0;i<idx;i++){
      const sec=times[i]??3, s=ans[i]??0, w=weight(sec);
      const adj = s + (s*(w-1)*0.2);
      const {axis,p} = Q[i]; const a1=axis[0], a2=axis[1];
      if(p===a1){accum[a1]+=adj; count[a1]+=1; count[a2]+=1;}
      else{accum[a2]+=adj; count[a2]+=1; count[a1]+=1;}
    }
    render();
  });

  skip?.addEventListener('click',()=>{
    ans[idx]=0; times[idx]=(Date.now()-start)/1000; next();
  });

  /* ---------- 9. 정규화 & 유형 결정 ---------- */
  function norm(letter){
    const avg = (accum[letter] / Math.max(1, count[letter])) / 4;
    return Math.max(0, Math.min(1, avg));
  }

  const label = p =>
    p>=0.80?'매우 강함' :
    p>=0.60?'강함' :
    p>=0.40?'보통' :
    p>=0.20?'약함' : '매우 약함';

  function decide(){
    const E = norm('E'), I = norm('I');
    const S = norm('S'), N = norm('N');
    const T = norm('T'), F = norm('F');
    const J = norm('J'), P = norm('P');

    function pick(a,b,axisKey){
      if(Math.abs(a-b) >= 0.05) return a>=b ? axisKey[0] : axisKey[1];
      let d=0;
      for(let i=Math.max(0,Q.length-3); i<Q.length; i++){
        if(Q[i].axis !== axisKey) continue;
        const sec=times[i]??3, w=weight(sec), s=ans[i]??0;
        const mag = (s>=3?1:(s===2?0.3:0.1));
        d += (Q[i].p===axisKey[0] ? 1 : -1) * w * mag;
      }
      return d>=0 ? axisKey[0] : axisKey[1];
    }

    const e = pick(E,I,'EI');
    const s = pick(S,N,'SN');
    const t = pick(T,F,'TF');
    const j = pick(J,P,'JP');

    return {
      letters: `${e}${s}${t}${j}`,
      n: {E,I,S,N,T,F,J,P}
    };
  }

  /* ---------- 10. 16유형 카피 (기존 그대로) ---------- */
  const COPY={
    ISTJ:{title:'ISTJ — 신중한 빌더',quote:'“차근차근, 정확하게.”',
      desc:'현실감각이 뛰어나고 책임감이 강한 유형입니다. 규칙과 계획 안에서 안정감을 느끼며, 묵묵히 결과를 만들어냅니다.',
      remind:'큰일을 작은 체크포인트로 쪼개고, 완료마다 스스로 칭찬하기.'},
    ISFJ:{title:'ISFJ — 따뜻한 지킴이',quote:'“조용히, 하지만 끝까지.”',
      desc:'배려 깊고 성실한 조력자입니다. 관계를 안정적으로 돌보며 신뢰를 쌓는 데 강합니다.',
      remind:'내 몫의 휴식도 일정에 포함시키기.'},
    INFJ:{title:'INFJ — 통찰형 조율가',quote:'“깊이 이해하고 바르게 이끌기.”',
      desc:'의미와 가치를 중시하고, 조용한 리더십으로 변화를 돕습니다.',
      remind:'이상과 현실의 교차점을 작은 실험으로 확인하기.'},
    INTJ:{title:'INTJ — 전략가',quote:'“구조화된 혁신.”',
      desc:'장기 전략에 강하고, 비전을 구체적인 계획으로 바꿉니다.',
      remind:'완벽보다 실행—MVP로 가설 검증부터.'},

    ISTP:{title:'ISTP — 실전 해결사',quote:'“직접 만져보면 답이 보인다.”',
      desc:'냉정하고 유연한 문제 해결형. 도구와 시스템을 빠르게 파악합니다.',
      remind:'혼자 해결 후 공유 루틴 만들기(5줄 요약).'},
    ISFP:{title:'ISFP — 따뜻한 장인',quote:'“감각으로 전하는 진심.”',
      desc:'섬세하고 온화하며, 가치와 미감을 실천으로 드러냅니다.',
      remind:'작은 작품도 공개하고 피드백 받기.'},
    INFP:{title:'INFP — 의미 탐색가',quote:'“가치에 맞게, 나답게.”',
      desc:'내적 가치와 진정성을 중시합니다. 스토리로 연결될 때 강해집니다.',
      remind:'가치-행동 1:1 매칭으로 오늘 한 가지 실천.'},
    INTP:{title:'INTP — 개념 엔지니어',quote:'“원리부터 이해한다.”',
      desc:'추상과 원리에 강하며, 구조화와 모델링을 즐깁니다.',
      remind:'개념을 예시 3개로 바꿔 설명해보기.'},

    ESTP:{title:'ESTP — 즉흥 실행가',quote:'“지금, 여기에서.”',
      desc:'행동력이 뛰어나고 상황판단이 빠릅니다. 위기대응에 강합니다.',
      remind:'즉흥+안전: 체크포인트 2개 세우고 Go.'},
    ESFP:{title:'ESFP — 분위기 메이커',quote:'“함께할 때 더 반짝.”',
      desc:'현장감 있는 소통과 에너지로 팀을 살립니다.',
      remind:'재미와 휴식의 리듬을 가볍게 고정.'},
    ENFP:{title:'ENFP — 아이디어 스파크',quote:'“가능성에 불붙이기.”',
      desc:'연결과 영감이 풍부합니다. 시작의 추진력이 강점입니다.',
      remind:'아이디어 1개를 24시간 내 시범 운행.'},
    ENTP:{title:'ENTP — 변주형 창조가',quote:'“다르게 보기, 새로 만들기.”',
      desc:'논리/재치를 겸비한 실험가. 틀을 뒤집고 개선을 시도합니다.',
      remind:'반대 시나리오도 1개 작성해 리스크 점검.'},

    ESTJ:{title:'ESTJ — 운영 캡틴',quote:'“체계적으로 밀어붙인다.”',
      desc:'조직/프로세스 운영에 강하며, 실행과 관리가 빠릅니다.',
      remind:'규칙과 예외 규칙을 함께 설계.'},
    ESFJ:{title:'ESFJ — 따뜻한 코디네이터',quote:'“함께 가는 길.”',
      desc:'관계 중심의 운영자. 협업 환경을 편안하게 만듭니다.',
      remind:'돌봄-자기돌봄 비율을 주간 점검.'},
    ENFJ:{title:'ENFJ — 영감형 리더',quote:'“가능성을 사람과 함께.”',
      desc:'동기부여와 조율력이 좋고, 성장 스토리를 설계합니다.',
      remind:'격려와 피드백을 분리해 전달하기.'},
    ENTJ:{title:'ENTJ — 지휘 전략가',quote:'“큰 그림을 실행으로.”',
      desc:'목표-자원-일정을 정렬해 성과를 냅니다.',
      remind:'지표 1개만 정하고 팀과 공유.'},
  };

  function meters(n){
    const rows = [
      ['E','I','에너지 방향'],
      ['S','N','정보 인식'],
      ['T','F','판단 기준'],
      ['J','P','생활 양식'],
    ];
    return `
      <div class="state-meter">
        ${rows.map(([a,b,name])=>{
          const pa = Math.round((n[a]??0)*100);
          const pb = Math.round((n[b]??0)*100);
          const dom = (n[a]??0) >= (n[b]??0) ? a : b;
          const labelText = label(Math.max(n[a]??0,n[b]??0));
          return `
            <div class="row">
              <span><b>${name}</b></span>
              <div class="bar">
                <span class="fill" style="width:${Math.max(pa,pb)}%"></span>
              </div>
              <span class="meter-label">${dom} 쪽 ${labelText}</span>
            </div>`;
        }).join('')}
      </div>`;
  }

  function finish(){
    card.style.display='none'; bar.style.width='100%';

    const {letters, n} = decide();
    const info = COPY[letters] || {
      title:`${letters} — 밸런스형`,
      quote:'“상황에 맞게 균형을 잡는다.”',
      desc:'축 간 균형이 좋아 유연하게 전환합니다.',
      remind:'강점 1개만 골라 오늘 상황에 적용.'
    };

    result.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <img class="animal-hero"
               src="../assets/mbti.png"
               alt="${info.title}"
               onerror="this.onerror=null; this.src='../assets/mbti.png'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>

        <p style="margin:10px 0">${info.desc}</p>

        ${meters(n)}

        <div class="mind-remind" style="margin-top:10px">
          <b>🌿 마음 리마인드:</b> ${info.remind}
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;

    result.style.display='block';
  }

  /* ---------- 11. 강도 선택 버튼 이벤트 ---------- */

  function applyMode(newMode){
    MODE = newMode;
    Q = MODE === 'light' ? Q_LIGHT
      : MODE === 'deep'  ? Q_DEEP
      : Q_BASE;

    // 버튼 selected 토글
    [modeLight, modeNormal, modeDeep].forEach(b=>b?.classList.remove('selected'));
    if(MODE === 'light') modeLight?.classList.add('selected');
    else if(MODE === 'deep') modeDeep?.classList.add('selected');
    else modeNormal?.classList.add('selected');

    if(modeLabel){
      modeLabel.textContent = MODE_META[MODE].label;
    }

    // 상태 초기화 후 질문 시작
    resetState();
    modeCard.style.display = 'none';
    metaBox.style.display  = 'flex';
    card.style.display     = 'block';
    result.style.display   = 'none';
    render();
  }

  modeLight?.addEventListener('click', ()=>applyMode('light'));
  modeNormal?.addEventListener('click', ()=>applyMode('normal'));
  modeDeep?.addEventListener('click', ()=>applyMode('deep'));

  // 기본 진입: 보통 모드 권장 → “보통” 버튼 눌린 것과 동일하게 동작시키려면 아래 한 줄 주석 해제
  // applyMode('normal');
});
