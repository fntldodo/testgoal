// v2025.6 — 응답시간 가중치/타이브레이커/중립치 보정 + 몽실 톤 결과(상태설명 4줄)
(() => {
  const Q = [
    "그 사람 앞에서 싫다는 말을 꺼내기 어렵다.",
    "거절 후 죄책감이 커져 결국 다시 들어주는 편이다.",
    "내가 느낀 불편을 설명하면 ‘그건 네가 예민한 것’이라는 반응을 종종 듣는다.",
    "대화를 시작하려면 눈치를 꽤 봐야 한다.",
    "연락/만남의 빈도나 시간대를 상대가 정하는 편이다.",
    "나의 사적인 정보/지인을 제한하려는 뉘앙스를 느낀 적이 있다.",
    "나의 성과/기쁨을 축소시키는 말을 자주 듣는다.",
    "사과가 ‘네가 그렇게 느꼈다면 미안’ 식으로 조건이 붙는다.",
    "상대의 기분이 나쁘면 당장 해결해야 할 의무감을 느낀다.",
    "최근 나의 수면/식사/일과에 영향을 받을 만큼 신경이 쓰인다.",
    "내가 겪은 일을 얘기하면 대화가 곧바로 그 사람 이야기로 넘어간다.",
    "싫었던 일을 다시 말하면 ‘그 얘긴 그만하자’로 종결되는 편이다.",
    "만나고 나면 마음이 잔뜩 쪼그라든 느낌이 든다.",
    "그 사람 앞에서 나의 기준/가치를 자주 수정하게 된다.",
    "헤어진 뒤에도 ‘혹시 내가 잘못했나’라는 생각이 길게 남는다."
  ];
  const LABELS = ["전혀 아니다","거의 아니다","보통","그런 편이다","매우 그렇다"];

  let idx=0, startedAt=Date.now(); const answers = Array(Q.length).fill(null);
  const $=id=>document.getElementById(id);
  const counter=$("counter"), bar=$("bar"), qbox=$("qbox"), choices=$("choices");
  const btnPrev=$("btnPrev"), btnSkip=$("btnSkip");
  const res=$("result"), rTitle=$("rTitle"), rQuote=$("rQuote"), rFill=$("rFill"),
        rLabel=$("rLabel"), rDesc=$("rDesc"), rMind=$("rMind"), retryBtn=$("retryBtn");

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
      "누군가의 부탁에 ‘아니요’가 잘 안 나올 수 있어요.",
      "상대를 배려하느라 내 감정을 미루는 패턴이 보입니다.",
      "나의 피곤함을 솔직히 말하는 것도 관계의 일부예요.",
      "“지금은 힘들어요, 여기까지만.”을 연습해요."
    ];
    if (prob >= 40) return [
      "사람/상황에 따라 경계가 흐려질 수 있어요.",
      "요청은 짧고 구체적으로 한 가지씩 말해요.",
      "중요한 결정은 메모/서면으로 남겨두어요.",
      "불편이 느껴지면 즉시 ‘멈춤표’를 찍어요."
    ];
    return [
      "관계 속에서도 나를 잘 돌보는 편이에요.",
      "‘거절’과 ‘수용’의 균형을 알고 있어요.",
      "새로운 관계일수록 속도를 천천히 해보세요.",
      "건강한 경계는 서로를 더 자유롭게 합니다."
    ];
  }

  function finish(){
    const valid=answers.filter(Boolean);
    const mean=valid.length? avg(valid.map(a=>a.w)) : 0;
    let prob=Math.round((mean/4)*100); // 경계 취약 확률
    prob = tie(prob);

    document.querySelector(".test-card").hidden = true;
    res.hidden = false;

    rTitle.textContent = "관계 경계 점검";
    rQuote.textContent = "나는 지금, 관계 안에서 나의 마음을 잘 지키고 있을까?";
    rFill.style.width = prob + "%";
    rLabel.textContent = `경계 취약 확률 — ${prob}%`;

    const l = lines(prob);
    rDesc.innerHTML = `<ul class="state-list">${l.map(x=>`<li>${x}</li>`).join("")}</ul>`;
    rMind.textContent = "마음 리마인드 — 내 마음의 울타리는, 내가 세운다.";
  }

  render();
})();