/* ===================================================
 * 마음 기상예보 (5지선다 + 시간가중치 ±20% 보조)
 * ---------------------------------------------------
 * - 답변: 0~4 (전혀/아니다/보통/그렇다/매우 그렇다)
 * - 선택 점수가 핵심, 응답 시간은 최대 ±20% 보조
 * - 축: W(따뜻함/공감), V(변화도/기복), R(회복력), I(내면/고요)
 * - 분류(6): SUNNY/ MILD/ VARIABLE/ RAINY/ STORMY/ MOONLIT
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 14문항 (W, V, R, I)
  const Q = [
    {k:'W', q:'힘든 이야기를 들으면 자연스럽게 공감부터 하게 된다.'},
    {k:'W', q:'친한 사람의 감정 변화를 예민하게 알아차리는 편이다.'},
    {k:'W', q:'대화에서 상대의 기분을 먼저 살피려 한다.'},

    {k:'V', q:'하루 안에서도 기분 기복이 꽤 있는 편이다.'},
    {k:'V', q:'사소한 일에도 마음이 쉽게 흔들린다.'},
    {k:'V', q:'어제의 감정이 오늘 컨디션에 영향을 준다.'},

    {k:'R', q:'스트레스를 받아도 금방 진정 방법을 찾는다.'},
    {k:'R', q:'실수나 실패를 오래 끌지 않고 금세 복구한다.'},
    {k:'R', q:'불안이 올라와도 호흡·산책 등으로 다스릴 수 있다.'},

    {k:'I', q:'혼자 있는 시간에서 안정감과 에너지를 얻는다.'},
    {k:'I', q:'감정을 기록하거나 조용히 정리하는 시간이 필요하다.'},
    {k:'I', q:'시끄러운 자리보다는 고요한 공간이 편하다.'},

    {k:'W', q:'가까운 사람의 안부를 먼저 묻고 챙기는 편이다.'},
    {k:'R', q:'몸 컨디션(수면·식사·운동)으로 마음을 관리한다.'},
  ];

  let idx = 0;
  const score  = { W:0, V:0, R:0, I:0 };
  const count  = { W:0, V:0, R:0, I:0 };
  const ans    = [];
  const times  = [];
  let startTime = Date.now();

  // DOM
  const stepLabel = document.getElementById('stepLabel');
  const barFill   = document.getElementById('barFill');
  const qText     = document.getElementById('qText');
  const wrap      = document.getElementById('choiceWrap');
  const card      = document.getElementById('card');
  const resultBox = document.getElementById('result');
  const prevBtn   = document.getElementById('prev');
  const skipBtn   = document.getElementById('skip');

  function render(){
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width   = `${(idx/Q.length)*100}%`;
    qText.textContent     = Q[idx].q;

    // 5지선다
    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>`;

    // 이전 선택 복원
    const prevSel = ans[idx];
    if(prevSel !== undefined){
      Array.from(wrap.children).forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }

    // 클릭
    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)), 150);
      });
    });

    startTime = Date.now();
  }

  function choose(s){
    const elapsed = (Date.now() - startTime)/1000;
    times[idx] = elapsed;

    const k = Q[idx].k;
    const w = getWeight(elapsed);         // 0.85 ~ 1.15
    ans[idx] = s;

    // 선택 우선 + 시간 보조(±20% 캡 내부에서 0.85~1.15만 사용)
    const adjusted = s + (s * (w - 1) * 0.2);
    score[k] += adjusted;
    count[k] += 1;

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
    recalc(idx);
    render();
  });

  skipBtn?.addEventListener('click', ()=>{
    ans[idx]=0;
    times[idx]=(Date.now()-startTime)/1000;
    next();
  });

  function recalc(end){
    score.W=score.V=score.R=score.I=0;
    count.W=count.V=count.R=count.I=0;
    for(let i=0;i<end;i++){
      const s = ans[i] ?? 0;
      const k = Q[i].k;
      const w = getWeight(times[i] ?? 0);
      const adjusted = s + (s * (w - 1) * 0.2);
      score[k] += adjusted;
      count[k] += 1;
    }
  }

  function getWeight(sec){
    // 너무 빠르면 -15, 보통 1.0, 충분히 숙고하면 +15 (최대 보조)
    if(sec < 1)  return 0.85;
    if(sec < 4)  return 1.00;
    if(sec < 8)  return 1.10;
    return 1.15;
  }

  // ---- 분류 규칙 ----
  function normalize(sc){
    // 5지선다 최대 4점, 축별 문항 수 반영
    const max = 4;
    const Wn = count.W ? sc.W / (count.W*max) : 0;
    const Vn = count.V ? sc.V / (count.V*max) : 0;
    const Rn = count.R ? sc.R / (count.R*max) : 0;
    const In = count.I ? sc.I / (count.I*max) : 0;
    return {W:Wn, V:Vn, R:Rn, I:In};
  }

  function classify(n){ // n: 0~1
    // 우선 규칙(강도형) → 일반 규칙
    if(n.V >= 0.70 && n.R <= 0.40)         return 'STORMY';   // 예민형(강한 변화 + 낮은 회복)
    if(n.R >= 0.70 && n.V <= 0.40 && n.W >= 0.60) return 'SUNNY';    // 맑음형(회복↑, 변화↓, 따뜻함↑)
    if(n.I >= 0.65 && n.V <= 0.50)         return 'MOONLIT';  // 내면형(고요↑, 변화↓)
    if(n.R <= 0.45 && n.W >= 0.50)         return 'RAINY';    // 감성형(따뜻함↑, 회복↓)
    if(n.V >= 0.60)                        return 'VARIABLE'; // 변화형(변화↑)
    return 'MILD'; // 온화형(그 외)
  }

  const COPY = {
    SUNNY: {
      icon:'🌞', title:'맑음형 — 따뜻함과 회복의 햇살',
      long: [
        '당신의 마음은 기본적으로 포근한 온도를 유지합니다. 감정의 파도가 오더라도 금세 숨을 고르며 중심을 찾는 힘이 있어요. 그래서 주변 사람들은 당신과 함께 있을 때 마음이 햇볕을 쬐는 듯 따뜻하다고 느낍니다.',
        '당신의 장점은 “빠른 회복”과 “다정한 태도”입니다. 실수나 부담이 생겨도 자신을 과하게 몰아붙이기보다, 상황을 정리하고 필요한 도움을 요청할 줄 알아요. 이 부드러운 자기 대화는 장기적으로 큰 안정감을 만들어줍니다.',
        '가끔은 “괜찮아 보여야 한다”는 책임감이 마음을 조용히 무겁게 만들기도 해요. 햇살에도 그늘이 있듯, 나만의 쉼을 확보하고 진짜 감정을 털어놓는 안전지대를 꾸준히 챙겨보세요.'
      ],
      tips:['하루 마무리 5분 호흡/스트레칭','“괜찮지 않아도 괜찮아” 문장 연습','가벼운 산책 + 햇볕 쬐기 10분','도움 요청 리스트(3명) 만들어두기']
    },
    MILD: {
      icon:'🌤️', title:'온화형 — 부드러운 균형 감각',
      long: [
        '당신은 감정과 생각을 무리 없이 조율해 가는 사람입니다. 큰 파도가 아니더라도, 작은 물결을 잘 읽고 그에 맞는 속도로 움직여요. 그래서 관계에서도 “함께 있으면 편안하다”는 말을 듣는 경우가 많습니다.',
        '온화함은 결코 소극적이라는 뜻이 아니에요. 오히려 주변의 리듬을 고려하는 배려에서 나오죠. 이런 사람에게 필요한 건 “내 마음의 속도”를 먼저 듣는 연습입니다.',
        '때때로 타인의 요구를 받아주다 보면, 내 마음의 신호가 흐릿해질 수 있어요. 중요한 선택 앞에선 한 박자 쉬어가며 “지금 내가 진짜 원하는 것”을 적어보세요.'
      ],
      tips:['선택 전 60초 멈춤(타이머)','주 1회 “나만의 일정”에 자기사업(취미/운동) 넣기','거절 문장 템플릿 1개 만들기','주간 에너지 지도(언제 피곤/맑음?) 그려보기']
    },
    VARIABLE: {
      icon:'🌦️', title:'변화형 — 살아있는 감정의 계절',
      long: [
        '당신의 감정은 계절처럼 자주 바뀝니다. 기복이 있다는 건, 그만큼 삶을 생생히 느끼고 있다는 뜻이기도 해요. 새로운 자극에 반응하고, 다채로운 감정을 경험하는 능력이 뛰어납니다.',
        '다만 변화가 잦을수록 체력과 마음의 연료가 빨리 소모돼요. 그래서 “충전 루틴”이 특히 중요합니다. 규칙을 강요할 필요는 없지만, 최소한의 리듬(수면/식사/수분/산책)을 고정해두면 감정의 진폭이 줄어듭니다.',
        '당신의 감정은 잘못이 아니라, 살아있음의 증거입니다. 오늘의 날씨를 인정하고, 그에 맞는 옷을 입듯 행동을 조절해보세요.'
      ],
      tips:['수면·식사·수분 “리듬 4종” 고정','하루 10분 햇빛 + 10분 걷기','감정 기록(3줄 저널): 사건/감정/요구','과한 약속은 1개 줄이기']
    },
    RAINY: {
      icon:'🌧️', title:'감성형 — 비를 맞아도 자라나는 마음',
      long: [
        '당신은 감정을 억지로 밀어내지 않고, 있는 그대로 느끼는 용기가 있습니다. 그래서 때로는 비를 맞는 시간이 길게 느껴질 수 있지만, 그만큼 남의 마음도 깊게 이해하는 사람입니다.',
        '감정이 무거울수록, 혼자가 되려는 마음이 커질 수 있어요. 그러나 비 오는 날일수록 지붕이 더 필요하듯, 안전한 대화 상대와의 연결이 회복력을 크게 높여줍니다.',
        '“감정은 흘러간다”는 사실을 기억해 주세요. 오늘의 비가 내일의 싹을 키울 때가 많습니다.'
      ],
      tips:['감정 라벨링(슬픔/외로움/분노 등 이름 붙이기)','따뜻한 차/샤워 같은 감각 케어','신뢰하는 사람 1명에게 솔직 메세지','일기 대신 “감정 색칠표”로 가볍게']
    },
    STORMY: {
      icon:'🌩️', title:'예민형 — 예리한 감각, 섬세한 마음',
      long: [
        '당신은 변화에 민감하고, 작은 신호도 크게 감지합니다. 이 예리함은 때로 피곤함을 만들지만, 사실은 “섬세함”이라는 강점의 다른 얼굴이에요.',
        '쉽게 흔들리기만 하는 마음은 없습니다. 다만, 회복을 돕는 구조(수면/영양/움직임/대화)가 아직 충분하지 않을 수 있어요. 스스로를 탓하기보다, 환경을 조정하는 데 집중해보세요.',
        '“예민함”은 조절될 때 강력한 능력이 됩니다. 당신의 감각은 누군가의 안전을 지키고, 분위기를 바꾸는 디테일을 발견해줄 거예요.'
      ],
      tips:['수면 우선(시간 고정) + 카페인 절반으로','SNS/뉴스 노출 시간 제한','불안을 몸으로 빼기(박수·가벼운 스쿼트 1분)','전문가 상담/멘토링 탐색 리스트 만들기']
    },
    MOONLIT: {
      icon:'🌙', title:'내면형 — 고요 속에서 자라는 빛',
      long: [
        '당신은 고요한 공간에서 힘을 얻고, 감정을 다듬습니다. 혼자 있는 시간이 부족하면 마음이 빠르게 피로해질 수 있어요. 그래서 당신에겐 “고요의 시간”이 단순한 취향이 아니라, 회복을 위한 필수 조건입니다.',
        '자기 이야기를 글로 정리하거나 그림/음악으로 표현하는 활동이 큰 도움을 줍니다. 내면의 소리를 선명하게 듣고, 필요한 것과 내려놓을 것을 구분하게 되죠.',
        '세상과 거리를 두는 건 도망이 아니라 선택일 때 더 단단해집니다. 당신의 속도를 지키며 이어지는 연결은 오래갑니다.'
      ],
      tips:['하루 15분 “무소음 블록” 확보','자기기록(노트/앱) 템플릿 만들기','소음 대신 백색소음/자연소리','소수 친밀모임(1~2명)만 일정화']
    }
  };

  function meters(n){
    const items = [
      {k:'W', name:'따뜻함'},
      {k:'V', name:'변화도'},
      {k:'R', name:'회복력'},
      {k:'I', name:'고요'}
    ];
    return items.map(({k,name})=>{
      const pct = Math.round((n[k]||0)*100);
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
    card.style.display='none';
    barFill.style.width='100%';

    const n = normalize(score);
    const key = classify(n);
    const c = COPY[key];

    const html = `
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/weather.png" alt="마음 기상예보" onerror="this.style.display='none'">
          <div>
            <div class="result-title">${c.icon} ${c.title}</div>
            <div class="result-desc">“지금의 나를 가볍게 이해하고, 다루는 법을 연습해요.”</div>
          </div>
        </div>

        <p style="margin:8px 0">${c.long[0]}</p>
        <p style="margin:8px 0">${c.long[1]}</p>
        <p style="margin:8px 0">${c.long[2]}</p>

        <div style="margin-top:10px">${meters(n)}</div>

        <div style="margin-top:10px">
          ${c.tips.map(t=>`<div class="pill">${t}</div>`).join('')}
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;

    resultBox.innerHTML = html;
    resultBox.style.display = 'block';
  }

  // 시작
  render();
});