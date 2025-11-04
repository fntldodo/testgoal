/* ===================================================
 * ⚡ 에너지 테스트 v2025.2 — 마음 리마인드 버전
 * 규칙:
 *  - 12문항 / 5지선다(0~4)
 *  - 응답시간 보조 ±20%(선택 우선, 뒤엎지 않음)
 *  - 결과 5단계: 방전 직전 / 저전력 / 보통 / 충전 중 / 풀충전
 *  - 퍼센트는 보조로만(라벨 동반), 숫자 단독 노출 금지
 *  - 결과: 제목/인용문/설명/감정상태 요약/마음 리마인드(1분 내)/상태 미터/버튼
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 12문항(컨디션·집중·기분·신체감각 등을 고르게 묻기)
  const Q = [
    {q:'오늘 아침(또는 기상 후) 몸의 무게감이 가벼웠다.'},
    {q:'작은 일이라도 금방 착수할 수 있었다.'},
    {q:'대화/알림/소음에 쉽게 지치지 않았다.'},
    {q:'가볍게라도 몸을 움직였다(걷기/스트레칭 등).'},
    {q:'지금 앉은 자세/호흡이 편안하다.'},
    {q:'머리가 맑고, 집중 전환이 수월했다.'},
    {q:'감정기복이 크지 않고 잔잔했다.'},
    {q:'물/간단 간식으로 에너지를 보충했다.'},
    {q:'해야 할 일을 미루지 않고 하나라도 처리했다.'},
    {q:'주변 정리가 어느 정도 되어 있다.'},
    {q:'눈/어깨/허리 등 신체 불편감이 적다.'},
    {q:'지금 바로 10~15분 몰입이 가능하다고 느낀다.'},
  ];

  let idx=0, start=Date.now();
  const ans=[], times=[];
  let sum=0; // 가중 합계

  // DOM
  const step=document.getElementById('stepLabel');
  const bar=document.getElementById('barFill');
  const qText=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const card=document.getElementById('card');
  const result=document.getElementById('result');
  const prev=document.getElementById('prev');
  const skip=document.getElementById('skip');

  // 시간 가중(±20% 캡 보조)
  function weight(sec){
    if(sec<1) return 0.9;       // 너무 빠른 반응: -10%
    if(sec<4) return 1.0;       // 보통
    if(sec<8) return 1.15;      // 숙고 +
    return 1.10;                // 과숙고 소폭 +
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
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;
    const prevSel=ans[idx];
    if(prevSel!==undefined){ [...wrap.children].forEach(b=>{ if(Number(b.dataset.s)===prevSel) b.classList.add('selected'); }); }
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
    const adjusted = s + (s*(w-1)*0.2); // 선택 우선, 시간은 ±20% 이내 보조
    sum += adjusted;
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
    sum=0;
    for(let i=0;i<end;i++){
      const s=ans[i]??0;
      const t=times[i]??3;
      const w=weight(t);
      const adjusted = s + (s*(w-1)*0.2);
      sum += adjusted;
    }
  }

  // 상태 라벨(5단계)
  function levelLabel(pct){
    if(pct>=85) return '풀충전';
    if(pct>=65) return '충전 중';
    if(pct>=45) return '보통';
    if(pct>=25) return '저전력';
    return '방전 직전';
  }

  // 미터(라벨 중심, %는 보조)
  function meter(pct){
    const safe = Math.max(0, Math.min(100, Math.round(pct)));
    return `
      <div class="state-meter" style="margin-top:8px">
        <div class="row">
          <span><b>에너지</b></span>
          <div class="bar"><span class="fill" style="width:${safe}%"></span></div>
          <span style="color:var(--text-soft)">${levelLabel(safe)}</span>
        </div>
      </div>`;
  }

  function finish(){
    card.style.display='none'; bar.style.width='100%';
    // 정규화: 최대 12문항 × 4점 = 48 → 가중치 반영 후 대략 0~(48*1.2)=57.6
    // 표준화 위해 48을 기준으로 % 환산 후 100 상한 클램프
    const pctRaw = (sum/48)*100;
    const pct = Math.max(0, Math.min(100, Math.round(pctRaw)));
    const label = levelLabel(pct);

    // 결과 카피
    const MAP = {
      '방전 직전': {
        title:'🪫 방전 직전',
        quote:'“잠깐 멈추고, 아주 작은 충전부터.”',
        desc:'지금은 속도를 줄이고 기본 충전에 집중하면 좋아요. 작은 회복이 다음 선택을 가볍게 합니다.',
        remind:[
          '창문 열고 깊은 호흡 3회',
          '물 1컵 + 어깨/목 스트레칭 1분',
          '작업 대신 5분 정리'
        ]
      },
      '저전력': {
        title:'🔋 저전력',
        quote:'“가볍게, 짧게, 한 번만.”',
        desc:'에너지가 낮지만 움직일 불씨는 있어요. 부담을 최소화해 작게 시작해봐요.',
        remind:[
          '알림 15분 끄기',
          '할 일 1개만 5분',
          '끝나면 작은 보상 1개'
        ]
      },
      '보통': {
        title:'🌤️ 보통',
        quote:'“리듬을 잇는 한 걸음.”',
        desc:'기본 컨디션은 양호해요. 무리하지 않는 선에서 짧은 몰입이 잘 붙습니다.',
        remind:[
          '타이머 15분',
          '수분 보충 + 자세 리셋',
          '끝난 뒤 책상 1분 정리'
        ]
      },
      '충전 중': {
        title:'⚡ 충전 중',
        quote:'“짧고 선명한 스퍼트.”',
        desc:'에너지가 오름세예요. 중요한 할 일을 작게 잘라 시범 운행으로 탄력을 유지해요.',
        remind:[
          '우선순위 1개만 시작',
          '방해 요소 20분 차단',
          '완료 후 한 줄 기록'
        ]
      },
      '풀충전': {
        title:'🌈 풀충전',
        quote:'“기세가 있을 때, 단 1개.”',
        desc:'지금은 추진력이 좋아요. 욕심을 줄이고 단 1개를 끝내는 만족감을 챙겨요.',
        remind:[
          '핵심 1개 바로 실행',
          '완료 후 짧은 산책',
          '다음 할 일은 내일로'
        ]
      }
    };
    const info = MAP[label];

    const RESULT_ICON = '../assets/energy.png';

    result.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <img src="${RESULT_ICON}" alt="에너지 상태"
               onerror="this.onerror=null; this.src='../assets/plant.png'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>

        <p style="margin:8px 0">${info.desc}</p>

        <!-- 감정상태 요약(2줄) -->
        <pre class="pill" style="white-space:pre-wrap;margin:8px 0">• 현재 톤: ${label}
• 다음 한 걸음: 작은 실행 1개로 리듬 잇기</pre>

        <!-- 상태 미터(퍼센트는 보조, 라벨이 주도) -->
        ${meter(pct)}

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