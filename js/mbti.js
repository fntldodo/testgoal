/* ===================================================
 * 몽실몽실 — MBTI 빠른 테스트 (v2025.2 마음 리마인드)
 * ---------------------------------------------------
 * • 12문항 · 5지선다(0~4)  전혀/아니다/보통/그렇다/매우그렇다
 * • 응답시간 가중치(±20%) — 선택 우선, 뒤엎지 않음
 * • 축: EI, SN, TF, JP  → 각 축 퍼센트로 상태라벨 표시(점수 노출 없음)
 * • 분류: 16유형(E/I + S/N + T/F + J/P)
 * • 중간값 편중 완화: 퍼센트 기반 + 소폭 분산 가중으로 경계 흔들림 감소
 * • 결과 카드: 제목·인용문·설명·감정상태 요약·마음 리마인드·퍼센트 바·버튼
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ---------- 문항(축별 균형 12개) ----------
  const Q = [
    {k:'EI', a:'E', q:'사람 많은 자리에서 에너지가 오른다.'},
    {k:'EI', a:'I', q:'혼자 있는 시간이 꼭 필요하다.'},
    {k:'EI', a:'E', q:'처음 본 사람에게 먼저 말을 거는 편이다.'},

    {k:'SN', a:'S', q:'사실·경험이 중요하다. 추상은 다소 답답하다.'},
    {k:'SN', a:'N', q:'가능성과 아이디어를 이야기하는 게 즐겁다.'},
    {k:'SN', a:'S', q:'새 정보는 구체적 예시가 있을 때 이해가 쉽다.'},

    {k:'TF', a:'T', q:'의사결정에서 논리/정확성이 우선이다.'},
    {k:'TF', a:'F', q:'사람들의 감정과 관계 영향을 먼저 본다.'},
    {k:'TF', a:'T', q:'논리적 모순을 보면 바로 잡고 싶다.'},

    {k:'JP', a:'J', q:'계획표/마감이 있어야 마음이 편하다.'},
    {k:'JP', a:'P', q:'상황 따라 즉흥적으로 움직이는 편이다.'},
    {k:'JP', a:'J', q:'할 일을 미리 정리하고 진행한다.'},
  ];

  // ---------- 상태 ----------
  let idx = 0;
  const score = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
  const count = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
  const ans   = [];
  const times = [];
  let startedAt = Date.now();

  // ---------- DOM ----------
  const stepLabel = document.getElementById('stepLabel');
  const barFill   = document.getElementById('barFill');
  const qText     = document.getElementById('qText');
  const wrap      = document.getElementById('choiceWrap');
  const card      = document.getElementById('card');
  const result    = document.getElementById('result');
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
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;

    const prevSel = ans[idx];
    if(prevSel !== undefined){
      Array.from(wrap.children).forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }

    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)), 140);
      });
    });

    startedAt = Date.now();
  }

  // ---------- 시간 가중치(보조) ----------
  function weight(sec){
    // 0.85 ~ 1.15 범위
    if (sec < 1)  return 0.90;
    if (sec < 4)  return 1.00;
    if (sec < 8)  return 1.12;
    return 1.08;
  }

  // ---------- 선택 처리 ----------
  function choose(s){
    const elapsed = (Date.now() - startedAt)/1000;
    times[idx] = elapsed;

    const dim = Q[idx]; // {k:'EI', a:'E' ...}
    const w   = weight(elapsed);
    const adj = s + (s * (w - 1) * 0.2); // 선택 우선, 시간은 ±20% 내 보조

    ans[idx] = s;
    score[dim.a] += adj;
    count[dim.a] += 1;

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
    recalcTo(idx);
    render();
  });

  skipBtn?.addEventListener('click', ()=>{
    ans[idx]   = 0;
    times[idx] = (Date.now() - startedAt)/1000;
    next();
  });

  function recalcTo(end){
    // reset
    Object.keys(score).forEach(k=>score[k]=0);
    Object.keys(count).forEach(k=>count[k]=0);
    for(let i=0;i<end;i++){
      const s = ans[i] ?? 0;
      const w = weight(times[i] ?? 0);
      const adj = s + (s * (w - 1) * 0.2);
      const {a} = Q[i];
      score[a] += adj;
      count[a] += 1;
    }
  }

  // ---------- 퍼센트 & 상태라벨 ----------
  function pctOf(leftKey, rightKey) {
    const maxL = (count[leftKey]  || 0) * 4;
    const maxR = (count[rightKey] || 0) * 4;
    const pL = maxL ? Math.round((score[leftKey]/maxL)*100) : 0;
    const pR = maxR ? Math.round((score[rightKey]/maxR)*100) : 0;
    return [clamp(pL), clamp(pR)];
  }
  function clamp(n){ return Math.max(0, Math.min(100, n)); }

  function stateWord(pair, side, p){
    // 상태 라벨(축별 톤)
    const L = side; // 'E','I' 등
    if(pair==='EI'){
      if(L==='E') return p>=70?'활발함':p>=50?'사교적':'조용-온화';
      return p>=70?'차분함':p>=50?'집중형':'외부지향';
    }
    if(pair==='SN'){
      if(L==='S') return p>=70?'현실감':'실용적';
      return p>=70?'통찰형':'상상력';
    }
    if(pair==='TF'){
      if(L==='T') return p>=70?'분석적':'합리적';
      return p>=70?'공감형':'배려적';
    }
    if(pair==='JP'){
      if(L==='J') return p>=70?'체계적':'계획적';
      return p>=70?'유연함':'즉흥적';
    }
    return p>=50?'높음':'보통';
  }

  // ---------- 분류(16유형) ----------
  function pickType(pairs){
    // pairs: {EI:[pE,pI], SN:[pS,pN], ...}
    // 소폭 분산 가중: 극단적이면 경계 흔들림 방지
    const decide = (pair, leftKey, rightKey) => {
      const [pL, pR] = pairs[pair];
      const diff = Math.abs(pL - pR);
      // 분산 가중(차이가 6 미만이면 살짝 강화)
      const boost = diff < 6 ? (pL>pR?+3:-3) : 0;
      return (pL + boost) >= pR ? leftKey : rightKey;
    };
    const EI = decide('EI','E','I');
    const SN = decide('SN','S','N');
    const TF = decide('TF','T','F');
    const JP = decide('JP','J','P');
    return EI+SN+TF+JP;
  }

  // ---------- 결과 카피 ----------
  const TYPE_COPY = {
    ENFP: {
      title:'🌈 ENFP — 아이디어 스파크러',
      quote:'“자유와 사람, 그리고 진심.”',
      text:`따뜻한 호기심으로 사람과 가능성을 잇는 타입. 순간의 영감을 현실로 옮길 때 가장 빛납니다.
종종 시작은 빠르고 마무리는 숨이 찰 수 있어요. 작은 루틴을 덧대면 에너지가 오래가요.`,
      remind:'오늘의 리마인드: 영감 노트 한 줄 → 15분 실험. “작게, 지금.”'
    },
    ENTP: {
      title:'⚡ ENTP — 변화 설계 토론가',
      quote:'“논리로 새 판을 짠다.”',
      text:`새로움을 향한 추진력과 아이디어 전개가 강점. 관점 전환으로 막힌 흐름을 풀어냅니다.
토론의 재미가 크다 보니, 감정의 온도를 1도 더 올려두면 더 많은 사람이 합류해요.`,
      remind:'오늘의 리마인드: “맞다/아니다”보다 “어떻게 하면”으로 한 번 더.'
    },
    ENFJ: {
      title:'☀️ ENFJ — 분위기 리더',
      quote:'“사람을 연결하는 다정한 추진력.”',
      text:`팀의 체온을 올리고 방향을 잡는 조율자. 공감과 실행을 함께 끌고 갑니다.
스스로의 마음도 일정에 포함하면 번아웃 없이 오래 가요.`,
      remind:'오늘의 리마인드: 나를 위한 10분 ‘감정 체크-쉼’ 타임.'
    },
    ENTJ: {
      title:'🚀 ENTJ — 추진력 전략가',
      quote:'“목표를 구조로 만든다.”',
      text:`판을 읽고 계획으로 옮기는 일에 탁월. 효율과 성장을 가속화합니다.
휴식도 전략입니다. 속도를 늦추면 시야가 더 넓어져요.`,
      remind:'오늘의 리마인드: “빠름 80% + 천천히 20%”의 균형.'
    },
    ESFP: {
      title:'🎉 ESFP — 현장 텐션업',
      quote:'“지금 이 순간이 무대.”',
      text:`현장에서 꽃피는 감각파. 사람들 사이에서 에너지가 충전됩니다.
리듬을 지키면 즐거움이 지치지 않아요.`,
      remind:'오늘의 리마인드: 즐김과 회복을 번갈아가며—25분 몰입/5분 숨 고르기.'
    },
    ESTP: {
      title:'🏃 ESTP — 액션 해결사',
      quote:'“생각보다 먼저 움직인다.”',
      text:`현장 대응, 빠른 판단이 강점. 몸으로 증명하며 길을 엽니다.
가끔은 ‘두 번째 생각’을 허락하면 실수가 줄어요.`,
      remind:'오늘의 리마인드: 실행 전 체크리스트 3칸만.'
    },
    ESFJ: {
      title:'🤝 ESFJ — 케어 코디',
      quote:'“함께를 따뜻하게.”',
      text:`팀의 안부를 챙기고 시스템으로 실용적 다정을 만듭니다.
나의 필요도 ‘돌봄’ 목록에 올려두면 지속 가능해요.`,
      remind:'오늘의 리마인드: “오늘 내 마음을 위한 1가지”.'
    },
    ESTJ: {
      title:'📋 ESTJ — 질서 설계자',
      quote:'“규칙과 실행의 기준점.”',
      text:`체계와 실행력으로 불확실성을 줄이는 타입. 모두가 안심하는 틀을 만듭니다.
때때로 놀라움 한 스푼이 팀에 활력을 줘요.`,
      remind:'오늘의 리마인드: 루틴 95% + 즉흥 5%.'
    },
    INFP: {
      title:'🌙 INFP — 마음 디자이너',
      quote:'“가치와 의미의 색채.”',
      text:`깊은 공감과 상상으로 세계를 물들이는 타입. 진심이 방향입니다.
현실의 작은 발걸음과 연결하면 더 멀리 가요.`,
      remind:'오늘의 리마인드: 의미 1문장 → 실행 1단계.'
    },
    INTP: {
      title:'🧩 INTP — 개념 탐험가',
      quote:'“구조와 원리를 파헤친다.”',
      text:`본질을 파고드는 분석가. 문제의 뼈대를 보는 눈이 탁월합니다.
결론 요약 습관을 들이면 설득력이 배가돼요.`,
      remind:'오늘의 리마인드: 탐색 끝에 “한 줄 결론” 남기기.'
    },
    INFJ: {
      title:'🌿 INFJ — 조용한 조율가',
      quote:'“깊이와 방향의 안내자.”',
      text:`사람과 흐름의 의미를 읽고 조용히 방향을 제시합니다.
나를 위한 경계도 부드럽게 표시해두면 편안해져요.`,
      remind:'오늘의 리마인드: “여기까지가 편해요”를 연습해보기.'
    },
    INTJ: {
      title:'🛰️ INTJ — 계획 건축가',
      quote:'“장기 플랜의 전략.”',
      text:`먼 곳을 바라보고 구조화하는 능력이 뛰어납니다.
완벽 대신 ‘충분히 괜찮음’을 택하면 추진력이 지속돼요.`,
      remind:'오늘의 리마인드: 80% 완성으로 출발, 나머지는 주행 중 보강.'
    },
    ISFP: {
      title:'🍃 ISFP — 부드러운 실천가',
      quote:'“따뜻하지만 자유롭게.”',
      text:`감수성과 실천이 만나는 지점에서 조용히 빛납니다.
작은 공간과 리듬을 지키면 표현이 더 풍성해져요.`,
      remind:'오늘의 리마인드: 나만의 15분 작업-존 만들기.'
    },
    ISTP: {
      title:'🛠️ ISTP — 조용한 해결사',
      quote:'“손으로 증명하는 분석 실용가.”',
      text:`문제 핵심을 빠르게 파악하고 조용히 해결하는 타입.
완료 공유 한 줄만 더하면 팀이 안심해요.`,
      remind:'오늘의 리마인드: “끝났습니다: 요약 1줄”.'
    },
    ISFJ: {
      title:'🏠 ISFJ — 든든한 보호자',
      quote:'“성실의 디테일.”',
      text:`사소함을 소중히 다루어 큰 신뢰를 만드는 타입.
스스로에게도 같은 다정을 나눠주세요.`,
      remind:'오늘의 리마인드: 내 마음 체크리스트 맨 위에 “나”.'
    },
    ISTJ: {
      title:'🧭 ISTJ — 원칙 수호자',
      quote:'“안정의 기준점.”',
      text:`원칙과 정밀함으로 흐름을 안정시키는 타입.
변화는 작은 단위로 나누면 매끈하게 스며듭니다.`,
      remind:'오늘의 리마인드: 변화 1단위(10%)만 적용해보기.'
    },
  };

  // ---------- 카드 컴포넌트 ----------
  function pairBar(titleLeft, pLeft, titleRight, pRight) {
    const leftLabel  = `${titleLeft} · ${stateWord(mapLabel(titleLeft,titleRight), mapSide(titleLeft,titleRight,true), pLeft)}`;
    const rightLabel = `${titleRight} · ${stateWord(mapLabel(titleLeft,titleRight), mapSide(titleLeft,titleRight,false), pRight)}`;
    return `
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:8px">
      <div>
        <div style="display:flex;justify-content:space-between;font-weight:700">
          <span>${titleLeft}</span><span>${pLeft}%</span>
        </div>
        <div style="height:8px;background:var(--mint-200);border-radius:999px;overflow:hidden">
          <span style="display:block;height:100%;width:${pLeft}%;background:var(--mint-500)"></span>
        </div>
        <div style="color:var(--text-soft);font-size:12px;margin-top:4px">${leftLabel}</div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;font-weight:700">
          <span>${titleRight}</span><span>${pRight}%</span>
        </div>
        <div style="height:8px;background:var(--mint-200);border-radius:999px;overflow:hidden;direction:rtl">
          <span style="display:block;height:100%;width:${pRight}%;background:var(--mint-400)"></span>
        </div>
        <div style="color:var(--text-soft);font-size:12px;margin-top:4px;text-align:right">${rightLabel}</div>
      </div>
    </div>`;
  }
  function mapLabel(L, R){
    const key = L+R;
    if(key==='외향성내향성'||key==='내향성외향성') return 'EI';
    if(key==='현실감통찰'||key==='통찰현실감')     return 'SN';
    if(key==='분석공감'||key==='공감분석')         return 'TF';
    if(key==='계획유연'||key==='유연계획')         return 'JP';
    return 'EI';
  }
  function mapSide(L,R,isLeft){
    // 매핑용(상태라벨에 쓰는 축 키)
    const pair = mapLabel(L,R);
    if(pair==='EI') return isLeft?'E':'I';
    if(pair==='SN') return isLeft?'S':'N';
    if(pair==='TF') return isLeft?'T':'F';
    if(pair==='JP') return isLeft?'J':'P';
  }

  function finish(){
    card.style.display='none';
    barFill.style.width='100%';

    const [pE,pI] = pctOf('E','I');
    const [pS,pN] = pctOf('S','N');
    const [pT,pF] = pctOf('T','F');
    const [pJ,pP] = pctOf('J','P');

    const pairs = {EI:[pE,pI], SN:[pS,pN], TF:[pT,pF], JP:[pJ,pP]};
    const code  = pickType(pairs);
    const info  = TYPE_COPY[code] || {
      title:'☁️ 몽실형',
      quote:'“함께 맞춰가요.”',
      text:'아주 미세한 차이로 경계에 있는 결과예요. 몇 문항만 바꿔도 다른 얼굴이 보일 수 있어요.',
      remind:'오늘의 리마인드: “나는 어떤 리듬에서 편안하지?” 한 줄로 적어보기.'
    };

    // 감정상태 요약(상위 성향 2개 조합 묘사)
    const mood = (() => {
      // 각 축에서 더 높은 쪽 키를 기록해 Top2 묘사
      const dims = [
        ['외향성','내향성',pE,pI,'EI'],
        ['현실감','통찰',  pS,pN,'SN'],
        ['분석',  '공감',  pT,pF,'TF'],
        ['계획',  '유연',  pJ,pP,'JP'],
      ].map(([L,R,PL,PR,key]) => {
        const tag = (PL>=PR)?L:R;
        const pct = (PL>=PR)?PL:PR;
        return {tag, pct, key};
      }).sort((a,b)=>b.pct-a.pct);

      const top2 = dims.slice(0,2).map(d=>d.tag).join(' · ');
      const table = {
        '외향성':'활력이 밖으로 잘 흐르는 날',
        '내향성':'깊은 집중이 쉬운 날',
        '현실감':'현실 감각이 선명한 날',
        '통찰':'그림을 크게 보는 날',
        '분석':'정확함이 중요한 날',
        '공감':'마음결이 먼저 보이는 날',
        '계획':'루틴이 편안한 날',
        '유연':'여백이 아이디어를 부르는 날'
      };
      const line1 = top2;
      const line2 = table[dims[0].tag] || '균형이 포근하게 유지되는 날';
      return `${line1}\n${line2}`;
    })();

    result.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/mbti.png" alt="MBTI 아이콘" onerror="this.style.display='none'">
          <div>
            <div class="result-title">나의 MBTI: <b>${code}</b></div>
            <div class="result-desc">“${info.quote}”</div>
          </div>
        </div>

        <p style="margin:10px 0; white-space:pre-line">${info.text}</p>

        <div class="pill" style="margin:6px 0; white-space:pre-line">${mood}</div>

        ${pairBar('외향성', pE, '내향성', pI)}
        ${pairBar('현실감', pS, '통찰',   pN)}
        ${pairBar('분석',   pT, '공감',   pF)}
        ${pairBar('계획',   pJ, '유연',   pP)}

        <div class="result-hint" style="margin-top:10px">
          <div class="pill">🌿 마음 리마인드</div>
          <p style="margin:6px 0">${info.remind}</p>
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;
    result.style.display='block';
  }

  // 시작
  render();
});