/* ===================================================
 * MBTI 빠른 테스트 — v2025.2 (마음 리마인드 버전)
 * 규칙
 *  - 12문항 / 5지선다(0~4) / 응답시간 보조(±20%) — 선택 우선
 *  - 결과: MBTI 16유형 + 상태라벨(숫자/퍼센트 직접 노출 X)
 *  - 축: EI, SN, TF, JP (각 3문항)
 *  - ‘애매한 중간값’ 완화: 적응형 임계 + 소프트 타이브레이크(마지막 응답/평균 반응시간)
 *  - 결과 구성: 제목 / 인용문 / 설명 / 감정상태 요약 / 마음 리마인드 / 축별 미니바 / 버튼
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    // EI (3)
    {k:'EI', a:'E', q:'사람 많은 자리에서 에너지가 오른다.'},
    {k:'EI', a:'I', q:'혼자 있는 시간이 꼭 필요하다.'},
    {k:'EI', a:'E', q:'처음 본 사람에게 먼저 말을 거는 편이다.'},

    // SN (3)
    {k:'SN', a:'S', q:'사실과 현재 경험이 더 중요하다.'},
    {k:'SN', a:'N', q:'가능성과 아이디어를 이야기하는 게 즐겁다.'},
    {k:'SN', a:'S', q:'새 정보는 구체적 예시가 있을 때 이해가 쉽다.'},

    // TF (3)
    {k:'TF', a:'T', q:'의사결정에서 논리/정확성이 우선이다.'},
    {k:'TF', a:'F', q:'사람들의 감정과 관계 영향을 먼저 본다.'},
    {k:'TF', a:'T', q:'논리적 모순을 보면 바로 잡고 싶다.'},

    // JP (3)
    {k:'JP', a:'J', q:'계획표/마감이 있어야 마음이 편하다.'},
    {k:'JP', a:'P', q:'상황 따라 즉흥적으로 움직이는 편이다.'},
    {k:'JP', a:'J', q:'할 일을 미리 정리하고 진행한다.'},
  ];

  // DOM
  const stepLabel=document.getElementById('stepLabel');
  const barFill  =document.getElementById('barFill');
  const qText    =document.getElementById('qText');
  const wrap     =document.getElementById('choiceWrap');
  const card     =document.getElementById('card');
  const result   =document.getElementById('result');
  const prevBtn  =document.getElementById('prev');
  const skipBtn  =document.getElementById('skip');

  // 상태
  let idx=0;
  const score={E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
  const counts={E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
  const ans=[];            // 0~4
  const times=[];          // 초
  let startTime=Date.now();
  let lastAxis=null;

  function weight(sec, axis){
    // 선택 우선, 보조는 ±20% 내 (여기서 가중치는 0.8~1.2 클램프 후 0.2배수로 반영)
    let w=1.0;
    if(sec<1) w=0.90;
    else if(sec<4) w=1.00;
    else if(sec<8) w=1.15;
    else w=1.10;

    // 아주 미세 보정: 외향/판단 성향은 빠른 응답, 내향/인식 성향은 숙고에 소폭 +
    if((axis==='E'||axis==='J') && sec<2)  w*=1.04;
    if((axis==='I'||axis==='P') && sec>=4) w*=1.04;

    return Math.min(1.2, Math.max(0.8, Number(w.toFixed(2))));
  }

  function render(){
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width   = `${(idx/Q.length)*100}%`;
    qText.textContent     = Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;

    const prevSel = ans[idx];
    if(prevSel!==undefined){
      Array.from(wrap.children).forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }

    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),120);
      });
    });

    startTime=Date.now();
  }

  function choose(s){
    const elapsed=(Date.now()-startTime)/1000;
    const {k,a}=Q[idx];
    ans[idx]=s; times[idx]=elapsed;

    lastAxis = a;

    // 선택 우선 + 시간 보조
    const w=weight(elapsed, a);
    const adjusted = s + (s * (w - 1) * 0.2);

    score[a]+=adjusted;
    counts[a]+=1;

    next();
  }

  function next(){ idx++; if(idx<Q.length) render(); else finish(); }

  prevBtn?.addEventListener('click', ()=>{
    if(idx===0) return;
    idx--;
    recompute(idx);
    render();
  });

  skipBtn?.addEventListener('click', ()=>{
    ans[idx]=0;
    times[idx]=(Date.now()-startTime)/1000;
    next();
  });

  function recompute(end){
    for(const k of Object.keys(score)) score[k]=0;
    for(const k of Object.keys(counts)) counts[k]=0;
    for(let i=0;i<end;i++){
      const s=ans[i] ?? 0;
      const {a}=Q[i];
      const w=weight(times[i] ?? 0, a);
      const adjusted = s + (s * (w - 1) * 0.2);
      score[a]+=adjusted;
      counts[a]+=1;
    }
  }

  // 적응형 임계: 너무 중간(=2 위주) 응답이 많으면 임계↑(조합 허용), 아니면 임계↓

  function axisDecision(L, R, countL, countR){
    // 정규화(축 최대점: 문항수*4)
    const maxL = (countL||0)*4;
    const maxR = (countR||0)*4;
    const nl = maxL ? L/maxL : 0;
    const nr = maxR ? R/maxR : 0;
    const diff = Math.abs(nl - nr);

    const mean = ans.reduce((a,b)=>a+(b??0),0)/(ans.filter(v=>v!==undefined).length||1);
    let TH = 0.08; // 기본 (정규화 스케일에서 약 8%p)
    if(mean>1.6 && mean<2.4) TH += 0.04; // 중간 응답이 많을수록 좀 더 조합 허용
    if((times.filter(t=>t<2).length)>=5) TH -= 0.02; // 즉응 많으면 단일 쪽으로 살짝

    // 동률시 소프트 타이브레이크(마지막 응답/평균 반응시간)
    if(diff < TH){
      // lastAxis가 해당 쌍 중 하나라면 그쪽 가볍게 선호
      if(lastAxis===getLetter(L, R, 'L') || lastAxis===getLetter(L, R, 'R')){
        return lastAxis;
      }
      // 평균 반응시간 빠른 쪽
      const avgT = (letter)=>{
        let sum=0,c=0;
        Q.forEach((q,i)=>{
          if(q.a===letter && times[i]!==undefined){ sum+=times[i]; c++; }
        });
        return c? sum/c : 99;
      };
      const leftLetter = getLetter(L, R, 'L');
      const rightLetter = getLetter(L, R, 'R');
      return (avgT(leftLetter) < avgT(rightLetter)) ? leftLetter : rightLetter;
    }

    return (nl >= nr) ? getLetter(L,R,'L') : getLetter(L,R,'R');
  }

  function getLetter(L, R, side){
    // 매핑 도우미: 쌍을 추론
    if((L===score.E || R===score.I) || (L===score.I || R===score.E)){
      return (side==='L') ? 'E' : 'I';
    }
    if((L===score.S || R===score.N) || (L===score.N || R===score.S)){
      return (side==='L') ? 'S' : 'N';
    }
    if((L===score.T || R===score.F) || (L===score.F || R===score.T)){
      return (side==='L') ? 'T' : 'F';
    }
    if((L===score.J || R===score.P) || (L===score.P || R===score.J)){
      return (side==='L') ? 'J' : 'P';
    }
    // fallback(안전장치)
    return (side==='L') ? 'E' : 'I';
  }

  function typeOf(){
    const EI = axisDecision(score.E, score.I, counts.E, counts.I);
    const SN = axisDecision(score.S, score.N, counts.S, counts.N);
    const TF = axisDecision(score.T, score.F, counts.T, counts.F);
    const JP = axisDecision(score.J, score.P, counts.J, counts.P);
    return EI+SN+TF+JP;
  }

  // 유형 카피(길고 재치 있게; 각 2~4문장)
  const COPY = {
    ENFP:{ t:'🌈 ENFP — 아이디어 스파크러', q:'“변화엔 설렘이, 설렘엔 용기가.”',
      d:'새로움과 사람을 사랑하는 추진적 몽상가. 감각과 직관을 번쩍이며 판을 뒤집을 힌트를 잘 찾습니다. 다만 시작의 불꽃이 큰 만큼 유지의 리듬을 작게 쪼개면 끝이 더 선명해져요.',
      r:'오늘은 “한 가지 즐거움”에 에너지를 집중해요. 하고 싶은 게 많을수록, 작은 완료 하나가 내일의 자신감을 키웁니다.' },
    ENTP:{ t:'⚡ ENTP — 변화를 즐기는 토론가', q:'“논리로 새 판을 짠다.”',
      d:'구조를 비틀고 규칙을 실험하기 좋아하는 전략형. 논리와 위트로 문제의 핵심을 드러냅니다. 단, 반박의 날이 예리할수록 관계의 온도를 한 번 더 만져 주세요.',
      r:'반박 대신 질문 한 스푼. “왜 그렇게 생각해?”는 대화의 지평을 넓혀 줍니다.' },
    ENFJ:{ t:'☀️ ENFJ — 분위기 리더', q:'“함께 빛나는 방법을 안다.”',
      d:'사람과 목표를 연결하는 따뜻한 리더. 모두의 성장 곡선을 살피는 시야가 넓습니다. 스스로를 챙기는 루틴이 들어가면 더 오래 빛나요.',
      r:'“오늘 나를 위한 10분”을 일정에 넣기. 리더의 에너지도 충전이 필요해요.' },
    ENTJ:{ t:'🚀 ENTJ — 추진력 전략가', q:'“목표를 계획으로, 계획을 실천으로.”',
      d:'전체 지도를 그려 실행까지 이끄는 드라이브형. 명확함이 장점인 만큼 완급 조절이 들어가면 팀이 더 단단해집니다.',
      r:'완벽보다 속도, 속도보다 리듬. 오늘은 80% 완료에 체크 ✔︎' },
    ESFP:{ t:'🎉 ESFP — 현장 텐션업', q:'“지금 이 순간, 제일 반짝.”',
      d:'감각으로 공간을 데우는 분위기 메이커. 즉시 실행력이 높아 팀의 엔진역할을 합니다. 간헐적 정지시간을 넣으면 배터리가 오래가요.',
      r:'숨 고르기 타이머 3분. “멈춤”도 좋은 리듬입니다.' },
    ESTP:{ t:'🏃 ESTP — 액션 해결사', q:'“생각보다 먼저 움직인다.”',
      d:'상황 파악과 기동력이 뛰어난 문제 해결형. 몸으로 확인하며 배울 때 성장이 빠릅니다. 다만 리스크 관리 체크리스트 하나만 곁들이면 좋아요.',
      r:'시도-배움-조정의 3박자. 실패는 데이터, 오늘의 다음 시도를 가볍게.' },
    ESFJ:{ t:'🤝 ESFJ — 케어 코디', q:'“팀의 체온을 지키는 사람.”',
      d:'세심한 배려와 실용성으로 공동체를 따뜻하게 묶습니다. “나를 위한 경계”를 미리 정해두면 과열을 예방해요.',
      r:'요청받지 않은 친절 중 오늘 딱 하나만. 나의 에너지도 소중합니다.' },
    ESTJ:{ t:'📋 ESTJ — 질서 설계자', q:'“시스템이 곧 안정.”',
      d:'명확한 기준과 계획을 세워 조직을 단단하게 만드는 실행가. 변화의 문턱 앞에서 “작은 파일럿”을 열면 더 유연해집니다.',
      r:'파일럿 1주, 검토 30분. 실험으로 설득하세요.' },
    INFP:{ t:'🌙 INFP — 마음 디자이너', q:'“가치와 의미로 채운다.”',
      d:'깊은 내면과 상상력으로 스토리를 짓는 이상가. 감정의 파도가 클수록, 작은 완수의 점을 찍으면 자존감이 살아나요.',
      r:'감정 한 줄 기록 + 감사 한 줄. 오늘의 마음을 가볍게 접어 보관해요.' },
    INTP:{ t:'🧩 INTP — 개념 탐험가', q:'“원리를 파헤쳐 구조를 세운다.”',
      d:'추상과 원리를 사랑하는 분석가. 생각의 바다에서 길을 잃지 않도록 “작은 가설-검증” 루프가 큰 힘이 됩니다.',
      r:'가설 1개만 정하고 실험. 메모는 5문장 이내.' },
    INFJ:{ t:'🌿 INFJ — 조용한 조율가', q:'“깊이와 방향을 제시한다.”',
      d:'사람과 의미를 잇는 통찰형. 과부하가 올수록 말의 길이가 짧아지는 경향을 알아차리면 좋습니다.',
      r:'한 명에게 깊이 — 오늘은 “한 사람의 안부”에 집중해요.' },
    INTJ:{ t:'🛰️ INTJ — 계획 건축가', q:'“장기 플랜에 강한 전략가.”',
      d:'끝을 보고 역산하는 설계자. 강력한 집중력만큼 휴식의 구조화가 필요합니다.',
      r:'집중 블록 50분 + 리셋 10분. 뇌의 리듬을 설계하세요.' },
    ISFP:{ t:'🍃 ISFP — 부드러운 실천가', q:'“따뜻하지만 자유롭게.”',
      d:'감수성과 실제감을 연결하는 미니멀리스트. 조용히 완성하는 힘이 있어요. 다만 요구 거절 문장 템플릿을 준비하면 편합니다.',
      r:'“이번 주는 어려워요. 다음 주는 가능해요.” 내 호흡을 지켜요.' },
    ISTP:{ t:'🛠️ ISTP — 조용한 해결사', q:'“손으로 증명한다.”',
      d:'도구와 시스템을 빠르게 익히는 실용 분석가. 완성보다 작동을 중시해 MVP가 잘 맞아요.',
      r:'손에 잡히는 1개, 오늘 바로 만들기.' },
    ISFJ:{ t:'🏠 ISFJ — 든든한 보호자', q:'“디테일은 사랑의 다른 이름.”',
      d:'성실하고 섬세하게 관계를 돌보는 신뢰의 사람. 가끔은 “나의 기준”을 앞에 두면 마음이 덜 지칩니다.',
      r:'내가 지키는 3가지 기준, 오늘 한 번 확인.' },
    ISTJ:{ t:'🧭 ISTJ — 원칙 수호자', q:'“규칙과 안정의 기준점.”',
      d:'탄탄한 루틴과 책임감으로 팀의 버팀목. 변화에 작은 실험을 붙이면 속도가 납득됩니다.',
      r:'새 규칙은 “한 줄 요약”으로. 모두가 같은 지도를 보게 해요.' },
  };

  function label(v){
    if(v>=0.78) return '아주 높음';
    if(v>=0.62) return '높음';
    if(v>=0.45) return '중간';
    if(v>=0.28) return '낮음';
    return '아주 낮음';
  }

  function miniMeters(norm){
    // 네 축 상태 — 퍼센트 숫자 없이 라벨만
    const rows = [
      ['E','I','바깥 에너지','안쪽 에너지'],
      ['S','N','현실 감각','가능성 직관'],
      ['T','F','논리 판단','공감 판단'],
      ['J','P','계획 선호','유연 선호'],
    ];
    return rows.map(([L,R,ln,rn])=>{
      const lv = norm[L], rv = norm[R];
      const leftW = Math.round(lv*100), rightW = Math.round(rv*100);
      return `
        <div style="background:#fff;border:1px solid var(--mint-200,#cfeee7);border-radius:12px;padding:10px">
          <div style="display:flex;justify-content:space-between;font-weight:700">
            <span>${ln}</span><span>${rn}</span>
          </div>
          <div style="display:flex;gap:6px;align-items:center;margin-top:6px">
            <div style="flex:1;background:var(--mint-100,#e9f7f3);border-radius:999px;overflow:hidden">
              <span style="display:block;height:8px;width:${leftW}%;background:var(--mint-500,#7ed6c4)"></span>
            </div>
            <div style="flex:1;background:var(--mint-100,#e9f7f3);border-radius:999px;overflow:hidden;direction:rtl">
              <span style="display:block;height:8px;width:${rightW}%;background:var(--mint-400,#9fe1d3)"></span>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;color:var(--text-soft);font-size:12px;margin-top:4px">
            <span>${label(lv)}</span><span>${label(rv)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function finish(){
    // 정규화(각 축 최대 = 문항수*4)
    const norm={};
    const maxBy = {E:counts.E*4,I:counts.I*4,S:counts.S*4,N:counts.N*4,T:counts.T*4,F:counts.F*4,J:counts.J*4,P:counts.P*4};
    for(const k of Object.keys(score)){
      const m = maxBy[k] || 0;
      norm[k] = m? (score[k]/m) : 0;
    }

    const code = typeOf();
    const c = COPY[code] || { t:`☁️ ${code}`, q:'"함께 맞춰가요."', d:'데이터가 비슷해요. 한 번 더 시도해 볼까요?', r:'오늘의 판단은 가볍게, 내일의 나에게도 여지를.' };

    // 감정상태 요약(라이트 톤)
    const moodLine = (() => {
      const map = {E:'활기', I:'차분', S:'현실', N:'상상', T:'이성', F:'공감', J:'정돈', P:'유연'};
      const picks = [code[0], code[1], code[2], code[3]].map(k=>map[k]);
      return `오늘의 키워드: <b>${picks.join(' · ')}</b>`;
    })();

    card.style.display='none';
    barFill.style.width='100%';

    result.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/mbti.png" alt="MBTI 아이콘" onerror="this.style.display='none'">
          <div>
            <div class="result-title">${c.t}</div>
            <div class="result-desc">${c.q}</div>
            <div class="pill" style="margin-top:6px">내 유형: <b>${code}</b></div>
          </div>
        </div>

        <p style="margin:10px 0">${c.d}</p>

        <div class="result-sub">
          <h4 style="margin:8px 0 4px">감정상태 요약</h4>
          <p style="margin:0;color:var(--text-soft)">${moodLine}</p>
        </div>

        <div class="result-sub">
          <h4 style="margin:10px 0 6px">축별 상태 보기</h4>
          ${miniMeters(norm)}
        </div>

        <div class="result-sub">
          <h4 style="margin:10px 0 6px">🌿 마음 리마인드</h4>
          <p style="margin:0">${c.r}</p>
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;

    result.style.display='block';
  }

  // 시작
  render();
});
