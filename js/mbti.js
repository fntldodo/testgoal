/* ===================================================
 * 🔤 MBTI 12문항 — v2025.2 마음 리마인드 확장 완전판
 * ---------------------------------------------------
 * - 5지선다(0~4) / 시간가중 ±20%(선택 우선)
 * - 4축 쌍(E/I, S/N, T/F, J/P)
 * - 결과: 코드 4글자 + 설명 + 마음 리마인드
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    {axis:'EI', a:'E', q:'사람 많은 자리에서 에너지가 오른다.'},
    {axis:'EI', a:'I', q:'혼자만의 시간이 꼭 필요하다.'},
    {axis:'EI', a:'E', q:'처음 본 사람에게 먼저 말을 거는 편이다.'},

    {axis:'SN', a:'S', q:'사실·경험이 중요하다. 추상은 답답하다.'},
    {axis:'SN', a:'N', q:'가능성과 아이디어를 이야기하는 게 즐겁다.'},
    {axis:'SN', a:'S', q:'새 개념은 구체적 예시가 있을 때 이해가 쉽다.'},

    {axis:'TF', a:'T', q:'의사결정에서 논리/정확성이 우선이다.'},
    {axis:'TF', a:'F', q:'사람들의 감정과 관계 영향을 먼저 본다.'},
    {axis:'TF', a:'T', q:'논리적 모순을 보면 바로 잡고 싶다.'},

    {axis:'JP', a:'J', q:'계획표/마감이 있어야 마음이 편하다.'},
    {axis:'JP', a:'P', q:'상황 따라 즉흥적으로 움직이는 편이다.'},
    {axis:'JP', a:'J', q:'할 일을 미리 정리하고 진행한다.'}
  ];

  let idx = 0, start = Date.now();
  const ans = [], times = [];
  const S = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};

  const step = document.getElementById('stepLabel'),
        bar  = document.getElementById('barFill'),
        qTxt = document.getElementById('qText'),
        wrap = document.getElementById('choiceWrap'),
        card = document.getElementById('card'),
        result = document.getElementById('result'),
        prev = document.getElementById('prev'),
        skip = document.getElementById('skip');

  function weight(sec){
    if (sec < 1) return 0.9;
    if (sec < 4) return 1.0;
    if (sec < 8) return 1.15;
    return 1.10;
  }

  function render(){
    step.textContent = `${idx+1} / ${Q.length}`;
    bar.style.width  = `${(idx/Q.length)*100}%`;
    qTxt.textContent = Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="4">매우 그렇다</button>
      <button class="choice" data-s="3">그렇다</button>
      <button class="choice" data-s="2">보통이다</button>
      <button class="choice ghost" data-s="1">아니다</button>
      <button class="choice ghost" data-s="0">전혀 아니다</button>
    `;

    const prevSel = ans[idx];
    if (prevSel !== undefined) {
      [...wrap.children].forEach(b => {
        if (Number(b.dataset.s) === prevSel) b.classList.add('selected');
      });
    }

    [...wrap.children].forEach(btn => {
      btn.addEventListener('click', () => {
        [...wrap.children].forEach(c => c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(() => choose(Number(btn.dataset.s)), 150);
      });
    });

    start = Date.now();
  }

  function choose(s){
    const sec = (Date.now()-start)/1000;
    const w   = weight(sec);
    const adj = s + (s*(w-1)*0.2); // 선택 우선, 시간 보조
    ans[idx] = s;
    times[idx] = sec;
    S[Q[idx].a] += adj;
    next();
  }

  function next(){ idx++; if (idx < Q.length) render(); else finish(); }

  prev?.addEventListener('click', () => {
    if (idx === 0) return;
    idx--;
    recalc(idx);
    render();
  });

  skip?.addEventListener('click', () => {
    ans[idx] = 0;
    times[idx] = (Date.now()-start)/1000;
    next();
  });

  function recalc(end){
    for (let k in S) S[k] = 0;
    for (let i=0;i<end;i++){
      const sec = times[i] ?? 3;
      const w   = weight(sec);
      const s   = ans[i] ?? 0;
      const adj = s + (s*(w-1)*0.2);
      S[Q[i].a] += adj;
    }
  }

  function pickPair(l, r){
    const lv = S[l], rv = S[r];
    if (Math.abs(lv - rv) < 0.01){
      // 최근 3문항 시간가중 타이브레이커
      let d = 0;
      for (let i=Math.max(0, idx-3); i<idx; i++){
        const a = Q[i]?.a;
        if (a === l || a === r){
          const w = weight(times[i] ?? 3);
          d += (a === l ? 1 : -1) * w;
        }
      }
      return d >= 0 ? l : r;
    }
    return (lv >= rv) ? l : r;
  }

  function labelPair(l, r){
    const lv=S[l], rv=S[r], total=(lv+rv)||1, dom=Math.max(lv,rv)/total;
    if (dom >= 0.75) return '매우 강함';
    if (dom >= 0.60) return '강함';
    if (dom >= 0.45) return '균형';
    if (dom >= 0.30) return '약함';
    return '매우 약함';
  }

  function finish(){
    card.style.display = 'none';
    bar.style.width = '100%';

    const code = `${pickPair('E','I')}${pickPair('S','N')}${pickPair('T','F')}${pickPair('J','P')}`;

    const M = {
      ISTJ:{t:'🧭 원칙 수호자',q:'“질서는 나의 언어, 성실은 나의 방식.”',
        d:'실질적이고 책임감이 강한 유형이에요. 계획과 규칙 속에서 안정감을 느끼며, 약속을 지키는 일에 자부심을 가집니다. 때로는 융통성이 부족해 보일 수 있지만, 그만큼 신뢰를 주는 타입이에요.',
        r:'오늘은 규칙보다 기분을 10% 더 반영해보세요. 예상 밖의 여유가 좋은 균형