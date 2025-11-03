/* ===================================================
 * 몽실이의 연애 스타일 테스트 (5지선다 + 마음 리마인드)
 * v2025.2 — 숫자 점수 표기 제거 / 퍼센트 대신 상태라벨
 * 유형: 8종 (단일 4 + 인접 조합 4)
 *   단일: E(표현), C(교류), S(안정), I(자율)
 *   조합: EC, ES, CI, IS  (서로 붙어있는 성향만 허용)
 * 로직 포인트:
 * - 선택 점수(0~4)가 최우선, 응답시간은 ±20% 내 보조
 * - 과도한 '애매한 중간형' 방지: 적응형 임계 + 소프트 타이브레이크
 * - 결과 UI: 제목 / 인용 / 설명 / 감정상태 요약 / 마음 리마인드 / 시각요소 / 버튼
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    {k:'E', q:'좋아하는 사람이 생기면 표현을 아끼지 않는 편이다.'},
    {k:'S', q:'연애에서도 믿음과 안정감이 가장 중요하다고 생각한다.'},
    {k:'C', q:'대화가 끊기면 불안해진다.'},
    {k:'I', q:'연인과 떨어져 있어도 각자 시간을 즐길 수 있다.'},
    {k:'E', q:'감정은 숨기기보다 바로 표현하는 게 좋다고 생각한다.'},
    {k:'S', q:'불확실한 관계보다는 확실히 정해진 관계가 편하다.'},
    {k:'C', q:'서로의 일상을 자주 공유하는 걸 좋아한다.'},
    {k:'I', q:'연애가 나를 구속하지 않았으면 좋겠다.'},
    {k:'E', q:'연애 초반에 스킨십이 빨리 늘어나는 걸 자연스럽게 느낀다.'},
    {k:'S', q:'연애의 핵심은 신뢰라고 생각한다.'},
    {k:'C', q:'감정 표현이 서툰 상대에게 답답함을 느낀다.'},
    {k:'I', q:'연인이 나의 사생활을 세세히 아는 건 부담스럽다.'},
    {k:'E', q:'사랑한다는 말을 자주 해야 관계가 유지된다고 생각한다.'},
    {k:'S', q:'한 번의 실수보다 일관된 태도가 더 중요하다.'},
    {k:'I', q:'서로 일정한 거리감이 있어야 오래간다고 생각한다.'}
  ];

  // DOM
  const stepLabel = document.getElementById('stepLabel');
  const barFill   = document.getElementById('barFill');
  const qText     = document.getElementById('qText');
  const wrap      = document.getElementById('choiceWrap');
  const card      = document.getElementById('card');
  const resultBox = document.getElementById('result');
  const prevBtn   = document.getElementById('prev');
  const skipBtn   = document.getElementById('skip');

  // 상태
  let idx = 0;
  const score  = {E:0, C:0, S:0, I:0};
  const counts = {E:0, C:0, S:0, I:0};
  const ans    = [];
  const times  = [];
  let startTime = Date.now();
  let lastPick  = null;

  // 가중치(응답시간 보조) — 선택은 절대 우선, 최대 ±20% 영향
  function weight(sec, axis){
    let w = 1.0;
    if(sec < 1)      w = 0.90;
    else if(sec < 4) w = 1.00;
    else if(sec < 8) w = 1.15;
    else             w = 1.10;

    // 아주 미세한 축 보정 (성향과 반응 속도 연결 가설)
    if((axis==='E'||axis==='C') && sec<2)  w *= 1.04; // 즉응적 표현/교류에 소폭 +
    if((axis==='I'||axis==='S') && sec>=4) w *= 1.04; // 신중/안정 축에 소폭 +

    return Math.min(1.2, Math.max(0.8, Number(w.toFixed(2))));
  }

  function render(){
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width   = `${(idx/Q.length)*100}%`;
    qText.textContent     = Q[idx].q;

    // 5지선다 (0~4) — 전혀 아니다 / 아니다 / 보통 / 그렇다 / 매우 그렇다
    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;

    // 이전 선택 표시 복원
    const prevSel = ans[idx];
    if(prevSel !== undefined){
      Array.from(wrap.children).forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }

    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)), 130);
      });
    });

    startTime = Date.now();
  }

  function choose(s){
    const elapsed = (Date.now() - startTime)/1000;
    const axis = Q[idx].k;
    const w    = weight(elapsed, axis);
    ans[idx]   = s;
    times[idx] = elapsed;
    lastPick   = axis;

    // 선택 우선 + 시간 보조(±20% 이내)
    const adjusted = s + (s * (w - 1) * 0.2);
    score[axis]  += adjusted;
    counts[axis] += 1;

    next();
  }

  function next(){
    idx++;
    if(idx < Q.length) render();
    else finish();
  }

  prevBtn?.addEventListener('click', ()=>{
    if(idx===0) return;
    idx--;
    recompute(idx);
    render();
  });

  skipBtn?.addEventListener('click', ()=>{
    ans[idx]   = 0;
    times[idx] = (Date.now() - startTime)/1000;
    next();
  });

  function recompute(end){
    score.E=score.C=score.S=score.I=0;
    counts.E=counts.C=counts.S=counts.I=0;
    for(let i=0;i<end;i++){
      const s = ans[i] ?? 0;
      const a = Q[i].k;
      const w = weight(times[i] ?? 0, a);
      const adjusted = s + (s * (w - 1) * 0.2);
      score[a]  += adjusted;
      counts[a] += 1;
    }
  }

  // 인접 조합만 허용: EC, ES, CI, IS
  const ALLOWED_COMBOS = new Set(['EC','CE','ES','SE','CI','IC','IS','SI']);

  // 적응형 임계치: 응답이 또렷할수록(극단/속도) 단일로, 모호하면 조합으로
  function diffThreshold(){
    const meanS = ans.reduce((a,b)=>a+(b??0),0) / (ans.filter(v=>v!==undefined).length || 1);
    const fastCount = times.filter(t=>t!==undefined && t<2).length;
    // 기본 1.2 → 즉응 많으면 1.0(단일 쉬움), 너무 중간(=2 위주)이면 1.4(조합 유도)
    let base = 1.2;
    if(fastCount >= 5) base -= 0.2;
    if(meanS > 1.6 && meanS < 2.4) base += 0.2;
    return Number(base.toFixed(2));
  }

  function classify(sc){
    // 정규화(축별 답한 문항 수가 달라도 공정)
    const norm = {};
    for(const k of ['E','C','S','I']){
      const max = (counts[k]||0) * 4; // 5지선다 최댓값(4)
      norm[k] = max ? sc[k]/max : 0;
    }

    // 상위 2개 추출
    const arr = Object.entries(norm).sort((a,b)=>b[1]-a[1]); // [ [k,v], ... ]
    const [k1,v1] = arr[0];
    const [k2,v2] = arr[1];
    const diff = v1 - v2;

    const DIFF = diffThreshold(); // 적응형

    // 소프트 타이브레이크: 동일하면 마지막 응답, 그리고 빠른 응답 축에 가산
    if(Math.abs(diff) < 0.05){
      if(lastPick && norm[lastPick] >= v1 - 0.03) return `${lastPick}_ONLY`;
      // 두 축의 평균 반응시간 비교(빠른 쪽 선호)
      const avgTime = (axis)=> {
        let sum=0, n=0;
        Q.forEach((q,i)=>{
          if(q.k===axis && times[i]!==undefined){ sum+=times[i]; n++; }
        });
        return n? sum/n : 99;
      };
      const t1 = avgTime(k1), t2 = avgTime(k2);
      if(Math.abs(t1-t2) > 0.4) return (t1 < t2 ? `${k1}_ONLY` : `${k2}_ONLY`);
    }

    if(diff >= DIFF) return `${k1}_ONLY`;

    // 조합(인접한 축만 허용), 아니면 가까운 인접으로 스냅
    const pair = [k1,k2].sort().join('');
    if(ALLOWED_COMBOS.has(pair)) return pair;

    // 인접 맵 (원형 인접성)
    const adjacent = { E:new Set(['C','S']), C:new Set(['E','S']), S:new Set(['E','I','C']), I:new Set(['S','C']) };
    // 위 인접 정의에서 ‘반대 축(E↔I, C↔S) 직접 조합’은 배제 → 가까운 인접으로 스냅
    for(const k of adjacent[k1]){ if(k===k2) return [k1,k2].sort().join(''); }
    // k2가 비인접이면, k1과 가장 가까운 인접 축으로 조합
    const fallback = [...adjacent[k1]].sort((a,b)=>norm[b]-norm[a])[0];
    return [k1,fallback].sort().join('');
  }

  // UI 카피
  const COPY = {
    // 단일 4
    'E_ONLY': {
      title:'💗 표현 스파크형',
      quote:'"마음은 전할 때 살아난다!"',
      desc:'애정표현과 피드백이 빠르고 확실한 타입. 관계의 온도를 올리는 리드 플레이어예요. 당신의 솔직함이 서로의 안전지대를 넓혀 줍니다.',
      state:['감정 온도: 따뜻함↑','관계 리듬: 빠르고 명확'],
      remind:'감정의 불꽃이 너무 빨라지면 숨 고르기 한 박자. “오늘의 속도는 안녕?” 하고 스스로에게 체크해 보세요.'
    },
    'C_ONLY': {
      title:'🤝 공감 네비게이터형',
      quote:'"너의 리듬을 먼저 듣는다."',
      desc:'상대의 미세한 신호를 캐치하고 대화를 통해 균형을 잡는 협력가. 당신의 경청은 관계의 나침반이 됩니다.',
      state:['대화 밀도: 섬세함↑','갈등 해소: 조율형'],
      remind:'내 마음의 리듬도 함께 체크! “오늘 나는 어떤 대화가 필요했지?”를 짧게 메모해 보세요.'
    },
    'S_ONLY': {
      title:'🧭 신뢰 앵커형',
      quote:'"꾸준함이 사랑을 지킨다."',
      desc:'일관성과 책임감을 중시하는 든든한 유형. 약속과 경계가 분명해질수록 관계가 편안해집니다.',
      state:['안정 지향: 높음','속도 설정: 차분·견고'],
      remind:'가끔은 즉흥의 여유도 비타민처럼 작동해요. 작은 변주 한 스푼, 안전한 범위에서 시도해 볼까요?'
    },
    'I_ONLY': {
      title:'🕊️ 자유 바람형',
      quote:'"숨 쉴 공간이 사랑을 오래가게 한다."',
      desc:'자율성과 속도 조절을 중시하는 건강한 거리두기 마스터. 각자의 세계가 있을수록 함께의 시간이 선명해집니다.',
      state:['자율감: 넉넉함','속도 감각: 균형 추구'],
      remind:'공유의 타이밍만 살짝 맞추면 더 편해져요. “언제 얘기하면 좋을까?”를 미리 제안해 보세요.'
    },
    // 인접 조합 4
    'CE': {
      title:'💞 따뜻한 커뮤니케이터형 (E+C)',
      quote:'"마음은 나누고, 귀는 열고."',
      desc:'표현과 공감의 투톱. 빠른 애정표현에 섬세한 경청이 더해져 관계 온도를 안정적으로 올립니다.',
      state:['관계 온도: 포근함','대화 결: 촘촘·배려'],
      remind:'피곤한 날엔 “짧은 마음 카드”로 템포 조절. 긴 설명 대신 한 줄 진심, 충분해요.'
    },
    'ES': {
      title:'🌷 다정한 신뢰 빌더형 (E+S)',
      quote:'"따뜻함을 꾸준히."',
      desc:'애정표현을 일관된 행동으로 증명하는 타입. 말과 행동의 간격이 좁을수록 신뢰는 단단해집니다.',
      state:['표현: 따뜻함','안정: 높음'],
      remind:'내 페이스가 빨라질 땐 상대의 숨 간격을 관찰해 보기. “천천히 가도 괜찮아” 한마디가 큰 선물이 됩니다.'
    },
    'CI': {
      title:'🌤️ 배려적 독립형 (C+I)',
      quote:'"서로의 거리를 존중하는 것도 사랑."',
      desc:'공감하지만 의존은 최소화. 섬세한 배려와 건강한 거리두기를 균형 있게 사용합니다.',
      state:['경청: 높음','자율: 존중형'],
      remind:'“연결-분리”의 스위치를 주기적으로 점검해요. 연결의 시간도, 혼자만의 시간도 계획에 넣어 보세요.'
    },
    'IS': {
      title:'🌿 차분한 파트너십형 (I+S)',
      quote:'"느리지만 견고하게."',
      desc:'자율성과 안정의 합. 과장 없이 담백하게, 오래 가는 팀 플레이를 지향합니다.',
      state:['속도: 느리지만 꾸준','안전감: 높음'],
      remind:'가끔은 “작은 이벤트 카드”로 설렘을 환기! 큰 변화 말고, 작은 새로움이면 충분해요.'
    }
  };

  function statePills(items){
    return items.map(t=>`<div class="pill">${t}</div>`).join('');
  }

  function axisBadges(norm){
    // 상태 라벨 (퍼센트 수치 노출 X, 말맛으로 표현)
    const label = (v)=> {
      if(v>=0.78) return '아주 높음';
      if(v>=0.62) return '높음';
      if(v>=0.45) return '중간';
      if(v>=0.28) return '낮음';
      return '아주 낮음';
    };
    const NAMES = {E:'표현', C:'교류', S:'안정', I:'자율'};
    return ['E','C','S','I']
      .map(k=>`<div class="mini-meter">
        <div class="mini-meter__head"><b>${NAMES[k]}</b><span>${label(norm[k])}</span></div>
        <div class="mini-meter__bar"><i style="width:${Math.round(norm[k]*100)}%"></i></div>
      </div>`).join('');
  }

  function finish(){
    // 정규화
    const norm = {};
    for(const k of ['E','C','S','I']){
      const max = (counts[k]||0)*4;
      norm[k] = max ? score[k]/max : 0;
    }

    const typeKey = classify(score);

    const info = COPY[typeKey] || {
      title:'☁️ 몽실형',
      quote:'"함께 맞춰가요."',
      desc:'데이터가 적거나 비슷해요. 한 번 더 시도해 볼까요?',
      state:['리듬: 탐색 중','표현: 부드럽게']
    };

    // 결과 카드 렌더
    card.style.display = 'none';
    barFill.style.width = '100%';

    resultBox.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/love.png" alt="연애 캐릭터" onerror="this.style.display='none'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
            <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
              ${statePills(info.state || [])}
            </div>
          </div>
        </div>

        <p style="margin:10px 0">${info.desc}</p>

        <div class="result-sub">
          <h4 style="margin:8px 0 4px">감정상태 요약</h4>
          <p style="margin:0;color:var(--text-soft)">오늘의 관계 리듬을 한 줄로 정리하면, <b>${
            (info.state && info.state[0]) ? info.state[0] : '포근한 탐색 모드'
          }</b>에 가깝습니다.</p>
        </div>

        <div class="result-sub">
          <h4 style="margin:10px 0 6px">축별 상태 보기</h4>
          ${axisBadges(norm)}
        </div>

        <div class="result-sub">
          <h4 style="margin:10px 0 6px">🌿 마음 리마인드</h4>
          <p style="margin:0">${info.remind || '오늘의 마음은 충분히 괜찮아요. 작은 한 걸음이면 됩니다.'}</p>
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;

    // 미니 미터 스타일 (간단 내장)
    const style = document.createElement('style');
    style.textContent = `
      .mini-meter{margin:8px 0}
      .mini-meter__head{display:flex;justify-content:space-between;font-weight:700}
      .mini-meter__bar{height:8px;background:var(--mint-200,#cfeee7);border-radius:999px;overflow:hidden;margin-top:6px}
      .mini-meter__bar i{display:block;height:100%;background:var(--mint-500,#7ed6c4)}
    `;
    document.head.appendChild(style);

    resultBox.style.display='block';
  }

  // 시작
  render();
});
