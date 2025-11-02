/* ===================================================
 * 나는 어떤 동물? (5지선다 + 시간 가중치 ±20%)
 * ---------------------------------------------------
 * - 답변: 0~4 (전혀/아니다/보통/그렇다/매우그렇다)
 * - 선택이 핵심, 응답시간은 보조(최대 ±20%) — 숫자 점수는 UI에 노출하지 않음
 * - 분류: 6종 동물(AN, AC, AS, CN, CS, NS) — 상위 2축 조합
 * - 결과 구성: 제목 / 인용문 / 설명 / 감정상태 요약 / 마음 리마인드 / 그래프 / 버튼
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 16문항 (A:활동성, N:새로움, C:공감, S:신중)
  const Q = [
    {k:'A', q:'즉흥적인 외출/모임 제안이 설렌다.'},
    {k:'A', q:'몸을 움직이는 활동(산책/운동)을 즐긴다.'},
    {k:'A', q:'문제 생기면 먼저 행동부터 해보는 편이다.'},
    {k:'A', q:'사람들과 함께 움직일 때 에너지가 오른다.'},

    {k:'N', q:'새로운 방법을 실험하는 게 즐겁다.'},
    {k:'N', q:'큰 그림/가능성을 떠올리는 일이 자주 있다.'},
    {k:'N', q:'규칙보다 아이디어가 먼저 떠오른다.'},
    {k:'N', q:'낯선 장소/문화에 호기심이 강하다.'},

    {k:'C', q:'상대의 감정 변화를 금방 눈치챈다.'},
    {k:'C', q:'팀워크가 좋으면 능률이 더 오른다.'},
    {k:'C', q:'연락·소통이 끊기면 불편함을 느낀다.'},
    {k:'C', q:'상대 입장에서 생각해보는 편이다.'},

    {k:'S', q:'계획을 세우고 단계적으로 진행하는 게 편하다.'},
    {k:'S', q:'결정 전, 정보를 비교·검토하는 편이다.'},
    {k:'S', q:'한 번에 많은 변화를 주는 건 부담스럽다.'},
    {k:'S', q:'루틴과 규칙이 있으면 마음이 편하다.'}
  ];

  let idx = 0;
  const score  = { A:0, N:0, C:0, S:0 };  // 가중 합산
  const counts = { A:0, N:0, C:0, S:0 };  // 축별 응답 수
  const ans    = [];                       // 원점수(0~4)
  const times  = [];                       // 응답 시간(초)
  let startTime = Date.now();

  // DOM
  const stepLabel = document.getElementById('stepLabel');
  const barFill   = document.getElementById('barFill');
  const qText     = document.getElementById('qText');
  const wrap      = document.getElementById('choiceWrap');
  const card      = document.getElementById('card');
  const resultBox = document.getElementById('result');
  const prevBtn   = document.getElementById('prev');
  const skipBtn   = document.getElementById('skip');

  if (!stepLabel || !barFill || !qText || !wrap || !card || !resultBox) {
    console.error('[animal.js] 필수 엘리먼트가 없습니다.');
    return;
  }

  /* ---------- 렌더 ---------- */
  function render(){
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width   = `${(idx/Q.length)*100}%`;
    qText.textContent     = Q[idx].q;

    // 5지선다(0~4)
    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>`;

    // 이전 선택 복원
    const prevSel = ans[idx];
    if (prevSel !== undefined){
      Array.from(wrap.children).forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }

    // 클릭
    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)), 150);
      });
    });

    startTime = Date.now();
  }

  /* ---------- 응답 처리 ---------- */
  function choose(s){
    const elapsed = (Date.now() - startTime)/1000;
    times[idx] = elapsed;

    const k = Q[idx].k;
    const w = getWeight(elapsed); // 0.8~1.2
    ans[idx] = s;

    // 선택 최우선 + 시간 보조(±20% 캡)
    const adjusted = s + (s * (w - 1) * 0.2);
    score[k]  += adjusted;
    counts[k] += 1;

    next();
  }

  function next(){
    idx++;
    if(idx < Q.length) render();
    else finish();
  }

  prevBtn?.addEventListener('click', ()=>{
    if(idx===0) return;
    idx--;
    recalc(idx);
    render();
  });

  skipBtn?.addEventListener('click', ()=>{
    ans[idx]   = 0;
    times[idx] = (Date.now() - startTime)/1000;
    next();
  });

  /* ---------- 재계산(되돌아감) ---------- */
  function recalc(end){
    score.A=score.N=score.C=score.S=0;
    counts.A=counts.N=counts.C=counts.S=0;
    for(let i=0;i<end;i++){
      const s = ans[i] ?? 0;
      const k = Q[i].k;
      const w = getWeight(times[i] ?? 0); // 동일 규칙
      const adjusted = s + (s * (w - 1) * 0.2);
      score[k]  += adjusted;
      counts[k] += 1;
    }
  }

  /* ---------- 시간 가중치(보조) ---------- */
  function getWeight(sec){
    // 0.8 ~ 1.2 범위에서 매핑
    if(sec < 1)  return 0.9;   // 너무 빠른 반응은 약간 -10%
    if(sec < 4)  return 1.0;   // 정상
    if(sec < 8)  return 1.15;  // 숙고
    return 1.1;                // 아주 오래 고민: +10% (과도 상향 방지)
  }

  /* ---------- 동물 매핑 (6유형) ---------- */
  const MAP = {
    'AN':'FOX',      // 여우 (A+N)
    'AC':'OTTER',    // 수달 (A+C)
    'AS':'CAT',      // 고양이 (A+S)
    'CN':'DOLPHIN',  // 돌고래 (C+N)
    'CS':'PENGUIN',  // 펭귄 (C+S)
    'NS':'OWL'       // 부엉이 (N+S)
  };

  const IMG = {
    FOX     : '../assets/animals/fox.png',
    OTTER   : '../assets/animals/otter.png',
    CAT     : '../assets/animals/cat.png',
    DOLPHIN : '../assets/animals/dolphin.png',
    PENGUIN : '../assets/animals/penguin.png',
    OWL     : '../assets/animals/owl.png'
  };

  const COPY = {
    FOX: {
      title:'🦊 여우형', 
      quote:'“일단 해보고 배우자!”',
      desc:'기민하고 재치 있는 도전자예요. 새로운 판을 여는 데 주저 없고, 상황 판단과 임기응변이 빠릅니다. 호기심이 발동하면 실행 속도가 붙고, 몸으로 부딪히며 배우는 편이에요.',
      remind:['체크포인트 3단계','즉흥 플랜에 안전장치 하나','짧은 회고 1문장']
    },
    OTTER: {
      title:'🦦 수달형', 
      quote:'“같이 하면 더 재밌지!”',
      desc:'즐거움을 나누는 팀플레이어예요. 친화력 만점, 분위기 메이커! 함께할 때 힘이 커지고, 연결감에서 동기부여를 얻습니다.',
      remind:['연락 리듬 정하기','휴식 신호 공유','칭찬 먼저, 피드백은 작게']
    },
    CAT: {
      title:'🐱 고양이형', 
      quote:'“거리는 내가 정해. 정성은 진심으로.”',
      desc:'자율성과 집중력이 강점이에요. 필요할 때 번개같이 움직이고, 에너지 관리를 잘합니다. 혼자만의 루틴이 있을 때 퍼포먼스가 좋아져요.',
      remind:['자유 시간 확보','50-10 타이머','요청은 텍스트로']
    },
    DOLPHIN: {
      title:'🐬 돌고래형', 
      quote:'“센스와 배려의 콜라보!”',
      desc:'영리하고 감각적인 소통가예요. 공감과 창의성이 함께 올라가며 흐름을 바꾸고, 팀의 대화를 부드럽게 이어줍니다.',
      remind:['아이디어 1가지 바로 실행','조용한 충전 타임','말보다 시연']
    },
    PENGUIN: {
      title:'🐧 펭귄형', 
      quote:'“천천히, 하지만 함께.”',
      desc:'의리 있고 성실한 협력가예요. 함께 가는 길을 좋아하고, 꾸준함이 큰 무기입니다. 안정적인 합의가 있을 때 가장 반짝여요.',
      remind:['규칙 + 예외 규칙','내 감정도 중요!','주간 체크리스트']
    },
    OWL: {
      title:'🦉 부엉이형', 
      quote:'“빨리보다 정확하게.”',
      desc:'차분한 통찰가예요. 새로움도 구조 안에서 다루고, 근거 기반 결정을 중시합니다. 충분한 정보와 시간이 주어지면 깊은 답을 내요.',
      remind:['탐색 시간 제한','작은 단위 실행','근거 3줄 요약']
    }
  };

  // 단일 성향 강함 판단 임계값(Top1-Top2 격차)
  const DIFF_STRICT = 4.0; // (5지선다 + 가중) 기준 튜닝값

  function pickKey(sc){
    // 점수 내림차순 → 상위 2개 축
    const arr = Object.entries(sc).sort((a,b)=>b[1]-a[1]);
    const [k1,v1] = arr[0];
    const [k2,v2] = arr[1];
    const diff = v1 - v2;

    // 조합키(알파벳 정렬)
    const comboKey = [k1,k2].sort().join(''); // 'AN','AC',...

    return { comboKey, dominance: diff >= DIFF_STRICT, topAxis: k1, secondAxis: k2 };
  }

  // 축 이름 맵
  const AXIS_NAME = {A:'활동성', N:'새로움', C:'공감', S:'신중'};

  // 감정/상황 해석 문장
  function moodInsight(k1, k2){
    const a = AXIS_NAME[k1], b = AXIS_NAME[k2];
    const pair = [k1,k2].sort().join('');
    const base = `오늘은 <b>${a}</b>와 <b>${b}</b>의 톤이 두드러져 보여요.`;

    const extra = {
      AN:'아이디어에 즉시 발을 붙이는 흐름',
      AC:'사람과 함께 움직이며 에너지 보충',
      AS:'속도는 빠르지만 안전장치도 챙김',
      CN:'섬세한 공감 속 기민한 감각',
      CS:'상대를 살피며 안정감 구축',
      NS:'새로움도 구조 안에서 차분히'
    }[pair] || '자신의 리듬을 존중하면 더 좋아집니다.';

    return `${base} ${extra}를 기대할 수 있어요.`;
  }

  // 미터(숫자 표시 없이 그래프만)
  function meters(sc){
    // 각 축 최대치: 4문항 × 4점 = 16
    const maxPerAxis = 16;
    return ['A','N','C','S'].map(k=>{
      const name = AXIS_NAME[k];
      const pct  = Math.round((sc[k] / maxPerAxis) * 100);
      return `
        <div style="text-align:left;margin:8px 0">
          <div style="display:flex;justify-content:space-between;font-weight:800">
            <span>${name}</span>
          </div>
          <div style="height:8px;background:var(--mint-200);border-radius:999px;overflow:hidden">
            <span style="display:block;height:100%;width:${pct}%;background:var(--mint-500)"></span>
          </div>
        </div>`;
    }).join('');
  }

  function finish(){
    card.style.display = 'none';
    barFill.style.width = '100%';

    const picked = pickKey(score);
    const animal = MAP[picked.comboKey] || 'FOX';
    const info   = COPY[animal];
    const img    = IMG[animal];

    const domBadge = picked.dominance
      ? `<div class="pill" style="margin-left:8px">단일 성향 강함</div>`
      : '';

    resultBox.innerHTML = `
      <div class="result-card">
        <!-- 제목 + 인용문 + (선택)배지 -->
        <div class="result-hero">
          <img src="${img}" alt="${info.title}" onerror="this.style.display='none'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
              ${domBadge}
            </div>
          </div>
        </div>

        <!-- 설명 -->
        <p style="margin:10px 0">${info.desc}</p>

        <!-- 감정상태 요약 -->
        <div class="soft-card" style="margin:12px 0">
          <div style="font-weight:800;margin-bottom:6px">오늘의 마음 해석</div>
          <div style="color:var(--text-soft)">${moodInsight(picked.topAxis, picked.secondAxis)}</div>
        </div>

        <!-- 마음 리마인드 (긍정 톤) -->
        <div style="margin-top:10px">
          <div style="font-weight:800;margin-bottom:6px">마음 리마인드</div>
          ${info.remind.map(t=>`<div class="pill">${t}</div>`).join('')}
        </div>

        <!-- 시각요소(그래프 바) -->
        <div style="margin-top:8px">${meters(score)}</div>

        <!-- 다시하기 · 메인버튼 -->
        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;

    resultBox.style.display = 'block';
  }

  // 시작
  render();
});
