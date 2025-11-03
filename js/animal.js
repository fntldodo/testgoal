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
      quote:'“같이 하면 더 재밌지!”',
      desc:'즐거움을 나누는 팀플레이어. 친화력 만점의 분위기 메이커로, 함께할 때 힘이 커집니다.',
      mood:['활동성: 리듬감 있게 상승','새로움: 호기심 스위치 ON','공감: 따뜻한 연결 최상','신중: 일정 체크 필요'],
      remind:['연락 리듬 정하기','작은 공동 목표 만들기','휴식 신호 미리 공유']
    },
    CAT: {
      title:'🐱 고양이형',
      quote:'“거리는 내가 정해. 정성은 진심으로.”',
      desc:'자율성과 집중력이 강점. 필요할 때 번개같이 움직이고, 에너지 관리에 능합니다.',
      mood:['활동성: 선택적 폭발','새로움: 조용한 탐험','공감: 깊지만 드러내진 않음','신중: 루틴 선호'],
      remind:['자유 시간 확보하기','50–10 타이머 사용','중요연락 체크창 별도']
    },
    DOLPHIN: {
      title:'🐬 돌고래형',
      quote:'“센스와 배려의 콜라보!”',
      desc:'영리하고 감각적. 공감과 창의성의 조합으로 흐름을 바꾸고 커뮤니케이션을 잘 이끕니다.',
      mood:['활동성: 부드러운 추진','새로움: 아이디어 넘침','공감: 파도처럼 넓게','신중: 끝맺음 점검'],
      remind:['아이디어 1개 바로 실행','조용한 충전 10분','끝맺음 체크리스트']
    },
    PENGUIN: {
      title:'🐧 펭귄형',
      quote:'“천천히, 하지만 함께.”',
      desc:'의리 있고 성실한 협력가. 함께 가는 길을 좋아하며 꾸준함이 큰 무기입니다.',
      mood:['활동성: 일정한 보폭','새로움: 작은 변화 선호','공감: 든든한 배려','신중: 계획적 안정'],
      remind:['규칙 + 예외 규칙','나를 위한 감정 한 줄','주 1회 작은 새로움']
    },
    OWL: {
      title:'🦉 부엉이형',
      quote:'“빨리보다 정확하게.”',
      desc:'차분한 통찰가. 새로움도 구조 안에서 섬세하게 다루고, 근거 기반 결정을 중시합니다.',
      mood:['활동성: 필요 시 집중 폭발','새로움: 근거 탐색 우선','공감: 차분한 배려','신중: 계획 최적화'],
      remind:['탐색 시간 제한 두기','작은 단위로 실행','완료 체크로 마침표']
    }
  };

  // ---------- 균형 편중 보정 ----------
  const GAP_STRICT = 3.2;     // 단일 성향으로 볼 최소 격차
  const GAP_TIE    = 1.2;     // 상위2축이 너무 근접할 때(균형 쏠림 방지)

  function pick