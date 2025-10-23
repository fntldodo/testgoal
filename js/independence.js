
const Q = [
  {k:'R', q:'기상·취침 시간이 비교적 일정하다.'},
  {k:'R', q:'할 일/일정을 스스로 계획해 실행한다.'},
  {k:'R', q:'예산·지출을 기록하거나 관리한다.'},
  {k:'R', q:'작은 일도 마감 기한을 정해두면 잘 끝낸다.'},
  {k:'R', q:'정리정돈과 환경 정비를 자주 한다.'},
  {k:'D', q:'중요한 일의 최종 결정은 스스로 내리는 편이다.'},
  {k:'D', q:'원치 않는 부탁은 정중히 거절할 수 있다.'},
  {k:'D', q:'선호/가치를 분명히 알고 선택에 반영한다.'},
  {k:'D', q:'타인의 비판에도 내 기준을 쉽게 놓지 않는다.'},
  {k:'D', q:'정보를 모으고 비교해 합리적 결정을 내린다.'},
  {k:'E', q:'스트레스를 느껴도 호흡/휴식으로 진정시킨다.'},
  {k:'E', q:'감정이 격해져도 말투·행동을 조절하려 노력한다.'},
  {k:'E', q:'실수/실패를 오래 끌지 않고 학습으로 전환한다.'},
  {k:'E', q:'불안할 때 도움 요청이나 상담을 시도할 수 있다.'},
  {k:'E', q:'몸 컨디션(수면/식사/운동)으로 마음을 관리한다.'},
];
let idx=0; const score={R:0,D:0,E:0}; const ans=[];
const stepLabel=document.getElementById('stepLabel');
const barFill=document.getElementById('barFill');
const qText=document.getElementById('qText');
const wrap=document.getElementById('choiceWrap');
const card=document.getElementById('card');
const resultBox=document.getElementById('result');
const prevBtn=document.getElementById('prev');
const skipBtn=document.getElementById('skip');
function render(){
  stepLabel.textContent = `${idx+1} / ${Q.length}`;
  barFill.style.width   = `${(idx/Q.length)*100}%`;
  qText.textContent     = Q[idx].q;
  wrap.innerHTML = `
    <button class="choice" data-s="3">매우 그렇다</button>
    <button class="choice" data-s="2">그렇다</button>
    <button class="choice ghost" data-s="1">아니다</button>
    <button class="choice ghost" data-s="0">전혀 아니다</button>`;
  const prevSel=ans[idx]; if(prevSel!==undefined){ Array.from(wrap.children).forEach(b=>{ if(Number(b.dataset.s)===prevSel)b.classList.add('selected');});}
  Array.from(wrap.children).forEach(btn=>{
    btn.addEventListener('click', ()=>{
      Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
      btn.classList.add('selected');
      setTimeout(()=>choose(Number(btn.dataset.s)), 220);
    });
  });
}
function choose(s){ ans[idx]=s; score[Q[idx].k]+=s; next(); }
function next(){ idx++; if(idx<Q.length) render(); else finish(); }
prevBtn.addEventListener('click', ()=>{ if(idx===0) return; idx--; recalcTo(idx); render(); });
skipBtn.addEventListener('click', ()=>{ ans[idx]=0; next(); });
function recalcTo(end){ score.R=score.D=score.E=0; for(let i=0;i<end;i++){ const v=ans[i]??0; score[Q[i].k]+=v; } }
function classify(sc){
  const r=sc.R,d=sc.D,e=sc.E; const spread=Math.max(r,d,e)-Math.min(r,d,e);
  if(spread<=3) return 'BALANCE';
  const max=Math.max(r,d,e); const top = (max===r?'R':(max===d?'D':'E'));
  if(top==='R') return 'ROUTINE'; if(top==='D') return 'DECIDER'; return 'CALMER';
}
function meter(label, val){
  const pct = Math.round(val / 15 * 100);
  return `<div style="text-align:left;margin:6px 0">
      <div style="display:flex;justify-content:space-between;font-weight:700">
        <span>${label}</span><span>${pct}%</span>
      </div>
      <div style="height:8px;background:var(--mint-200);border-radius:999px;overflow:hidden">
        <span style="display:block;height:100%;width:${pct}%;background:var(--mint-500)"></span>
      </div>
    </div>`;
}
const CARDS = {
  ROUTINE: { title:'🗓️ 루틴몽실형', text:'계획·습관으로 하루를 단단히 쌓는 타입. 일관성이 곧 마음의 안전벨트!', quote:'"작은 루틴이 큰 평온을 만든다 — 오늘도 체크 ✔️"', tips:['쉬는 날용 미니 루틴','완벽보다 지속 — 80% 완료도 박수👏'] },
  DECIDER: { title:'🧭 결정몽실형', text:'선호와 기준이 또렷한 주도형. 선택의 순간, 나침반이 정확해요.', quote:'"YES/NO 대신, 나의 기준을 한 줄로!"', tips:['옵션 3개 이하','거절 문장 템플릿 만들기'] },
  CALMER:  { title:'🌿 평온몽실형', text:'감정의 물결 위에서도 중심을 잡는 타입. 회복탄력성이 탁월해요.', quote:'"감정은 없애는 게 아니라 다루는 것 — 숨 길게, 물 한 잔."', tips:['수면·식사·걷기 루틴','감정 기록 3줄 메모'] },
  BALANCE: { title:'☁️ 균형몽실형', text:'루틴·결정·감정이 고르게 발달. 유연함이 강점!', quote:'"균형은 작은 습관의 합."', tips:['분기 업데이트 데이','과부하 신호 체크'] }
};
function finish(){
  card.style.display = 'none'; barFill.style.width='100%';
  const type = classify(score); const c = CARDS[type];
  const html = `<div class="result-card">
      <div class="result-hero">
        <img src="../assets/independence.png" alt="자립 캐릭터">
        <div>
          <div class="result-title">${c.title}</div>
          <div class="result-desc">${c.quote}</div>
        </div>
      </div>
      <p style="margin-bottom:8px">${c.text}</p>
      ${meter('루틴', score.R)}${meter('결정', score.D)}${meter('감정', score.E)}
      <div style="margin-top:8px">${c.tips.map(t=>`<div class="pill">${t}</div>`).join('')}</div>
      <div class="result-actions">
        <a class="start" href="../index.html">메인으로</a>
        <button class="start" onclick="location.reload()">다시 테스트</button>
      </div>
    </div>`;
  resultBox.innerHTML = html; resultBox.style.display = 'block';
}
render();
