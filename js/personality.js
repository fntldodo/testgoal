/* ===================================================
 * 성격 성향 미니 체크 (빅파이브) — v2025.2 마음 리마인드
 * - 20문항 / 5지선다(0~4) / 응답시간 보조(±20%) — 선택 우선
 * - 결과: 레이다 유지하되 숫자/퍼센트 노출 없음(상태라벨만)
 * - 구성: 제목/인용문/설명/감정상태 요약/마음 리마인드/레이더/버튼
 * - 중간치 편중 완화: 상/하위 축 강조 문구 + 적응형 라벨링
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const ITEMS = [
    // O (개방성)
    {k:'O',q:'새로 배우는 기술이나 취미를 기쁘게 시도한다.'},
    {k:'O',q:'낯선 문화/장소에도 호기심이 크다.'},
    {k:'O',q:'문제를 풀 때 독특한 방식이 떠오르는 편이다.'},
    {k:'O',q:'변화가 두렵기보다 기대된다.'},
    // C (성실성)
    {k:'C',q:'약속·마감은 웬만하면 어기지 않는다.'},
    {k:'C',q:'할 일 목록을 만들고 체크한다.'},
    {k:'C',q:'작은 일도 끝까지 마무리하는 편이다.'},
    {k:'C',q:'정리정돈/시간관리 같은 루틴이 있다.'},
    // E (외향성)
    {k:'E',q:'사람이 많은 자리에서 에너지가 오른다.'},
    {k:'E',q:'처음 본 사람에게도 먼저 말을 건다.'},
    {k:'E',q:'즉흥적인 만남/활동을 즐긴다.'},
    {k:'E',q:'감정 표현을 솔직하게 하는 편이다.'},
    // A (우호성)
    {k:'A',q:'상대 감정에 공감하고 배려하려 한다.'},
    {k:'A',q:'갈등이 생기면 먼저 부드럽게 풀고 싶다.'},
    {k:'A',q:'상대가 불편해할 요소를 미리 살핀다.'},
    {k:'A',q:'내 의견을 말해도 톤은 다정하게 유지한다.'},
    // N (정서안정 역채점)
    {k:'N',q:'사소한 일에도 걱정이 쉽게 올라온다.'},
    {k:'N',q:'기분 기복이 잦은 편이다.'},
    {k:'N',q:'스트레스 상황에서 마음이 금방 휘청인다.'},
    {k:'N',q:'실수/지적을 오래 곱씹는 편이다.'},
  ];

  // DOM
  const stepLabel=document.getElementById('stepLabel');
  const barFill  =document.getElementById('barFill');
  const qText    =document.getElementById('qText');
  const wrap     =document.getElementById('choiceWrap');
  const card     =document.getElementById('card');
  const result   =document.getElementById('result');
  const prevBtn  =document.getElementById('prev');
  const skipBtn  =document.getElementById('skip');

  // 상태
  let idx=0;
  const score={O:0,C:0,E:0,A:0,N:0};
  const counts={O:0,C:0,E:0,A:0,N:0};
  const ans=[];      // 0~4
  const times=[];    // 초
  let startTime=Date.now();

  function weight(sec, axis){
    let w=1.0;
    if(sec<1) w=0.9;
    else if(sec<4) w=1.0;
    else if(sec<8) w=1.15;
    else w=1.1;
    // 미세 보정: O/E는 즉응 +, C는 숙고 +, N/A는 중립
    if((axis==='O'||axis==='E') && sec<2) w*=1.04;
    if(axis==='C' && sec>=4) w*=1.04;
    return Math.min(1.2, Math.max(0.8, Number(w.toFixed(2))));
  }

  function render(){
    stepLabel.textContent = `${idx+1} / ${ITEMS.length}`;
    barFill.style.width   = `${(idx/ITEMS.length)*100}%`;
    qText.textContent     = ITEMS[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;

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
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      });
    });

    startTime=Date.now();
  }

  function choose(s){
    const elapsed=(Date.now()-startTime)/1000;
    const axis=ITEMS[idx].k;

    ans[idx]=s; times[idx]=elapsed;
    const w=weight(elapsed, axis);
    const adjusted = s + (s * (w - 1) * 0.2);

    score[axis]+=adjusted;
    counts[axis]+=1;

    next();
  }

  function next(){ idx++; if(idx<ITEMS.length) render(); else finish(); }

  prevBtn?.addEventListener('click', ()=>{
    if(idx===0) return;
    idx--;
    recompute(idx);
    render();
  });

  skipBtn?.addEventListener('click', ()=>{
    ans[idx]=0;
    times[idx]=(Date.now()-startTime)/1000;
    next();
  });

  function recompute(end){
    for(const k of Object.keys(score)) score[k]=0;
    for(const k of Object.keys(counts)) counts[k]=0;
    for(let i=0;i<end;i++){
      const s=ans[i] ?? 0;
      const k=ITEMS[i].k;
      const w=weight(times[i] ?? 0, k);
      const adjusted = s + (s * (w - 1) * 0.2);
      score[k]+=adjusted;
      counts[k]+=1;
    }
  }

  // 정규화 0~1 (N은 역채점 변환)
  function normalize(sc){
    const maxPer=4; // 항목당 최대점(5지선다 0~4 → 4)
    const norm={};
    const keys=['O','C','E','A','N'];
    const cnt={O:4,C:4,E:4,A:4,N:4};
    keys.forEach(k=>{
      const m = cnt[k]*maxPer;
      const raw = sc[k] || 0;
      if(k==='N'){
        // 정서안정(역) → 값이 클수록 ‘안정’이 낮음 → 뒤집기
        const nv = 1 - (raw / m);
        norm[k] = Math.max(0, Math.min(1, nv));
      }else{
        norm[k] = Math.max(0, Math.min(1, raw / m));
      }
    });
    return norm;
  }

  // 상태 라벨(숫자/퍼센트 미노출)
  function label(v){
    if(v>=0.78) return '아주 높음';
    if(v>=0.62) return '높음';
    if(v>=0.45) return '중간';
    if(v>=0.28) return '낮음';
    return '아주 낮음';
  }

  function wittyStates(norm){
    const LBL = {O:'개방성', C:'성실성', E:'외향성', A:'우호성', N:'정서안정'};
    const lines = Object.entries(norm).map(([k,v])=>{
      const name = LBL[k];
      const lv = label(v);
      return `<div class="card-like" style="background:#fff;border:1px solid var(--mint-200,#cfeee7);border-radius:12px;padding:10px">
        <div style="display:flex;justify-content:space-between;font-weight:700">
          <span>${name}</span><span>${lv}</span>
        </div>
        <div style="height:8px;background:var(--mint-100,#e9f7f3);border-radius:999px;overflow:hidden;margin-top:6px">
          <span style="display:block;height:8px;width:${Math.round(v*100)}%;background:var(--mint-500,#7ed6c4)"></span>
        </div>
      </div>`;
    });
    return `<div class="state-list">${lines.join('')}</div>`;
  }

  function wittySummary(norm){
    // 상위 2개 키워드로 요약
    const mapWord = {O:'탐색', C:'꾸준', E:'활기', A:'다정', N:'차분'};
    const arr = Object.entries(norm).sort((a,b)=>b[1]-a[1]);
    const top2 = arr.slice(0,2).map(([k])=>mapWord[k]);
    return `오늘의 키워드: <b>${top2.join(' · ')}</b>`;
  }

  // 마음 리마인드(지배 축 기준으로 메시지 선택)
  function mindRemind(norm){
    const order = Object.entries(norm).sort((a,b)=>b[1]-a[1]).map(([k])=>k);
    const top = order[0];
    const second = order[1];

    const MR = {
      O:'새로움이 에너지를 올려요. 오늘은 “가벼운 첫 시도 1개”에 체크—작게 시작하면 오래 갑니다.',
      C:'루틴이 안정감을 주는 날. 할 일 3개만 뽑아 순서대로—완료의 잔잔한 만족이 쌓여요.',
      E:'사람/현장 에너지가 도움이 됩니다. 짧은 통화나 산책 동행으로 기분을 띄워 보세요.',
      A:'관계의 온도를 지키는 날. 내 마음도 돌보는 “작은 경계 문장” 하나 준비해요.',
      N:'마음의 속도가 차분해요. 충분히 괜찮아요—호흡 4-4-4로 리셋하고 천천히.'
    };

    // 상/하위 조합에 위트 한 줄 추가
    const extra = (() => {
      if(top==='O' && second==='C') return '아이디어에 체크리스트를 덧붙이면 금이 간 꿈도 단단해집니다.';
      if(top==='C' && second==='O') return '계획에 작은 실험을 더하면 지루함 없이 오래 갑니다.';
      if(top==='E' && second==='A') return '사람 사이의 온기가 오늘의 연료. 다정함은 최고의 촉매예요.';
      if(top==='A' && second==='E') return '배려의 방향을 넓히되, 내 마음의 창도 열어 주세요.';
      if(top==='N' && second==='O') return '차분한 바탕 위에 한 방울의 새로움—밸런스가 예쁩니다.';
      return null;
    })();

    return MR[top] + (extra? ` ${extra}` : '');
  }

  // 레이다(숫자 라벨 없이 선/면만)
  function drawRadar(canvasId, values, keys){
    const c = document.getElementById(canvasId); if(!c) return;
    const ctx = c.getContext('2d');
    const W=c.width, H=c.height, cx=W/2, cy=H/2; const radius=Math.min(W,H)*0.38;
    const layers=5; const angleStep=(Math.PI*2)/keys.length;
    ctx.clearRect(0,0,W,H);

    // 격자
    ctx.strokeStyle='rgba(146,217,206,0.9)'; ctx.lineWidth=1;
    for(let l=1;l<=layers;l++){
      ctx.beginPath(); const r=radius*(l/layers);
      for(let i=0;i<keys.length;i++){
        const a=-Math.PI/2+angleStep*i; const x=cx+Math.cos(a)*r; const y=cy+Math.sin(a)*r;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.closePath(); ctx.stroke();
    }

    // 축 라벨(텍스트만, 수치 없음)
    ctx.fillStyle='#2F2F2F'; ctx.font='12px Pretendard, system-ui';
    const LBL = {O:'개방성',C:'성실성',E:'외향성',A:'우호성',N:'정서안정'};
    keys.forEach((k,i)=>{
      const a=-Math.PI/2+angleStep*i; const x=cx+Math.cos(a)*(radius+16); const y=cy+Math.sin(a)*(radius+16);
      const label=LBL[k]; const tw=ctx.measureText(label).width; ctx.fillText(label, x-tw/2, y+4);
    });

    // 데이터 폴리곤
    const pts = keys.map((k,i)=>{
      const v=Math.max(0,Math.min(1,values[k])); const a=-Math.PI/2+angleStep*i;
      return {x:cx+Math.cos(a)*radius*v, y:cy+Math.sin(a)*radius*v};
    });
    ctx.beginPath(); pts.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.closePath();
    ctx.fillStyle='rgba(165,226,217,0.45)'; ctx.fill();
    ctx.beginPath(); pts.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.closePath();
    ctx.strokeStyle='rgba(146,217,206,1)'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='rgba(146,217,206,1)'; pts.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fill(); });
  }

  function finish(){
    const norm = normalize(score);

    // 상/하위 축을 언어로 보여주기
    const mood = wittySummary(norm);
    const remind = mindRemind(norm);

    card.style.display='none';
    barFill.style.width='100%';

    result.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/brain.png" alt="성격 아이콘" onerror="this.style.display='none'">
          <div>
            <div class="result-title">나의 성격 성향 오각형</div>
            <div class="result-desc">“숫자 대신 상태로 읽는 레이다”</div>
          </div>
        </div>

        <p style="margin:8px 0">
          다섯 가지 축(개방성·성실성·외향성·우호성·정서안정)을 상태 어휘로 표현해 드려요.
          오늘의 나를 가볍게 확인하고, 내일의 리듬을 설계해 보세요.
        </p>

        <div class="result-sub">
          <h4 style="margin:10px 0 6px">감정상태 요약</h4>
          <p style="margin:0;color:var(--text-soft)">${mood}</p>
        </div>

        <div class="result-sub">
          <h4 style="margin:10px 0 6px">축별 상태 보기</h4>
          ${wittyStates(norm)}
        </div>

        <div class="radar-wrap" style="margin:12px 0 8px;display:grid;place-items:center">
          <canvas id="radar" width="340" height="340" aria-label="성격 레이다 차트"></canvas>
          <div class="legend">
            <div class="pill">개방성</div>
            <div class="pill">성실성</div>
            <div class="pill">외향성</div>
            <div class="pill">우호성</div>
            <div class="pill">정서안정</div>
          </div>
        </div>

        <div class="result-sub">
          <h4 style="margin:10px 0 6px">🌿 마음 리마인드</h4>
          <p style="margin:0">${remind}</p>
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>

        <p class="note" style="margin-top:10px">* 자기보고식 경향 파악 도구이며, 임상 진단을 대체하지 않습니다.</p>
      </div>
    `;

    result.style.display='block';
    drawRadar('radar', norm, ['O','C','E','A','N']);
  }

  // 시작
  render();
});
