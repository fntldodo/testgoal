// v2025.6 — 응답시간 가중치/타이브레이커 + 몽실 톤 결과(상태설명 4줄)
(() => {
  const Q = [
    "상대의 옷차림/소지품에서 생활 습관의 단서를 빠르게 찾는다.",
    "상대가 쓰는 단어의 뉘앙스(항상/가끔 등)에 민감하게 반응한다.",
    "표정·목소리 톤의 작은 변화로 감정선이 바뀌는 걸 알아차린다.",
    "대화 초반에 열어둔 가능성(애매한 말)을 중간에 구체화해 나간다.",
    "상대가 반응한 포인트를 기억해 다음 질문을 즉시 수정한다.",
    "확정적인 단정 대신, 넓은 가설을 던지고 반응으로 좁혀간다.",
    "상대의 동조를 얻기 위해 쉬운 문장→조금 더 날카로운 문장으로 조정한다.",
    "‘누구에게나 유효한 문장’과 ‘상대에게만 유효한 문장’을 구분하려 한다.",
    "제스처/시선 방향에서 관심 주제를 감지한다.",
    "상대의 최근 경험(일/관계/건강) 중, 안전한 주제부터 접근한다.",
    "내 예상이 빗나가면 깔끔히 철회하고 다른 가설을 시도한다.",
    "대화 후 기록/메모를 남겨 다음 대화의 연결고리를 만든다.",
    "정보가 부족할 때 ‘일반적인 통계’로 가설을 뒷받침한다.",
    "무례하지 않게 거절/회수하는 문장을 준비해둔다.",
    "상대의 경계 신호(짧은 대답, 몸을 뒤로 빼기)를 민감하게 본다."
  ];
  const LABELS = ["전혀 아니다","거의 아니다","보통","그런 편이다","매우 그렇다"];

  let idx=0, startedAt=Date.now(); const answers=Array(Q.length).fill(null);
  const $=id=>document.getElementById(id);
  const counter=$("counter"), bar=$("bar"), qbox=$("qbox"), choices=$("choices");
  const btnPrev=$("btnPrev"), btnSkip=$("btnSkip");
  const res=$("result"), rTitle=$("rTitle"), rQuote=$("rQuote"),
        rFill=$("rFill"), rLabel=$("rLabel"), rDesc=$("rDesc"), rMind=$("rMind"),
        retryBtn=$("retryBtn");

  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
  const tW=s=> s<=1.2?+0.2 : s<=2.5?+0.1 : s<=6?0 : s<=10?-0.1 : -0.2;
  const apply=(c,s)=> Math.min(4, Math.max(0, c + (c-2)*tW(s)));

  function render(){
    counter.textContent=`문항 ${idx+1} / ${Q.length}`;
    bar.style.width=`${(idx/Q.length)*100}%`;
    qbox.textContent=Q[idx];
    choices.innerHTML="";
    LABELS.forEach((lab,i)=>{
      const row=document.createElement("div"); row.className="choice";
      const btn=document.createElement("button"); btn.type="button"; btn.textContent=lab;
      btn.addEventListener("click",()=>select(i));
      row.addEventListener("click",(e)=>{ if(e.target.tagName!=='BUTTON') btn.click(); });
      row.appendChild(btn); choices.appendChild(row);
    });
    btnPrev.disabled = idx===0;
    startedAt = Date.now();
  }

  function select(i){
    const sec=(Date.now()-startedAt)/1000;
    const w=apply(i,sec);
    answers[idx]={v:i,t:sec,w};
    if(idx<Q.length-1){ idx++; render(); } else { finish(); }
  }

  btnPrev.addEventListener("click", ()=>{ if(idx>0){ idx--; render(); }});
  btnSkip.addEventListener("click", ()=>{ if(idx<Q.length-1){ idx++; render(); } else { finish(); }});
  retryBtn.addEventListener("click", ()=>{ idx=0; answers.fill(null); res.hidden=true; document.querySelector(".test-card").hidden=false; render(); });

  function tie(prob){
    const rec=answers.slice(-3).filter(Boolean);
    if(!rec.length) return prob;
    const mean=avg(answers.filter(Boolean).map(a=>a.w));
    if(mean>=1.9 && mean<=2.1){
      const tilt = rec.reduce((s,a)=> s + (a.w-2), 0);
      if(tilt>0.01) return Math.min(100, prob+5);
      if(tilt<-0.01) return Math.max(0,   prob-5);
    }
    return prob;
  }

  function lines(prob){
    if (prob >= 70) return [
      "상대의 표정·말투·단서를 잘 캐치합니다.",
      "너무 빠른 판단은 감정을 놓치게 만들 수 있어요.",
      "추측보다 확인을 더 자주 선택해보세요.",
      "지나친 분석보다, 따뜻한 반응이 관계를 살립니다."
    ];
    if (prob >= 40) return [
      "감은 좋지만, 상황에 따라 집중력이 달라질 수 있어요.",
      "‘누구나 문장’과 ‘그 사람만의 문장’을 구분해보세요.",
      "빗나가면 깔끔히 회수하고 다른 가설로 전환하세요.",
      "다음 대화를 위한 작은 연결 고리를 남겨두세요."
    ];
    return [
      "감지력은 천천히 자라나는 감각이에요.",
      "표정·톤·단어에서 작은 단서를 찾아보세요.",
      "넓게 던지고 반응으로 좁히는 연습을 해보세요.",
      "안전을 지키는 회수 문장을 미리 준비해두세요."
    ];
  }

  function finish(){
    const valid=answers.filter(Boolean);
    const mean=valid.length? avg(valid.map(a=>a.w)) : 0;
    let prob=Math.round((mean/4)*100);
    prob = tie(prob);

    document.querySelector(".test-card").hidden = true;
    res.hidden = false;

    rTitle.textContent="콜드리딩 감지력";
    rQuote.textContent="나는 대화 속에서 숨은 단서들을 얼마나 섬세하게 읽고 있을까?";
    rFill.style.width=prob+"%";
    rLabel.textContent=`감지력 — ${prob}%`;

    const l = lines(prob);
    rDesc.innerHTML = `<ul class="state-list">${l.map(x=>`<li>${x}</li>`).join("")}</ul>`;
    rMind.textContent="마음 리마인드 — 모든 신호를 읽으려 하기보다, 마음을 느껴요.";
  }

  render();
})();