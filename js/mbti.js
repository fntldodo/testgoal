/* ===================================================
 * MBTI 빠른 테스트 — v2025.3
 * - 5지선다(0~4) + 응답시간 보조 ±20% (선택 우선, 뒤엎지 않음)
 * - 축: E/I, S/N, T/F, J/P
 * - 강도 모드: 라이트(8문항) / 보통(12문항) / 심화(24문항 예정)
 * - 숫자 점수 직접 노출 금지(퍼센트는 라벨과 함께 보조만)
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('layout-v2');
  document.body.setAttribute('data-theme','fun');

  /* ---------- 0. 강도 모드 ---------- */
  const MODE_META = {
    light:  { label: '라이트 · 8문항' , len: 8  },
    normal: { label: '보통 · 12문항', len: 12 },
    deep:   { label: '심화 · 24문항', len: 24 },
  };
  let MODE = 'normal';

  const modeCard   = document.getElementById('modeCard');
  const modeLight  = document.getElementById('modeLight');
  const modeNormal = document.getElementById('modeNormal');
  const modeDeep   = document.getElementById('modeDeep');
  const modeLabel  = document.getElementById('modeLabel');
  const metaBox    = document.getElementById('metaBox');

  /* ---------- 1. 문항 세트 ---------- */
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

  // 라이트: 축당 2문항 (총 8문항)
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

  // 심화: 자리만 잡아둔 상태 (추후 실제 24문항으로 교체)
  const Q_DEEP = [...Q_BASE, ...Q_BASE];

  // 현재 사용 문항
  let Q = Q_BASE;

  /* ---------- 2. 상태 ---------- */
  let idx=0, start=Date.now();
  const ans=[], times=[];
  const accum = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
  const count = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};

  /* ---------- 3. DOM ---------- */
  const step  = document.getElementById('stepLabel');
  const bar   = document.getElementById('barFill');
  const qText = document.getElementById('qText');
  const wrap  = document.getElementById('choiceWrap');
  const card  = document.getElementById('card');
  const result= document.getElementById('result');
  const prev  = document.getElementById('prev');
  const skip  = document.getElementById('skip');

  // 처음엔 질문/진행률 숨김
  card.style.display   = 'none';
  metaBox.style.display= 'none';
  result.style.display = 'none';
  bar.style.width      = '0%';

  /* ---------- 4. 공통 ---------- */
  function weight(sec){
    if(sec<1) return 0.9;
    if(sec<4) return 1.0;
    if(sec<8) return 1.15;
    return 1.10;
  }

  function resetState(){
    idx=0; start=Date.now();
    ans.length=0; times.length=0;
    for(const k in accum) accum[k]=0;
    for(const k in count) count[k]=0;
  }

  /* ---------- 5. 렌더 ---------- */
  function render(){
    step.textContent = `${idx+1} / ${Q.length}`;
    bar.style.width  = `${(idx/Q.length)*100}%`;
    qText.textContent= Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>`;

    const prevSel = ans[idx];
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

    start = Date.now();
  }

  /* ---------- 6. 선택 ---------- */
  function choose(s){
    const sec=(Date.now()-start)/1000, w=weight(sec);
    const adj = s + (s*(w-1)*0.2);
    const {axis,p} = Q[idx];

    const a1=axis[0], a2=axis[1];
    if(p === a1){
      accum[a1]+=adj; count[a1]+=1; count[a2]+=1;
    }else{
      accum[a2]+=adj; count[a2]+=1; count[a1]+=1;
    }

    ans[idx]=s; times[idx]=sec;
    next();
  }

  function next(){
    idx++;
    if(idx<Q.length) render();
    else finish();
  }

  /* ---------- 7. 이전/건너뛰기 ---------- */
  prev?.addEventListener('click',()=>{
    if(idx===0) return;
    idx--;
    for(const k in accum) accum[k]=0;
    for(const k in count) count[k]=0;
    for(let i=0;i<idx;i++){
      const sec=times[i]??3, s=ans[i]??0, w=weight(sec);
      const adj = s + (s*(w-1)*0.2);
      const {axis,p} = Q[i]; const a1=axis[0], a2=axis[1];
      if(p===a1){accum[a1]+=adj; count[a1]+=1; count[a2]+=1;}
      else      {accum[a2]+=adj; count[a2]+=1; count[a1]+=1;}
    }
    render();
  });

  skip?.addEventListener('click',()=>{
    ans[idx]=0; times[idx]=(Date.now()-start)/1000;
    next();
  });

  /* ---------- 8. 점수 → 0~1 ---------- */
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
    const E=norm('E'), I=norm('I');
    const S=norm('S'), N=norm('N');
    const T=norm('T'), F=norm('F');
    const J=norm('J'), P=norm('P');

    function pick(a,b,axisKey){
      if(Math.abs(a-b) >= 0.05) return a>=b ? axisKey[0] : axisKey[1];
      let d=0;
      for(let i=Math.max(0,Q.length-3); i<Q.length; i++){
        if(Q[i].axis !== axisKey) continue;
        const sec=times[i]??3, w=weight(sec), s=ans[i]??0;
        const mag=(s>=3?1:(s===2?0.3:0.1));
        d += (Q[i].p===axisKey[0]?1:-1)*w*mag;
      }
      return d>=0 ? axisKey[0] : axisKey[1];
    }

    const e=pick(E,I,'EI');
    const s=pick(S,N,'SN');
    const t=pick(T,F,'TF');
    const j=pick(J,P,'JP');

    return { letters:`${e}${s}${t}${j}`, n:{E,I,S,N,T,F,J,P} };
  }

  /* ---------- 9. 16유형 카피 (desc 확장 버전) ---------- */
  const COPY={
    ISTJ:{
      title:'ISTJ — 신중한 빌더',
      quote:'“차근차근, 정확하게.”',
      desc:'현실감각이 뛰어나고 책임감이 강한 유형입니다. 약속과 규칙을 잘 지키고, 맡은 일을 끝까지 해내려는 힘이 큽니다. 감정에 흔들리기보다는 사실과 근거를 먼저 확인하는 편이에요. 그래서 주변 사람들에게 “믿고 맡길 수 있는 사람”이라는 인상을 자주 줍니다. 단, 스스로에게 너무 엄격해 지치지 않도록 작은 여유를 남겨두는 것이 중요합니다.',
      remind:'큰일을 작은 체크포인트로 쪼개고, 완료마다 스스로 칭찬하기.'
    },
    ISFJ:{
      title:'ISFJ — 따뜻한 지킴이',
      quote:'“조용히, 하지만 끝까지.”',
      desc:'다른 사람의 필요와 감정을 세심하게 살피는 돌봄형 유형입니다. 앞에 나서기보다는 뒤에서 안정적으로 받쳐줄 때 힘이 나요. 작은 습관과 루틴을 지키며 주변 환경을 편안하게 만드는 데 강점이 있습니다. 그래서 사람들이 자연스럽게 고민을 털어놓고 의지하게 됩니다. 다만 남을 챙기느라 내 마음을 뒤로 미루지 않도록 “나만의 시간”을 꼭 챙겨야 합니다.',
      remind:'내 몫의 휴식도 일정에 포함시키기.'
    },
    INFJ:{
      title:'INFJ — 통찰형 조율가',
      quote:'“깊이 이해하고 바르게 이끌기.”',
      desc:'표면보다 그 뒤에 숨어 있는 의미와 흐름을 읽는 능력이 좋습니다. 사람과 상황을 깊이 이해하려 하고, 모두가 조금 더 나은 방향으로 가도록 돕고 싶어 해요. 말수는 적어도 한마디를 할 때 신중하게 고르는 편입니다. 그래서 가까운 사람들에게는 의외로 강한 영향력을 가진 조용한 리더가 되기도 합니다. 스스로의 이상을 현실과 연결하는 작은 실험을 반복할수록 만족감이 커집니다.',
      remind:'이상과 현실의 교차점을 작은 실험으로 확인하기.'
    },
    INTJ:{
      title:'INTJ — 전략가',
      quote:'“구조화된 혁신.”',
      desc:'머릿속에 장기적인 그림을 그리고, 그걸 현실로 옮기는 방법을 고민합니다. 비효율을 보면 자연스럽게 구조를 재설계하고 싶어져요. 논리와 독립성이 강해서 혼자서도 잘 해내지만, 같은 방향을 보는 사람과 함께할 때 더 큰 시너지가 납니다. 감정 표현이 적어 차갑게 보일 수 있지만, 사실은 목표와 효율에 집중해 있는 경우가 많습니다. 계획을 완벽하게 다 세우기 전에 작은 버전부터 실행하면 속도가 한층 빨라집니다.',
      remind:'완벽보다 실행 — MVP로 가설 검증부터.'
    },

    ISTP:{
      title:'ISTP — 실전 해결사',
      quote:'“직접 만져보면 답이 보인다.”',
      desc:'머리로만 아는 것보다 직접 다뤄보고 익히는 것을 선호합니다. 위기 상황에서도 비교적 침착하게 핵심 문제를 찾는 편이에요. 자유와 자율성을 중요하게 여겨 간섭이 심한 환경에서는 금방 지칩니다. 관심 있는 분야에서는 놀라운 집중력을 보이지만, 의미를 못 느끼면 쉽게 흥미를 잃기도 합니다. 내가 이미 알고 있는 기술을 작은 프로젝트로 연결하면 성취감이 빠르게 쌓입니다.',
      remind:'혼자 해결 후 공유 루틴 만들기(5줄 요약).'
    },
    ISFP:{
      title:'ISFP — 따뜻한 장인',
      quote:'“감각으로 전하는 진심.”',
      desc:'조용하지만 마음속에는 따뜻한 가치관과 아름다움에 대한 기준이 뚜렷합니다. 말로 길게 설명하기보다는 행동과 분위기로 진심을 표현하는 편이에요. 나와 맞는 사람, 나와 맞는 환경을 만났을 때 잠재력이 크게 살아납니다. 억지로 경쟁해야 하는 구조보다는, 각자의 속도를 존중하는 곳에서 더 빛납니다. 작은 결과물이라도 세상과 나누면 스스로의 가치를 더 선명하게 느낄 수 있습니다.',
      remind:'작은 작품도 공개하고 피드백 받기.'
    },
    INFP:{
      title:'INFP — 의미 탐색가',
      quote:'“가치에 맞게, 나답게.”',
      desc:'내면의 가치와 이야기성을 중요하게 생각하는 유형입니다. 겉으로 평온해 보여도 마음속에서는 끊임없이 “이게 정말 나다운가?”를 묻고 있어요. 사람이나 일에 쉽게 깊이 빠져들지만, 가치가 어긋난다고 느끼면 갑자기 열정이 식기도 합니다. 상상력과 공감력이 풍부해서 글, 그림, 상담, 기획 등 스토리가 필요한 영역에서 강점을 보입니다. 머릿속에만 두지 말고 작은 행동 하나로 연결할 때 자존감이 자연스럽게 올라갑니다.',
      remind:'가치-행동 1:1 매칭으로 오늘 한 가지 실천.'
    },
    INTP:{
      title:'INTP — 개념 엔지니어',
      quote:'“원리부터 이해한다.”',
      desc:'현상을 보면 “왜 그런가?”부터 파고드는 분석형 유형입니다. 아이디어와 이론을 자유롭게 조합하면서, 머릿속에서 새로운 모델을 만들어내는 걸 즐겨요. 실전보다 생각이 앞서 나갈 때가 많아서, 주변에서는 때때로 “현실감이 없다”고 느낄 수도 있습니다. 하지만 한 번 관심을 가진 주제에 대해서는 깊고 독창적인 통찰을 제공합니다. 개념을 실제 예시와 연결하는 연습을 할수록 영향력이 훨씬 커집니다.',
      remind:'개념을 예시 3개로 바꿔 설명해보기.'
    },

    ESTP:{
      title:'ESTP — 즉흥 실행가',
      quote:'“지금, 여기에서.”',
      desc:'상황 판단이 빠르고 행동력이 강한 유형입니다. 머뭇거리기보다는 직접 부딪쳐 보면서 배우는 쪽을 선호해요. 위기 순간에도 비교적 침착하게 해결책을 찾는 편이라, 현장에서 일어나는 문제에 강합니다. 다만 재미와 자극을 좇다 보면 장기 계획이 느슨해질 수 있습니다. 하고 싶은 일에 최소한의 안전장치와 체크포인트만 더해도 성과가 크게 안정됩니다.',
      remind:'즉흥+안전: 체크포인트 2개 세우고 Go.'
    },
    ESFP:{
      title:'ESFP — 분위기 메이커',
      quote:'“함께할 때 더 반짝.”',
      desc:'사람들 사이에서 자연스럽게 분위기를 띄우고 생기를 더하는 유형입니다. 새로운 경험과 즐거운 자극을 좋아해서, 일상의 작은 이벤트도 금방 만들어냅니다. 감각이 발달해 현장의 공기를 잘 읽고, 상대방을 편안하게 만드는 능력이 뛰어납니다. 하지만 남의 기대를 맞추느라 자기 에너지를 과하게 쓰면 금방 탈진할 수 있습니다. 즐거움과 휴식의 리듬을 스스로 조절할 수 있을 때 가장 오래 반짝입니다.',
      remind:'재미와 휴식의 리듬을 가볍게 고정.'
    },
    ENFP:{
      title:'ENFP — 아이디어 스파크',
      quote:'“가능성에 불붙이기.”',
      desc:'사람과 아이디어를 연결하는 데 천부적인 재능이 있습니다. 새로운 가능성을 발견하면 에너지가 치솟고, 주변 사람들을 함께 움직이게 만드는 힘이 커요. 시작은 빠르지만, 흥미가 식으면 마무리가 느려질 수 있다는 점이 과제입니다. 감정과 직관이 풍부해 공감 능력도 뛰어나지만, 동시에 에너지 기복도 크게 느낄 수 있습니다. 떠오르는 아이디어 중 단 하나만 골라 짧게라도 실행해보면 만족감이 훨씬 커집니다.',
      remind:'아이디어 1개를 24시간 내 시범 운행.'
    },
    ENTP:{
      title:'ENTP — 변주형 창조가',
      quote:'“다르게 보기, 새로 만들기.”',
      desc:'기존의 틀을 그대로 두기보다는 “이걸 왜 이렇게 하지?”라고 질문하는 유형입니다. 토론과 브레인스토밍을 즐기고, 다양한 관점을 오가며 해결책을 찾는 데 능숙해요. 변화를 두려워하지 않아 혁신을 이끌지만, 너무 많은 시도 때문에 주변을 피곤하게 만들 수 있습니다. 논리와 재치를 동시에 사용해 사람들을 설득하는 능력도 큽니다. 아이디어를 실제 실행 단계까지 가져가기 위해, 최소한의 우선순위와 마감만 정해두면 좋습니다.',
      remind:'반대 시나리오도 1개 작성해 리스크 점검.'
    },

    ESTJ:{
      title:'ESTJ — 운영 캡틴',
      quote:'“체계적으로 밀어붙인다.”',
      desc:'목표를 정하고 그에 맞는 계획과 규칙을 세우는 데 강한 유형입니다. 일의 흐름이 정돈되어 있을수록 마음이 편안해지고, 실행 속도도 빨라집니다. 책임감이 강해 팀을 이끌며 결과를 만들어내는 역할을 자주 맡게 됩니다. 다만 속도가 빠른 만큼, 주변의 감정 속도를 놓칠 때가 있을 수 있어요. 규칙과 함께 “예외를 허용하는 기준”을 같이 설계하면 리더십이 한층 부드러워집니다.',
      remind:'규칙과 예외 규칙을 함께 설계.'
    },
    ESFJ:{
      title:'ESFJ — 따뜻한 코디네이터',
      quote:'“함께 가는 길.”',
      desc:'사람들 사이의 분위기와 관계를 세심하게 챙기는 유형입니다. 누가 소외되지는 않았는지, 모두가 편안한지 자연스럽게 살펴요. 조직이나 모임에서 실무와 사람 관리 사이를 매끄럽게 연결하는 데 강점이 있습니다. 다만 갈등을 피하려다가 내 마음을 너무 뒤로 미뤄둘 수 있습니다. 돌봄과 자기돌봄의 비율을 주기적으로 점검하면 지치는 일을 줄일 수 있습니다.',
      remind:'돌봄-자기돌봄 비율을 주간 점검.'
    },
    ENFJ:{
      title:'ENFJ — 영감형 리더',
      quote:'“가능성을 사람과 함께.”',
      desc:'타인의 잠재력을 발견하고, 그 가능성을 믿어주는 데 큰 기쁨을 느낍니다. 사람들의 생각과 감정을 읽어내며, 모두가 함께 성장할 수 있는 방향을 설계하는 데 능숙해요. 말과 행동이 일치할 때 신뢰가 빠르게 쌓이는 스타일입니다. 대신 스스로에게 너무 높은 기준을 적용해 부담을 과하게 짊어질 수 있습니다. 격려와 피드백을 분리해 전달하면 관계도, 리더십도 더 안정적으로 유지됩니다.',
      remind:'격려와 피드백을 분리해 전달하기.'
    },
    ENTJ:{
      title:'ENTJ — 지휘 전략가',
      quote:'“큰 그림을 실행으로.”',
      desc:'목표를 보면 자연스럽게 자원, 사람, 시간 순으로 계획을 세우는 유형입니다. 복잡한 상황에서도 구조를 빠르게 파악해 우선순위를 정하는 능력이 뛰어납니다. 추진력이 강해 주변을 강하게 끌고 가기도 하지만, 그만큼 결과에 대한 책임도 본인이 크게 짊어집니다. 감정보다 효율을 우선하다 보면 관계의 미세한 신호를 놓칠 수 있으니, 의도와 방식의 균형이 중요합니다. 핵심 지표 한두 개만 명확히 정해 팀과 공유하면 에너지가 한 방향으로 모입니다.',
      remind:'지표 1개만 정하고 팀과 공유.'
    },
  };

  /* ---------- 10. 그래프 ---------- */
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

  /* ---------- 11. 결과 ---------- */
  function finish(){
    card.style.display='none';
    bar.style.width='100%';

    const {letters, n} = decide();
    const info = COPY[letters] || {
      title:`${letters} — 밸런스형`,
      quote:'“상황에 맞게 균형을 잡는다.”',
      desc:'축 간 균형이 좋아 유연하게 전환합니다. 상황에 따라 필요한 역할을 골라 쓰는 능력이 큰 편입니다. 다만 나만의 기준을 잃지 않도록, 지금 내가 중요하게 여기는 가치를 가끔 정리해 두면 좋습니다.',
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

  /* ---------- 12. 강도 선택 적용 ---------- */
  function applyMode(newMode){
    MODE = newMode;
    Q = MODE==='light' ? Q_LIGHT :
        MODE==='deep'  ? Q_DEEP  : Q_BASE;

    // 버튼 selected 토글
    [modeLight, modeNormal, modeDeep].forEach(b=>b?.classList.remove('selected'));
    if(MODE==='light') modeLight?.classList.add('selected');
    else if(MODE==='deep') modeDeep?.classList.add('selected');
    else modeNormal?.classList.add('selected');

    if(modeLabel) modeLabel.textContent = MODE_META[MODE].label;

    // 상태 초기화 + 화면 전환
    resetState();
    modeCard.classList.add('hidden');
    modeCard.style.display = 'none';
    metaBox.style.display  = 'flex';
    card.style.display     = 'block';
    result.style.display   = 'none';
    render();
  }

  modeLight?.addEventListener('click', ()=>applyMode('light'));
  modeNormal?.addEventListener('click', ()=>applyMode('normal'));
  modeDeep?.addEventListener('click', ()=>applyMode('deep'));

  // 자동 시작 X : 반드시 사용자가 모드 선택 후 시작
});
