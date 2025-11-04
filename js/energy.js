/* ===================================================
 * ⚡ 에너지 테스트 v2025.2 — 마음 리마인드 버전
 * 규칙:
 *  - 5지선다(0~4) + 응답시간 보조 ±20%(선택 우선, 뒤엎지 않음)
 *  - 결과: “5단계 상태 라벨” 고정 (퍼센트는 해석 라벨과 함께 보조만)
 *    · 방전 직전 / 저전력 / 보통 / 충전 중 / 풀충전
 *  - 결과 카드: 제목 / 인용문 / 설명(3~5문장) / 감정상태 요약(2줄)
 *               / 마음 리마인드(즉시 실행 1분 내 행동 포함) / 시각요소(배터리 게이지)
 *  - 중립 편중 방지: 최근 3문항 타이브레이커 + 시간가중
 *  - 이미지: 공통 아이콘 ../assets/plant.png (없으면 mongsil.png)
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 15문항 — 에너지(활력/집중/의욕/회복) 단일 축을 정규화해서 5단계 분류
  const Q = [
    {q:'지금 무언가를 “바로 시작”하기가 비교적 쉽다.'},
    {q:'한 가지에 10~20분 정도는 집중이 유지된다.'},
    {q:'몸이 무겁다기보다 가볍다는 느낌이 든다.'},
    {q:'작은 일이라도 완료하면 기분이 오른다.'},
    {q:'사람과 대화/메시지 주고받기가 어렵지 않다.'},
    {q:'맑은 공기/햇빛/물 한 잔으로 컨디션이 개선된다.'},
    {q:'미루던 일을 꺼내 들어도 부담이 덜하다.'},
    {q:'생각이 과하게 엉키지 않고 정리된다.'},
    {q:'앉았다 일어나는 동작이 크게 힘들지 않다.'},
    {q:'짧은 산책/스트레칭이면 기운이 금방 오른다.'},
    {q:'중요하지 않은 자극(알림/잡생각)을 덜 따라간다.'},
    {q:'밥/수면/물 섭취가 오늘은 대체로 규칙적이다.'},
    {q:'마감이 있어도 크게 압도되지 않는다.'},
    {q:'부정적 감정이 와도 오래 머무르지 않는다.'},
    {q:'“지금 할 수 있는 가장 작은 것”이 바로 떠오른다.'},
  ];

  let idx=0, startTime=Date.now();
  const ans=[], times=[];
  let sum=0; // 가중 누적 합 (0~4)
  const stepLabel=document.getElementById('stepLabel');
  const barFill=document.getElementById('barFill');
  const qText=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const card=document.getElementById('card');
  const result=document.getElementById('result');
  const prev=document.getElementById('prev');
  const skip=document.getElementById('skip');

  function weight(sec){
    if(sec<1) return 0.9;     // 너무 빠름: -10%
    if(sec<4) return 1.0;     // 보통
    if(sec<8) return 1.15;    // 숙고 +
    return 1.10;              // 과숙고 소폭 +
  }

  function render(){
    stepLabel.textContent=`${idx+1} / ${Q.length}`;
    barFill.style.width=`${(idx/Q.length)*100}%`;
    qText.textContent=Q[idx].q;
    wrap.innerHTML=`
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;
    const prevSel=ans[idx];
    if(prevSel!==undefined){
      [...wrap.children].forEach(b=>{ if(Number(b.dataset.s)===prevSel) b.classList.add('selected');});
    }
    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click',()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      });
    });
    startTime=Date.now();
  }

  function choose(s){
    const elapsed=(Date.now()-startTime)/1000;
    times[idx]=elapsed; ans[idx]=s;
    const w=weight(elapsed);
    const adjusted = s + (s*(w-1)*0.2); // ±20% 캡 (선택 우선)
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
    ans[idx]=0;
    times[idx]=(Date.now()-startTime)/1000;
    next();
  });

  function recalc(end){
    sum=0;
    for(let i=0;i<end;i++){
      const s=ans[i]??0;
      const t=times[i]??3;
      const w=weight(t);
      sum += s + (s*(w-1)*0.2);
    }
  }

  // 정규화(0~1)
  function normalized(){
    const max = Q.length * 4;
    const n = Math.max(0, Math.min(1, sum / Math.max(1,max)));
    return n;
  }

  // 타이브레이커: 경계 근처(±2.5%p)에서 최근 3문항 + 시간 보조로 미세 상향/하향
  function tieBreak(n){
    const boundaries=[0.2,0.4,0.6,0.8];
    let near=null;
    for(const b of boundaries){
      if(Math.abs(n-b) <= 0.025){ near=b; break; }
    }
    if(near===null) return n;
    const start = Math.max(0, Q.length-3);
    let d=0;
    for(let i=start;i<Q.length;i++){
      const s=ans[i]??0, t=times[i]??3;
      const w = t<1 ? 0.9 : (t<4?1.0:(t<8?1.15:1.1));
      // 최근 선택이 상향(>=3)이면 +, 하향(<=1)이면 -
      if(s>=3) d += w*0.01;     // 최대 +1%p 정도
      else if(s<=1) d -= w*0.01;
    }
    let adj = n + d;
    if(near===0.2) adj = Math.min(Math.max(adj, 0.18), 0.22);
    if(near===0.4) adj = Math.min(Math.max(adj, 0.38), 0.42);
    if(near===0.6) adj = Math.min(Math.max(adj, 0.58), 0.62);
    if(near===0.8) adj = Math.min(Math.max(adj, 0.78), 0.82);
    return Math.max(0, Math.min(1, adj));
  }

  function stageLabel(p){
    if(p<0.2)   return '방전 직전';
    if(p<0.4)   return '저전력';
    if(p<0.6)   return '보통';
    if(p<0.8)   return '충전 중';
    return '풀충전';
  }

  // 시각요소: 배터리 게이지 (라벨 중심, %는 보조)
  function battery(p){
    const pct = Math.round(p*100);
    return `
      <div style="margin:10px 0">
        <div style="display:flex;justify-content:space-between;font-weight:800">
          <span>배터리 상태</span><span>${stageLabel(p)} (${pct}%)</span>
        </div>
        <div style="position:relative;height:14px;border:1px solid var(--mint-300);border-radius:8px;overflow:hidden;background:#fff;">
          <span style="display:block;height:100%;width:${pct}%;background:var(--mint-500)"></span>
        </div>
      </div>
    `;
  }

  const COPY = {
    '방전 직전': {
      title:'🪫 방전 직전',
      quote:'“지금은 멈춤이 연료.”',
      desc:'에너지가 바닥에 가까워요. 억지로 밀기보다 안전 모드로 전환하면 회복이 빨라집니다. 아주 작은 휴식 루틴이 내일의 컨디션을 지킵니다.',
      tips:['밝은 조명 켜기 1회','물 한 컵 + 깊은 호흡 3회','알림 15분 끄기']
    },
    '저전력': {
      title:'🔋 저전력',
      quote:'“느리지만 앞으로.”',
      desc:'속도를 낮추고 가벼운 일부터. 작은 완료 경험이 곧 연료가 됩니다. 오늘은 무리하지 않는 “짧은 실행”이 정답!',
      tips:['의자에서 일어나 30초 스트레칭','할 일 1개만 5분 착수','햇빛/환기 1분']
    },
    '보통': {
      title:'🔆 보통',
      quote:'“꾸준함이 곧 안정.”',
      desc:'과하게 올리지도, 떨어뜨리지도 않는 안정 모드. 루틴을 유지하면서 중요한 것 1개를 살짝 앞당겨 보세요.',
      tips:['타이머 15분 집중','물 1컵 + 가벼운 산책','작업 후 1문장 기록']
    },
    '충전 중': {
      title:'⚡ 충전 중',
      quote:'“기세 있을 때 작게 한 걸음 더.”',
      desc:'에너지가 차오르는 중. 한 가지를 끝내고 축하하는 리듬을 타면 내일의 컨디션도 좋아집니다.',
      tips:['중요 태스크 1개 바로 착수','25분 몰입 + 5분 리셋','감사 1가지 적기']
    },
    '풀충전': {
      title:'🌞 풀충전',
      quote:'“지금이 바로 골든 타임.”',
      desc:'집중/의욕/활력이 모두 잘 붙는 날. 과부하만 피하면 최고의 추진력을 발휘할 수 있어요.',
      tips:['큰 일 1개 쐐기 박기','알림 1시간 최소화','끝나고 3분 정리']
    }
  };

  function finish(){
    card.style.display='none'; barFill.style.width='100%';
    let n = normalized();
    n = tieBreak(n); // 경계 근처면 최근 3문항/시간으로 미세 조정
    const label = stageLabel(n);
    const info = COPY[label];

    // 감정상태 요약(2줄)
    const mood = (()=>{
      if(label==='방전 직전') return '• 집중 — 흐릿함  • 의욕 — 낮음\n• 회복 — 우선 필요  • 속도 — 매우 느림';
      if(label==='저전력')   return '• 집중 — 낮음   • 의욕 — 낮음~보통\n• 회복 — 가벼운 리셋  • 속도 — 느림';
      if(label==='보통')     return '• 집중 — 보통   • 의욕 — 보통\n• 회복 — 유지 권장  • 속도 — 안정';
      if(label==='충전 중')  return '• 집중 — 선명   • 의욕 — 상승\n• 회복 — 양호     • 속도 — 가속';
      return '• 집중 — 선명+   • 의욕 — 높음\n• 회복 — 매우 양호  • 속도 — 빠름';
    })();

    result.innerHTML=`
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/plant.png" alt="에너지 아이콘" onerror="this.src='../assets/mongsil.png'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>

        <p style="margin:8px 0">${info.desc}</p>

        <pre class="pill" style="white-space:pre-wrap;margin:8px 0">${mood}</pre>

        <div class="mind-remind" style="margin:6px 0 10px;color:var(--text-soft)">
          <b>🌿 마음 리마인드(1분 내 실행)</b><br>
          · ${info.tips[0]}<br>
          · ${info.tips[1]}<br>
          · ${info.tips[2]}
        </div>

        ${battery(n)}

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