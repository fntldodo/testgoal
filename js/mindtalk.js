/* ===================================================
 * 💬 마음톡 v2025.2 — 마음 리마인드 버전
 * 규칙:
 *  - 12문항 / 5지선다(0~4)
 *  - 응답시간 보조 ±20%(선택 우선, 뒤엎지 않음)
 *  - 분류: 6축(M 동기, R 관계, C 진로, S 자기돌봄, E 감정정리, F 집중)
 *          단일형 6 + 하이브리드 6(상위2축 근접시) = 최대 12유형
 *  - 결과: 제목/인용문/설명/감정상태 요약(2줄)/마음 리마인드/시각요소/버튼
 *  - 수치 직접 노출 금지(라벨 우선, %는 보조 가능)
 *  - 중립 편중 방지: 상위2축 정규화 + 최근3문항 타이브레이커 + 시간가중
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    {k:'M', q:'지금 “작게 시작”할 동기가 떠오른다.'},
    {k:'R', q:'가까운 사람과 내 마음을 나누는 게 부담되지 않는다.'},
    {k:'C', q:'이번 주의 진로/일 목표가 비교적 또렷하다.'},
    {k:'S', q:'수면·식사·물·움직임 같은 기본 케어를 챙겼다.'},
    {k:'E', q:'감정을 글 몇 줄로 정리하면 가벼워진다.'},
    {k:'F', q:'알림/잡생각을 잠시 내려놓고 몰입할 수 있다.'},
    {k:'M', q:'완벽보다 “진행”을 택할 수 있다.'},
    {k:'R', q:'도움 요청/거절을 상황에 맞게 표현할 수 있다.'},
    {k:'C', q:'내 선호/가치가 선택에 반영되고 있다.'},
    {k:'S', q:'과부하 신호(두통/무기력)를 알아차릴 수 있다.'},
    {k:'E', q:'감정의 원인과 바람을 구분해볼 수 있다.'},
    {k:'F', q:'15~25분 타이머 집중이 가능하다.'},
  ];

  let idx=0, startTime=Date.now();
  const ans=[], times=[];
  const score={M:0,R:0,C:0,S:0,E:0,F:0}, count={M:0,R:0,C:0,S:0,E:0,F:0};

  // DOM
  const stepLabel=document.getElementById('stepLabel');
  const barFill=document.getElementById('barFill');
  const qText=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const card=document.getElementById('card');
  const result=document.getElementById('result');
  const prev=document.getElementById('prev');
  const skip=document.getElementById('skip');

  // 시간 가중(±20% 캡의 보조)
  function weight(sec){
    if(sec<1) return 0.9;      // 너무 빠름
    if(sec<4) return 1.0;      // 보통
    if(sec<8) return 1.15;     // 숙고 +
    return 1.10;               // 과숙고 소폭 +
  }

  function render(){
    stepLabel.textContent=`${idx+1} / ${Q.length}`;
    barFill.style.width=`${(idx/Q.length)*100}%`;
    qText.textContent=Q[idx].q;
    wrap.innerHTML=`
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;
    const prevSel=ans[idx];
    if(prevSel!==undefined){
      [...wrap.children].forEach(b=>{ if(Number(b.dataset.s)===prevSel) b.classList.add('selected'); });
    }
    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click',()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      });
    });
    startTime=Date.now();
  }

  function choose(s){
    const elapsed=(Date.now()-startTime)/1000;
    const k=Q[idx].k, w=weight(elapsed);
    ans[idx]=s; times[idx]=elapsed;
    const adjusted = s + (s*(w-1)*0.2);
    score[k]+=adjusted; count[k]+=1;
    next();
  }
  function next(){ idx++; if(idx<Q.length) render(); else finish(); }

  prev?.addEventListener('click',()=>{
    if(idx===0) return;
    idx--;
    recalc(idx);
    render();
  });
  skip?.addEventListener('click',()=>{
    ans[idx]=0; times[idx]=(Date.now()-startTime)/1000;
    next();
  });

  function recalc(end){
    Object.keys(score).forEach(k=>{ score[k]=0; count[k]=0; });
    for(let i=0;i<end;i++){
      const s=ans[i]??0, t=times[i]??3, k=Q[i].k;
      const w=weight(t);
      const adjusted=s + (s*(w-1)*0.2);
      score[k]+=adjusted; count[k]+=1;
    }
  }

  // 정규화(축별 평균 0~1)
  function norm(){
    const n={};
    for(const k of Object.keys(score)){
      const avg = (score[k] / Math.max(1,count[k])) / 4;
      n[k]=Math.max(0, Math.min(1, avg));
    }
    return n;
  }

  // 하이브리드/단일형 분류 + 타이브레이커
  function classify(n){
    const arr=Object.entries(n).sort((a,b)=>b[1]-a[1]); // desc
    const [k1,v1]=arr[0], [k2,v2]=arr[1], [k3,v3]=arr[2];
    const diff=v1-v2, spread=v1-v3;

    // 경계 근처면 최근 3문항으로 미세조정
    function tiebreakCloser(v1,v2){
      let d=0;
      const start=Math.max(0,Q.length-3);
      for(let i=start;i<Q.length;i++){
        const s=ans[i]??0, t=times[i]??3, w= (t<1?0.9:(t<4?1.0:(t<8?1.15:1.1)));
        const axis=Q[i].k;
        if(axis===k1 && s>=3) d+=w*0.01;
        if(axis===k2 && s>=3) d-=w*0.01;
        if(axis===k1 && s<=1) d-=w*0.01;
        if(axis===k2 && s<=1) d+=w*0.01;
      }
      return (v1 + d) - v2;
    }

    let dAdj=diff;
    if(diff<0.10) dAdj=tiebreakCloser(v1,v2);

    if(dAdj<0.10){ // 하이브리드
      return {type:`${k1}${k2}`, mode:'hybrid', top:[k1,k2], n};
    }
    // 단일형
    return {type:k1, mode:'single', top:[k1,k2], n};
  }

  // 결과 카피
  const N2K = {M:'동기', R:'관계', C:'진로', S:'자기돌봄', E:'감정정리', F:'집중'};
  const COPY_SINGLE = {
    M:{title:'🚀 동기 부스터형', quote:'“작게, 지금, 시작.”',
       desc:'의욕의 불씨를 금방 살리는 타입. 완벽보다 진행을 택하면 가장 잘 나아갑니다.',
       remind:['할 일 1개를 5분만','끝나면 스스로 칭찬 1문장','알림 15분 끄기']},
    R:{title:'🤝 관계 네비형', quote:'“마음은 나눌수록 가벼워진다.”',
       desc:'연결감이 에너지의 원천. 소통의 리듬을 만들면 컨디션이 올라갑니다.',
       remind:['안부 1명에게 한 줄','도움요청/거절 문장 템플릿','대화 전 30초 호흡']},
    C:{title:'🧭 진로 컴패스형', quote:'“기준 한 줄이 방향.”',
       desc:'가치·선호를 기준으로 길을 정리하는 타입. 작은 실험으로 확신을 키웁니다.',
       remind:['오늘 기준 한 줄 작성','작은 시범운행 1개','기록 3줄 남기기']},
    S:{title:'🌿 자기돌봄 케어형', quote:'“몸을 챙기면 마음이 돌아온다.”',
       desc:'기본 케어가 곧 회복력. 루틴의 난이도를 낮추면 지속이 쉬워집니다.',
       remind:['물 한 컵 + 창문환기','5분 스트레칭','수면 알람 설정']},
    E:{title:'📝 감정정리 스케치형', quote:'“사실/느낌/바람, 세 줄.”',
       desc:'감정의 결을 언어로 다듬는 타입. 기록으로 무게를 줄입니다.',
       remind:['세 줄 일기(사실/느낌/바람)','따뜻한 음료 1잔','산책 3분']},
    F:{title:'🎯 집중 포커스형', quote:'“타이머가 리듬.”',
       desc:'짧고 선명한 몰입이 강점. 한 번의 몰입이 다음 행동을 부릅니다.',
       remind:['타이머 15분','알림 최소화','끝나고 책상 정리 1분']}
  };

  // 하이브리드 카피(상위2축)
  const COPY_HYBRID = {
    MR:{title:'🚀🤝 동기×관계', quote:'“같이 시작이 쉽게 한다.”',
        desc:'사람과 연결될 때 동기가 켜집니다. 작은 공동 체크리스트로 리듬을 만드세요.',
        remind:['동료와 10분 코워킹','완료 공유 이모지 약속','안부 한 줄 후 바로 착수']},
    MC:{title:'🚀🧭 동기×진로', quote:'“작은 실험이 추진력.”',
        desc:'방향 감각이 동기를 밀어줍니다. 오늘 1개만 실험!',
        remind:['실험 항목 1개','기준 한 줄','15분 시범운행']},
    MS:{title:'🚀🌿 동기×돌봄', quote:'“컨디션이 불씨.”',
        desc:'몸 케어가 동기의 연료. 쉬운 루틴으로 불씨를 지켜요.',
        remind:['물+환기','5분 스트레칭','작업 5분']},
    ME:{title:'🚀📝 동기×감정', quote:'“정리 후 가벼운 시작.”',
        desc:'감정을 한 번 정리하면 바로 착수가 쉬워요.',
        remind:['세 줄 일기','작업 5분','끝나면 스스로 칭찬']},
    MF:{title:'🚀🎯 동기×집중', quote:'“짧고 강하게.”',
        desc:'동기와 몰입의 시너지가 큰 타입.',
        remind:['타이머 15분','알림 끄기','작은 보상 준비']},
    RC:{title:'🤝🧭 관계×진로', quote:'“대화가 방향.”',
        desc:'사람과의 대화 속에서 진로 기준이 선명해집니다.',
        remind:['멘토 1명에게 질문','기준 한 줄 공유','피드백 1문장 저장']},
    RS:{title:'🤝🌿 관계×돌봄', quote:'“함께 돌봄.”',
        desc:'돌봄 루틴을 함께 만들면 지속이 쉬워요.',
        remind:['케어 동료와 체크','물/스트레칭 알림','잠깐 산책 약속']},
    RE:{title:'🤝📝 관계×감정', quote:'“말하면 가벼워진다.”',
        desc:'감정 나눔이 컨디션을 끌어올립니다.',
        remind:['안부 한 줄','세 줄 일기','따뜻한 음료']},
    RF:{title:'🤝🎯 관계×집중', quote:'“동시 접속 몰입.”',
        desc:'같이 타이머를 켜면 몰입이 쉬워집니다.',
        remind:['코워킹 15분','방해 요소 차단','끝나면 하이파이브 이모지']},
    CS:{title:'🧭🌿 진로×돌봄', quote:'“속도는 컨디션에 맞춰.”',
        desc:'몸 상태에 맞는 계획이 성과를 만듭니다.',
        remind:['쉬운 계획 1개','수면 알림','작업 후 가벼운 보상']},
    CE:{title:'🧭📝 진로×감정', quote:'“정리하고 선택.”',
        desc:'감정의 노이즈를 줄이면 결정이 쉬워져요.',
        remind:['세 줄 정리→선택 1개','기준 한 줄','타이머 15분']},
    CF:{title:'🧭🎯 진로×집중', quote:'“방향→몰입 루프.”',
        desc:'방향을 정하고 바로 몰입하면 효율 최고.',
        remind:['우선순위 1개','타이머 20분','끝나면 기록 1문장']},
    SE:{title:'🌿📝 돌봄×감정', quote:'“몸과 말의 합.”',
        desc:'몸을 돌보고 말로 정리하면 회복이 빨라져요.',
        remind:['물+호흡','세 줄 일기','짧은 산책']},
    SF:{title:'🌿🎯 돌봄×집중', quote:'“컨디션→몰입.”',
        desc:'짧은 케어 후 몰입이 가장 잘 됩니다.',
        remind:['스트레칭 1분','타이머 15분','종료 후 정리 1분']},
    EF:{title:'📝🎯 감정×집중', quote:'“정리 후 직행.”',
        desc:'감정을 쓱 정리하고 곧바로 몰입하세요.',
        remind:['세 줄 요약','알림 최소화','15분 집중']}
  };

  // 상태 라벨(0~1 → 단어)
  function label(v){
    if(v>=0.8) return '높음';
    if(v>=0.6) return '적정';
    if(v>=0.4) return '보통';
    if(v>=0.2) return '낮음';
    return '아주 낮음';
  }

  // 상태 미터(라벨 중심, %는 보조)
  function meter(n){
    const rows=[['M','동기'],['R','관계'],['C','진로'],['S','자기돌봄'],['E','감정정리'],['F','집중']];
    return `
      <div class="state-meter">
        ${rows.map(([k,name])=>{
          const pct=Math.round(Math.max(0,Math.min(1,n[k]))*100);
          return `
            <div class="row">
              <span><b>${name}</b></span>
              <div class="bar"><span class="fill" style="width:${pct}%"></span></div>
              <span style="color:var(--text-soft)">${label(pct/100)}</span>
            </div>`;
        }).join('')}
      </div>`;
  }

  function finish(){
    card.style.display='none'; barFill.style.width='100%';
    const n = norm();
    const cls = classify(n);  // {type, mode, top, n}

    const img='../assets/mindtalk.png';
    // 카피 선택
    let info=null;
    if(cls.mode==='single'){
      info = COPY_SINGLE[cls.type];
    }else{
      const key = cls.type.split('').sort().join('');
      info = COPY_HYBRID[key];
    }
    if(!info){ info = COPY_SINGLE.M; }

    // 감정상태 요약(2줄)
    const ms = `• 상위 축: ${cls.top.map(k=>N2K[k]).join(' / ')}\n• 전체 톤: ${cls.mode==='single'?'단일 성향 또렷':'두 축의 조화'}`;

    // 추천 리마인드 칩(하위 카테고리)
    const chips = ['동기','관계','진로','자기돌봄','감정정리','집중'];
    const chipHtml = chips.map(c=>`<button class="pill" type="button" aria-label="${c} 리마인드">${c}</button>`).join('');

    result.innerHTML=`
      <div class="result-card">
        <div class="result-hero">
          <img src="${img}" alt="마음톡" onerror="this.src='../assets/plant.png'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>

        <p style="margin:8px 0">${info.desc}</p>

        <pre class="pill" style="white-space:pre-wrap;margin:8px 0">${ms}</pre>

        <div class="mind-remind" style="margin:6px 0 10px;color:var(--text-soft)">
          <b>🌿 마음 리마인드(1분 내 실행)</b><br>
          · ${info.remind[0]}<br>
          · ${info.remind[1]}<br>
          · ${info.remind[2]}
        </div>

        ${meter(cls.n)}

        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${chipHtml}</div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;

    // 칩 클릭 → 간단 토스트(선택 피드백) 정도만
    document.querySelectorAll('.result-card .pill').forEach(b=>{
      b.addEventListener('click', ()=>{
        const t=b.textContent.trim();
        b.classList.add('selected');
        setTimeout(()=>b.classList.remove('selected'), 400);
      });
    });

    result.style.display='block';
  }

  // 시작
  render();
});