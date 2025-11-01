/* ===================================================
 * 몽실이의 연애 스타일 테스트 (5지선다 + ±20% 가중치 + 8유형)
 * ---------------------------------------------------
 * 선택 점수 우선 / 응답시간은 보조
 * 단일형 4(E,C,S,I) + 조합형 6(EC,ES,EI,CS,CI,IS)
 * =================================================== */

document.addEventListener('DOMContentLoaded',()=>{

  const Q=[
    {k:'E',q:'좋아하는 사람이 생기면 표현을 아끼지 않는 편이다.'},
    {k:'S',q:'연애에서도 믿음과 안정감이 가장 중요하다고 생각한다.'},
    {k:'C',q:'대화가 끊기면 불안해진다.'},
    {k:'I',q:'연인과 떨어져 있어도 각자 시간을 즐길 수 있다.'},
    {k:'E',q:'감정은 숨기기보다 바로 표현하는 게 좋다고 생각한다.'},
    {k:'S',q:'불확실한 관계보다는 확실히 정해진 관계가 편하다.'},
    {k:'C',q:'서로의 일상을 자주 공유하는 걸 좋아한다.'},
    {k:'I',q:'연애가 나를 구속하지 않았으면 좋겠다.'},
    {k:'E',q:'연애 초반에 스킨십이 빨리 늘어나는 걸 자연스럽게 느낀다.'},
    {k:'S',q:'연애의 핵심은 신뢰라고 생각한다.'},
    {k:'C',q:'감정 표현이 서툰 상대에게 답답함을 느낀다.'},
    {k:'I',q:'연인이 나의 사생활을 세세히 아는 건 부담스럽다.'},
    {k:'E',q:'사랑한다는 말을 자주 해야 관계가 유지된다고 생각한다.'},
    {k:'S',q:'한 번의 실수보다 일관된 태도가 더 중요하다.'},
    {k:'I',q:'서로 일정한 거리감이 있어야 오래간다고 생각한다.'}
  ];

  let idx=0;
  const score={E:0,C:0,S:0,I:0};
  const ans=[],times=[];
  let start=Date.now();

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
    stepLabel.textContent=`${idx+1} / ${Q.length}`;
    barFill.style.width=`${(idx/Q.length)*100}%`;
    qText.textContent=Q[idx].q;

    wrap.innerHTML=`
      <button class="choice" data-s="4">매우 그렇다</button>
      <button class="choice" data-s="3">그렇다</button>
      <button class="choice" data-s="2">보통이다</button>
      <button class="choice ghost" data-s="1">아니다</button>
      <button class="choice ghost" data-s="0">전혀 아니다</button>`;

    const prevSel=ans[idx];
    if(prevSel!==undefined){
      [...wrap.children].forEach(b=>{
        if(Number(b.dataset.s)===prevSel)b.classList.add('selected');
      });
    }

    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click',()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),160);
      });
    });
    start=Date.now();
  }

  function choose(s){
    const elapsed=(Date.now()-start)/1000;
    times[idx]=elapsed;
    const k=Q[idx].k;
    const w=timeWeight(elapsed,k);
    ans[idx]=s;
    const adj=s+(s*(w-1)*0.2);
    score[k]+=adj;
    next();
  }

  function next(){
    idx++;
    if(idx<Q.length)render();
    else finish();
  }

  prevBtn.addEventListener('click',()=>{
    if(idx===0)return;
    idx--;recalc(idx);render();
  });
  skipBtn.addEventListener('click',()=>{
    ans[idx]=0;
    times[idx]=(Date.now()-start)/1000;
    next();
  });

  function recalc(end){
    score.E=score.C=score.S=score.I=0;
    for(let i=0;i<end;i++){
      const s=ans[i]??0;
      const k=Q[i].k;
      const w=timeWeight(times[i]??0,k);
      const adj=s+(s*(w-1)*0.2);
      score[k]+=adj;
    }
  }

  function timeWeight(sec,key){
    let w=1.0;
    if(sec<1)w=0.85;
    else if(sec<4)w=1.0;
    else if(sec<8)w=1.15;
    else w=1.1;
    if((key==='E'||key==='C')&&sec<2)w*=1.05;
    if((key==='I'||key==='S')&&sec>=4)w*=1.05;
    return Number(w.toFixed(2));
  }

  // --- 유형 분류 ---
  const DIFF_STRICT=3.0;
  function classify(sc){
    const arr=Object.entries(sc).sort((a,b)=>b[1]-a[1]);
    const [k1,v1]=arr[0];
    const [k2,v2]=arr[1];
    const diff=v1-v2;
    if(diff>=DIFF_STRICT)return `${k1}_ONLY`;
    return [k1,k2].sort().join('');
  }

  function interpret(avg){
    if(avg>=3.7)return{label:'매우 높음',tone:'result-very-high'};
    if(avg>=3.0)return{label:'높음',tone:'result-high'};
    if(avg>=2.0)return{label:'중간',tone:'result-mid'};
    if(avg>=1.0)return{label:'낮음',tone:'result-low'};
    return{label:'매우 낮음',tone:'result-very-low'};
  }

  const TYPE={
    E_ONLY:{t:'💗 표현 스파크형',q:'"마음은 전할 때 살아난다!"',d:'감정표현이 빠르고 확실한 타입. 관계의 온도를 올리는 리더형.'},
    C_ONLY:{t:'🤝 공감 네비게이터형',q:'"너의 리듬을 먼저 듣는다."',d:'상대의 감정을 잘 캐치하고 조율하는 섬세한 협력가.'},
    S_ONLY:{t:'🧭 신뢰 앵커형',q:'"꾸준함이 사랑을 지킨다."',d:'일관성과 책임감을 중시하며 안정감을 제공한다.'},
    I_ONLY:{t:'🕊️ 자유 바람형',q:'"숨 쉴 공간이 사랑을 오래가게 한다."',d:'자율성과 개별성을 존중하는 독립적 연애 스타일.'},
    CE:{t:'💞 따뜻한 커뮤니케이터형 (E+C)',q:'"마음은 나누고 귀는 열고."',d:'표현력+공감력의 조화. 빠른 피드백과 경청이 강점.'},
    ES:{t:'🌷 다정한 신뢰 빌더형 (E+S)',q:'"따뜻함을 꾸준히."',d:'감정표현과 안정감이 어우러진 성숙한 스타일.'},
    EI:{t:'🎈 유쾌한 독립형 (E+I)',q:'"가볍지만 진심."',d:'밝고 자유롭지만 관계에 진심인 타입.'},
    CS:{t:'🫶 온정적 수호자형 (C+S)',q:'"마음을 지키는 방법을 안다."',d:'공감+신뢰의 균형으로 안정된 관계를 유지한다.'},
    CI:{t:'🌤️ 배려적 독립형 (C+I)',q:'"서로의 거리도 존중이야."',d:'섬세한 배려와 건강한 거리 두기를 병행한다.'},
    IS:{t:'🌿 차분한 파트너십형 (I+S)',q:'"느리지만 견고하게."',d:'자율과 안정의 합. 담백하고 오래가는 관계.'}
  };

  function meter(){
    const keys=['E','C','S','I'];
    return keys.map(k=>{
      const pct=Math.round((score[k]/(5*4))*100);
      const n={E:'표현',C:'교류',S:'안정',I:'자율'}[k];
      return `<div style="margin:8px 0">
        <div style="display:flex;justify-content:space-between;font-weight:700">
          <span>${n}</span><span>${pct}%</span></div>
        <div style="height:8px;background:var(--mint-200);border-radius:999px;overflow:hidden">
          <span style="display:block;height:100%;width:${pct}%;background:var(--mint-500)"></span>
        </div></div>`;
    }).join('');
  }

  function finish(){
    card.style.display='none';
    barFill.style.width='100%';
    const key=classify(score);
    const info=TYPE[key]||{t:'☁️ 몽실형',q:'"함께 맞춰가요."',d:'데이터가 부족합니다.'};
    const answered=ans.filter(v=>v!==undefined).length||1;
    const avg=Object.values(score).reduce((a,b)=>a+b,0)/answered;
    const lev=interpret(avg);
    const avgT=times.length?(times.reduce((a,b)=>a+b,0)/times.length).toFixed(1):'0.0';

    result.innerHTML=`
    <div class="result-card">
      <div class="result-hero">
        <img src="../assets/love.png" alt="연애 캐릭터" onerror="this.style.display='none'">
        <div>
          <div class="result-title">${info.t}</div>
          <div class="result-desc">${info.q}</div>
          <div class="pill" style="margin-top:6px">표현 강도: <b>${lev.label}</b> (${avg.toFixed(1)}점)</div>
        </div>
      </div>
      <p style="margin:10px 0">${info.d}</p>
      <div style="margin-top:8px">${meter()}</div>
      <div style="margin:10px 0;font-size:13px;color:var(--text-soft)">평균 응답 시간: <b>${avgT}s</b></div>
      <div class="result-actions">
        <a class="start" href="../index.html">메인으로</a>
        <button class="start" onclick="location.reload()">다시 테스트</button>
      </div>
    </div>`;
    result.style.display='block';
  }

  render();
});
