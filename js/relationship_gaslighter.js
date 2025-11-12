// v2025.6 — 5지선다 + 응답시간 ±20% 가중치(선택 우선) + 타이브레이커 + 중립치 보정 + 상태설명 4줄
(() => {
  const Q = [
    "상대가 불편하다고 말하면 ‘그건 네가 예민해서 그래’라는 생각이 든다.",
    "내가 옳다는 확신이 있을 때, 상대의 기억/느낌을 교정하려 든다.",
    "상대가 나를 비판하면, 대개 ‘네가 오해한 거야’로 되받아친다.",
    "내가 원하는 방향으로 상대의 선택을 유도하는 편이다.",
    "내 말이 상대에게 상처였다는 말을 들으면, 먼저 ‘그건 네 해석’이라 여긴다.",
    "상대의 과거 실수를 근거로 현재의 감정을 무효화한 적이 있다.",
    "대화 중 내가 더 논리적/현명하다고 느끼며 주도하려 한다.",
    "사소한 농담이나 비꼼을 ‘장난’으로 처리해 왔다.",
    "상대의 감정보다 ‘사실’이 우선이라 생각해 감정을 잘 다루지 않는다.",
    "상대의 경계(그만/싫어)를 내가 보기엔 과하다고 느끼곤 한다.",
    "상대의 지인·정보를 통제하면 관계가 더 건강해질 거라 믿는다.",
    "상대의 자존감이 낮을수록 내 도움(지도)이 필요하다고 느낀다.",
    "내 사과는 ‘그렇게 느꼈다면 미안’처럼 조건이 붙는 편이다.",
    "내가 맞다고 확신하면, 사과 대신 설명으로 설득하려 한다.",
    "갈등 후 ‘결국 내 말이 맞았지?’라고 정리하고 싶다."
  ];
  const LABELS = ["전혀 아니다","거의 아니다","보통","그런 편이다","매우 그렇다"];

  let idx = 0, startedAt = Date.now();
  const answers = Array(Q.length).fill(null);

  const $ = id => document.getElementById(id);
  const counter=$("counter"), bar=$("bar"), qbox=$("qbox"), choices=$("choices");
  const btnPrev=$("btnPrev"), btnSkip=$("btnSkip");
  const result=$("result"), rTitle=$("rTitle"), rQuote=$("rQuote"), rFill=$("rFill"),
        rLabel=$("rLabel"), rDesc=$("rDesc"), rMind=$("rMind"), retryBtn=$("retryBtn");

  const tW = s => s<=1.2?+0.2 : s<=2.5?+0.1 : s<=6?0 : s<=10?-0.1 : -0.2;
  const apply = (c,s)=> Math.min(4, Math.max(0, c + (c-2)*tW(s)));
  const avg = a => a.reduce((x,y)=>x+y,0)/a.length;

  function render(){
    counter.textContent=`문항 ${idx+1} / ${Q.length}`;
    bar.style.width=`${(idx/Q.length)*100}%`;
    qbox.textContent=Q[idx];
    choices.innerHTML="";
    LABELS.forEach((lab,i)=>{
      const row=document.createElement("div"); row.className="choice";
      const btn=document.createElement("button"); btn.type="button"; btn.textContent=lab;
      btn.addEventListener("click",()=>select(i));
      row.addEventListener("click",(e)=>{ if(e.target.tagName!=="BUTTON") btn.click(); });
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
  retryBtn.addEventListener("click", ()=>{ idx=0; answers.fill(null); result.hidden=true; document.querySelector(".test-card").hidden=false; render(); });

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

  function buildStateLines(prob){
    if (prob >= 70) return [
      "대화를 ‘설득/교정의 경기’처럼 진행하는 습관이 감지돼요.",
      "“그건 네가 예민해서 그래” 같은 감정 무효화 표현을 점검해요.",
      "먼저 감정을 있는 그대로 인정한 뒤, 사실·의견을 나중에 제시해요.",
      "장난·비꼼은 즉시 회수 문장으로 정리하세요."
    ];
    if (prob >= 40) return [
      "상황에 따라 교정 말투가 올라오는 구간이에요.",
      "반박 전 “네가 그렇게 느낄 수 있어” 한 문장을 먼저 둡니다.",
      "사과는 조건 없이 짧게(“미안해, 그런 의도는 아니었어”).",
      "무엇이 불편했는지 질문으로 확인하고 해결을 함께 정리하세요."
    ];
    return [
      "대체로 존중 중심 대화를 유지하는 편이에요.",
      "감정 확인 → 사실 정리 → 요청 제안의 루틴을 계속 가져가요.",
      "예민한 이슈일수록 속도를 늦추고 요약으로 확인해요.",
      "결론은 승패보다 회복(둘의 안전)을 기준으로 마무리하세요."
    ];
  }

  function finish(){
    const valid=answers.filter(Boolean);
    const mean=valid.length ? avg(valid.map(a=>a.w)) : 0;
    let prob=Math.round((mean/4)*100);
    prob = tie(prob);

    document.querySelector(".test-card").hidden = true;
    result.hidden = false;

    rTitle.textContent = "가스라이팅 성향 지수";
    rQuote.textContent = "높을수록 ‘상대의 감정·기억을 교정/무효화’하려는 경향이 강한 상태예요.";
    rFill.style.width = prob + "%";
    rLabel.textContent = `예상 확률 — ${prob}%`;

    const lines = buildStateLines(prob);
    rDesc.innerHTML = `<ul class="state-list">${lines.map(li=>`<li>${li}</li>`).join("")}</ul>`;
    rMind.textContent = "마음 리마인드 — 정답보다 존중이 먼저.";
  }

  render();
})();