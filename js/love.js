/* ===================================================
 * 💗 연애 성향 테스트 v2025.2 — 마음 리마인드 버전
 * ---------------------------------------------------
 * - 15문항 / 5지선다(0~4)
 * - ±20% 응답시간 가중 (선택 우선)
 * - 4축: 표현(E), 교류(C), 자율(S), 안정(I)
 * - 8유형: 단일 4형 + 복합 4형 (EC, ES, CI, SI)
 * - 결과: 상태라벨 중심 (“활발함”, “차분함” 등)
 * - 결과 구성: 제목/인용문/설명/감정요약/마음리마인드/상태미터/버튼
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // [수정-추가] 질문 레이아웃 V2 적용 + 카테고리(동물=fun) 지정
  document.body.classList.add('layout-v2');
  document.body.setAttribute('data-theme','fun');

  const Q = [

    {k:'E', q:'좋아하는 감정을 표현하는 편이다.'},
    {k:'E', q:'상대가 내 감정을 알 수 있게 노력한다.'},
    {k:'E', q:'감정 표현이 솔직한 편이다.'},
    {k:'C', q:'사람들과의 교류에서 즐거움을 느낀다.'},
    {k:'C', q:'대화나 연락이 활발한 관계가 좋다.'},
    {k:'C', q:'연락이 끊기면 마음이 불안해진다.'},
    {k:'S', q:'혼자만의 시간도 중요하다고 생각한다.'},
    {k:'S', q:'연애 중에도 개인 루틴을 유지하려 한다.'},
    {k:'S', q:'감정적 거리보다 심리적 독립을 중시한다.'},
    {k:'I', q:'안정적인 관계를 선호한다.'},
    {k:'I', q:'상대의 일상 패턴을 함께하는 걸 좋아한다.'},
    {k:'I', q:'예측 가능한 관계에서 마음이 편하다.'},
    {k:'I', q:'갈등이 생기면 먼저 대화를 시도한다.'},
    {k:'E', q:'감정을 표현하지 않으면 답답함을 느낀다.'},
    {k:'S', q:'상대의 기분보다 내 컨디션을 우선 고려한다.'}
  ];

  let idx = 0, start = Date.now();
  const ans=[], times=[];
  const score={E:0,C:0,S:0,I:0}, count={E:0,C:0,S:0,I:0};

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
    const adj=s+(s*(w-1)*0.2);
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
      const w=weight(t); const adj=s+(s*(w-1)*0.2);
      score[k]+=adj; count[k]++;
    }
  }

  function normalize(){
    const n={};
    for(let k in score){ n[k]=Math.max(0,Math.min(1,(score[k]/Math.max(1,count[k]))/4)); }
    return n;
  }

  function classify(){
    const n=normalize();
    const arr=Object.entries(n).sort((a,b)=>b[1]-a[1]);
    const [k1,v1]=arr[0], [k2,v2]=arr[1], [k3,v3]=arr[2];
    const diff=v1-v2;
    if(diff<0.08) return {type:[k1,k2].sort().join(''), n};
    return {type:k1, n};
  }

  const TYPE_COPY={
    E:{title:'💞 표현형',quote:'“감정은 나눌 때 진짜가 된다.”',desc:'감정을 솔직하게 표현하며 관계를 깊게 만드는 타입이에요. 진심을 나누는 순간이 당신의 사랑을 단단하게 합니다.',mood:'표현 — 풍부함 / 교류 — 적극적 / 자율 — 온화 / 안정 — 균형',remind:'감정을 미루지 말고, 오늘은 한 문장으로 표현해요.'},
    C:{title:'🌷 교류형',quote:'“관계 속에서 피어나는 나.”',desc:'함께하는 순간을 소중히 여기는 교류 중심형이에요. 따뜻한 대화와 연결이 사랑의 언어입니다.',mood:'표현 — 따뜻함 / 교류 — 활발함 / 자율 — 보통 / 안정 — 부드러움',remind:'오늘은 먼저 연락해보세요. 작은 대화가 온기를 불러옵니다.'},
    S:{title:'🌿 자율형',quote:'“거리는 마음의 여백이다.”',desc:'스스로의 리듬을 지키며 사랑하는 독립적 성향이에요. 균형 잡힌 거리감이 오히려 관계를 단단하게 해줍니다.',mood:'표현 — 차분함 / 교류 — 절제 / 자율 — 높음 / 안정 — 평온',remind:'오늘은 혼자 있는 시간을 “충전”으로 생각해요.'},
    I:{title:'☁️ 안정형',quote:'“예측 가능한 사랑이 마음을 편하게 한다.”',desc:'감정의 기복보다 평온을 추구하는 안정형이에요. 꾸준함과 신뢰가 관계를 오래가게 합니다.',mood:'표현 — 온화 / 교류 — 일정 / 자율 — 안정 / 안정 — 높음',remind:'오늘은 익숙한 루틴 속의 작은 다정함을 떠올려보세요.'},
    EC:{title:'🌈 교류·표현형',quote:'“말하고, 느끼고, 연결한다.”',desc:'표현과 교류가 함께 강한 타입이에요. 사랑의 순간마다 진심을 나누며 주변에 따뜻한 기운을 전합니다.',mood:'표현 — 활발함 / 교류 — 풍부함 / 자율 — 중간 / 안정 — 부드러움',remind:'오늘의 대화 속 감정 한 조각을 기록해보세요.'},
    ES:{title:'🌤️ 표현·자율형',quote:'“솔직하지만 가볍게.”',desc:'감정은 표현하지만, 자신만의 속도도 지키는 균형형이에요. 솔직한 대화와 개인적 여백이 조화롭습니다.',mood:'표현 — 적극 / 교류 — 유연 / 자율 — 높음 / 안정 — 온화',remind:'감정 표현 후엔 “쉼표”도 함께 두세요.'},
    CI:{title:'🪴 교류·안정형',quote:'“함께여서 편안하다.”',desc:'교류와 안정이 중심인 포근한 스타일이에요. 따뜻한 관계 속에서도 편안함을 잃지 않습니다.',mood:'표현 — 부드러움 / 교류 — 높음 / 자율 — 차분 / 안정 — 높음',remind:'함께하는 시간에 “고요함”을 더해보세요.'},
    SI:{title:'🫶 자율·안정형',quote:'“조용히, 그러나 깊게.”',desc:'혼자일 땐 차분하고, 함께일 땐 안정감을 주는 타입이에요. 서두르지 않아도 마음은 충분히 통합니다.',mood:'표현 — 차분함 / 교류 — 잔잔 / 자율 — 높음 / 안정 — 높음',remind:'대화보다 눈맞춤 한 번이 더 진심일 수 있어요.'},
  };

  function label(v){
    if(v>=0.8) return '강함';
    if(v>=0.6) return '적정';
    if(v>=0.4) return '보통';
    if(v>=0.2) return '낮음';
    return '매우 낮음';
  }

  function finish(){
    card.style.display='none'; bar.style.width='100%';
    const r=classify(); const info=TYPE_COPY[r.type]||TYPE_COPY.I;
    const n=r.n;

    const meterHTML=['E','C','S','I'].map(k=>{
      const pct=Math.round(n[k]*100);
      const name={E:'표현',C:'교류',S:'자율',I:'안정'}[k];
      return `
      <div style="margin:6px 0">
        <div style="display:flex;justify-content:space-between;font-weight:700">
          <span>${name} — ${label(n[k])}</span>
          <span>${pct}%</span>
        </div>
        <div style="height:8px;background:var(--mint-200);border-radius:999px;overflow:hidden">
          <span style="display:block;height:100%;width:${pct}%;background:var(--mint-500)"></span>
        </div>
      </div>`;
    }).join('');

    result.innerHTML=`
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/love.png" alt="연애 아이콘"
               onerror="this.onerror=null; this.src='../assets/mongsil.png'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>

        <p style="margin:8px 0">${info.desc}</p>

        <div class="pill" style="margin:8px 0">${info.mood}</div>

        <div class="mind-remind" style="margin:6px 0 10px;color:var(--text-soft)">
          <b>🌿 마음 리마인드:</b> ${info.remind}
        </div>

        <div style="margin-top:8px">${meterHTML}</div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>`;
    result.style.display='block';
  }

  render();
});
