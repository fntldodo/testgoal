/* ===================================================
 * MBTI 빠른 테스트 — 몽실몽실 v2025.2 (마음 리마인드)
 * ---------------------------------------------------
 * - 12문항 / 5지선다(0~4)
 * - 응답시간 가중치(±20%)는 '보조'만, 선택 우선
 * - 결과 UI: 제목/인용문/설명/감정상태 요약/마음 리마인드/축별 막대/버튼
 * - 숫자 점수나 %는 화면에 직접 노출하지 않음(막대만)
 * =================================================== */

(function(){
  // 12문항 (각 축 3문항)
  const Q = [
    // E–I
    {k:'EI', a:'E', q:'사람 많은 자리에서 에너지가 오른다.'},
    {k:'EI', a:'I', q:'혼자 있는 시간이 꼭 필요하다.'},
    {k:'EI', a:'E', q:'처음 본 사람에게 먼저 말을 거는 편이다.'},
    // S–N
    {k:'SN', a:'S', q:'사실·경험이 중요하다. 추상은 다소 답답하다.'},
    {k:'SN', a:'N', q:'가능성과 아이디어를 이야기하는 게 즐겁다.'},
    {k:'SN', a:'S', q:'새 정보는 구체적인 예시가 있을 때 이해가 쉽다.'},
    // T–F
    {k:'TF', a:'T', q:'의사결정에서 논리/정확성이 우선이다.'},
    {k:'TF', a:'F', q:'사람들의 감정과 관계 영향을 먼저 본다.'},
    {k:'TF', a:'T', q:'논리적 모순을 보면 바로잡고 싶다.'},
    // J–P
    {k:'JP', a:'J', q:'계획표/마감이 있어야 마음이 편하다.'},
    {k:'JP', a:'P', q:'상황 따라 즉흥적으로 움직이는 편이다.'},
    {k:'JP', a:'J', q:'할 일을 미리 정리하고 진행한다.'},
  ];

  let idx=0;
  const score={E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
  const counts={E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
  const ans=[], times=[];
  let startTime=Date.now();

  // DOM
  const stepLabel=document.getElementById('stepLabel');
  const barFill=document.getElementById('barFill');
  const qText=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const card=document.getElementById('card');
  const result=document.getElementById('result');
  const prevBtn=document.getElementById('prev');
  const skipBtn=document.getElementById('skip');

  function render(){
    stepLabel.textContent=`${idx+1} / ${Q.length}`;
    barFill.style.width=`${(idx/Q.length)*100}%`;
    qText.textContent=Q[idx].q;

    wrap.innerHTML=`
      <button class="choice" data-s="4">매우 그렇다</button>
      <button class="choice" data-s="3">그렇다</button>
      <button class="choice" data-s="2">보통이다</button>
      <button class="choice ghost" data-s="1">아니다</button>
      <button class="choice ghost" data-s="0">전혀 아니다</button>
    `;

    const prevSel = ans[idx];
    if(prevSel!==undefined){
      Array.from(wrap.children).forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }

    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),180);
      });
    });

    startTime=Date.now();
  }

  function choose(s){
    const elapsed=(Date.now()-startTime)/1000;
    times[idx]=elapsed;

    const axis=Q[idx].a;
    const w=getWeight(elapsed, axis); // 0.8~1.2 보조
    ans[idx]=s;

    const adjusted = s + (s*(w-1)*0.2); // 선택 우선, 시간 보조
    score[axis]+=adjusted;
    counts[axis]+=1;

    next();
  }

  function next(){ idx++; if(idx<Q.length) render(); else finish(); }

  prevBtn?.addEventListener('click', ()=>{
    if(idx===0) return;
    idx--;
    recalcTo(idx);
    render();
  });

  skipBtn?.addEventListener('click', ()=>{
    ans[idx]=0;
    times[idx]=(Date.now()-startTime)/1000;
    next();
  });

  function getWeight(sec, a){
    let w=1.0;
    if(sec<1) w=0.9;
    else if(sec<4) w=1.0;
    else if(sec<8) w=1.15;
    else w=1.1;
    // 축별 미세 보정(선택 뒤엎지 않음)
    if((a==='E'||a==='T'||a==='J') && sec<2) w*=1.05; // 빠른 즉응 = 외향/사고/판단 약 +5%
    if((a==='I'||a==='F'||a==='P') && sec>=4) w*=1.05; // 숙고형 = 내향/감정/인식 약 +5%
    return Number(w.toFixed(2));
  }

  function recalcTo(end){
    for(const k of Object.keys(score)) { score[k]=0; counts[k]=0; }
    for(let i=0;i<end;i++){
      const s=ans[i] ?? 0;
      const a=Q[i].a;
      const w=getWeight(times[i] ?? 0, a);
      const adjusted = s + (s*(w-1)*0.2);
      score[a]+=adjusted;
      counts[a]+=1;
    }
  }

  function mbtiCode(sc){
    const EI = (sc.E>=sc.I)?'E':'I';
    const SN = (sc.S>=sc.N)?'S':'N';
    const TF = (sc.T>=sc.F)?'T':'F';
    const JP = (sc.J>=sc.P)?'J':'P';
    return EI+SN+TF+JP;
  }

  /* ---------- 결과 카피(16유형) ---------- */
  const COPY={
    ENFP:{title:'🌈 ENFP — 아이디어 스파크러',quote:'"가능성은 늘 문 너머에!"',
      desc:'사람과 가능성을 사랑하는 낙관적 탐험가. 새롭고 의미 있는 연결을 만들 때 에너지가 폭발합니다. 다만 시작이 많아 흐트러지기 쉬우니, “작은 마감”을 쌓아 완주 근육을 길러보세요.'},
    ENTP:{title:'⚡ ENTP — 변화 설계 토론가',quote:'"생각의 판을 뒤집어 보자!"',
      desc:'논리와 유머로 새 구조를 만드는 발명가형. 토론을 통해 더 날카로워집니다. 과잉 아이디어는 우선순위 3개로 정리하면 추진력이 배가됩니다.'},
    ENFJ:{title:'☀️ ENFJ — 분위기 리더',quote:'"우리 함께 올라가요."',
      desc:'사람의 잠재력을 믿고 끌어올리는 조율가. 관계의 온도를 안정적으로 유지합니다. 자기 돌봄 시간을 루틴에 넣으면 퍼주는 마음이 오래 갑니다.'},
    ENTJ:{title:'🚀 ENTJ — 추진 전략가',quote:'"목표는 계획으로, 계획은 실행으로."',
      desc:'큰그림과 실행 설계에 강한 리더. 결정이 빠르고 명확합니다. 속도를 유지하되, 팀의 감정 신호도 가볍게 체크하면 충돌이 줄어듭니다.'},

    ESFP:{title:'🎉 ESFP — 현장 텐션업',quote:'"지금 이 순간을 살자!"',
      desc:'감각과 즐거움의 메이커. 사람들 속에서 빛이 납니다. 즉흥성과 책임의 균형을 위해 “소소한 약속 관리”만 챙겨도 신뢰가 크게 올라가요.'},
    ESTP:{title:'🏃 ESTP — 액션 해결사',quote:'"움직이면 길이 보인다!"',
      desc:'현장 적응력이 뛰어난 실전가. 위기에도 침착합니다. 장기 목표를 짧은 체크포인트로 나누면 완주력이 안정됩니다.'},
    ESFJ:{title:'🤝 ESFJ — 케어 코디',quote:'"함께하면 더 나아져요."',
      desc:'세심한 보살핌으로 팀의 체온을 지키는 실용형 다정가. 자신의 피로 신호도 캘린더에 기록하면 번아웃을 예방할 수 있어요.'},
    ESTJ:{title:'📋 ESTJ — 질서 설계자',quote:'"규칙이 자유를 만든다."',
      desc:'체계와 실행으로 신뢰를 주는 운영자. 명확한 역할 분담에 강합니다. 가끔은 “실험의 날”을 넣어 유연성을 확장해보세요.'},

    INFP:{title:'🌙 INFP — 마음 디자이너',quote:'"가치가 길을 만든다."',
      desc:'의미와 진정성을 중시하는 이상가. 홀로 깊이 몰입할 때 창의가 피어납니다. 가벼운 공유 습관을 만들면 영향력이 자연히 확장돼요.'},
    INTP:{title:'🧩 INTP — 개념 탐험가',quote:'"원리를 이해하면 다 보인다."',
      desc:'구조와 논리에 몰입하는 분석가. 완벽주의로 멈추기 쉬우니, 70% 공개-피드백-개선 루프를 써보세요.'},
    INFJ:{title:'🌿 INFJ — 조용한 조율가',quote:'"깊이를 잃지 않으며 방향을 찾자."',
      desc:'통찰과 공감의 결로 방향을 제시합니다. 에너지 보호를 위해 1:1 깊은 대화와 혼자만의 회복 시간을 번갈아 배치해 보세요.'},
    INTJ:{title:'🛰️ INTJ — 계획 건축가',quote:'"장기 플랜, 정교한 실행."',
      desc:'전략과 시스템 설계에 강한 독립형. 협업 온도를 위해 감정 신호 1줄 메모-리플을 습관화하면 마찰이 줄어듭니다.'},

    ISFP:{title:'🍃 ISFP — 따뜻한 실천가',quote:'"조용히, 그러나 진심으로."',
      desc:'섬세한 미감과 다정함으로 주변을 편안하게 만듭니다. 마감 압박을 줄여주는 “작은 한 걸음” 계획이 잘 맞아요.'},
    ISTP:{title:'🛠️ ISTP — 조용한 해결사',quote:'"손으로 증명한다."',
      desc:'문제 분해-수정에 강한 실용가. 설명보다 프로토타입이 빠릅니다. 공유 타이밍만 조금 앞당기면 협업이 부드러워집니다.'},
    ISFJ:{title:'🏠 ISFJ — 든든한 보호자',quote:'"꾸준함이 믿음이다."',
      desc:'성실함과 책임감으로 신뢰를 쌓는 케어러. 자기 돌봄 루틴(수면/식사/산책)을 우선순위에 올려두면 지속력이 더 좋아요.'},
    ISTJ:{title:'🧭 ISTJ — 원칙 수호자',quote:'"기준이 방향을 지킨다."',
      desc:'원칙과 사실을 바탕으로 안정감을 주는 기준점. 가끔은 “즉흥의 창”을 열면 팀의 창의가 살아납니다.'},
  };

  /* ---------- 감정 상태 요약(축 상위 조합) ---------- */
  function emotionSummary(sc){
    // 각 쌍의 상대적 성향(숫자는 숨기지만 논리로 요약)
    const axisPair = (a,b,la,lb)=> (sc[a]>=sc[b]? la : lb);
    const e = axisPair('E','I','표현 에너지 ↑','깊이 충전 모드');
    const s = axisPair('S','N','현실 감각 선명','가능성 탐색 모드');
    const t = axisPair('T','F','분석/판단 선호','정서/관계 선호');
    const j = axisPair('J','P','계획/질서 선호','유연/탐색 선호');
    return `오늘의 리듬: ${e} · ${s} · ${t} · ${j}`;
  }

  /* ---------- 마음 리마인드(축별 추천) ---------- */
  function mindReminders(code){
    // 간단: 유형의 각 축을 참고해 3~4개 추천
    const base = {
      E:['짧아도 “마음 신호” 남기기', '5분 휴식 타이머로 과열 방지'],
      I:['혼자 충전 20분 예약', '말로 하기 어려우면 글/이모지로'],
      S:['작은 다음 한 걸음 정의', '구체 예시 1개 찾기'],
      N:['아이디어 메모 → 하나만 실행', '실험 결과 1줄 기록'],
      T:['판단 전 체크리스트 3개', '근거-감정 순서 섞어보기'],
      F:['감정 이름 붙이기 1줄', '경계 문장 한 줄 준비'],
      J:['우선순위 3개로 압축', '완벽 대신 80% 출발'],
      P:['마감 대신 타이머 25분', '가벼운 시작으로 관성 만들기'],
    };
    return [
      ...(base[code[0]]||[]).slice(0,1),
      ...(base[code[1]]||[]).slice(0,1),
      ...(base[code[2]]||[]).slice(0,1),
      ...(base[code[3]]||[]).slice(0,1),
    ];
  }

  /* ---------- 축별 막대(숫자 미노출) ---------- */
  function meters(sc, ct){
    const pairs=[['E','I','에너지(E/I)'],['S','N','정보(S/N)'],['T','F','판단(T/F)'],['J','P','라이프(J/P)']];
    return pairs.map(([L,R,label])=>{
      const totalMaxL=(ct[L]||0)*4, totalMaxR=(ct[R]||0)*4;
      const pctL = totalMaxL? Math.round(Math.max(0,Math.min(1, sc[L]/totalMaxL))*100) : 0;
      const pctR = totalMaxR? Math.round(Math.max(0,Math.min(1, sc[R]/totalMaxR))*100) : 0;
      return `
        <div class="section">
          <div class="section-title">${label}</div>
          <div style="display:flex;gap:8px;align-items:center">
            <div style="flex:1" aria-label="${L} 상대적 강도">
              <div class="meter"><span style="width:${pctL}%"></span></div>
            </div>
            <div style="flex:1" aria-label="${R} 상대적 강도">
              <div class="meter"><span style="width:${pctR}%"></span></div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;color:var(--text-soft);font-size:12px;margin-top:4px">
            <span>${L}</span><span>${R}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function finish(){
    card.style.display='none';
    barFill.style.width='100%';

    const code = mbtiCode(score);
    const info = COPY[code] || {title:'☁️ 몽실형', quote:'"함께 맞춰가요."', desc:'데이터가 적어요. 한 번 더 시도해볼까요?'};

    const summary = emotionSummary(score);
    const reminders = mindReminders(code);

    result.innerHTML=`
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/mbti.png" alt="MBTI 아이콘" onerror="this.style.display='none'">
          <div>
            <div class="result-title">나의 MBTI: <b>${code}</b></div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>

        <p style="margin:10px 0">${info.desc}</p>

        <div class="section">
          <div class="section-title">감정 상태 요약</div>
          <div style="background:#fff;border:1px solid var(--mint-200);border-radius:14px;padding:12px">${summary}</div>
        </div>

        <div class="section">
          <div class="section-title">마음 리마인드</div>
          <div>${reminders.map(t=>`<span class="pill">${t}</span>`).join('')}</div>
        </div>

        <div class="section">
          <div class="section-title">나의 성향 레이더(축)</div>
          ${meters(score, counts)}
        </div>

        <div class="result-actions" style="margin-top:12px">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
        <p class="note" style="margin-top:10px">* 자기보고식 경향 파악 도구이며, 임상 진단이 아닙니다.</p>
      </div>
    `;
    result.style.display='block';
  }

  // 시작
  render();
})();