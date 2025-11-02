/* ===================================================
 * 성격 성향 미니 체크 (빅파이브) — 몽실몽실 v2025.2
 * ---------------------------------------------------
 * - 20문항 / 5지선다(0~4)
 * - 응답시간 가중치(±20%)는 보조만, 선택 우선
 * - 결과 UI: 제목/인용문/설명/감정상태 요약/마음 리마인드/레이더/버튼
 * - 숫자 점수/퍼센트는 결과 화면에 노출하지 않음(시각화만)
 * - 결과 이미지는 ../assets/brain.png
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
    // 축당 최댓값(문항수*4)로 정규화. N은 '정서안정(역)'라서 반대로 뒤집어 표기
    const maxBy = {O:(ct.O||0)*4, C:(ct.C||0)*4, E:(ct.E||0)*4, A:(ct.A||0)*4, N:(ct.N||0)*4};
    const norm = {
      O: maxBy.O? Math.max(0, Math.min(1, sc.O/maxBy.O)) : 0,
      C: maxBy.C? Math.max(0, Math.min(1, sc.C/maxBy.C)) : 0,
      E: maxBy.E? Math.max(0, Math.min(1, sc.E/maxBy.E)) : 0,
      A: maxBy.A? Math.max(0, Math.min(1, sc.A/maxBy.A)) : 0,
      // 정서안정(역): 높을수록 불안정 → 안정 관점으로 뒤집어서 시각화
      N: maxBy.N? 1 - Math.max(0, Math.min(1, sc.N/maxBy.N)) : 0,
    };
    return norm;
  }

  /* ---------- 감정 상태 요약 ---------- */
  function emotionSummary(norm){
    // 높음/중간/낮음 텍스트(숫자 미노출)
    const lvl = (v)=> v>=0.7?'높음' : v>=0.4?'중간' : '낮음';
    return `오늘의 성향: 개방성 ${lvl(norm.O)} · 성실성 ${lvl(norm.C)} · 외향성 ${lvl(norm.E)} · 우호성 ${lvl(norm.A)} · 정서안정 ${lvl(norm.N)}`;
  }

  /* ---------- 마음 리마인드 ---------- */
  function mindReminders(norm){
    // 상위 3축 기준 추천(카피는 부드럽게)
    const arr = Object.entries(norm).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);
    const pool = {
      O:['새 아이디어 1개만 바로 시도','실험 결과를 1줄로 기록'],
      C:['할 일 3개만 남기고 시작','완벽 대신 “80% 출발”'],
      E:['짧은 인사라도 마음 신호 남기기','5분 산책으로 기분 환기'],
      A:['부드러운 경계 문장 1줄 준비','고마웠던 일 1가지 전하기'],
      N:['3-3-3 호흡으로 마음 정리','수면·식사·물 마시기부터'],
    };
    const bag=[];
    arr.forEach(k=>{
      const pick = (pool[k]||[]).slice(0,1);
      bag.push(...pick);
    });
    return bag;
  }

  /* ---------- 결과 카피(간단 프로파일) ---------- */
  function profileCopy(norm){
    // 상위축 조합을 바탕으로 짧은 별칭+설명 생성
    const top = Object.entries(norm).sort((a,b)=>b[1]-a[1]).map(([k])=>k).slice(0,2).join('');
    const base = {
      OE:{title:'🌈 탐험형 창의가', quote:'"새 길은 걸으면 길이 된다."', desc:'새로움을 즐기며 아이디어를 현실로 바꾸는 힘. 실험-기록 루틴을 붙이면 성과가 또렷해집니다.'},
      OC:{title:'🧭 기획형 실천가', quote:'"생각은 계획으로, 계획은 한 걸음으로."', desc:'체계와 상상력을 함께 쓰는 타입. 작은 마감 주기를 쓰면 완주력이 높아집니다.'},
      CE:{title:'🎯 실행형 에너자이저', quote:'"움직이면 길이 보인다!"', desc:'즉시 행동으로 관성을 만드는 스타일. 체크리스트 3개만 잡고 가면 더 매끄럽습니다.'},
      CA:{title:'🤝 다정한 운영가', quote:'"부드러움이 오래 간다."', desc:'사람과 시스템을 동시에 챙깁니다. 나의 피로 신호도 루틴에 넣어 균형을 지키세요.'},
      EA:{title:'☀️ 소통형 분위기 메이커', quote:'"함께해서 즐거운 사람이 되자."', desc:'표현과 배려의 합. 짧은 인사/피드백 습관이 관계 온도를 지켜줍니다.'},
      ON:{title:'🌿 사색형 회복가', quote:'"천천히 깊어지는 시간."', desc:'섬세한 내면 탐색에 강점. 감정 기록 3줄 메모가 안정감을 도와요.'},
      CN:{title:'📅 안정형 루틴러', quote:'"꾸준함이 제일 강하다."', desc:'작은 약속을 지키는 힘. 과부하 신호를 조기에 포착해 쉬는 날 루틴을 만드세요.'},
      AN:{title:'☕ 공감형 균형가', quote:'"다정함은 나를 지키는 힘."', desc:'조율과 배려가 자연스러운 타입. 경계 문장 1줄을 준비해 과소비를 막아보세요.'},
      OA:{title:'🌸 포용형 창조가', quote:'"섬세함이 만드는 새 가능성."', desc:'미감과 아이디어를 조합. 완벽주의를 내려놓고 드래프트 공개 루틴을 시도해요.'},
      default:{title:'☁️ 균형 몽실형', quote:'"상황에 맞춰 톤을 바꾸는 유연함."', desc:'특정 축에 치우치지 않고 균형 있게 반응합니다.'},
    };
    return base[top] || base.default;
  }

  /* ---------- 레이더 그리기(숫자 노출 없음) ---------- */
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

  function finish(){
    card.style.display='none';
    barFill.style.width='100%';

    const norm = normalize(score, counts);
    const summary = emotionSummary(norm);
    const profile = profileCopy(norm);
    const tips = mindReminders(norm);

    result.innerHTML = `
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
    result.style.display='block';
    drawRadar('radar', norm, ['O','C','E','A','N']);
  }

  // 시작
  render();
});