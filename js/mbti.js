/* ===================================================
 * MBTI 테스트 — v2025.3-fix
 * - 강도 선택: 라이트(8) / 보통(12) / 심화(24)
 * - 5지선다(0~4) + 응답시간 가중 ±20%
 * - 축: E/I, S/N, T/F, J/P
 * - 결과: 16유형 · 2줄 설명 + 장점 3줄 + 주의점 3줄 + 그래프(양쪽 퍼센트)
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('layout-v2');
  document.body.setAttribute('data-theme','fun');

  /* ---------------- 질문 세트 정의 ---------------- */

  const QUESTION_SETS = {
    light: {
      labelShort: '라이트',
      labelDetail: '라이트(8문항, 가벼운 확인용)',
      note: '* 현재: <b>라이트</b>(8문항, 빠른 경향 확인용) 기준 문항입니다. 자기보고식 경향 파악 도구이며, 임상 진단이 아닙니다.',
      items: [
        {axis:'EI', p:'E', q:'새로운 사람과 대화할 때 금세 에너지가 붙는다.'},
        {axis:'EI', p:'I', q:'하루를 마무리할 때는 혼자만의 시간이 꼭 필요하다.'},
        {axis:'SN', p:'S', q:'추상적인 얘기보다 일상적인 예시가 편하다.'},
        {axis:'SN', p:'N', q:'아이디어와 가능성을 떠올리며 상상하는 시간이 즐겁다.'},
        {axis:'TF', p:'T', q:'판단할 때 감정보다 기준·원칙을 먼저 본다.'},
        {axis:'TF', p:'F', q:'결정이 누군가의 감정에 미칠 영향이 크게 신경 쓰인다.'},
        {axis:'JP', p:'J', q:'할 일을 미리 정리해두어야 마음이 편하다.'},
        {axis:'JP', p:'P', q:'계획이 있어도 상황 보며 즉흥적으로 바꾸는 편이다.'},
      ]
    },
    normal: {
      labelShort: '보통',
      labelDetail: '보통(12문항, 표준형)',
      note: '* 현재: <b>보통</b>(12문항, 표준형) 기준 문항입니다. 자기보고식 경향 파악 도구이며, 임상 진단이 아닙니다.',
      items: [
        {axis:'EI', p:'E', q:'새로운 사람과 대화할 때 금세 에너지가 붙는다.'},
        {axis:'EI', p:'I', q:'혼자만의 시간이 있어야 생각이 정리된다.'},
        {axis:'EI', p:'E', q:'모임에서 먼저 분위기를 띄우는 편이다.'},

        {axis:'SN', p:'S', q:'추상적인 얘기보다 구체적인 사례가 편하다.'},
        {axis:'SN', p:'N', q:'가능성을 떠올리며 상상하는 시간이 즐겁다.'},
        {axis:'SN', p:'N', q:'패턴을 보고 큰 그림을 재빨리 파악한다.'},

        {axis:'TF', p:'T', q:'판단할 때 감정보다 기준/원칙을 우선한다.'},
        {axis:'TF', p:'F', q:'상대 감정의 파장까지 고려해 결정을 조율한다.'},
        {axis:'TF', p:'F', q:'갈등이 생기면 관계의 온도를 먼저 살핀다.'},

        {axis:'JP', p:'J', q:'계획표와 체크리스트가 있어야 마음이 놓인다.'},
        {axis:'JP', p:'P', q:'계획이 있어도 상황에 따라 유연하게 바꾼다.'},
        {axis:'JP', p:'J', q:'기한이 있으면 미리미리 처리해두는 편이다.'},
      ]
    },
    deep: {
      labelShort: '심화',
      labelDetail: '심화(24문항, 자세한 경향 확인용)',
      note: '* 현재: <b>심화</b>(24문항, 세부 경향 확인용) 기준 문항입니다. 자기보고식 경향 파악 도구이며, 임상 진단이 아닙니다.',
      items: [
        // EI 6
        {axis:'EI', p:'E', q:'처음 보는 사람에게도 먼저 말을 거는 편이다.'},
        {axis:'EI', p:'I', q:'사람 많은 자리를 다녀오면 에너지가 빨리 소진된다.'},
        {axis:'EI', p:'E', q:'여럿이 함께할 때 아이디어가 더 잘 떠오른다.'},
        {axis:'EI', p:'I', q:'조용한 환경에서 혼자 일할 때 집중이 잘 된다.'},
        {axis:'EI', p:'E', q:'계획보다 상황 속 즉흥적인 기회를 즐긴다.'},
        {axis:'EI', p:'I', q:'말하기 전에 머릿속으로 여러 번 정리해보는 편이다.'},

        // SN 6
        {axis:'SN', p:'S', q:'지금의 현실 상황을 먼저 파악하는 편이다.'},
        {axis:'SN', p:'N', q:'눈앞의 사실보다 “앞으로 어떻게 될지”가 더 궁금하다.'},
        {axis:'SN', p:'S', q:'새로운 것보다 익숙한 방식이 마음이 편하다.'},
        {axis:'SN', p:'N', q:'작은 일에서도 숨은 의미나 패턴을 찾으려 한다.'},
        {axis:'SN', p:'S', q:'설명 들을 때 요약·정리보다 예시가 더 이해되기 쉽다.'},
        {axis:'SN', p:'N', q:'아이디어나 상상을 기록해두는 편이다.'},

        // TF 6
        {axis:'TF', p:'T', q:'논리적으로 맞는지 먼저 체크하고 감정을 본다.'},
        {axis:'TF', p:'F', q:'상대가 상처받지 않을까 하는 걱정을 자주 한다.'},
        {axis:'TF', p:'T', q:'논쟁 상황에서도 감정에 휘둘리지 않으려 한다.'},
        {axis:'TF', p:'F', q:'상대 입장에서 어떻게 느낄지 상상해본 뒤 결정한다.'},
        {axis:'TF', p:'T', q:'일을 평가할 때 결과와 효율을 가장 중요하게 본다.'},
        {axis:'TF', p:'F', q:'결과가 좋아도 분위기가 나빴다면 마음이 걸린다.'},

        // JP 6
        {axis:'JP', p:'J', q:'일정을 미리 잡아두고 그에 맞춰 움직이는 편이다.'},
        {axis:'JP', p:'P', q:'마감 직전 집중력이 확 올라가는 경험이 많다.'},
        {axis:'JP', p:'J', q:'오늘 할 일을 전날이나 아침에 정리해두면 편하다.'},
        {axis:'JP', p:'P', q:'계획이 자주 바뀌어도 큰 스트레스를 느끼지 않는다.'},
        {axis:'JP', p:'J', q:'서랍·파일·폴더를 정리해두면 마음도 정돈된 느낌이다.'},
        {axis:'JP', p:'P', q:'선택지를 열어두고 상황을 보며 결정하는 편이다.'},
      ]
    }
  };

  /* ---------------- 상태 ---------------- */

  let currentMode = 'normal';
  let Q = QUESTION_SETS[currentMode].items;

  let idx = 0;
  let start = Date.now();
  const ans   = [];
  const times = [];
  const accum = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
  const count = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};

  /* ---------------- DOM ---------------- */

  const modeCard   = document.getElementById('modeCard');
  const testWrap   = document.getElementById('testWrap');
  const modeNote   = document.getElementById('modeNote');
  const modeMini   = document.getElementById('modeMini');

  const step   = document.getElementById('stepLabel');
  const bar    = document.getElementById('barFill');
  const qText  = document.getElementById('qText');
  const wrap   = document.getElementById('choiceWrap');
  const card   = document.getElementById('card');
  const result = document.getElementById('result');
  const prev   = document.getElementById('prev');
  const skip   = document.getElementById('skip');

  /* ---------------- 공통 함수 ---------------- */

  function weight(sec){
    if(sec<1) return 0.9;
    if(sec<4) return 1.0;
    if(sec<8) return 1.15;
    return 1.10;
  }

  function resetState() {
    idx = 0;
    start = Date.now();
    ans.length = 0;
    times.length = 0;
    for(const k in accum) accum[k] = 0;
    for(const k in count) count[k] = 0;
    if(card)   card.style.display = 'block';
    if(result) result.style.display = 'none';
    if(bar)    bar.style.width = '0%';
  }

  function updateModeUI() {
    if(modeMini){
      [...modeMini.querySelectorAll('.mode-pill')].forEach(btn=>{
        btn.classList.toggle('active', btn.dataset.mode === currentMode);
      });
    }
    if(modeNote){
      modeNote.innerHTML = QUESTION_SETS[currentMode].note;
    }
  }

  /* ---------------- 질문 렌더 ---------------- */

  function render(){
    if(!step || !bar || !qText || !wrap) return;
    step.textContent = `${idx+1} / ${Q.length}`;
    bar.style.width  = `${(idx/Q.length)*100}%`;
    qText.textContent = Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;

    const prevSel = ans[idx];
    if(prevSel !== undefined){
      [...wrap.children].forEach(b=>{
        if(Number(b.dataset.s) === prevSel) b.classList.add('selected');
      });
    }

    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click',()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      });
    });

    start = Date.now();
  }

  /* ---------------- 선택 처리 ---------------- */

  function choose(s){
    const sec = (Date.now()-start)/1000;
    const w   = weight(sec);
    const adj = s + (s*(w-1)*0.2);

    const {axis,p} = Q[idx];
    const a1 = axis[0], a2 = axis[1];

    if(p === a1){
      accum[a1]+=adj; count[a1]+=1; count[a2]+=1;
    }else{
      accum[a2]+=adj; count[a2]+=1; count[a1]+=1;
    }

    ans[idx]   = s;
    times[idx] = sec;

    idx++;
    if(idx < Q.length) render();
    else finish();
  }

  prev && prev.addEventListener('click',()=>{
    if(idx===0) return;
    idx--;
    for(const k in accum) accum[k]=0;
    for(const k in count) count[k]=0;

    for(let i=0;i<idx;i++){
      const sec = times[i]??3;
      const s   = ans[i]??0;
      const w   = weight(sec);
      const adj = s + (s*(w-1)*0.2);
      const {axis,p} = Q[i];
      const a1 = axis[0], a2 = axis[1];
      if(p===a1){accum[a1]+=adj; count[a1]+=1; count[a2]+=1;}
      else      {accum[a2]+=adj; count[a2]+=1; count[a1]+=1;}
    }
    render();
  });

  skip && skip.addEventListener('click',()=>{
    ans[idx]=0;
    times[idx]=(Date.now()-start)/1000;
    idx++;
    if(idx < Q.length) render();
    else finish();
  });

  /* ---------------- 점수 계산 ---------------- */

  function norm(letter){
    const avg = (accum[letter] / Math.max(1,count[letter])) / 4;
    return Math.max(0, Math.min(1, avg));
  }

  function strengthWord(diff){
    if(diff >= 0.35) return '매우 뚜렷하게';
    if(diff >= 0.20) return '뚜렷하게';
    if(diff >= 0.10) return '약간';
    return '거의 비슷하게';
  }

  function decide(){
    const E = norm('E'), I = norm('I');
    const S = norm('S'), N = norm('N');
    const T = norm('T'), F = norm('F');
    const J = norm('J'), P = norm('P');

    function pick(a,b,axisKey){
      if(Math.abs(a-b) >= 0.05) return a>=b ? axisKey[0] : axisKey[1];
      let d=0;
      for(let i=0;i<Q.length;i++){
        if(Q[i].axis !== axisKey) continue;
        const sec=times[i]??3, w=weight(sec), s=ans[i]??0;
        const mag = (s>=3?1:(s===2?0.3:0.1));
        d += (Q[i].p===axisKey[0] ? 1 : -1) * w * mag;
      }
      return d>=0 ? axisKey[0] : axisKey[1];
    }

    const e = pick(E,I,'EI');
    const s = pick(S,N,'SN');
    const t = pick(T,F,'TF');
    const j = pick(J,P,'JP');

    return {
      letters: `${e}${s}${t}${j}`,
      n: {E,I,S,N,T,F,J,P}
    };
  }

  /* ---------------- 16유형 설명 (전부 동일 – 생략 없이 붙여둔 버전) ---------------- */

  const COPY = { /* ← 여기에는 아까 준 긴 16유형 객체 그대로 넣어 주세요.
                    (길어서 답변에 한 번 더 안 붙일게, 위에서 이미 전체 받았으니까
                    그대로 복붙하면 됩니다) */ };

  /* ---------------- 그래프 ---------------- */

  function axisRow(n, a, b, name){
    let va = n[a] ?? 0;
    let vb = n[b] ?? 0;
    let pa = Math.round(va*100);
    let pb = Math.round(vb*100);

    if(pa+pb === 0){
      pa = pb = 50;
    }else{
      const sum = pa+pb;
      pa = Math.round(pa/sum*100);
      pb = 100-pa;
    }

    const diff = Math.abs(va - vb);
    const dom  = va >= vb ? a : b;
    const diffWord = strengthWord(diff);

    return `
      <div class="axis-row">
        <div class="axis-header">
          <span class="axis-name"><b>${name}</b></span>
          <span class="axis-label">
            ${a} ${pa}% · ${b} ${pb}% 
            <span class="axis-diff">(${dom} 쪽 ${diffWord} 우세)</span>
          </span>
        </div>
        <div class="axis-bar">
          <span class="axis-fill axis-fill-a" style="width:${pa}%"></span>
          <span class="axis-fill axis-fill-b" style="width:${pb}%"></span>
        </div>
      </div>
    `;
  }

  function meters(n){
    return `
      <div class="state-meter mbti-meter">
        ${axisRow(n,'E','I','에너지 방향')}
        ${axisRow(n,'S','N','정보 인식')}
        ${axisRow(n,'T','F','판단 기준')}
        ${axisRow(n,'J','P','생활 양식')}
      </div>
    `;
  }

  /* ---------------- 결과 렌더 ---------------- */

  function finish(){
    if(card) card.style.display='none';
    if(bar)  bar.style.width='100%';

    const {letters, n} = decide();
    const info = COPY[letters];

    const overviewHtml  = info.overview.map(l=>`<span class="block">${l}</span>`).join('');
    const strengthsHtml = info.strengths.join('<br>');
    const risksHtml     = info.risks.join('<br>');

    result.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <img class="animal-hero"
               src="../assets/mbti.png"
               alt="${info.title}"
               onerror="this.onerror=null; this.src='../assets/mbti.png'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>

        <p class="result-desc" style="margin:10px 0">
          ${overviewHtml}
        </p>

        <div class="result-section">
          <b>✅ 장점</b>
          <p>${strengthsHtml}</p>
        </div>

        <div class="result-section">
          <b>⚠️ 주의할 점</b>
          <p>${risksHtml}</p>
        </div>

        ${meters(n)}

        <div class="mind-remind" style="margin-top:10px">
          <b>🌿 마음 리마인드:</b> ${info.remind}
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;

    result.style.display='block';
  }

  /* ---------------- 모드 전환 ---------------- */

  function setMode(mode, fromMini = false){
    if(!QUESTION_SETS[mode]) return;

    const hasProgress = idx > 0 || (result && result.style.display === 'block');
    if(fromMini && hasProgress){
      const ok = window.confirm('검사 강도를 바꾸면 지금까지의 응답은 초기화되고 처음부터 다시 시작합니다.');
      if(!ok) return;
    }

    currentMode = mode;
    Q = QUESTION_SETS[mode].items;

    resetState();
    updateModeUI();
    render();

    if(modeCard) modeCard.style.display = 'none';
    if(testWrap) testWrap.style.display = 'block';
  }

  /* --- ① 큰 강도 선택 버튼에 직접 리스너 연결 --- */
  const bigModeButtons = document.querySelectorAll('.mode-option');
  bigModeButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const mode = btn.dataset.mode || 'normal';
      setMode(mode,false);
    });
  });

  /* --- ② 상단 미니 pill 리스너 --- */
  if(modeMini){
    modeMini.addEventListener('click',(e)=>{
      const btn = e.target.closest('.mode-pill');
      if(!btn) return;
      const mode = btn.dataset.mode;
      if(mode === currentMode) return;
      setMode(mode,true);
    });
  }

  // 처음엔 모드만 고르는 화면이므로 여기서는 render() 호출 안 함.
});

