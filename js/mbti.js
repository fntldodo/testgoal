/* ===================================================
 * MBTI 테스트 — v2025.3
 * - 강도 선택: 라이트(8) / 보통(12) / 심화(24)
 * - 5지선다(0~4) + 응답시간 가중 ±20% (선택은 그대로, 미세 보정만)
 * - 축: E/I, S/N, T/F, J/P
 * - 결과: 16유형 · 2줄 설명 + 장점 3줄 + 주의점 3줄 + 그래프(양쪽 퍼센트)
 * - 숫자 점수 직접 노출 X (퍼센트는 설명용으로만)
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 레이아웃 모드
  document.body.classList.add('layout-v2');
  document.body.setAttribute('data-theme','fun');

  /* ---------------- 질문 세트 정의 ---------------- */

  const QUESTION_SETS = {
    light: {
      labelShort: '라이트',
      labelDetail: '라이트(8문항, 가벼운 확인용)',
      note: '* 현재: <b>라이트</b>(8문항, 빠른 경향 확인용) 기준 문항입니다. 자기보고식 경향 파악 도구이며, 임상 진단이 아닙니다.',
      items: [
        // EI 2문항
        {axis:'EI', p:'E', q:'새로운 사람과 대화할 때 금세 에너지가 붙는다.'},
        {axis:'EI', p:'I', q:'하루를 마무리할 때는 혼자만의 시간이 꼭 필요하다.'},
        // SN 2문항
        {axis:'SN', p:'S', q:'추상적인 얘기보다 일상적인 예시가 편하다.'},
        {axis:'SN', p:'N', q:'아이디어와 가능성을 떠올리며 상상하는 시간이 즐겁다.'},
        // TF 2문항
        {axis:'TF', p:'T', q:'판단할 때 감정보다 기준·원칙을 먼저 본다.'},
        {axis:'TF', p:'F', q:'결정이 누군가의 감정에 미칠 영향이 크게 신경 쓰인다.'},
        // JP 2문항
        {axis:'JP', p:'J', q:'할 일을 미리 정리해두어야 마음이 편하다.'},
        {axis:'JP', p:'P', q:'계획이 있어도 상황 보며 즉흥적으로 바꾸는 편이다.'},
      ]
    },
    normal: {
      labelShort: '보통',
      labelDetail: '보통(12문항, 표준형)',
      note: '* 현재: <b>보통</b>(12문항, 표준형) 기준 문항입니다. 자기보고식 경향 파악 도구이며, 임상 진단이 아닙니다.',
      items: [
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
      ]
    },
    deep: {
      labelShort: '심화',
      labelDetail: '심화(24문항, 자세한 경향 확인용)',
      note: '* 현재: <b>심화</b>(24문항, 세부 경향 확인용) 기준 문항입니다. 자기보고식 경향 파악 도구이며, 임상 진단이 아닙니다.',
      items: [
        // EI 6
        {axis:'EI', p:'E', q:'처음 보는 사람에게도 먼저 말을 거는 편이다.'},
        {axis:'EI', p:'I', q:'사람 많은 자리를 다녀오면 에너지가 빨리 소진된다.'},
        {axis:'EI', p:'E', q:'여럿이 함께할 때 아이디어가 더 잘 떠오른다.'},
        {axis:'EI', p:'I', q:'조용한 환경에서 혼자 일할 때 집중이 잘 된다.'},
        {axis:'EI', p:'E', q:'계획보다 상황 속 즉흥적인 기회를 즐긴다.'},
        {axis:'EI', p:'I', q:'말하기 전에 머릿속으로 여러 번 정리해보는 편이다.'},

        // SN 6
        {axis:'SN', p:'S', q:'지금의 현실 상황을 먼저 파악하는 편이다.'},
        {axis:'SN', p:'N', q:'눈앞의 사실보다 “앞으로 어떻게 될지”가 더 궁금하다.'},
        {axis:'SN', p:'S', q:'새로운 것보다 익숙한 방식이 마음이 편하다.'},
        {axis:'SN', p:'N', q:'작은 일에서도 숨은 의미나 패턴을 찾으려 한다.'},
        {axis:'SN', p:'S', q:'설명 들을 때 요약·정리보다 예시가 더 이해되기 쉽다.'},
        {axis:'SN', p:'N', q:'아이디어나 상상을 기록해두는 편이다.'},

        // TF 6
        {axis:'TF', p:'T', q:'논리적으로 맞는지 먼저 체크하고 감정을 본다.'},
        {axis:'TF', p:'F', q:'상대가 상처받지 않을까 하는 걱정을 자주 한다.'},
        {axis:'TF', p:'T', q:'논쟁 상황에서도 감정에 휘둘리지 않으려 한다.'},
        {axis:'TF', p:'F', q:'상대 입장에서 어떻게 느낄지 상상해본 뒤 결정한다.'},
        {axis:'TF', p:'T', q:'일을 평가할 때 결과와 효율을 가장 중요하게 본다.'},
        {axis:'TF', p:'F', q:'결과가 좋아도 분위기가 나빴다면 마음이 걸린다.'},

        // JP 6
        {axis:'JP', p:'J', q:'일정을 미리 잡아두고 그에 맞춰 움직이는 편이다.'},
        {axis:'JP', p:'P', q:'마감 직전 집중력이 확 올라가는 경험이 많다.'},
        {axis:'JP', p:'J', q:'오늘 할 일을 전날이나 아침에 정리해두면 편하다.'},
        {axis:'JP', p:'P', q:'계획이 자주 바뀌어도 큰 스트레스를 느끼지 않는다.'},
        {axis:'JP', p:'J', q:'서랍·파일·폴더를 정리해두면 마음도 정돈된 느낌이다.'},
        {axis:'JP', p:'P', q:'선택지를 열어두고 상황을 보며 결정하는 편이다.'},
      ]
    }
  };

  /* ---------------- 상태 변수 ---------------- */

  let currentMode = 'normal';
  let Q = QUESTION_SETS[currentMode].items;

  let idx = 0;
  let start = Date.now();
  const ans = [];
  const times = [];
  const accum = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
  const count = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};

  /* ---------------- DOM ---------------- */

  const modeCard   = document.getElementById('modeCard');
  const testWrap   = document.getElementById('testWrap');
  const modeNote   = document.getElementById('modeNote');
  const modeMini   = document.getElementById('modeMini');

  const step       = document.getElementById('stepLabel');
  const bar        = document.getElementById('barFill');
  const qText      = document.getElementById('qText');
  const wrap       = document.getElementById('choiceWrap');
  const card       = document.getElementById('card');
  const result     = document.getElementById('result');
  const prev       = document.getElementById('prev');
  const skip       = document.getElementById('skip');

  if(!step || !bar || !qText || !wrap || !card || !result) return;

  /* ---------------- 시간 가중 ---------------- */

  function weight(sec){
    if(sec<1) return 0.9;
    if(sec<4) return 1.0;
    if(sec<8) return 1.15;
    return 1.10;
  }

  /* ---------------- 공통 리셋 ---------------- */

  function resetState() {
    idx = 0;
    start = Date.now();
    ans.length = 0;
    times.length = 0;
    for(const k in accum) accum[k] = 0;
    for(const k in count) count[k] = 0;
    card.style.display = 'block';
    result.style.display = 'none';
    bar.style.width = '0%';
  }

  function updateModeUI() {
    // 미니 pill 활성화
    if(modeMini){
      [...modeMini.querySelectorAll('.mode-pill')].forEach(btn=>{
        btn.classList.toggle('active', btn.dataset.mode === currentMode);
      });
    }
    // 하단 안내 문구
    if(modeNote){
      modeNote.innerHTML = QUESTION_SETS[currentMode].note;
    }
  }

  /* ---------------- 렌더 ---------------- */

  function render(){
    step.textContent = `${idx+1} / ${Q.length}`;
    bar.style.width = `${(idx/Q.length)*100}%`;
    qText.textContent = Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;

    const prevSel = ans[idx];
    if(prevSel !== undefined){
      [...wrap.children].forEach(b=>{
        if(Number(b.dataset.s) === prevSel) b.classList.add('selected');
      });
    }

    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click',()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      });
    });

    start = Date.now();
  }

  /* ---------------- 선택 처리 ---------------- */

  function choose(s){
    const sec = (Date.now()-start)/1000;
    const w   = weight(sec);
    const adj = s + (s*(w-1)*0.2);

    const {axis,p} = Q[idx];
    const a1 = axis[0], a2 = axis[1];

    if(p === a1){
      accum[a1]+=adj; count[a1]+=1; count[a2]+=1;
    }else{
      accum[a2]+=adj; count[a2]+=1; count[a1]+=1;
    }

    ans[idx]   = s;
    times[idx] = sec;

    idx++;
    if(idx < Q.length) render();
    else finish();
  }

  prev?.addEventListener('click',()=>{
    if(idx===0) return;
    idx--;
    // 전체 재계산
    for(const k in accum) accum[k]=0;
    for(const k in count) count[k]=0;

    for(let i=0;i<idx;i++){
      const sec = times[i]??3;
      const s   = ans[i]??0;
      const w   = weight(sec);
      const adj = s + (s*(w-1)*0.2);
      const {axis,p} = Q[i];
      const a1 = axis[0], a2 = axis[1];
      if(p===a1){accum[a1]+=adj; count[a1]+=1; count[a2]+=1;}
      else{accum[a2]+=adj; count[a2]+=1; count[a1]+=1;}
    }
    render();
  });

  skip?.addEventListener('click',()=>{
    ans[idx]=0;
    times[idx]=(Date.now()-start)/1000;
    idx++;
    if(idx < Q.length) render();
    else finish();
  });

  /* ---------------- 정규화 & 타입 결정 ---------------- */

  function norm(letter){
    const avg = (accum[letter] / Math.max(1,count[letter])) / 4;
    return Math.max(0, Math.min(1, avg));
  }

  function strengthWord(diff){
    if(diff >= 0.35) return '매우 뚜렷하게';
    if(diff >= 0.20) return '뚜렷하게';
    if(diff >= 0.10) return '약간';
    return '거의 비슷하게';
  }

  function decide(){
    const E = norm('E'), I = norm('I');
    const S = norm('S'), N = norm('N');
    const T = norm('T'), F = norm('F');
    const J = norm('J'), P = norm('P');

    function pick(a,b,axisKey){
      if(Math.abs(a-b) >= 0.05) return a>=b ? axisKey[0] : axisKey[1];
      let d=0;
      for(let i=0;i<Q.length;i++){
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

  /* ---------------- 16유형 카피 ---------------- */

  const COPY = {
    ISTJ:{
      title:'ISTJ — 신중한 빌더',
      quote:'“차근차근, 정확하게.”',
      overview:[
        '현실감각이 뛰어나고 책임감이 강한 유형입니다.',
        '규칙과 계획 안에서 안정감을 느끼며, 묵묵히 결과를 만들어냅니다.'
      ],
      strengths:[
        '약속과 마감을 잘 지켜 주변에서 신뢰를 얻습니다.',
        '한 번 맡은 일을 끝까지 들고 가는 끈기가 있습니다.',
        '세부사항을 놓치지 않고 체계적으로 정리하는 데 강합니다.'
      ],
      risks:[
        '예상 밖 상황에서 융통성이 부족하다는 말을 들을 수 있습니다.',
        '실수나 비효율을 보면 먼저 지적부터 하게 될 수 있습니다.',
        '감정을 표현하지 않아 속내를 알기 어렵다는 평가를 받을 수 있습니다.'
      ],
      remind:'큰일을 작은 체크포인트로 쪼개고, 완료마다 스스로 칭찬하기.'
    },
    ISFJ:{
      title:'ISFJ — 따뜻한 지킴이',
      quote:'“조용히, 하지만 끝까지.”',
      overview:[
        '배려 깊고 성실한 조력자 유형입니다.',
        '눈에 띄지 않는 자리에서 사람과 시스템을 꾸준히 돌봅니다.'
      ],
      strengths:[
        '주변 사람들의 필요를 세심하게 챙기는 편입니다.',
        '한 번 정한 관계와 약속을 오래 지키려 합니다.',
        '안정적인 루틴과 환경을 유지하는 데 강점이 있습니다.'
      ],
      risks:[
        '타인을 챙기느라 본인의 피로를 뒤로 미루기 쉽습니다.',
        '갈등을 피하다가 마음속에 서운함을 쌓아둘 수 있습니다.',
        '새로운 시도 앞에서 “괜히 힘들어지지 않을까” 먼저 걱정할 수 있습니다.'
      ],
      remind:'내 몫의 휴식도 일정에 포함시키기.'
    },
    INFJ:{
      title:'INFJ — 통찰형 조율가',
      quote:'“깊이 이해하고 바르게 이끌기.”',
      overview:[
        '의미와 가치를 중시하는 조용한 리더형입니다.',
        '사람과 상황의 흐름을 읽고 방향을 제안하는 데 강합니다.'
      ],
      strengths:[
        '타인의 숨은 의도와 감정을 섬세하게 읽어냅니다.',
        '장기적인 비전과 가치 기준을 가지고 움직입니다.',
        '조용하지만 단단한 리더십으로 사람들을 설득할 수 있습니다.'
      ],
      risks:[
        '이상과 현실의 차이에 쉽게 지칠 수 있습니다.',
        '모든 것을 “완벽히 맞고 싶다”는 마음에 시작을 미룰 수 있습니다.',
        '속으로 많은 것을 생각하지만 표현은 적어 오해가 생길 수 있습니다.'
      ],
      remind:'이상과 현실의 교차점을 작은 실험으로 확인하기.'
    },
    INTJ:{
      title:'INTJ — 전략가',
      quote:'“구조화된 혁신.”',
      overview:[
        '장기 전략과 구조 설계에 강한 유형입니다.',
        '비전을 구체적인 계획으로 바꾸는 데 즐거움을 느낍니다.'
      ],
      strengths:[
        '복잡한 문제를 구조화해 핵심을 빠르게 파악합니다.',
        '목표를 정하면 꾸준히 추진해 나가는 추진력이 있습니다.',
        '감정에 휘둘리지 않고 논리적으로 판단하려 노력합니다.'
      ],
      risks:[
        '속도가 느린 사람들을 답답하게 느낄 수 있습니다.',
        '감정 표현이 적어 차갑게 보인다는 말을 듣기 쉽습니다.',
        '완성도가 낮으면 아예 시작을 미루는 경향이 있을 수 있습니다.'
      ],
      remind:'완벽보다 실행 — 작은 MVP로 가설부터 검증하기.'
    },

    ISTP:{
      title:'ISTP — 실전 해결사',
      quote:'“직접 만져보면 답이 보인다.”',
      overview:[
        '냉정하고 유연한 문제 해결형입니다.',
        '도구와 시스템을 실제로 다뤄 보며 익히는 데 강합니다.'
      ],
      strengths:[
        '위기 상황에서도 침착하게 상황을 판단합니다.',
        '불필요한 절차를 줄이고 핵심만 효율적으로 처리합니다.',
        '손재주나 기계·도구 다루기에 재능을 보이는 경우가 많습니다.'
      ],
      risks:[
        '관계의 감정적인 부분을 놓치고 “일 얘기만” 할 수 있습니다.',
        '지루한 반복 업무에는 쉽게 흥미를 잃을 수 있습니다.',
        '도움을 요청하거나 감정을 표현하는 데 서툴 수 있습니다.'
      ],
      remind:'혼자 해결 후, 5줄 요약으로 주변과 공유하는 루틴 만들기.'
    },
    ISFP:{
      title:'ISFP — 따뜻한 장인',
      quote:'“감각으로 전하는 진심.”',
      overview:[
        '섬세하고 온화한 감성형 실행자입니다.',
        '눈에 보이는 결과물 속에 자신의 가치를 담는 것을 좋아합니다.'
      ],
      strengths:[
        '사람과 환경의 미세한 분위기를 잘 느낍니다.',
        '무언가를 손으로 만들거나 꾸미는 데 재능이 있는 경우가 많습니다.',
        '조용하지만 진심 어린 행동으로 주변을 따뜻하게 만듭니다.'
      ],
      risks:[
        '갈등 상황에서 자신의 의견을 끝까지 주장하기 어렵게 느낄 수 있습니다.',
        '비판을 개인에 대한 거절로 받아들이고 상처받기 쉽습니다.',
        '계획을 세우기보다 그때그때 기분에 따라 움직일 수 있습니다.'
      ],
      remind:'작은 작품이라도 세상에 내어놓고 피드백 받아보기.'
    },
    INFP:{
      title:'INFP — 의미 탐색가',
      quote:'“가치에 맞게, 나답게.”',
      overview:[
        '내적 가치와 이상을 중시하는 스토리형 유형입니다.',
        '무언가에 마음이 움직이면 깊이 몰입하는 힘이 있습니다.'
      ],
      strengths:[
        '사람과 상황의 숨은 의미를 잘 찾아냅니다.',
        '자신이 믿는 가치와 연결될 때 강한 에너지가 생깁니다.',
        '타인의 경험에 공감하며 이야기로 따뜻함을 전할 수 있습니다.'
      ],
      risks:[
        '현실의 제약을 마주할 때 쉽게 좌절감을 느낄 수 있습니다.',
        '비판을 받으면 자신의 존재 전체가 부정당한 것처럼 느껴질 수 있습니다.',
        '실행보다 생각과 상상 속에서 머무는 시간이 길어질 수 있습니다.'
      ],
      remind:'오늘 한 가지 행동을 내 가치와 1:1로 연결해 실천해 보기.'
    },
    INTP:{
      title:'INTP — 개념 엔지니어',
      quote:'“원리부터 이해한다.”',
      overview:[
        '추상과 원리를 탐구하는 분석형 사고가 강합니다.',
        '개념을 구조화하고 모델을 만드는 일을 즐깁니다.'
      ],
      strengths:[
        '복잡한 아이디어를 논리적으로 분해하고 연결합니다.',
        '새로운 이론이나 시스템을 떠올리는 데 뛰어난 편입니다.',
        '논리적 허점을 발견하고 개선 방향을 제시할 수 있습니다.'
      ],
      risks:[
        '흥미가 없는 일에는 집중이 잘 되지 않을 수 있습니다.',
        '실행보다 아이디어 단계에서 끝나는 일이 생기기 쉽습니다.',
        '감정 표현이 적어 “차갑다, 비판적이다”라는 인상을 줄 수 있습니다.'
      ],
      remind:'추상 개념을 예시 3개로 풀어 설명하는 연습하기.'
    },

    ESTP:{
      title:'ESTP — 즉흥 실행가',
      quote:'“지금, 여기에서.”',
      overview:[
        '행동력이 뛰어나고 상황판단이 빠른 유형입니다.',
        '현장에서 직접 부딪치며 배우는 것을 선호합니다.'
      ],
      strengths:[
        '위기 대응이나 돌발 상황 처리에 강합니다.',
        '사람들과 금세 어울리고 분위기를 띄우는 능력이 있습니다.',
        '기회를 포착하면 바로 실행으로 옮기는 추진력이 있습니다.'
      ],
      risks:[
        '장기적인 후폭풍을 충분히 검토하지 않고 결정할 수 있습니다.',
        '세부 계획을 소홀히 하여 뒷수습이 필요해질 수 있습니다.',
        '조용한 사람들의 속도와 감정을 놓치고 지나가기 쉽습니다.'
      ],
      remind:'즉흥 + 안전: 체크포인트 2개 세우고 실행하기.'
    },
    ESFP:{
      title:'ESFP — 분위기 메이커',
      quote:'“함께할 때 더 반짝.”',
      overview:[
        '사람들과 어울리며 에너지를 나누는 유형입니다.',
        '현장의 즐거움과 생동감을 중요하게 여깁니다.'
      ],
      strengths:[
        '주변 사람들을 편안하게 만들고 분위기를 밝힙니다.',
        '새로운 경험과 사람을 두려워하지 않고 시도합니다.',
        '상대의 감정 변화를 빠르게 캐치해 반응합니다.'
      ],
      risks:[
        '지루하고 반복적인 일에는 쉽게 싫증을 낼 수 있습니다.',
        '지금의 즐거움 때문에 장기 계획을 미루기 쉽습니다.',
        '갈등이 생기면 깊이 있는 대화보다 회피를 선택할 수 있습니다.'
      ],
      remind:'재미와 휴식의 리듬을 가볍게 고정하고, 해야 할 일 1개만 먼저 처리하기.'
    },
    ENFP:{
      title:'ENFP — 아이디어 스파크',
      quote:'“가능성에 불붙이기.”',
      overview:[
        '연결과 영감이 풍부한 시작형 유형입니다.',
        '사람과 아이디어 사이에서 스파크를 만드는 데 강합니다.'
      ],
      strengths:[
        '새로운 가능성과 대안을 잘 떠올립니다.',
        '사람들에게 동기부여와 영감을 주는 말을 잘 합니다.',
        '다양한 관점을 유연하게 연결하는 데 능숙합니다.'
      ],
      risks:[
        '시작은 많은데 마무리가 부족하다는 말을 들을 수 있습니다.',
        '흥미가 시들해지면 금세 다른 것에 눈을 돌릴 수 있습니다.',
        '감정 기복이 클 때 에너지 관리가 어려울 수 있습니다.'
      ],
      remind:'아이디어 1개를 골라 24시간 안에 “작은 시범 운행” 해보기.'
    },
    ENTP:{
      title:'ENTP — 변주형 창조가',
      quote:'“다르게 보기, 새로 만들기.”',
      overview:[
        '틀을 뒤집고 새로운 관점을 제안하는 실험가형입니다.',
        '논리와 재치를 동시에 사용하는 경우가 많습니다.'
      ],
      strengths:[
        '문제를 여러 각도에서 바라보고 창의적 대안을 만듭니다.',
        '토론과 브레인스토밍에서 큰 에너지를 발휘합니다.',
        '변화와 혁신이 필요한 상황에서 두각을 나타냅니다.'
      ],
      risks:[
        '논쟁이 재미로 느껴져 상대에게는 공격처럼 보일 수 있습니다.',
        '지속적인 관리·운영 업무에는 쉽게 지루함을 느낍니다.',
        '세부 실행 계획보다 아이디어 생산에만 머물 위험이 있습니다.'
      ],
      remind:'반대 시나리오 1개를 꼭 작성해 리스크 함께 점검하기.'
    },

    ESTJ:{
      title:'ESTJ — 운영 캡틴',
      quote:'“체계적으로 밀어붙인다.”',
      overview:[
        '조직과 시스템을 운영하는 데 강한 유형입니다.',
        '계획을 세우고 사람들을 조정해 목표를 달성하려 합니다.'
      ],
      strengths:[
        '업무 분장과 일정 관리에 능숙한 편입니다.',
        '결정을 미루지 않고 실행으로 옮기는 추진력이 있습니다.',
        '규칙과 기준을 분명히 해 팀의 방향을 잡아줍니다.'
      ],
      risks:[
        '속도가 느린 사람들에게는 부담스러운 상대로 느껴질 수 있습니다.',
        '감정보다 효율을 우선해 관계가 딱딱해질 위험이 있습니다.',
        '본인의 기준에 맞지 않으면 인정이 늦을 수 있습니다.'
      ],
      remind:'규칙과 함께 “예외 규칙”도 미리 설계해 여유 남겨두기.'
    },
    ESFJ:{
      title:'ESFJ — 따뜻한 코디네이터',
      quote:'“함께 가는 길.”',
      overview:[
        '사람 중심으로 팀을 운영하는 유형입니다.',
        '분위기와 관계를 고려하며 실무도 꼼꼼히 챙깁니다.'
      ],
      strengths:[
        '구성원들의 마음을 세심하게 살피며 조율합니다.',
        '모임이나 행사 준비를 체계적으로 진행할 수 있습니다.',
        '협력적인 분위기를 만들고 유지하는 데 강점이 있습니다.'
      ],
      risks:[
        '거절을 잘 못해 스스로 과부하를 떠안기 쉽습니다.',
        '갈등을 피하려다 솔직한 피드백을 미루게 될 수 있습니다.',
        '타인의 시선을 지나치게 의식해 본인 욕구를 뒤로 미룰 수 있습니다.'
      ],
      remind:'돌봄과 자기돌봄 비율을 주간 단위로 체크해 보기.'
    },
    ENFJ:{
      title:'ENFJ — 영감형 리더',
      quote:'“가능성을 사람과 함께.”',
      overview:[
        '사람들의 성장과 변화를 이끄는 리더형입니다.',
        '비전과 감수성을 함께 사용하는 경우가 많습니다.'
      ],
      strengths:[
        '상대의 잠재력을 발견하고 격려하는 데 능숙합니다.',
        '팀의 분위기를 읽고 갈등을 중재할 수 있습니다.',
        '프로젝트에 이야기를 입혀 동기를 불러일으킵니다.'
      ],
      risks:[
        '모든 사람을 챙기려다 본인이 소진될 수 있습니다.',
        '완벽한 조화를 이루려다 어려운 결정을 미루게 될 수 있습니다.',
        '겉으로는 괜찮다고 하지만 속으로 서운함을 쌓아둘 수 있습니다.'
      ],
      remind:'격려와 피드백을 분리해, 칭찬 후 개선점을 구체적으로 전달하기.'
    },
    ENTJ:{
      title:'ENTJ — 지휘 전략가',
      quote:'“큰 그림을 실행으로.”',
      overview:[
        '목표·자원·일정을 정렬하는 데 강한 리더형입니다.',
        '효율적인 구조를 만들고 성과를 내는 것에 집중합니다.'
      ],
      strengths:[
        '방향을 제시하고 사람들을 이끌어가는 힘이 있습니다.',
        '복잡한 프로젝트를 단계별 계획으로 나누는 데 능숙합니다.',
        '냉정하게 우선순위를 정하고 자원을 배분하려 합니다.'
      ],
      risks:[
        '직설적인 표현으로 주변이 위축될 수 있습니다.',
        '속도와 성과에 집중하다 감정적 여유를 놓칠 수 있습니다.',
        '실수나 약점을 드러내는 것을 두려워해 부담을 혼자 짊어질 수 있습니다.'
      ],
      remind:'핵심 지표 1개만 정하고, 팀과 함께 공유·조정하기.'
    }
  };

  /* ---------------- 그래프 (양쪽 비율) ---------------- */

  function axisRow(n, a, b, name){
    let va = n[a] ?? 0;
    let vb = n[b] ?? 0;
    let pa = Math.round(va*100);
    let pb = Math.round(vb*100);

    if(pa+pb === 0){
      pa = pb = 50;
    }else{
      const sum = pa+pb;
      pa = Math.round(pa/sum*100);
      pb = 100-pa;
    }

    const diff = Math.abs(va - vb);
    const dom  = va >= vb ? a : b;
    const diffWord = strengthWord(diff);

    return `
      <div class="axis-row">
        <div class="axis-header">
          <span class="axis-name"><b>${name}</b></span>
          <span class="axis-label">
            ${a} ${pa}% · ${b} ${pb}% 
            <span class="axis-diff">(${dom} 쪽 ${diffWord} 우세)</span>
          </span>
        </div>
        <div class="axis-bar">
          <span class="axis-fill axis-fill-a" style="width:${pa}%"></span>
          <span class="axis-fill axis-fill-b" style="width:${pb}%"></span>
        </div>
      </div>
    `;
  }

  function meters(n){
    return `
      <div class="state-meter mbti-meter">
        ${axisRow(n,'E','I','에너지 방향')}
        ${axisRow(n,'S','N','정보 인식')}
        ${axisRow(n,'T','F','판단 기준')}
        ${axisRow(n,'J','P','생활 양식')}
      </div>
    `;
  }

  /* ---------------- 결과 렌더 ---------------- */

  function finish(){
    card.style.display='none';
    bar.style.width='100%';

    const {letters, n} = decide();
    const info = COPY[letters] || {
      title:`${letters} — 밸런스형`,
      quote:'“상황에 맞게 균형을 잡는다.”',
      overview:[
        '네 축이 전체적으로 비슷한 힘을 가지고 있는 유형입니다.',
        '상황에 따라 필요한 모드를 유연하게 전환하는 편이에요.'
      ],
      strengths:[
        '한쪽 성향에 치우치지 않아 다양한 사람과 소통하기 쉽습니다.',
        '여러 관점을 비교하며 균형 잡힌 결정을 내리려 합니다.',
        '환경 변화에 맞춰 스스로를 조절하는 능력이 있습니다.'
      ],
      risks:[
        '“나는 어떤 사람인가”를 정의하기 어려워 느껴질 수 있습니다.',
        '결정 앞에서 오래 고민하며 에너지를 소모할 수 있습니다.',
        '주변의 목소리에 휘둘려 자기 기준을 잃지 않도록 주의가 필요합니다.'
      ],
      remind:'강점 1개만 골라, 오늘 실제 상황에 작게 적용해 보기.'
    };

    const overviewHtml = (info.overview || []).map(l=>`<span class="block">${l}</span>`).join('');
    const strengthsHtml = (info.strengths || []).join('<br>');
    const risksHtml = (info.risks || []).join('<br>');

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

        <p class="result-desc" style="margin:10px 0">
          ${overviewHtml}
        </p>

        <div class="result-section">
          <b>✅ 장점</b>
          <p>${strengthsHtml}</p>
        </div>

        <div class="result-section">
          <b>⚠️ 주의할 점</b>
          <p>${risksHtml}</p>
        </div>

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

  /* ---------------- 모드 선택 (큰 카드 + 미니 pill) ---------------- */

  function setMode(mode, fromMini = false){
    if(!QUESTION_SETS[mode]) return;

    // 검사 진행 중에 미니 pill로 전환 시 경고
    const hasProgress = idx > 0 || result.style.display === 'block';
    if(fromMini && hasProgress){
      const ok = window.confirm('검사 강도를 바꾸면 지금까지의 응답은 초기화되고 처음부터 다시 시작합니다.');
      if(!ok) return;
    }

    currentMode = mode;
    Q = QUESTION_SETS[mode].items;

    resetState();
    updateModeUI();
    render();

    // 강도 선택 카드 숨기고 테스트 영역 노출
    if(modeCard) modeCard.style.display = 'none';
    if(testWrap) testWrap.style.display = 'block';
  }

  // 첫 화면 큰 카드 선택
  if(modeCard){
    modeCard.addEventListener('click',(e)=>{
      const btn = e.target.closest('.mode-option');
      if(!btn) return;
      const mode = btn.dataset.mode || 'normal';
      setMode(mode,false);
    });
  }

  // 상단 미니 pill
  if(modeMini){
    modeMini.addEventListener('click',(e)=>{
      const btn = e.target.closest('.mode-pill');
      if(!btn) return;
      const mode = btn.dataset.mode;
      if(mode === currentMode) return;
      setMode(mode,true);
    });
  }

  // 기본값: 아직 아무것도 선택 안 한 상태이므로
  // modeCard만 보이고 테스트는 숨김 (HTML 기본 상태 유지).
  // 사용자가 강도 선택하면 setMode 내부에서 render() 호출됨.
});
