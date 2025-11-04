/* ===================================================
 * ☁️ 마음 일기예보 v2025.2 — 마음 리마인드 버전
 * 규칙
 *  - 15문항 / 5지선다(0~4)
 *  - 응답시간 보조 ±20%(선택 우선, 뒤엎지 않음)
 *  - 6유형: SUNNY / CLOUDY / RAINY / STORM / RAINBOW / NIGHT
 *  - 숫자 단독 노출 금지(라벨 중심, %는 보조)
 *  - 결과: 제목/인용문/설명/감정상태 요약/마음 리마인드/상태 미터/버튼
 * 이미지
 *  - assets/weather/weather_{sunny|cloudy|rainy|storm|rainbow|night}.png
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 문항: 축/날씨별로 2~3개씩 분산
  // t: SUNNY(SU), CLOUDY(CL), RAINY(RA), STORM(ST), RAINBOW(RB), NIGHT(NI)
  const Q = [
    {t:'SU', q:'가볍게 시작하기가 오늘은 쉬운 편이었다.'},
    {t:'SU', q:'사소한 일에도 의욕이 톡톡 튄다.'},
    {t:'CL', q:'속도를 낮추고 상황을 더 살피고 싶었다.'},
    {t:'CL', q:'결정을 서두르기보다 정리/관망이 편했다.'},
    {t:'RA', q:'감정의 결이 평소보다 섬세하게 느껴졌다.'},
    {t:'RA', q:'작은 말/상황에도 마음이 쉽게 흔들렸다.'},
    {t:'ST', q:'생각/알림/자극이 한꺼번에 몰려왔다.'},
    {t:'ST', q:'급해지거나 압박감이 크게 느껴졌다.'},
    {t:'RB', q:'감사/연결감 같은 따뜻한 마음이 떠올랐다.'},
    {t:'RB', q:'작은 성취에서 회복되는 느낌이 있었다.'},
    {t:'NI', q:'속도를 늦추고 조용히 정리하고 싶었다.'},
    {t:'NI', q:'휴식/수면/충전의 필요가 분명히 느껴졌다.'},
    {t:'SU', q:'짧은 몰입(10~15분)이 지금 바로 가능하다.'},
    {t:'RA', q:'마음이 말랑해져 창의적인 생각이 스친다.'},
    {t:'CL', q:'정답보다 “기록/정리”가 오늘은 더 어울린다.'},
  ];

  // 상태
  let idx=0, start=Date.now();
  const ans=[], times=[];
  const score={SU:0,CL:0,RA:0,ST:0,RB:0,NI:0};

  // DOM
  const step=document.getElementById('stepLabel');
  const bar=document.getElementById('barFill');
  const qText=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const card=document.getElementById('card');
  const result=document.getElementById('result');
  const prev=document.getElementById('prev');
  const skip=document.getElementById('skip');

  // 시간 보조 가중치(±20% 캡, 선택 우선)
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
    wrap.innerHTML=`
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>`;
    const prevSel=ans[idx];
    if(prevSel!==undefined){
      [...wrap.children].forEach(b=>{ if(Number(b.dataset.s)===prevSel) b.classList.add('selected'); });
    }
    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click',()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      });
    });
    start=Date.now();
  }

  function choose(s){
    const sec=(Date.now()-start)/1000;
    const w=weight(sec);
    ans[idx]=s; times[idx]=sec;
    const k=Q[idx].t;
    const adjusted = s + (s*(w-1)*0.2);
    score[k]+=adjusted;
    next();
  }
  function next(){ idx++; if(idx<Q.length) render(); else finish(); }

  prev?.addEventListener('click',()=>{
    if(idx===0) return;
    idx--;
    recalc(idx);
    render();
  });
  skip?.addEventListener('click',()=>{
    ans[idx]=0; times[idx]=(Date.now()-start)/1000;
    next();
  });

  function recalc(end){
    score.SU=score.CL=score.RA=score.ST=score.RB=score.NI=0;
    for(let i=0;i<end;i++){
      const s=ans[i]??0;
      const t=times[i]??3;
      const w=weight(t);
      const k=Q[i].t;
      const adjusted = s + (s*(w-1)*0.2);
      score[k]+=adjusted;
    }
  }

  /* ---------------- 분류/타이브레이커 ---------------- */
  function classify(){
    // 평균으로 정규화(축별 문항 수 상이 방지)
    const count={SU:0,CL:0,RA:0,ST:0,RB:0,NI:0};
    Q.forEach(q=>{ count[q.t]++; });
    const norm = Object.fromEntries(Object.entries(score).map(([k,v])=>{
      const m = count[k]||1;
      return [k, (v/m)/4]; // 0~1
    }));
    const arr = Object.entries(norm).sort((a,b)=>b[1]-a[1]); // desc
    let [k1,v1]=arr[0], [k2,v2]=arr[1];
    const diff = v1 - v2;

    // tie-break: 최근 3문항 + 시간 보조
    if(diff < 0.08){
      const last3 = Math.max(0, Q.length-3);
      let drift=0;
      for(let i=last3;i<Q.length;i++){
        const ansVal = ans[i]??0;
        const t=times[i]??3;
        const w=weight(t);
        const k=Q[i].t;
        if(k===k1) drift += (ansVal+ (ansVal*(w-1)*0.2));
        else if(k===k2) drift -= (ansVal+ (ansVal*(w-1)*0.2));
      }
      if(drift<0){ const tmp=k1; k1=k2; k2=tmp; }
    }

    return {top:k1, second:k2, norm};
  }

  /* ---------------- 결과 카피 ---------------- */
  const ICON = (k)=>`../assets/weather/weather_${({
    SU:'sunny', CL:'cloudy', RA:'rainy', ST:'storm', RB:'rainbow', NI:'night'
  })[k]}.png`;

  const COPY = {
    SU:{title:'☀️ 맑음', quote:'“기세가 있을 때, 한 걸음!”',
        desc:'빛이 통과하듯 가벼운 날. 시작이 쉬워 작은 실행이 잘 붙습니다.',
        remind:['햇볕 5분 받기','가벼운 정리 3개','핵심 1개만 착수']},
    CL:{title:'⛅ 흐림', quote:'“급할 것 없어요. 관찰이 힘.”',
        desc:'속도를 줄이고 주변을 헤아리는 날. 탐색/정리에 어울립니다.',
        remind:['미정은 기록으로 보류','받은 편지함 5개 정리','결정은 내일 오전으로']},
    RA:{title:'🌧 비', quote:'“흘려보내면 창의가 열려요.”',
        desc:'감정의 결이 섬세해지는 날. 부드럽게 흘리면 오히려 깊이가 생깁니다.',
        remind:['감정일기 3줄(사실/느낌/바람)','따뜻한 음료','창밖 1분 보기']},
    ST:{title:'⛈ 폭풍', quote:'“방향만 잡으면 추진력 폭발.”',
        desc:'자극과 생각이 몰려드는 날. 한 가지에 꽂으면 강력합니다.',
        remind:['알림 20분 차단','중요 1개만 고정','25분 몰입 타이머']},
    RB:{title:'🌈 무지개', quote:'“감사/연결감이 회복을 부릅니다.”',
        desc:'마음과 생각이 화해하는 날. 따뜻한 연결이 쉽게 떠오릅니다.',
        remind:['고마운 일 3가지 적기','안부 한 줄 보내기','책상 위 작은 꽃/오브제 정리']},
    NI:{title:'🌙 밤', quote:'“낮춰야 멀리 가요.”',
        desc:'속도를 낮추고 충전에 적합한 날. 조용한 정리가 깊이를 만듭니다.',
        remind:['스크린 15분 줄이기','따뜻한 샤워','일찍 눕기 알람']}
  };

  /* ---------------- 상태 미터(날씨 용어) ----------------
   *  - 기압: 안정/압박감(= 자극 역지표) → ST와 반비례
   *  - 습도: 감정 포화감(= RA)        → 정비례
   *  - 바람: 전환/움직임(= SU/ST)     → SU+ST 중간값
   *  - 체감온도: 따뜻한 연결감(= RB)   → 정비례 (CL/NI는 약간 낮춤)
   * 수치는 %로 계산하되 라벨 동반(숫자 단독 금지)
   * ----------------------------------------------------- */
  function labelScale(v){
    if(v>=0.80) return '아주 안정적';
    if(v>=0.60) return '안정적';
    if(v>=0.40) return '보통';
    if(v>=0.20) return '약간 민감';
    return '예민/저기압';
  }
  function percent(v){ return Math.max(0, Math.min(100, Math.round(v*100))); }

  function buildMeters(norm){
    // 0~1 정규화 입력
    const pSU=norm.SU, pCL=norm.CL, pRA=norm.RA, pST=norm.ST, pRB=norm.RB, pNI=norm.NI;

    const press = clamp(1 - pST*0.8, 0, 1);                         // 기압(안정)
    const humid = clamp(pRA, 0, 1);                                 // 습도(감정 포화)
    const wind  = clamp((pSU*0.6 + pST*0.4), 0, 1);                  // 바람(전환/추진)
    const feels = clamp(pRB*0.9 + pCL*0.1 + (1-pNI)*0.05, 0, 1);     // 체감온도(따뜻함)

    const rows = [
      {name:'기압', val:press},
      {name:'습도', val:humid},
      {name:'바람', val:wind},
      {name:'체감온도', val:feels},
    ];
    return `
      <div class="state-meter" style="margin-top:8px">
        ${rows.map(r=>`
          <div class="row">
            <span><b>${r.name}</b></span>
            <div class="bar"><span class="fill" style="width:${percent(r.val)}%"></span></div>
            <span style="color:var(--text-soft)">${labelScale(r.val)}${''}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }

  function finish(){
    card.style.display='none'; bar.style.width='100%';

    const {top, second, norm} = classify();
    const info = COPY[top];
    const icon = ICON(top);

    // 감정상태 요약(2줄)
    const summary = {
      SU:'가볍게 시작·짧은 몰입에 유리',
      CL:'관찰/정리 타이밍, 결정은 보류 OK',
      RA:'감정 섬세 — 부드럽게 흘려보내기',
      ST:'자극 과다 — 한 가지에만 몰입',
      RB:'회복/감사 — 연결감으로 에너지 ↑',
      NI:'충전/정리 — 속도를 낮춰 깊이 만들기'
    }[top];

    const nextHint = {
      SU:'핵심 1개만 바로 시작',
      CL:'미정은 기록으로 묶고 보류',
      RA:'감정일기 3줄 후 따뜻한 음료',
      ST:'알림 OFF + 25분 타이머',
      RB:'고마운 사람에게 안부 한 줄',
      NI:'스크린 타임 줄이고 일찍 눕기'
    }[top];

    result.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <img src="${icon}" alt="${info.title}"
               onerror="this.onerror=null; this.src='../assets/mongsil.png'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>

        <p style="margin:8px 0">${info.desc}</p>

        <!-- 감정상태 요약(2줄) -->
        <pre class="pill" style="white-space:pre-wrap;margin:8px 0">• 오늘의 톤: ${summary}
• 다음 한 걸음: ${nextHint}</pre>

        <!-- 상태 미터(날씨 용어) -->
        ${buildMeters(norm)}

        <!-- 마음 리마인드(1분 내 실행) -->
        <div class="mind-remind" style="margin:8px 0 10px;color:var(--text-soft)">
          <b>🌿 마음 리마인드(1분 내 실행)</b><br>
          · ${info.remind[0]}<br>
          · ${info.remind[1]}<br>
          · ${info.remind[2]}
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