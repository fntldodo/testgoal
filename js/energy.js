/* ===================================================
 * 에너지(Battery) — 몽실몽실 v2025.2 (마음 리마인드)
 * ---------------------------------------------------
 * - 15문항 / 5지선다(0~4) + 응답시간 가중(±20%, 선택 우선)
 * - 축: DRIVE(의욕) / REST(회복) / FOCUS(집중) / LOAD(과부하, 역점수)
 * - 종합 에너지 지수(0~100) → 5단계 라벨
 *   · 방전 직전 / 저전력 / 보통 / 충전 중 / 풀충전
 * - 결과: 숫자 단독 노출 금지(라벨 중심, %는 괄호로 보조)
 * - 타이브레이커: 근소차면 최근 3문항 + 시간 보조
 * =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    {k:'DRIVE', q:'작게 시작하면 금방 탄력이 붙는 편이다.'},
    {k:'DRIVE', q:'새 아이디어가 떠오르면 실행으로 이어진다.'},
    {k:'REST',  q:'짧게라도 쉬면 컨디션이 확실히 회복된다.'},
    {k:'REST',  q:'수면/식사 등 기본 케어를 지키려 한다.'},
    {k:'FOCUS', q:'알림을 줄이면 일에 몰입이 잘 된다.'},
    {k:'FOCUS', q:'한 번 시작하면 중간 방해 없이 이어간다.'},
    {k:'LOAD',  q:'할 일이 머릿속에서 자주 뒤엉킨다.'},
    {k:'LOAD',  q:'피로감이나 부담이 쉽게 올라온다.'},
    {k:'DRIVE', q:'오늘 해야 할 작은 일을 떠올리면 마음이 가벼워진다.'},
    {k:'REST',  q:'산책/스트레칭 등 가벼운 회복 습관이 있다.'},
    {k:'FOCUS', q:'타이머(25분 등)를 쓰면 성과가 분명해진다.'},
    {k:'LOAD',  q:'해야 할 일을 미루다가 한꺼번에 몰리는 편이다.'},
    {k:'DRIVE', q:'완벽보다 “완료”가 더 중요하다고 느낀다.'},
    {k:'REST',  q:'물/호흡/눈휴식 같은 미니 회복을 신경 쓴다.'},
    {k:'FOCUS', q:'작은 목표를 쪼개면 집중이 훨씬 쉬워진다.'},
  ];

  let idx=0, start=Date.now();
  const score={DRIVE:0,REST:0,FOCUS:0,LOAD:0};
  const count={DRIVE:0,REST:0,FOCUS:0,LOAD:0};
  const ans=[], times=[], recent=[];

  const step=document.getElementById('stepLabel');
  const bar=document.getElementById('barFill');
  const qText=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const card=document.getElementById('card');
  const result=document.getElementById('result');
  const prev=document.getElementById('prev');
  const skip=document.getElementById('skip');

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
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;
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
    const k=Q[idx].k; const w=weight(sec);
    const adjusted = s + (s*(w-1)*0.2); // ±20% 캡 (선택 우선)
    score[k]+= adjusted; count[k]+=1; ans[idx]=s; times[idx]=sec;

    recent.push({i:idx,k,s,sec});
    if(recent.length>3) recent.shift();

    if(idx<Q.length-1){ idx++; render(); } else { finish(); }
  }

  prev?.addEventListener('click',()=>{
    if(idx===0) return;
    idx--;
    recalc(idx);
    render();
  });

  skip?.addEventListener('click',()=>{
    ans[idx]=0; times[idx]=(Date.now()-start)/1000;
    choose(0); // 스킵도 0으로 기록(편중 방지용)
  });

  function recalc(end){
    score.DRIVE=score.REST=score.FOCUS=score.LOAD=0;
    count.DRIVE=count.REST=count.FOCUS=count.LOAD=0;
    for(let i=0;i<end;i++){
      const s=ans[i]??0; const w=weight(times[i]??0); const k=Q[i].k;
      const adjusted = s + (s*(w-1)*0.2);
      score[k]+=adjusted; count[k]+=1;
    }
  }

  // 0~1 정규화
  function normAxis(){
    const N={};
    for(const k of Object.keys(score)){
      const denom=Math.max(1, count[k])*4;
      N[k]=Math.max(0, Math.min(1, score[k]/denom));
    }
    return N;
  }

  // 최근 3문항 타이브레이커(근소차일 때 높은 쪽을 결정)
  function tieBreak(a,b){
    let d=0;
    recent.forEach(r=>{
      const w=weight(r.sec);
      if(r.k===a) d+=1*w;
      if(r.k===b) d-=1*w;
    });
    return d>=0 ? a : b;
  }

  // 종합 에너지 지수(0~100)
  function energyIndex(N){
    // 양(+) 축: DRIVE, REST, FOCUS / 음(-) 축: LOAD
    // 간단 가중 합: 0.35*D + 0.30*R + 0.25*F - 0.20*LOAD
    let score = 0.35*N.DRIVE + 0.30*N.REST + 0.25*N.FOCUS - 0.20*N.LOAD;
    score = Math.max(0, Math.min(1, score));
    return Math.round(score*100);
  }

  function energyLabel(pct){
    if(pct < 20) return '방전 직전';
    if(pct < 40) return '저전력';
    if(pct < 60) return '보통';
    if(pct < 80) return '충전 중';
    return '풀충전';
  }

  function axisLabel(p){
    if(p>=0.8) return '매우 높음';
    if(p>=0.6) return '높음';
    if(p>=0.4) return '보통';
    if(p>=0.2) return '낮음';
    return '매우 낮음';
  }

  function meterRow(name, p01){
    const pct=Math.round(p01*100);
    return `
      <div style="text-align:left;margin:6px 0">
        <div style="display:flex;justify-content:space-between;font-weight:700">
          <span>${name} — ${axisLabel(p01)}</span>
          <span style="color:var(--text-soft)">${pct}%</span>
        </div>
        <div class="bar" style="height:8px">
          <span class="fill" style="width:${pct}%"></span>
        </div>
      </div>`;
  }

  function finish(){
    card.style.display='none'; bar.style.width='100%';

    const N=normAxis();                       // 축별 정규화
    const pct=energyIndex(N);                 // 0~100
    const label=energyLabel(pct);             // 5단계 라벨

    // 근소 차이에서 어느 축을 강조할지(보조 문구용)
    const pairs=[['DRIVE','REST'],['DRIVE','FOCUS'],['REST','FOCUS']];
    let topAxis='DRIVE', topVal=-1;
    Object.entries(N).forEach(([k,v])=>{ if(v>topVal){topAxis=k; topVal=v;}});
    const arr=Object.entries(N).sort((a,b)=>b[1]-a[1]);
    const [k1,v1]=arr[0], [k2,v2]=arr[1];
    const keyTop=(Math.abs(v1-v2)<0.06)? tieBreak(k1,k2) : k1;

    // 결과 카피
    const IMG='../assets/plant.png';
    const titleMap={
      '방전 직전':'🔋 방전 직전',
      '저전력':'🪫 저전력',
      '보통':'🔆 보통',
      '충전 중':'⚡ 충전 중',
      '풀충전':'🌞 풀충전'
    };
    const quoteMap={
      '방전 직전':'“지금은 멈춰야 앞으로 달릴 수 있어요.”',
      '저전력':'“작게 시작, 짧게 쉬기.”',
      '보통':'“리듬을 타면 더 편해져요.”',
      '충전 중':'“에너지가 모이면 속도는 자연히.”',
      '풀충전':'“지금의 탄력을 소중하게!”'
    };
    const descMap={
      '방전 직전':'에너지 잔량이 낮은 상태예요. 회복 루틴을 먼저 채우면 금방 균형을 되찾을 수 있어요.',
      '저전력':'가벼운 회복과 작은 성취가 필요한 구간. 부담은 줄이고 흐름만 유지해요.',
      '보통':'무리가 없는 표준 컨디션. 리듬을 잃지 않게 짧은 회복을 섞어주세요.',
      '충전 중':'좋은 상승 곡선! 과부하만 조심하면 성과가 잘 나옵니다.',
      '풀충전':'집중·의욕·회복이 조화로운 상태. “중요한 1개”를 크게 밀어보기 좋아요.'
    };

    const quickRemind = (state=>{
      // “지금 당장 1분 내 할 수 있는 것”으로 고정
      if(state==='방전 직전') return ['물 한 컵','눈 감고 30초 호흡(4-4)','자리에서 목/어깨 스트레칭'];
      if(state==='저전력')   return ['알림 끄고 5분 타이머','앉은 채 10회 기지개','창문 열고 공기 환기'];
      if(state==='보통')     return ['작업 쪼개기(2분 플랜)','물리적 방해물 정리 1개','짧은 산책 1분'];
      if(state==='충전 중')  return ['중요한 1개 바로 시작','25분 집중 타이머','끝나면 물 1컵 보상'];
      return /* 풀충전 */     ['핵심 1개 과감히 착수','알림 OFF 30분','마무리 의식 30초'];
    })(label);

    const moodSummary = [
      `의욕 — ${axisLabel(N.DRIVE)}`,
      `회복 — ${axisLabel(N.REST)}`,
      `집중 — ${axisLabel(N.FOCUS)}`,
      `과부하 — ${axisLabel(1-N.LOAD)}`
    ].join('  • ');

    // 퍼센트는 보조(라벨 우선)
    const subTitle = `${label} <span style="color:var(--text-soft)">(${pct}%)</span>`;

    result.innerHTML=`
      <div class="result-card hobby">
        <div class="result-hero">
          <img src="${IMG}" alt="에너지 아이콘" onerror="this.src='../assets/mongsil.png'">
          <div>
            <div class="result-title">${titleMap[label]}</div>
            <div class="result-desc">${quoteMap[label]}</div>
          </div>
        </div>

        <p style="margin:8px 0">${descMap[label]}</p>

        <div class="pill" style="margin:8px 0 2px">${moodSummary}</div>

        <div class="mind-remind" style="margin:6px 0 10px;color:var(--text-soft)">
          <b>🌿 지금 바로(1분 내) 할 수 있는 것:</b>
          ${quickRemind.map(t=>`<div class="pill" style="display:inline-block;margin:4px 6px 0 0">${t}</div>`).join('')}
        </div>

        <div style="margin-top:8px">
          <div style="font-weight:900;margin-bottom:4px">상태: ${subTitle}</div>
          ${meterRow('의욕(DRIVE)', N.DRIVE)}
          ${meterRow('회복(REST)',  N.REST)}
          ${meterRow('집중(FOCUS)', N.FOCUS)}
          ${meterRow('과부하(LOAD)', 1-N.LOAD)}
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;

    result.style.display='block';
  }

  render();
});
