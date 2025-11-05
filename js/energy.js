/* ===================================================
 * 🔋 에너지 테스트 — v2025.2 (12문항)
 * ---------------------------------------------------
 * - 5지선다(0~4) + 응답시간 보조 ±20% (선택 우선, 뒤엎지 않음)
 * - 결과: 5단계 상태 라벨(주) + 퍼센트(보조)  / 숫자 단독 노출 금지
 * - 타이브레이커: 최근 3문항 + 시간가중으로 미세 조정
 * - "지금 1분 내 실행" 가능한 마음 리마인드 제공
 * - 결과 카드: 제목/인용문/설명/감정상태 요약(문장)/리마인드/상태 미터/버튼
 * =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // 12문항 (신체/정신/환경 신호를 고르게 섞음)
  const Q = [
    // 컨디션 체감
    {k:'B', q:'아침이나 시작 전, 몸이 무겁기보다 가볍게 예열되는 편이다.'},
    {k:'B', q:'잠깐 걸으면 머리가 맑아지는 느낌이 있다.'},
    {k:'B', q:'식사/수분/호흡 등 기본 케어가 요즘 잘 지켜진다.'},
    // 집중/동기
    {k:'F', q:'해야 할 일을 떠올리면 “바로 착수” 모드가 켜진다.'},
    {k:'F', q:'작은 성취를 만들며 다음 단계로 확장하는 편이다.'},
    {k:'F', q:'방해 요소가 있어도 미세한 몰입이 유지된다.'},
    // 감정/회복
    {k:'R', q:'감정이 출렁여도 5분 내 진정 루틴이 통한다.'},
    {k:'R', q:'실수/지연이 생겨도 “다음 선택”으로 금방 이동한다.'},
    {k:'R', q:'휴식 후 “충전됨” 느낌을 꽤 분명히 받는다.'},
    // 환경/리듬
    {k:'E', q:'작업 공간/빛/소음이 대체로 편안하게 맞춰져 있다.'},
    {k:'E', q:'루틴(수면/식사/운동)의 일정 리듬이 유지된다.'},
    {k:'E', q:'오늘 해야할 일의 우선순위를 3개 이내로 잡아두었다.'}
  ];

  let idx=0, start=Date.now();
  const score={B:0,F:0,R:0,E:0}, count={B:0,F:0,R:0,E:0};
  const ans=[], times=[];
  const step=document.getElementById('stepLabel');
  const bar=document.getElementById('barFill');
  const qText=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const card=document.getElementById('card');
  const result=document.getElementById('result');
  const prev=document.getElementById('prev');
  const skip=document.getElementById('skip');

  // 시간 가중: 1초 미만 -10%, 4~8초 +15%, 8초+ +10% (선택 뒤엎지 않음)
  function weight(sec){
    if(sec<1) return 0.9;
    if(sec<4) return 1.0;
    if(sec<8) return 1.15;
    return 1.10;
  }

  function render(){
    step.textContent=`${idx+1} / ${Q.length}`;
    bar.style.width=`${(idx/Q.length)*100}%`;
    qText.textContent=Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;

    const prevSel=ans[idx];
    if(prevSel!==undefined){
      [...wrap.children].forEach(b=>{ if(Number(b.dataset.s)===prevSel) b.classList.add('selected'); });
    }

    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click', ()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)), 150);
      });
    });

    start=Date.now();
  }

  function choose(s){
    const sec=(Date.now()-start)/1000, w=weight(sec);
    const adj=s + (s*(w-1)*0.2);  // ±20% 보조
    ans[idx]=s; times[idx]=sec;
    const k=Q[idx].k; score[k]+=adj; count[k]+=1;
    next();
  }
  function next(){ idx++; if(idx<Q.length) render(); else finish(); }

  // 뒤로/스킵
  prev?.addEventListener('click', ()=>{
    if(idx===0) return;
    idx--;
    recalc(idx);
    render();
  });
  skip?.addEventListener('click', ()=>{
    ans[idx]=0; times[idx]=(Date.now()-start)/1000; next();
  });

  function recalc(end){
    score.B=score.F=score.R=score.E=0; count.B=count.F=count.R=count.E=0;
    for(let i=0;i<end;i++){
      const s=ans[i]??0, k=Q[i].k, sec=times[i]??3, w=weight(sec);
      const adj=s + (s*(w-1)*0.2);
      score[k]+=adj; count[k]+=1;
    }
  }

  // 축 평균(0~4) → 0~1
  function normalized(){
    const n={};
    for(const k of ['B','F','R','E']){
      const avg=(score[k]/Math.max(1,count[k]))/4;
      n[k]=Math.max(0,Math.min(1,avg));
    }
    return n;
  }

  // 전체 에너지 합성지표 (B/F/R/E 평균)
  function scalarEnergy(n){
    const v=(n.B + n.F + n.R + n.E)/4; // 0~1
    return Math.max(0, Math.min(1, v));
  }

  // 최근 3문항 타이브레이커(중립 편중/경계값 스냅 보정)
  function tieBreak(v){
    // v가 경계(0.40/0.60/0.80 근처)에서 애매하면, 최근 선택 강도*시간가중으로 살짝 조정
    const marks=[0.40, 0.60, 0.80];
    let nearest=marks[0], diff=Math.abs(v-marks[0]);
    for(const m of marks){ const d=Math.abs(v-m); if(d<diff){ diff=d; nearest=m; } }
    if(diff>0.04) return v; // 경계에서 충분히 떨어져 있으면 그대로

    let d=0;
    for(let i=Math.max(0,Q.length-3); i<Q.length; i++){
      const s=ans[i]??0, sec=times[i]??3, w=weight(sec);
      const mag=(s>=3?1:(s===2?0.25:0.1)); // 강한 동의일수록 영향
      d += (s>=3? +1 : s<=1? -1 : 0) * w * mag;
    }
    // d>0 → 한 단계 상향, d<0 → 하향(최대 ±0.02만)
    const adjust = d>0 ? 0.02 : d<0 ? -0.02 : 0;
    return Math.max(0, Math.min(1, v+adjust));
  }

  // 상태 라벨 (퍼센트는 보조 표기 전용)
  function stateLabel(p01){
    const p = Math.round(p01*100);
    if(p >= 90) return {label:'풀충전', hint:`풀충전(${p}%)`};
    if(p >= 70) return {label:'충전 중', hint:`충전 중(${p}%)`};
    if(p >= 50) return {label:'보통',   hint:`보통(${p}%)`};
    if(p >= 30) return {label:'저전력', hint:`저전력(${p}%)`};
    return            {label:'방전 직전', hint:`방전 직전(${p}%)`};
  }

  // 상태 미터(보조): 4축 막대 + 합성진행 바
  function meters(n, v){
    const rows=[
      ['B','컨디션'], ['F','집중/동기'], ['R','회복탄력'], ['E','리듬/환경']
    ];
    const rowHtml = rows.map(([k,name])=>{
      const pct=Math.round((n[k]??0)*100);
      const word =
        pct>=90?'매우 높음':
        pct>=70?'높음':
        pct>=50?'보통':
        pct>=30?'낮음':'매우 낮음';
      return `
        <div class="row">
          <span><b>${name}</b></span>
          <div class="bar"><span class="fill" style="width:${pct}%"></span></div>
          <span class="meter-label">${word}${pct?` (${pct}%)`:''}</span>
        </div>`;
    }).join('');

    const totalPct = Math.round(v*100);
    return `
      <div class="state-meter" style="margin-top:10px">
        ${rowHtml}
        <div class="row" style="margin-top:8px">
          <span><b>종합</b></span>
          <div class="bar"><span class="fill" style="width:${totalPct}%"></span></div>
          <span class="meter-label">${totalPct}%</span>
        </div>
      </div>`;
  }

  // 결과 카피(라벨별)
  const COPY = {
    '방전 직전': {
      title:'🔋 방전 직전',
      quote:'“불빛이 희미해질 땐, 스위치를 잠깐 내려요.”',
      desc:'지금은 에너지 보존이 최우선. 미세한 충전 루틴(물 한 컵, 1분 호흡, 밝은 조명 켜기)으로 ‘기본 전압’을 올리면 회복이 빨라집니다.',
      remind:'지금 60초: 창문 열고 3회 깊은 호흡 → 물 한 컵.'
    },
    '저전력': {
      title:'🪫 저전력',
      quote:'“작게 켜고, 자주 충전.”',
      desc:'큰 목표보다 “2분 실행”으로 점화하세요. 작게 시작해도 연쇄 효과가 생기며, 오늘 리듬을 망치지 않고 회복선을 끌어올립니다.',
      remind:'지금 90초: 해야 할 일 1개만 2분 타이머로 스타트.'
    },
    '보통': {
      title:'🔆 보통',
      quote:'“연결이 잘 된 상태, 과부하만 조심!”',
      desc:'기본은 안정. 과한 멀티태스킹을 피하고, 단위작업을 25분 이내로 끊어가면 피로 누적 없이 효율이 유지됩니다.',
      remind:'지금 1분: 책상 정리 3개만 → 물 한 컵 → 25분 타이머.'
    },
    '충전 중': {
      title:'⚡ 충전 중',
      quote:'“속도를 올리되, 회복 루틴을 끼워 넣자.”',
      desc:'몰입이 쉽게 켜집니다. 단, 회복 루틴(걷기/기지개/눈 건강)을 일정마다 끼워 넣어야 ‘지속되는 고효율’이 완성됩니다.',
      remind:'지금 1분: 자리에서 일어나 기지개 3회 + 먼 곳 보기 20초.'
    },
    '풀충전': {
      title:'🌟 풀충전',
      quote:'“오늘의 하이라이트, 지금 뽑자.”',
      desc:'최고 컨디션. 가장 영향력 있는 과제 1개를 먼저 잡아 성과를 박아두세요. 이후엔 여유를 남기며 유지가 핵심입니다.',
      remind:'지금 1분: 하이라이트 1개를 메모하고 바로 착수.'
    }
  };

  function finish(){
    card.style.display='none'; bar.style.width='100%';

    const n = normalized();
    let v = scalarEnergy(n);
    v = tieBreak(v); // 경계값 보정

    const {label, hint} = stateLabel(v);
    const info = COPY[label];

    result.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <img class="animal-hero"
               src="../assets/energy.png"
               alt="${info.title}"
               onerror="this.onerror=null; this.src='../assets/mongsil.png'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>

        <p style="margin:10px 0">${info.desc}</p>

        <!-- 감정상태 요약(문장형, 퍼센트는 보조 문구로만) -->
        <div class="pill" style="margin-bottom:8px">현재 상태 — <b>${hint}</b></div>

        ${meters(n, v)}

        <div class="mind-remind" style="margin-top:10px">
          <b>🌿 지금 1분 리마인드:</b> ${info.remind}
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