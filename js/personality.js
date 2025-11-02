/* ===================================================
 * 성격 성향 미니 체크 (빅파이브) — 몽실몽실 v2025.2+
 * ---------------------------------------------------
 * - 20문항 / 5지선다(0~4)
 * - 응답시간 가중치(±20%)는 보조, 선택 우선
 * - 결과 UI: 제목/인용문/설명(확장)/감정상태 요약/마음 리마인드/레이더/버튼
 * - 숫자 점수/퍼센트 노출 없음(시각화만)
 * - 결과 이미지: ../assets/brain.png
 * - 변경점:
 *   1) 균형(BALANCE) 빈출 ↓ : 지배형/이중조합 로직 정교화(표준편차 기반)
 *   2) 결과 카피 확장 + 재치 톤
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const LABELS = {O:'개방성', C:'성실성', E:'외향성', A:'우호성', N:'정서안정(역)'};

  // 20문항 (O,C,E,A,N 각 4문항)
  const ITEMS = [
    // O — 개방성
    {k:'O',q:'새로 배우는 기술이나 취미를 기쁘게 시도한다.'},
    {k:'O',q:'낯선 문화/장소에도 호기심이 크다.'},
    {k:'O',q:'문제를 풀 때 독특한 방식이 떠오르는 편이다.'},
    {k:'O',q:'변화가 두렵기보다 기대된다.'},
    // C — 성실성
    {k:'C',q:'약속·마감은 웬만하면 어기지 않는다.'},
    {k:'C',q:'할 일 목록을 만들고 체크한다.'},
    {k:'C',q:'작은 일도 끝까지 마무리하는 편이다.'},
    {k:'C',q:'정리정돈/시간관리 같은 루틴이 있다.'},
    // E — 외향성
    {k:'E',q:'사람이 많은 자리에서 에너지가 오른다.'},
    {k:'E',q:'처음 본 사람에게도 먼저 말을 건다.'},
    {k:'E',q:'즉흥적인 만남/활동을 즐긴다.'},
    {k:'E',q:'감정 표현을 솔직하게 하는 편이다.'},
    // A — 우호성
    {k:'A',q:'상대 감정에 공감하고 배려하려 한다.'},
    {k:'A',q:'갈등이 생기면 먼저 부드럽게 풀고 싶다.'},
    {k:'A',q:'상대가 불편해할 요소를 미리 살핀다.'},
    {k:'A',q:'내 의견을 말해도 톤은 다정하게 유지한다.'},
    // N — 정서안정(역채점)
    {k:'N',q:'사소한 일에도 걱정이 쉽게 올라온다.'},
    {k:'N',q:'기분 기복이 잦은 편이다.'},
    {k:'N',q:'스트레스 상황에서 마음이 금방 휘청인다.'},
    {k:'N',q:'실수/지적을 오래 곱씹는 편이다.'},
  ];

  let idx=0;
  const score={O:0,C:0,E:0,A:0,N:0};     // 가중 누적
  const counts={O:0,C:0,E:0,A:0,N:0};    // 축별 응답 수
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
    stepLabel.textContent=`${idx+1} / ${ITEMS.length}`;
    barFill.style.width=`${(idx/ITEMS.length)*100}%`;
    qText.textContent=ITEMS[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="4">매우 그렇다</button>
      <button class="choice" data-s="3">그렇다</button>
      <button class="choice" data-s="2">보통이다</button>
      <button class="choice ghost" data-s="1">아니다</button>
      <button class="choice ghost" data-s="0">전혀 아니다</button>`;

    // 이전 선택 표시
    const prevSel=ans[idx];
    if(prevSel!==undefined){
      Array.from(wrap.children).forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }

    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)), 180);
      });
    });

    startTime=Date.now();
  }

  function choose(s){
    const elapsed=(Date.now()-startTime)/1000;
    times[idx]=elapsed;

    const axis = ITEMS[idx].k;
    const w = getWeight(elapsed, axis);      // 0.8~1.2
    ans[idx]=s;

    // 선택 우선 + 시간 보조(±20% 캡)
    const adjusted = s + (s*(w-1)*0.2);
    score[axis]+=adjusted;
    counts[axis]+=1;

    next();
  }

  function next(){ idx++; if(idx<ITEMS.length) render(); else finish(); }

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

  // 시간 가중치(보조)
  function getWeight(sec, k){
    let w=1.0;
    if(sec<1) w=0.9;
    else if(sec<4) w=1.0;
    else if(sec<8) w=1.15;
    else w=1.1;

    // 미세 보정(선택 뒤엎지 않음)
    if((k==='E'||k==='O') && sec<2)  w*=1.05;  // 즉응형 축
    if((k==='C'||k==='A') && sec>=4) w*=1.05;  // 숙고형 축
    return Number(w.toFixed(2));
  }

  function recalcTo(end){
    for(const k of Object.keys(score)){ score[k]=0; counts[k]=0; }
    for(let i=0;i<end;i++){
      const s=ans[i] ?? 0;
      const axis=ITEMS[i].k;
      const w=getWeight(times[i] ?? 0, axis);
      const adjusted = s + (s*(w-1)*0.2);
      score[axis]+=adjusted;
      counts[axis]+=1;
    }
  }

  /* ---------- 시각화용 정규화(0~1) ---------- */
  function normalize(sc, ct){
    const maxBy = {O:(ct.O||0)*4, C:(ct.C||0)*4, E:(ct.E||0)*4, A:(ct.A||0)*4, N:(ct.N||0)*4};
    const norm = {
      O: maxBy.O? Math.max(0, Math.min(1, sc.O/maxBy.O)) : 0,
      C: maxBy.C? Math.max(0, Math.min(1, sc.C/maxBy.C)) : 0,
      E: maxBy.E? Math.max(0, Math.min(1, sc.E/maxBy.E)) : 0,
      A: maxBy.A? Math.max(0, Math.min(1, sc.A/maxBy.A)) : 0,
      // 정서안정(역): 높을수록 불안정 → 안정 관점으로 뒤집어 시각화
      N: maxBy.N? 1 - Math.max(0, Math.min(1, sc.N/maxBy.N)) : 0,
    };
    return norm;
  }

  /* ---------- 감정 상태 요약 ---------- */
  function emotionSummary(norm){
    const lvl = (v)=> v>=0.7?'높음' : v>=0.4?'중간' : '낮음';
    return `오늘의 성향: 개방성 ${lvl(norm.O)} · 성실성 ${lvl(norm.C)} · 외향성 ${lvl(norm.E)} · 우호성 ${lvl(norm.A)} · 정서안정 ${lvl(norm.N)}`;
  }

  /* ---------- 마음 리마인드 ---------- */
  function mindReminders(norm){
    const arr = Object.entries(norm).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);
    const pool = {
      O:['번뜩인 아이디어 1개만 바로 시도해보기','실험 결과 1줄 로그 남기기'],
      C:['할 일 3개만 남기고 출발하기','완벽 대신 “80% 출발” 시도'],
      E:['짧은 인사라도 마음 신호 보내기','5분 산책으로 활력 충전'],
      A:['부드러운 경계 문장 1줄 준비','고마웠던 순간 1가지 전하기'],
      N:['3-3-3 호흡으로 마음 정리','수면·식사·물 마시기 우선순위'],
    };
    const bag=[];
    arr.forEach(k=>{ const tip=(pool[k]||[])[0]; if(tip) bag.push(tip); });
    return bag;
  }

  /* ---------- 결과 카피(확장·재치 톤) ---------- */
  const COPY_SINGLE = {
    O:{ title:'🌈 탐험형 창의가',
        quote:'"새 길은 걸으면 길이 된다."',
        desc:'새로움을 좋아하는 당신은 아이디어 생산 공장 같은 사람. 시작 버튼만 눌러주면 금세 프로토타입이 튀어나옵니다. 단, 흥미가 옮겨 다닐 수 있어요. 오늘은 “작게, 빨리, 재밌게” — 30분 실험과 1줄 기록으로 다음 걸음을 연결해보세요.' },
    C:{ title:'📅 루틴형 설계가',
        quote:'"꾸준함은 최고의 치트키."',
        desc:'계획과 체크리스트가 최고의 친구인 타입. 시스템으로 불확실성을 줄이고 결과를 뽑아냅니다. 단, 완벽주의가 발목을 잡을 때가 있어요. “완료 80%도 승리”라는 표어를 붙여보세요. 속도와 품질, 둘 다 잡힙니다.' },
    E:{ title:'☀️ 소통형 에너자이저',
        quote:'"움직이면 길이 보인다!"',
        desc:'사람, 대화, 현장 에너지에서 힘을 얻는 당신. 분위기를 살리고 관성을 만드는 데 탁월합니다. 단, 일정이 과열되면 체력이 소모돼요. 5분 산책과 2잔의 물을 루틴에 붙여 활력을 안정적으로 유지하세요.' },
    A:{ title:'☕ 온도 유지 관리자',
        quote:'"다정함은 성과의 윤활유."',
        desc:'공감과 배려로 팀의 마찰을 줄이는 조율가. 갈등의 모서리를 둥글게 다듬습니다. 단, “거절”이 어렵다면 내 마음의 경계도 함께 챙겨요. “지금은 어렵지만, 다음 주에 도울게요” 같은 문장 하나를 준비해두세요.' },
    N:{ title:'🌿 안정 추구 균형가',
        quote:'"불안은 줄이고, 근거는 채우고."',
        desc:'파동을 빠르게 감지하는 레이더 보유자. 민감함은 위험을 사전에 줄이는 강점이 됩니다. 단, 생각이 과열되면 체력부터 방전! 수면·식사·물 마시기를 최우선에 두고, 오늘의 걱정은 “10분 타임어택 메모”로 꺼내보세요.' },
  };

  const COPY_PAIR = {
    OE:{ title:'🧪 창의 실험가 (O+E)',
         quote:'"아이디어는 밖으로 나와야 산다."',
         desc:'아이디어+현장 에너지의 폭발력. 떠오른 생각을 바로 시도하고 반응을 받아 더 좋은 버전으로 진화시킵니다. 단, 레일이 없으면 공회전할 수도. 3칸짜리 레일(목표-시간-결과 로그)을 깔면 속도가 난이도가 됩니다.' },
    OC:{ title:'🧭 기획형 실천가 (O+C)',
         quote:'"상상은 계획으로, 계획은 한 걸음으로."',
         desc:'상상력과 구조화의 교차점. 새로움을 설계로 엮어 결과를 뽑아내는 타입입니다. 흥미의 불꽃이 꺼지기 전에 “소(小)마감”을 촘촘히 걸어두면 완주 확률이 크게 올라가요.' },
    OA:{ title:'🌸 감성 크리에이터 (O+A)',
         quote:'"섬세함이 만드는 새 가능성."',
         desc:'미감·배려·창의의 조합. 사람의 마음을 움직이는 결과물을 잘 만듭니다. 단, 스스로에게 너무 엄격할 수 있어요. “초안은 거칠게, 피드백은 가볍게”를 합의로 만들어보세요.' },
    CE:{ title:'🎯 실행력 리더 (C+E)',
         quote:'"일은 굴리면 굴러간다."',
         desc:'체계와 추진력의 합. 목표를 불도저처럼 밀어 붙이는 실행형. 단, 팀의 속도가 뒤처지지 않도록 체크포인트를 만들고, 휴식도 “업무”처럼 예약해두면 더 멀리 갑니다.' },
    CA:{ title:'🤝 믿음의 운영가 (C+A)',
         quote:'"꾸준함이 신뢰를 만든다."',
         desc:'약속을 지키는 다정함. 팀을 편안하게 만드는 운영자형입니다. 단, “나만의 시간”이 제일 나중으로 밀리지 않게 일주일에 2칸은 자신에게 예약해두세요.' },
    CN:{ title:'🛟 안전장치 설계자 (C+N)',
         quote:'"위험은 미리 줄이고, 루틴은 넓힌다."',
         desc:'리스크 관리의 고수. 체크리스트로 불확실성을 줄입니다. 단, 준비만 하다 기회를 놓치지 않도록 “실험 금요일 30분”을 의식적으로 배정해보세요.' },
    EA:{ title:'☀️💬 분위기 메이커 (E+A)',
         quote:'"말 한마디가 팀의 온도를 바꾼다."',
         desc:'표현과 배려로 공기부터 바꾸는 사람. 회의가 “모각모(모여서 각자 모드)”가 되지 않게 분위기를 열어줍니다. 단, 과열 방지를 위해 “하루 한 번 고요 시간”을 루틴으로!' },
    EN:{ title:'⚖️ 현실감 있는 낙관가 (E+N)',
         quote:'"가볍게 웃고, 크게 흔들리지 않는다."',
         desc:'외향 에너지에 안전 장치를 단 타입. 즉흥과 안정의 균형을 잘 잡습니다. 단, 감정이 지칠 때는 사람 대신 “자연”에서 에너지를 보충해보세요.' },
    AN:{ title:'🫶 따뜻한 균형추 (A+N)',
         quote:'"내 마음도 돌보는 다정함."',
         desc:'남을 챙기는 만큼 나를 챙기는 법을 아는 타입. 경계 문장 하나만 준비해도 피로도가 크게 줄어요. 다정함은 지속 가능할 때 더 빛납니다.' },
    ON:{ title:'🌙 사색형 안정가 (O+N)',
         quote:'"깊이와 안전의 공존."',
         desc:'내면 탐색이 깊고, 위험 신호를 빠르게 감지합니다. 아이디어는 “드래프트 공개 1회”로 세상과 가볍게 연결해보세요. 생각이 더 탄탄해집니다.' },
  };

  function variantFromNorm(norm){
    const entries = Object.entries(norm).sort((a,b)=>b[1]-a[1]);
    const [k1,v1] = entries[0];
    const [k2,v2] = entries[1];

    // 표준편차 기반 균형 판단 (너무 빡빡하면 항상 균형 나와서 완화)
    const vals = entries.map(([,v])=>v);
    const mean = vals.reduce((a,b)=>a+b,0)/vals.length;
    const stdev = Math.sqrt(vals.reduce((a,b)=>a+Math.pow(b-mean,2),0)/vals.length);

    // 지배형: top1과 top2 격차가 충분할 때
    const DOM_DIFF = 0.25;   // 지배형 임계
    // 균형형: 전축이 매우 근접할 때만 (과거보다 훨씬 드물게)
    const BALANCE_STD = 0.06; // 균형 임계

    if (v1 - v2 >= DOM_DIFF) {
      return { key: k1, mode: 'single' };
    }
    if (stdev <= BALANCE_STD) {
      return { key: 'BALANCE', mode: 'balance' };
    }
    // 그 외는 상위 2축 조합(알파벳 순 정렬 X → 실제 순위 보존)
    return { key: (k1+k2), mode: 'pair' };
  }

  function profileCopy(norm){
    const v = variantFromNorm(norm);
    if (v.mode === 'single') {
      return COPY_SINGLE[v.key] || {title:'☁️ 균형 몽실형', quote:'"상황에 맞춰 톤을 바꿔요."', desc:'특정 축에 치우치지 않고 유연하게 반응합니다.'};
    }
    if (v.mode === 'pair') {
      return COPY_PAIR[v.key] || {title:'☁️ 균형 몽실형', quote:'"상황에 맞춰 톤을 바꿔요."', desc:'특정 축에 치우치지 않고 유연하게 반응합니다.'};
    }
    // 진짜 균형일 때만
    return { title:'☁️ 균형 몽실형',
             quote:'"필요한 색을 그때그때 꺼내 쓰는 팔레트."',
             desc:'모든 축이 고르게 자리 잡아 상황에 따라 톤을 자연스럽게 바꾸는 타입. 특정 강점 하나로 밀어붙이기보다, “맥락 읽기 → 필요한 도구 꺼내기”가 강점입니다. 프로젝트 초반엔 폭넓게 탐색하고, 중반부엔 한 축(예: C 또는 O)에 레버리지를 주세요.' };
  }

  /* ---------- 레이더(숫자 미노출) ---------- */
  function drawRadar(canvasId, values, keys){
    const c = document.getElementById(canvasId); if(!c) return;
    const ctx = c.getContext('2d');
    const W=c.width, H=c.height, cx=W/2, cy=H/2;
    const radius=Math.min(W,H)*0.38;
    const layers=5, angleStep=(Math.PI*2)/keys.length;

    ctx.clearRect(0,0,W,H);

    // 격자
    ctx.strokeStyle='rgba(146,217,206,0.9)'; ctx.lineWidth=1;
    for(let l=1;l<=layers;l++){
      ctx.beginPath();
      const r=radius*(l/layers);
      for(let i=0;i<keys.length;i++){
        const a=-Math.PI/2+angleStep*i;
        const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r;
        (i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));
      }
      ctx.closePath(); ctx.stroke();
    }

    // 라벨
    ctx.fillStyle='#2F2F2F'; ctx.font='12px Pretendard, system-ui';
    keys.forEach((k,i)=>{
      const a=-Math.PI/2+angleStep*i;
      const x=cx+Math.cos(a)*(radius+16), y=cy+Math.sin(a)*(radius+16);
      const label=LABELS[k];
      const tw=ctx.measureText(label).width;
      ctx.fillText(label, x-tw/2, y+4);
    });

    // 값 영역
    const pts = keys.map((k,i)=>{
      const v=Math.max(0,Math.min(1,values[k]??0));
      const a=-Math.PI/2+angleStep*i;
      return {x:cx+Math.cos(a)*radius*v, y:cy+Math.sin(a)*radius*v};
    });

    ctx.beginPath(); pts.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    ctx.closePath(); ctx.fillStyle='rgba(165,226,217,0.45)'; ctx.fill();
    ctx.beginPath(); pts.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    ctx.closePath(); ctx.strokeStyle='rgba(146,217,206,1)'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='rgba(146,217,206,1)'; pts.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fill(); });
  }

  function resultShell(profile, summary, tips){
    return `
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/brain.png" alt="성격 아이콘" onerror="this.style.display='none'">
          <div>
            <div class="result-title">${profile.title}</div>
            <div class="result-desc">${profile.quote}</div>
          </div>
        </div>

        <p style="margin:10px 0">${profile.desc}</p>

        <div class="section">
          <div class="section-title">감정 상태 요약</div>
          <div style="background:#fff;border:1px solid var(--mint-200);border-radius:14px;padding:12px">
            ${summary}
          </div>
        </div>

        <div class="section">
          <div class="section-title">마음 리마인드</div>
          <div>${tips.map(t=>`<span class="pill">${t}</span>`).join('')}</div>
        </div>

        <div class="section radar-wrap">
          <canvas id="radar" width="340" height="340" aria-label="성격 레이다 차트"></canvas>
          <div class="radar-legend">
            ${['O','C','E','A','N'].map(k=>`
              <div class="legend-item"><span class="legend-dot"></span>${LABELS[k]}</div>
            `).join('')}
          </div>
        </div>

        <div class="result-actions" style="margin-top:12px">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
        <p class="note" style="margin-top:10px">* 자기보고식 경향 파악 도구이며, 임상 진단이 아닙니다.</p>
      </div>
    `;
  }

  function finish(){
    card.style.display='none';
    barFill.style.width='100%';

    const norm = normalize(score, counts);
    const summary = emotionSummary(norm);
    const profile = profileCopy(norm);
    const tips = mindReminders(norm);

    result.innerHTML = resultShell(profile, summary, tips);
    result.style.display='block';
    drawRadar('radar', norm, ['O','C','E','A','N']);
  }

  // 시작
  render();
});