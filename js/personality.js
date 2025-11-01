// personality.js v2

const ITEMS = [
  {k:'O',q:'새로 배우는 기술이나 취미를 기쁘게 시도한다.'},
  {k:'O',q:'낯선 문화/장소에도 호기심이 크다.'},
  {k:'O',q:'문제를 풀 때 독특한 방식이 떠오르는 편이다.'},
  {k:'O',q:'변화가 두렵기보다 기대된다.'},
  {k:'C',q:'약속·마감은 웬만하면 어기지 않는다.'},
  {k:'C',q:'할 일 목록을 만들고 체크한다.'},
  {k:'C',q:'작은 일도 끝까지 마무리하는 편이다.'},
  {k:'C',q:'정리정돈/시간관리 같은 루틴이 있다.'},
  {k:'E',q:'사람이 많은 자리에서 에너지가 오른다.'},
  {k:'E',q:'처음 본 사람에게도 먼저 말을 건다.'},
  {k:'E',q:'즉흥적인 만남/활동을 즐긴다.'},
  {k:'E',q:'감정 표현을 솔직하게 하는 편이다.'},
  {k:'A',q:'상대 감정에 공감하고 배려하려 한다.'},
  {k:'A',q:'갈등이 생기면 먼저 부드럽게 풀고 싶다.'},
  {k:'A',q:'상대가 불편해할 요소를 미리 살핀다.'},
  {k:'A',q:'내 의견을 말해도 톤은 다정하게 유지한다.'},
  {k:'N',q:'사소한 일에도 걱정이 쉽게 올라온다.'},
  {k:'N',q:'기분 기복이 잦은 편이다.'},
  {k:'N',q:'스트레스 상황에서 마음이 금방 휘청인다.'},
  {k:'N',q:'실수/지적을 오래 곱씹는 편이다.'},
];

const LABELS = {O:'개방성', C:'성실성', E:'외향성', A:'우호성', N:'정서안정(역)'};

let idx=0; const score={O:0,C:0,E:0,A:0,N:0}; const ans=[];
const stepLabel=document.getElementById('stepLabel');
const barFill=document.getElementById('barFill');
const qText=document.getElementById('qText');
const card=document.getElementById('card');
const result=document.getElementById('result');
const wrap=document.getElementById('choiceWrap');
const prevBtn=document.getElementById('prev');
const skipBtn=document.getElementById('skip');

function render(){
  stepLabel.textContent=`${idx+1} / ${ITEMS.length}`;
  barFill.style.width = `${(idx/ITEMS.length)*100}%`;
  qText.textContent = ITEMS[idx].q;
  wrap.innerHTML = `
    <button class="choice" data-s="3">매우 그렇다</button>
    <button class="choice" data-s="2">그렇다</button>
    <button class="choice ghost" data-s="1">아니다</button>
    <button class="choice ghost" data-s="0">전혀 아니다</button>`;
  const prevSel=ans[idx];
  if(prevSel!==undefined){ Array.from(wrap.children).forEach(b=>{ if(Number(b.dataset.s)===prevSel)b.classList.add('selected');});}
  Array.from(wrap.children).forEach(btn=>{
    btn.addEventListener('click',()=>{
      Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
      btn.classList.add('selected');
      setTimeout(()=>choose(Number(btn.dataset.s)),220);
    });
  });
}

function choose(s){ ans[idx]=s; score[ITEMS[idx].k]+=s; next(); }
function next(){ idx++; if(idx<ITEMS.length) render(); else finish(); }

prevBtn.addEventListener('click',()=>{ if(idx===0) return; idx--; recalc(); render(); });
skipBtn.addEventListener('click',()=>{ ans[idx]=0; next(); });

function recalc(){ score.O=score.C=score.E=score.A=score.N=0; for(let i=0;i<idx;i++) score[ITEMS[i].k]+=ans[i]??0; }

function finish(){
  card.style.display='none'; barFill.style.width='100%';
  const norm = normalizeScores(score);
  const witty = wittyTips(score);
  result.innerHTML = `
    <div class="result-card">
      <div class="result-hero">
        <img src="../assets/brain.png" alt="성격 아이콘">
        <div>
          <div class="result-title">나의 성격 성향 오각형</div>
          <div class="result-desc">빅파이브 5축을 카드 안 레이더로 보여드려요.</div>
        </div>
      </div>
      <div class="radar-wrap" style="margin:8px 0 6px">
        <canvas id="radar" width="340" height="340" aria-label="성격 레이다 차트"></canvas>
        <div class="radar-legend">
          ${['O','C','E','A','N'].map(k=>`
            <div class="legend-item"><span class="legend-dot"></span>${LABELS[k]}</div>
          `).join('')}
        </div>
      </div>
      <div style="margin-top:8px">${witty.map(t=>`<div class="pill">${t}</div>`).join('')}</div>
      <div class="result-actions">
        <a class="start" href="../index.html">메인으로</a>
        <button class="start" onclick="location.reload()">다시 테스트</button>
      </div>
      <p class="note" style="margin-top:10px">* 자기보고식 경향 파악 도구이며, 임상 진단을 대체하지 않습니다.</p>
    </div>`;
  result.style.display='block';
  drawRadar('radar', norm, ['O','C','E','A','N']);
}

function normalizeScores(sc){
  const counts = {O:4, C:4, E:4, A:4, N:4}; const maxPer = 3;
  return { O: sc.O/(counts.O*maxPer), C: sc.C/(counts.C*maxPer),
           E: sc.E/(counts.E*maxPer), A: sc.A/(counts.A*maxPer),
           N: 1 - (sc.N/(counts.N*maxPer)) };
}
function wittyTips(sc){
  const lines=[];
  if(sc.C>=9) lines.push("성실성 만렙! 달력과 메모장이 당신에게 사인 요청🗓️");
  else if(sc.C>=6) lines.push("착착형 생산가. ‘오늘 할 일’을 내일로 미루지 않아요.");
  if(sc.O>=9) lines.push("개방성 팝콘🍿 아이디어가 톡톡 튀어요. 실험 정신 굿!");
  if(sc.E>=9) lines.push("에너지 충만! 하지만 ‘혼자 충전 시간’도 챙기기🔋");
  if(sc.A>=9) lines.push("다정한 공감러 ☕ 대화의 온도를 지키는 사람.");
  if(sc.N<=3) lines.push("정서 안정! 파도에도 서핑 타는 평정심 🌊");
  if(lines.length===0) lines.push("균형 잡힌 구름 ☁️ 상황에 맞춰 색을 바꾸는 유연함!");
  return lines;
}
function drawRadar(canvasId, values, keys){
  const c = document.getElementById(canvasId); const ctx = c.getContext('2d');
  const W=c.width, H=c.height, cx=W/2, cy=H/2; const radius=Math.min(W,H)*0.38;
  const layers=5; const angleStep=(Math.PI*2)/keys.length;
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='rgba(146,217,206,0.9)'; ctx.lineWidth=1;
  for(let l=1;l<=layers;l++){
    ctx.beginPath(); const r=radius*(l/layers);
    for(let i=0;i<keys.length;i++){ const a=-Math.PI/2+angleStep*i; const x=cx+Math.cos(a)*r; const y=cy+Math.sin(a)*r; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
    ctx.closePath(); ctx.stroke();
  }
  ctx.fillStyle='#2F2F2F'; ctx.font='12px Pretendard, system-ui';
  keys.forEach((k,i)=>{ const a=-Math.PI/2+angleStep*i; const x=cx+Math.cos(a)*(radius+16); const y=cy+Math.sin(a)*(radius+16); const label={O:'개방성',C:'성실성',E:'외향성',A:'우호성',N:'정서안정(역)'}[k]; const tw=ctx.measureText(label).width; ctx.fillText(label, x-tw/2, y+4); });
  const pts = keys.map((k,i)=>{ const v=Math.max(0,Math.min(1,values[k])); const a=-Math.PI/2+angleStep*i; return {x:cx+Math.cos(a)*radius*v, y:cy+Math.sin(a)*radius*v}; });
  ctx.beginPath(); pts.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.closePath(); ctx.fillStyle='rgba(165,226,217,0.45)'; ctx.fill();
  ctx.beginPath(); pts.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.closePath(); ctx.strokeStyle='rgba(146,217,206,1)'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='rgba(146,217,206,1)'; pts.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fill(); });
}
render();