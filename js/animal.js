/* ===================================================
 * 나는 어떤 동물? v2025.2 (마음 리마인드 버전)
 * ---------------------------------------------------
 *  - 16문항 / 5지선다(0~4)
 *  - 선택 점수 최우선 + 응답시간 보조(±20% 캡)  → 내부 계산만 사용, UI에는 “수치/점수” 노출 안 함
 *  - 유형: 6종(FOX, OTTER, CAT, DOLPHIN, PENGUIN, OWL)
 *  - 균형 편중 보정: 상위2축 격차가 작으면 2문항 보정샘플링(soft tiebreak) 후 재판정
 *  - 결과 구성: 제목/인용문/설명/감정상태 요약/마음 리마인드/상태미터/버튼
 * =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // ---------- 문항 (A:활동성, N:새로움, C:공감, S:신중) ----------
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

  // ---------- 상태 ----------
  let idx = 0;
  const score  = {A:0,N:0,C:0,S:0};
  const counts = {A:0,N:0,C:0,S:0};
  const ans = [];
  const times = [];
  let startTime = Date.now();

  // ---------- DOM ----------
  const stepLabel = document.getElementById('stepLabel');
  const barFill   = document.getElementById('barFill');
  const qText     = document.getElementById('qText');
  const wrap      = document.getElementById('choiceWrap');
  const card      = document.getElementById('card');
  const resultBox = document.getElementById('result');
  const prevBtn   = document.getElementById('prev');
  const skipBtn   = document.getElementById('skip');

  // ---------- 렌더 ----------
  function render(){
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width   = `${(idx/Q.length)*100}%`;
    qText.textContent     = Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>`;

    const prevSel = ans[idx];
    if(prevSel !== undefined){
      [...wrap.children].forEach(b => {
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }

    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click',()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),140);
      });
    });

    startTime = Date.now();
  }

  // ---------- 가중치 ----------
  function getWeight(sec){
    if(sec < 1)  return 0.9;   // 너무 빠름 → 약간 감쇠
    if(sec < 4)  return 1.0;   // 정상
    if(sec < 8)  return 1.15;  // 숙고
    return 1.1;                // 과도 숙고도 소폭 보상
  }

  // ---------- 응답 처리 ----------
  function choose(s){
    const elapsed = (Date.now()-startTime)/1000;
    times[idx] = elapsed; ans[idx] = s;

    const k = Q[idx].k;
    const w = getWeight(elapsed);
    const adjusted = s + (s * (w - 1) * 0.2); // 보조(±20% 캡)
    score[k] += adjusted;
    counts[k]+= 1;

    next();
  }
  function next(){ idx++; (idx < Q.length) ? render() : finish(); }

  // 되돌아감 재계산
  prevBtn?.addEventListener('click',()=>{
    if(idx===0) return;
    idx--;
    score.A=score.N=score.C=score.S=0;
    counts.A=counts.N=counts.C=counts.S=0;
    for(let i=0;i<idx;i++){
      const s = ans[i] ?? 0, k = Q[i].k;
      const w = getWeight(times[i] ?? 0);
      const adjusted = s + (s * (w - 1) * 0.2);
      score[k]+=adjusted; counts[k]+=1;
    }
    render();
  });
  skipBtn?.addEventListener('click',()=>{ ans[idx]=0; times[idx]=(Date.now()-startTime)/1000; next(); });

  // ---------- 유형 매핑 ----------
  const MAP = { 'AN':'FOX', 'AC':'OTTER', 'AS':'CAT', 'CN':'DOLPHIN', 'CS':'PENGUIN', 'NS':'OWL' };
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
      desc:'기민하고 재치 있는 도전자. 새로운 판을 여는 데 주저 없고, 상황 판단과 임기응변이 빠릅니다.',
      mood:['활동성: 깜짝 에너지 상승','새로움: 실험 모드 활성화','공감: 필요 시 가볍게 연결','신중: 속도 조절 필요'],
      remind:['체크포인트 3단계','즉흥 플랜에 안전장치 하나','한 번 쉬고 다시 질주']
    },

    OTTER: {
      title:'🦦 수달형',
      quote:'“너랑 있으면 시간순삭이야.”',
      desc:'즐거움을 나누는 데 천부적인 재주가 있어요. 웃음이 많고, 함께일 때 에너지가 커집니다. 가끔은 너무 ‘맞춰주려다’ 자기 속도를 놓칠 때가 있어요. 물속의 수달처럼, 당신의 리듬으로 움직이세요.',
      mood:['활동성: 리듬감 있게 상승','새로움: 호기심 스위치 ON','공감: 따뜻한 연결 최상','신중: 일정 체크 필요'],
      remind:['연락은 ‘의무’보다 ‘기분 나눔’으로','내 리듬을 따라야 오래간다','오늘은 내가 웃게 될 이유 하나 만들기']
    },

    CAT: {
      title:'🐱 고양이형',
      quote:'“혼자 있어도 괜찮은 사람이, 진짜 멋있지.”',
      desc:'자기 페이스가 확실한 타입. 필요할 때 번개처럼 움직이고, 쉴 때는 완전히 꺼둡니다. 세상과의 거리를 현명하게 조절하며, 진심이 깊어요. 다만 너무 오래 고요 속에 있으면 ‘고요 피로’가 쌓이기도 해요.',
      mood:['활동성: 선택적 폭발','새로움: 조용한 탐험','공감: 깊지만 드러내진 않음','신중: 루틴 선호'],
      remind:['내 공간은 내 리듬의 안식처','혼자 있을 땐 생각을, 함께일 땐 웃음을','나에게 작은 호기심을 선물하기']
    },

    DOLPHIN: {
      title:'🐬 돌고래형',
      quote:'“네가 있으면 공기가 달라져.”',
      desc:'감각적이고 영리한 커뮤니케이터예요. 눈치가 빠르고 대화의 분위기를 자연스럽게 이끌죠. 새로움과 공감의 밸런스가 좋아서 주변을 자주 밝힙니다. 단, 너무 많은 흐름을 읽다 보면 내 감정을 뒤로 미루게 돼요.',
      mood:['활동성: 부드러운 추진','새로움: 아이디어 넘침','공감: 파도처럼 넓게','신중: 끝맺음 점검'],
      remind:['‘좋은 말’보다 ‘진심’을','아이디어는 작게라도 실행하기','조용한 공간은 생각의 쉼표']
    },

    PENGUIN: {
      title:'🐧 펭귄형',
      quote:'“속도가 다르면 어때, 방향이 같으면 되지.”',
      desc:'묵직한 신뢰감의 소유자. 계획적으로 움직이고 약속은 웬만하면 지킵니다. 느리지만 단단하게, 꾸준히 걸어갑니다. 단, 변화에 대한 두려움이 있다면 작은 시도부터요.',
      mood:['활동성: 일정한 보폭','새로움: 작은 변화 선호','공감: 든든한 배려','신중: 계획적 안정'],
      remind:['완벽보다 ‘지속’을 택하자','새로움은 작은 한 걸음이면 충분','나의 ‘꾸준함’이 주변을 따뜻하게 만든다']
    },

    OWL: {
      title:'🦉 부엉이형',
      quote:'“생각이 깊다는 건, 세상을 다르게 보는 눈이 있다는 뜻.”',
      desc:'통찰력 있는 사색가. 한 걸음 물러서서 전체를 보는 시야가 강점이에요. 논리적이지만 감정의 결도 놓치지 않죠. 다만 생각이 너무 많아질 땐 ‘멈춤’도 전략이에요.',
      mood:['활동성: 필요 시 집중 폭발','새로움: 근거 탐색 우선','공감: 차분한 배려','신중: 계획 최적화'],
      remind:['‘충분히 생각했다’는 신호를 믿기','완벽보다 의미를','깊게 본 만큼, 가볍게 흘려보내기']
    }
  };

  // ---------- 균형 편중 보정 ----------
  const GAP_STRICT = 3.2;     // 단일 성향으로 볼 최소 격차
  const GAP_TIE    = 1.2;     // 상위2축이 너무 근접할 때(균형 쏠림 방지)

  function pickKey(sc){
    const arr = Object.entries(sc).sort((a,b)=>b[1]-a[1]);
    const [k1,v1] = arr[0]; const [k2,v2] = arr[1];
    let diff = v1-v2;

    // 균형 편중이면 soft tiebreak: k1, k2 관련 항목 중 아직 2문항 랜덤 보정
    if(diff < GAP_TIE){
      const left = Q.map((q,i)=>({i, ...q})).filter(q=>q.k===k1 || q.k===k2);
      const remain = left.filter(x=>ans[x.i]===undefined);
      const pick = remain.slice(0,2); // 남은 게 없으면 패스(이미 끝난 시점이면 의미 없음)
      pick.forEach(p=>{
        // 가벼운 가중치 오프셋(선택 뒤엎지 않음)
        score[p.k] += 0.4;
      });
      // 재정렬
      const arr2 = Object.entries(score).sort((a,b)=>b[1]-a[1]);
      diff = arr2[0][1]-arr2[1][1];
      return {k1:arr2[0][0], k2:arr2[1][0], diff};
    }
    return {k1, k2, diff};
  }

  // ---------- 상태 미터 (수치/%) 미표시, 상태 라벨만 ----------
  function axisLabel(k, v){
    // v는 내부 상대값 → 라벨만 반환
    const nameMap = {A:'활동성',N:'새로움',C:'공감',S:'신중'};
    const name = nameMap[k];
    // 대략적 상태 라벨
    const label = v>12 ? '강함'
                : v>9  ? '높음'
                : v>6  ? '중간'
                : v>3  ? '온화'
                : '차분';
    return `${name} — ${label}`;
  }
  function meters(sc){
    const max = 16; // 4문항*4
    return ['A','N','C','S'].map(k=>{
      const ratio = Math.max(0, Math.min(1, sc[k]/max));
      return `
        <div style="margin:8px 0">
          <div style="font-weight:700;display:flex;justify-content:space-between">
            <span>${axisLabel(k, sc[k])}</span>
          </div>
          <div style="height:8px;background:var(--mint-200);border-radius:999px;overflow:hidden">
            <span style="display:block;height:100%;width:${Math.round(ratio*100)}%;background:var(--mint-500)"></span>
          </div>
        </div>`;
    }).join('');
  }

  // ---------- 결과 ----------
  function finish(){
    card.style.display='none';
    barFill.style.width='100%';

    const {k1,k2,diff} = pickKey(score);
    const key = [k1,k2].sort().join(''); // 조합키
    const animal = MAP[key] || 'FOX';
    const info = COPY[animal];
    const img  = IMG[animal];

    // 단일 성향 뱃지(수치표현 없이 상태로만)
    const singleBadge = (diff >= GAP_STRICT)
      ? `<div class="pill" title="응답 패턴이 한 축으로 충분히 치우쳤어요.">단일 성향 뚜렷</div>` : '';

    resultBox.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <img src="${img}" alt="${info.title}" onerror="this.style.display='none'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
            <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">${singleBadge}</div>
          </div>
        </div>

        <p style="margin:10px 0">${info.desc}</p>

        <div class="soft-box" style="margin:10px 0">
          <b>감정상태 요약</b>
          <ul style="margin:6px 0 0 18px">
            ${info.mood.map(m=>`<li>${m}</li>`).join('')}
          </ul>
        </div>

        <div class="soft-box" style="margin:10px 0">
          <b>마음 리마인드</b>
          <ul style="margin:6px 0 0 18px">
            ${info.remind.map(m=>`<li>${m}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-top:10px">${meters(score)}</div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>`;
    resultBox.style.display='block';
  }

  // 시작
  render();
});