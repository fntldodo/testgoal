/* ===================================================
 * 마음 일기예보 — 몽실몽실 v2025.2 (마음 리마인드)
 * ---------------------------------------------------
 * - 15문항 / 5지선다(0~4) + 응답시간 가중(±20%, 선택 우선)
 * - 6형: SUNNY / CLOUDY / RAINY / STORM / RAINBOW / NIGHT
 * - 결과: 숫자 직접 노출 금지(상태 라벨 중심), %는 보조일 때만
 * - 상태미터 라벨을 날씨 용어(기압/습도/바람/체감온도)로 표기
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 각 문항은 특정 날씨 성향에 기여
  const Q = [
    {t:'SUNNY',   q:'아침에 가볍게라도 시작하면 컨디션이 빨리 오른다.'},
    {t:'SUNNY',   q:'낙관적인 상상을 하면 실행으로 이어지는 편이다.'},
    {t:'CLOUDY',  q:'결정 전에 한 번 더 살피고 정리하는 편이 마음이 편하다.'},
    {t:'CLOUDY',  q:'속도를 조금 늦추면 오히려 실수가 줄어든다.'},
    {t:'RAINY',   q:'요즘 감정의 결을 예민하게 느낀다.'},
    {t:'RAINY',   q:'음악/글/영상 같은 감성 자극에 많이 몰입한다.'},
    {t:'STORM',   q:'생각과 알림이 한꺼번에 몰려 머릿속이 복잡해지곤 한다.'},
    {t:'STORM',   q:'강한 추진력으로 한 번에 몰아치는 편이다.'},
    {t:'RAINBOW', q:'최근에 감사할 일이나 연결감이 떠오른다.'},
    {t:'RAINBOW', q:'감정과 생각이 화해하는 순간이 있었다.'},
    {t:'NIGHT',   q:'조용한 시간에 재충전이 잘 된다.'},
    {t:'NIGHT',   q:'스크린 타임을 줄이면 마음이 차분해진다.'},
    // 균형/보정용 3문항
    {t:'SUNNY',   q:'작게라도 시작하면 금방 탄력이 붙는다.'},
    {t:'CLOUDY',  q:'정리/정돈을 하면 머리가 맑아진다.'},
    {t:'NIGHT',   q:'늦은 밤보다 일찍 눕는 날이 더 안정적이다.'},
  ];

  let idx=0, startTime=Date.now();
  const S={SUNNY:0,CLOUDY:0,RAINY:0,STORM:0,RAINBOW:0,NIGHT:0};
  const C={SUNNY:0,CLOUDY:0,RAINY:0,STORM:0,RAINBOW:0,NIGHT:0};
  const ans=[], times=[], recent=[];

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

  function weight(sec){
    if(sec<1) return 0.9;
    if(sec<4) return 1.0;
    if(sec<8) return 1.15;
    return 1.1;
  }

  function choose(s){
    const elapsed=(Date.now()-startTime)/1000;
    const t=Q[idx].t, w=weight(elapsed);
    const adj=s + (s*(w-1)*0.2); // ±20% 캡, 선택이 우선
    S[t]+=adj; C[t]+=1; ans[idx]=s; times[idx]=elapsed;

    recent.push({i:idx,t,s,sec:elapsed});
    if(recent.length>3) recent.shift();

    idx<Q.length-1? (idx++,render()):finish();
  }

  prevBtn?.addEventListener('click',()=>{
    if(idx===0) return;
    idx--;
    recalc(idx);
    render();
  });

  skipBtn?.addEventListener('click',()=>{
    ans[idx]=0; times[idx]=(Date.now()-startTime)/1000;
    choose(0); // 스킵도 0 반영(통계/가중 유지)
  });

  function recalc(end){
    Object.keys(S).forEach(k=>{ S[k]=0; C[k]=0; });
    for(let i=0;i<end;i++){
      const s=ans[i]??0; const t=Q[i].t; const w=weight(times[i]??0);
      const adj=s + (s*(w-1)*0.2);
      S[t]+=adj; C[t]+=1;
    }
  }

  // 정규화 0~1
  function norm(){
    const N={};
    Object.keys(S).forEach(k=>{
      const denom=Math.max(1, C[k])*4;
      N[k]=Math.max(0, Math.min(1, S[k]/denom));
    });
    return N;
  }

  // 타이브레이커: 근소차면 최근 3문항에서 더 많이 선택된 축
  function tieBreak(a,b){
    let d=0;
    recent.forEach(r=>{
      const w=weight(r.sec);
      if(r.t===a) d+=1*w;
      if(r.t===b) d-=1*w;
    });
    return d>=0 ? a : b;
  }

  function classify(){
    const n=norm();
    const arr=Object.entries(n).sort((x,y)=>y[1]-x[1]);
    const [k1,v1]=arr[0], [k2,v2]=arr[1];
    const diff=v1-v2;
    const main = (diff<0.08) ? tieBreak(k1,k2) : k1;
    return main; // SUNNY~NIGHT
  }

  // 상태미터 계산(날씨 용어)
  function clamp01(v){ return Math.max(0, Math.min(1, v)); }
  function weatherMeters(n){
    // 기압: STORM 반대 + CLOUDY 약간의 안정
    const pressure = clamp01(1 - n.STORM*0.8 + n.CLOUDY*0.2);
    // 습도: RAINY 그대로
    const humidity = clamp01(n.RAINY);
    // 바람: STORM 0.6 + CLOUDY 0.3
    const wind     = clamp01(n.STORM*0.6 + n.CLOUDY*0.3);
    // 체감온도: SUNNY 0.6 + RAINBOW 0.4 - NIGHT 0.2
    const feels    = clamp01(n.SUNNY*0.6 + n.RAINBOW*0.4 - n.NIGHT*0.2);

    const pct=(x)=>Math.round(x*100);
    const label=(p,kind)=>{
      if(kind==='pressure'){ if(p>=80) return '매우 안정적'; if(p>=60) return '안정적'; if(p>=40) return '보통'; if(p>=20) return '변동 있음'; return '불안정'; }
      if(kind==='humidity'){ if(p>=80) return '매우 높음'; if(p>=60) return '높음'; if(p>=40) return '보통'; if(p>=20) return '낮음'; return '매우 낮음'; }
      if(kind==='wind'){     if(p>=80) return '강풍';     if(p>=60) return '약간 강함'; if(p>=40) return '보통'; if(p>=20) return '잔잔'; return '매우 잔잔'; }
      if(kind==='feels'){    if(p>=80) return '아주 따뜻함'; if(p>=60) return '따뜻함'; if(p>=40) return '온화'; if(p>=20) return '서늘'; return '차가움'; }
      return '보통';
    };

    const row=(name,p,kind)=>`
      <div style="text-align:left;margin:6px 0">
        <div style="display:flex;justify-content:space-between;font-weight:700">
          <span>${name} — ${label(p,kind)}</span>
          <span style="color:var(--text-soft)">${p}%</span>
        </div>
        <div class="bar" style="height:8px"><span class="fill" style="width:${p}%"></span></div>
      </div>
    `;

    return [
      row('기압',   pct(pressure), 'pressure'),
      row('습도',   pct(humidity), 'humidity'),
      row('바람',   pct(wind),     'wind'),
      row('체감온도', pct(feels),   'feels')
    ].join('');
  }

  const IMG=(k)=>`../assets/weather/weather_${k.toLowerCase()}.png`;
  const COPY={
    SUNNY:{title:'☀️ 맑음 — 낙관 에너지형', quote:'“작게 시작하면 금방 빛이 들어요.”',
      desc:'의욕과 낙관이 가볍게 올라오는 날. 시작의 마찰이 낮고 흐름이 잘 붙습니다.',
      mood:['속도 — 가벼움','집중 — 상승','정서 — 밝음'],
      remind:['할 일 1개만 끝내기','햇빛 10분 산책','물 한 컵']},
    CLOUDY:{title:'⛅ 흐림 — 사려 깊은 관망형', quote:'“천천히 보면 더 잘 보여요.”',
      desc:'속도를 낮추고 정리/정돈이 잘되는 날. 탐색·검토에 유리합니다.',
      mood:['속도 — 느림','집중 — 선별','정서 — 잔잔'],
      remind:['결정 보류 OK, 메모 먼저','책상 5분 정리','가벼운 스트레칭']},
    RAINY:{title:'🌧 비 — 감성 섬세형', quote:'“흐름에 맡기고 흘려보내요.”',
      desc:'감정의 결이 섬세하게 느껴지는 날. 표현/창작/회고에 강점이 있습니다.',
      mood:['속도 — 부드러움','집중 — 감성','정서 — 깊음'],
      remind:['감정일기 3줄','따뜻한 음료','창밖 보기 2분']},
    STORM:{title:'⛈ 폭풍 — 에너지 과포화형', quote:'“방향을 잡으면 추진력은 자산.”',
      desc:'자극과 생각이 몰려오는 날. 한 가지에 몰입하면 성과가 큽니다.',
      mood:['속도 — 빠름','집중 — 분산→집중','정서 — 요동'],
      remind:['알림 끄고 25분 타이머','중요한 1개만 실행','깊은 호흡 3회']},
    RAINBOW:{title:'🌈 무지개 — 회복·통합형', quote:'“감사와 연결이 에너지를 채워요.”',
      desc:'감정과 생각이 화해하는 날. 관계·감사·정리에 최적화.',
      mood:['속도 — 안정','집중 — 통합','정서 — 온화'],
      remind:['고마운 일 3가지','짧은 안부 한 줄','정리 후 마무리 의식']},
    NIGHT:{title:'🌙 밤 — 정리·충전형', quote:'“속도를 낮추면 깊이가 채워집니다.”',
      desc:'조용한 성찰과 휴식이 필요한 날. 에너지 보존/정리에 적합합니다.',
      mood:['속도 — 낮춤','집중 — 휴식','정서 — 차분'],
      remind:['스크린 타임 줄이기','따뜻한 샤워','일찍 눕기 챌린지']}
  };

  function finish(){
    card.style.display='none'; barFill.style.width='100%';

    const key=classify();          // 최종 날씨
    const n=norm();                // 축별 정규화(0~1)
    const c=COPY[key];
    const moodSummary=`• ${c.mood.join('  • ')}`;

    resultBox.innerHTML=`
      <div class="result-card mind">
        <div class="result-hero">
          <img src="${IMG(key)}" alt="${c.title}" onerror="this.src='../assets/mongsil.png'">
          <div>
            <div class="result-title">${c.title}</div>
            <div class="result-desc">${c.quote}</div>
          </div>
        </div>

        <p style="margin:8px 0">${c.desc}</p>

        <div class="pill" style="margin:8px 0 2px">${moodSummary}</div>

        <div class="mind-remind" style="margin:6px 0 10px; color:var(--text-soft)">
          <b>🌿 마음 리마인드:</b>
          ${c.remind.map(t=>`<div class="pill" style="display:inline-block; margin:4px 6px 0 0">${t}</div>`).join('')}
          <div style="margin-top:6px; font-size:13px">* 지금 당장 할 수 있는 미니 행동 1가지부터 시작해요.</div>
        </div>

        <div style="margin-top:8px">
          ${weatherMeters(n)}
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;
    resultBox.style.display='block';
  }

  render();
});
