// === Animal Test with Character Images ===
// 방어코드: DOM이 없으면 중단
document.addEventListener('DOMContentLoaded', () => {

  const Q = [
    {k:'A', q:'즉흥적인 외출/모임 제안이 설렌다.'},
    {k:'A', q:'몸을 움직이는 활동(산책/운동)을 즐긴다.'},
    {k:'A', q:'문제 생기면 먼저 행동부터 해보는 편이다.'},
    {k:'A', q:'사람들과 함께 움직일 때 에너지가 오른다.'},
    {k:'N', q:'새로운 방법을 실험하는 게 즐겁다.'},
    {k:'N', q:'큰 그림/가능성을 떠올리는 일이 자주 있다.'},
    {k:'N', q:'규칙보다 아이디어가 먼저 떠오른다.'},
    {k:'N', q:'낯선 장소/문화에 호기심이 강하다.'},
    {k:'C', q:'상대의 감정 변화를 금방 눈치챈다.'},
    {k:'C', q:'팀워크가 좋으면 능률이 더 오른다.'},
    {k:'C', q:'연락·소통이 끊기면 불편함을 느낀다.'},
    {k:'C', q:'상대 입장에서 생각해보는 편이다.'},
    {k:'S', q:'계획을 세우고 단계적으로 진행하는 게 편하다.'},
    {k:'S', q:'결정 전, 정보를 비교·검토하는 편이다.'},
    {k:'S', q:'한 번에 많은 변화를 주는 건 부담스럽다.'},
    {k:'S', q:'루틴과 규칙이 있으면 마음이 편하다.'}
  ];

  let idx = 0;
  const score = {A:0,N:0,C:0,S:0};
  const ans = [];

  const stepLabel = document.getElementById('stepLabel');
  const barFill   = document.getElementById('barFill');
  const qText     = document.getElementById('qText');
  const wrap      = document.getElementById('choiceWrap');
  const card      = document.getElementById('card');
  const resultBox = document.getElementById('result');
  const prevBtn   = document.getElementById('prev');
  const skipBtn   = document.getElementById('skip');

  if (!stepLabel || !barFill || !qText || !wrap || !card || !resultBox) {
    console.error('[animal.js] 필수 엘리먼트가 없습니다. HTML 경로/ID를 확인하세요.');
    return;
  }

  function render(){
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width   = `${(idx/Q.length)*100}%`;
    qText.textContent     = Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="3" type="button">매우 그렇다</button>
      <button class="choice" data-s="2" type="button">그렇다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>`;

    const prevSel = ans[idx];
    if (prevSel !== undefined) {
      Array.from(wrap.children).forEach(b=>{
        if(Number(b.dataset.s) === prevSel) b.classList.add('selected');
      });
    }

    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)), 120);
      });
    });
  }

  function choose(s){
    ans[idx] = s;
    score[Q[idx].k] += s;
    next();
  }

  function next(){
    idx++;
    if (idx < Q.length) render();
    else finish();
  }

  prevBtn?.addEventListener('click', ()=>{
    if (idx === 0) return;
    idx--;
    recalcTo(idx);
    render();
  });

  skipBtn?.addEventListener('click', ()=>{
    ans[idx] = 0;
    next();
  });

  function recalcTo(endIdx){
    score.A = score.N = score.C = score.S = 0;
    for (let i=0; i<endIdx; i++){
      const v = ans[i] ?? 0;
      score[Q[i].k] += v;
    }
  }

  function pickType(sc){
    const pairs = Object.entries(sc).sort((a,b)=>b[1]-a[1]);
    const top1 = pairs[0][0], top2 = pairs[1][0];
    const key  = [top1, top2].sort().join('');
    const spread = Math.max(sc.A, sc.N, sc.C, sc.S) - Math.min(sc.A, sc.N, sc.C, sc.S);
    if (spread <= 3) return 'BALANCE';
    return MAP[key] || 'BALANCE';
  }

  const MAP = { 'AN':'FOX', 'AC':'OTTER', 'AS':'CAT', 'CN':'DOLPHIN', 'CS':'PENGUIN', 'NS':'OWL' };

  const IMG = {
    FOX:       '../assets/animals/fox.png',
    OTTER:     '../assets/animals/otter.png',
    CAT:       '../assets/animals/cat.png',
    DOLPHIN:   '../assets/animals/dolphin.png',
    PENGUIN:   '../assets/animals/penguin.png',
    OWL:       '../assets/animals/owl.png',
    BALANCE:   '../assets/animals/balance.png'
  };

  const COPY = {
    FOX:     { title:'🦊 여우형',    quote:'“일단 해보고 배우자!”', desc:'기민하고 재치 있는 도전자! 새로운 판을 여는 데 주저 없음.', tips:['체크포인트 3단계','즉흥 플랜에 안전장치 하나'] },
    OTTER:   { title:'🦦 수달형',    quote:'“같이 하면 더 재밌지!”', desc:'즐거움을 나누는 팀플레이어. 친화력 만점, 분위기 메이커!', tips:['연락 리듬 정하기','휴식 신호 공유'] },
    CAT:     { title:'🐱 고양이형',  quote:'“거리는 내가 정해. 정성은 진심으로.”', desc:'자율성과 집중력이 강점. 필요할 때 번개같이 움직여요.', tips:['자유 시간 확보','50-10 타이머'] },
    DOLPHIN: { title:'🐬 돌고래형',  quote:'“센스와 배려의 콜라보!”', desc:'영리하고 감각적. 공감과 창의성의 조합으로 흐름을 바꿔요.', tips:['아이디어 1가지 바로 실행','조용한 충전 타임'] },
    PENGUIN: { title:'🐧 펭귄형',    quote:'“천천히, 하지만 함께.”', desc:'의리 있고 성실한 협력가. 함께 가는 길을 좋아해요.', tips:['규칙 + 예외 규칙','내 감정도 중요!'] },
    OWL:     { title:'🦉 부엉이형',  quote:'“빨리보다 정확하게.”', desc:'차분한 통찰가. 새로움도 구조 안에서 섬세하게 다루죠.', tips:['탐색 시간 제한','작은 단위 실행'] },
    BALANCE: { title:'☁️ 균형몽실형', quote:'“필요한 때 필요한 얼굴.”', desc:'네 가지 성향이 고른 균형형. 상황별 모드 전환이 강점!', tips:['강점 지도 업데이트','기분/몸/일 리듬 한눈에'] }
  };

  function meters(sc){
    return ['A','N','C','S'].map(k=>{
      const name = {A:'활동성', N:'새로움', C:'공감', S:'신중'}[k];
      const pct  = Math.round(sc[k] / (4*3) * 100);
      return `<div style="text-align:left;margin:6px 0">
          <div style="display:flex;justify-content:space-between;font-weight:700">
            <span>${name}</span><span>${pct}%</span>
          </div>
          <div style="height:8px;background:var(--mint-200);border-radius:999px;overflow:hidden">
            <span style="display:block;height:100%;width:${pct}%;background:var(--mint-500)"></span>
          </div>
        </div>`;
    }).join('');
  }

  function finish(){
    card.style.display = 'none';
    barFill.style.width = '100%';

    const type = pickType(score);
    const info = COPY[type];
    const img  = IMG[type] || '../assets/animals/balance.png';

    const html = `<div class="result-card">
        <div class="result-hero">
          <img src="${img}" alt="${info.title}" onerror="this.src='../assets/animals/balance.png'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>
        <p style="margin:8px 0">${info.desc}</p>
        <div style="margin-top:8px">${meters(score)}</div>
        <div style="margin-top:8px">${info.tips.map(t=>`<div class="pill">${t}</div>`).join('')}</div>
        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>`;

    resultBox.innerHTML = html;
    resultBox.style.display = 'block';
  }

  // 시작
  render();

});
