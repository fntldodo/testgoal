/* ===================================================
 * 🧠 성격 테스트 (Big Five) v2025.2 — 마음 리마인드 버전
 * ---------------------------------------------------
 * - 15문항 / 5지선다(0~4)
 * - 응답시간 보조 ±20%(선택 우선)
 * - OCEAN(개방성, 성실성, 외향성, 친화성, 신경성)
 * - 결과: 라벨 중심(만렙·차분·출렁 등), 점수/숫자 직접 노출 금지
 * - 결과 구성: 제목/인용문/설명/감정요약/마음리마인드/레이더형 미터/버튼
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    {k:'O', q:'새로운 시도나 아이디어에 끌린다.'},
    {k:'O', q:'예술, 디자인, 철학 등에 흥미가 있다.'},
    {k:'O', q:'다른 관점을 열린 마음으로 듣는다.'},
    {k:'C', q:'계획을 세우고 그에 따라 행동한다.'},
    {k:'C', q:'해야 할 일을 미루지 않는다.'},
    {k:'C', q:'정리정돈이 잘 되는 편이다.'},
    {k:'E', q:'사람들과 어울리면 에너지가 생긴다.'},
    {k:'E', q:'모임이나 대화에서 먼저 말을 거는 편이다.'},
    {k:'E', q:'감정을 표현하는 게 자연스럽다.'},
    {k:'A', q:'다른 사람을 이해하려 노력한다.'},
    {k:'A', q:'배려와 양보가 익숙하다.'},
    {k:'A', q:'타인의 감정에 민감하게 반응한다.'},
    {k:'N', q:'감정 기복이 잦은 편이다.'},
    {k:'N', q:'스트레스를 쉽게 받는다.'},
    {k:'N', q:'작은 일에도 불안감이 생긴다.'}
  ];

  let idx = 0, start = Date.now();
  const ans=[], times=[];
  const score={O:0,C:0,E:0,A:0,N:0}, count={O:0,C:0,E:0,A:0,N:0};

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
      <button class="choice" data-s="4">매우 그렇다</button>
      <button class="choice" data-s="3">그렇다</button>
      <button class="choice" data-s="2">보통이다</button>
      <button class="choice ghost" data-s="1">아니다</button>
      <button class="choice ghost" data-s="0">전혀 아니다</button>`;
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
    start=Date.now();
  }

  function choose(s){
    const sec=(Date.now()-start)/1000;
    const w=weight(sec);
    ans[idx]=s; times[idx]=sec;
    const k=Q[idx].k;
    const adj = s + (s*(w-1)*0.2);
    score[k]+=adj; count[k]++;
    next();
  }
  function next(){ idx++; if(idx<Q.length) render(); else finish(); }

  prev?.addEventListener('click', ()=>{
    if(idx===0) return;
    idx--;
    recalc(idx);
    render();
  });

  skip?.addEventListener('click', ()=>{
    ans[idx]=0; times[idx]=(Date.now()-start)/1000;
    next();
  });

  function recalc(end){
    for(let k in score){ score[k]=0; count[k]=0; }
    for(let i=0;i<end;i++){
      const s=ans[i]??0; const t=times[i]??3; const k=Q[i].k;
      const w=weight(t); const adj = s + (s*(w-1)*0.2);
      score[k]+=adj; count[k]++;
    }
  }

  function normalize(){
    const n={};
    for(let k in score){
      n[k]=Math.max(0,Math.min(1,(score[k]/Math.max(1,count[k]))/4));
    }
    return n;
  }

  function label(v){
    if(v>=0.8) return '만렙';
    if(v>=0.6) return '높음';
    if(v>=0.4) return '보통';
    if(v>=0.2) return '낮음';
    return '출렁';
  }

  function finish(){
    card.style.display='none'; bar.style.width='100%';
    const n=normalize();

    // 라벨 + 퍼센트 해석용
    const traits=[
      {k:'O', name:'개방성', quote:'새로움에 열린 마음', remind:'새로운 자극 1가지 받아들이기'},
      {k:'C', name:'성실성', quote:'루틴과 집중의 힘', remind:'작은 루틴 3분 지키기'},
      {k:'E', name:'외향성', quote:'관계의 에너지', remind:'안부 한 줄 보내기'},
      {k:'A', name:'친화성', quote:'부드러운 교감', remind:'고마운 일 3줄 기록'},
      {k:'N', name:'신경성', quote:'감정의 출렁임', remind:'호흡 4·6으로 진정하기'},
    ];

    const moodSummary=`• ${traits.map(t=>`${t.name} — ${label(n[t.k])}`).join('  • ')}`;

    const remindList=traits.map(t=>`· ${t.remind}`).join('<br>');

    const meterHTML=`
      <div class="state-meter">
        ${traits.map(t=>{
          const pct=Math.round(n[t.k]*100);
          return `
          <div class="row">
            <span><b>${t.name}</b></span>
            <div class="bar"><span class="fill" style="width:${pct}%"></span></div>
            <span style="color:var(--text-soft)">${label(n[t.k])}${pct?` (${pct}%)`:''}</span>
          </div>`;}).join('')}
      </div>`;

    result.innerHTML=`
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/brain.png" alt="성격 아이콘"
               onerror="this.onerror=null; this.src='../assets/mongsil.png'">
          <div>
            <div class="result-title">🧠 당신의 오늘 성향</div>
            <div class="result-desc">“${moodSummary}”</div>
          </div>
        </div>

        <p style="margin:8px 0">당신의 마음은 여러 방향으로 움직이지만, 오늘은 ${traits.find(t=>n[t.k]===Math.max(...Object.values(n))).name} 쪽이 특히 빛나고 있어요. 
        각 요소의 균형이 당신의 개성입니다.</p>

        <div class="pill" style="margin:8px 0">${moodSummary}</div>

        <div class="mind-remind" style="margin:6px 0 10px;color:var(--text-soft)">
          <b>🌿 마음 리마인드</b><br>${remindList}
        </div>

        ${meterHTML}

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;
    result.style.display='block';
  }

  render();
});