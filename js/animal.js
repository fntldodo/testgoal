/* ===================================================
 * 나는 어떤 동물? (5지선다 + 시간 가중치 ±20% + 6유형 유지)
 * v7 (마음리마인드 적용)
 * ---------------------------------------------------
 * - 답변: 0~4 (전혀/아니다/보통/그렇다/매우그렇다)
 * - 선택이 핵심, 응답시간은 보조 가중치(최대 ±20%)
 * - 분류: 6종 동물(AN, AC, AS, CN, CS, NS)
 * - 결과 카드: 제목/인용문/설명 + 감정 상태 해석 + 마음 리마인드
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  console.log('animal.js v7');

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
  const score  = { A:0, N:0, C:0, S:0 };  // 가중 합산 점수
  const counts = { A:0, N:0, C:0, S:0 };  // 축별 응답 문항 수
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

  /* ---------- 동물 매핑 (6유형 유지) ---------- */
  const MAP = {
    'AN':'FOX',      // 여우
    'AC':'OTTER',    // 수달
    'AS':'CAT',      // 고양이
    'CN':'DOLPHIN',  // 돌고래
    'CS':'PENGUIN',  // 펭귄
    'NS':'OWL'       // 부엉이
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
      title:'🦊 여우형', quote:'“일단 해보고 배우자!”',
      desc:'기민하고 재치 있는 도전자! 새로운 판을 여는 데 주저 없고, 상황 판단과 임기응변이 빠릅니다.',
      remind:['체크포인트 3단계로 안전장치 만들기','즉흥 플랜에도 종료시간 넣기']
    },
    OTTER: {
      title:'🦦 수달형', quote:'“같이 하면 더 재밌지!”',
      desc:'즐거움을 나누는 팀플레이어. 친화력 만점, 분위기 메이커! 함께할 때 힘이 커집니다.',
      remind:['연락 리듬 정하기(예: 저녁 9시 체크)','충전 타임 신호 만들기']
    },
    CAT: {
      title:'🐱 고양이형', quote:'“거리는 내가 정해. 정성은 진심으로.”',
      desc:'자율성과 집중력이 강점. 필요할 때 번개같이 움직이고, 에너지 관리에 능합니다.',
      remind:['자유 시간 블록 확보','50-10 타이머로 몰입 유지']
    },
    DOLPHIN: {
      title:'🐬 돌고래형', quote:'“센스와 배려의 콜라보!”',
      desc:'영리하고 감각적. 공감과 창의성의 조합으로 흐름을 바꾸고 커뮤니케이션을 잘 이끕니다.',
      remind:['아이디어 1가지만 바로 실행','조용한 충전 10분']
    },
    PENGUIN: {
      title:'🐧 펭귄형', quote:'“천천히, 하지만 함께.”',
      desc:'의리 있고 성실한 협력가. 함께 가는 길을 좋아하며 꾸준함이 큰 무기입니다.',
      remind:['규칙 + 예외 규칙 1개 만들기','내 감정도 체크(1줄 메모)']
    },
    OWL: {
      title:'🦉 부엉이형', quote:'“빨리보다 정확하게.”',
      desc:'차분한 통찰가. 새로움도 구조 안에서 섬세하게 다루고, 근거 기반 결정을 중시합니다.',
      remind:['탐색 시간 제한(예: 20분)','작은 단위로 쪼개 실행']
    }
  };

  // 단일 성향 강함 판단 임계값(Top1-Top2 격차)
  const DIFF_STRICT = 4.0; // 5지선다+가중치 기준

  function pickKey(sc){
    const arr = Object.entries(sc).sort((a,b)=>b[1]-a[1]);
    const [k1,v1] = arr[0];
    const [k2,v2] = arr[1];
    const diff = v1 - v2;

    const comboKey = [k1,k2].sort().join(''); // 'AN','AC',...
    const dominance = diff >= DIFF_STRICT;

    return { comboKey, dominance, topAxis:k1, secondAxis:k2, diff };
  }

  // 감정 상태 해석(축 기반 간단 설명)
  function moodInsight(top, second){
    const axisName = {A:'활동성', N:'새로움', C:'공감', S:'신중'};
    const tone = {
      A:'에너지가 높아 몸이 먼저 반응하기 쉬운 날이에요. 시동이 잘 걸리지만, 과속 방지턱을 하나 두면 좋아요.',
      N:'시선이 미래로 뻗는 상태예요. 상상력이 활발하고 호기심이 크니, 작은 실험을 바로 해보면 성취감이 큽니다.',
      C:'감정 레이더가 민감해진 날. 타인의 신호를 잘 읽고 공감이 풍부해, 조율자 역할에 강점을 보여요.',
      S:'안정과 구조가 필요한 상태예요. 계획대로 할 때 마음이 편안하고, 차분한 루틴이 회복력을 높여줘요.'
    };
    const pair = `(${axisName[top]} ↔ ${axisName[second]})`;
    return `오늘의 마음 축은 <b>${axisName[top]}</b> 쪽으로 기울어 있습니다 ${pair}. ${tone[top]}`;
  }

  function meters(sc){
    // 각 축 최대치: 4문항 × 4점 = 16 (5지선다 최대 4)
    const maxPerAxis = 16;
    return ['A','N','C','S'].map(k=>{
      const name = ({A:'활동성', N:'새로움', C:'공감', S:'신중'})[k];
      const pct  = Math.round((sc[k] / maxPerAxis) * 100);
      return `<div style="text-align:left;margin:6px 0">
        <div style="display:flex;justify-content:space-between;font-weight:700">
          <span>${name}</span><span>${pct}%</span>
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

    // 전체 평균(참고용 표시)
    const answered = ans.filter(v => v !== undefined).length || 1;
    const totalAdj = Object.values(score).reduce((a,b)=>a+b,0);
    const avgAll   = (totalAdj / answered).toFixed(1); // 0~4 스케일

    const domBadge = picked.dominance ? `<div class="pill" style="margin-left:8px">단일 성향 강함</div>` : '';

    const html = `
      <div class="result-card">
        <div class="result-hero">
          <img src="${img}" alt="${info.title}" onerror="this.style.display='none'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
              <div class="pill">평균 점수: <b>${avgAll}</b>/4.0</div>
              ${domBadge}
            </div>
          </div>
        </div>

        <p style="margin:10px 0">${info.desc}</p>

        <!-- 감정 상태 해석 -->
        <div class="soft-card" style="margin:10px 0;padding:12px;border:1px solid var(--mint-200);border-radius:14px;background:var(--mint-50)">
          <div style="font-weight:800;margin-bottom:6px">오늘의 마음 해석</div>
          <div style="color:var(--text-soft)">${moodInsight(picked.topAxis, picked.secondAxis)}</div>
        </div>

        <!-- 축 미터 -->
        <div style="margin-top:8px">${meters(score)}</div>

        <!-- 마음 리마인드 -->
        <div style="margin-top:10px">
          <div style="font-weight:800;margin-bottom:6px">마음 리마인드</div>
          ${info.remind.map(t=>`<div class="pill">${t}</div>`).join('')}
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;

    resultBox.innerHTML = html;
    resultBox.style.display = 'block';
  }

  // 시작
  render();
});
