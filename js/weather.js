/* =========================================================
 * ☁️ 마음 일기예보 — v2025.2 보강판 (마음 리마인드 적용)
 * - 원본 구조 유지, 문장 강화, 리마인드 자연화
 * ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    {k:'P', q:'오늘은 사소한 일에도 고마움이 느껴진다.'},
    {k:'P', q:'가벼운 기대감이 마음속에서 은근히 올라온다.'},
    {k:'P', q:'내가 하는 일에서 작은 즐거움이 보인다.'},
    {k:'P', q:'몸과 마음이 전반적으로 가벼운 편이다.'},
    {k:'N', q:'자꾸 걱정이 앞서서 아무 것도 손에 잡히지 않는다.', rev:true},
    {k:'N', q:'짜증/분노가 자주 올라오고 사소한 것에 걸린다.', rev:true},
    {k:'N', q:'오늘은 우울/허무가 커서 의욕이 잘 안 난다.', rev:true},
    {k:'N', q:'머릿속이 복잡해서 아무 결정을 못 내리겠다.', rev:true},
    {k:'E', q:'움직이면 금방 탄력이 붙는 느낌이다.'},
    {k:'E', q:'집중을 시작하면 꽤 오래 유지되는 편이다.'},
    {k:'E', q:'필요한 일을 처리할 힘이 충분하다고 느낀다.'},
    {k:'C', q:'마음의 속도가 안정적이고 호흡이 고르게 느껴진다.'},
    {k:'C', q:'생각이 정리되어 우선순위가 비교적 분명하다.'},
    {k:'C', q:'감정의 파도가 지나가더라도 금방 균형을 회복한다.'}
  ];

  let idx=0, start=Date.now();
  const score={P:0,N:0,E:0,C:0}, count={P:0,N:0,E:0,C:0};
  const ans=[], times=[];

  const step=document.getElementById('stepLabel');
  const bar=document.getElementById('barFill');
  const qText=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const card=document.getElementById('card');
  const result=document.getElementById('result');
  const prev=document.getElementById('prev');
  const skip=document.getElementById('skip');

  function weight(sec){ if(sec<1)return 0.9; if(sec<4)return 1.0; if(sec<8)return 1.15; return 1.10; }

  function render(){
    step.textContent=`${idx+1} / ${Q.length}`;
    bar.style.width=`${(idx/Q.length)*100}%`;
    qText.textContent=Q[idx].q;
    wrap.innerHTML=`
      <button class="choice" data-s="4">매우 그렇다</button>
      <button class="choice" data-s="3">그렇다</button>
      <button class="choice" data-s="2">보통이다</button>
      <button class="choice ghost" data-s="1">아니다</button>
      <button class="choice ghost" data-s="0">전혀 아니다</button>`;
    const prevSel=ans[idx];
    if(prevSel!==undefined){[...wrap.children].forEach(b=>{if(Number(b.dataset.s)===prevSel)b.classList.add('selected');});}
    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click',()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),120);
      });
    });
    start=Date.now();
  }

  function choose(s){
    const sec=(Date.now()-start)/1000;
    const w=weight(sec);
    const item=Q[idx];
    const base=item.rev?(4-s):s;
    const adj=base+(base*(w-1)*0.2);
    ans[idx]=s; times[idx]=sec;
    score[item.k]+=adj; count[item.k]+=1;
    next();
  }

  function next(){ idx++; if(idx<Q.length)render(); else finish(); }
  prev?.addEventListener('click',()=>{if(idx===0)return;idx--;recalc(idx);render();});
  skip?.addEventListener('click',()=>{ans[idx]=0;times[idx]=(Date.now()-start)/1000;next();});
  function recalc(end){ for(const k in score)score[k]=count[k]=0;
    for(let i=0;i<end;i++){const sec=times[i]??3,w=weight(sec);
      const it=Q[i],s=ans[i]??0,base=it.rev?(4-s):s;
      const adj=base+(base*(w-1)*0.2);
      score[it.k]+=adj;count[it.k]+=1;}
  }

  function normalize(){const n={};for(const k of['P','N','E','C']){
    const avg=(score[k]/Math.max(1,count[k]))/4;n[k]=Math.max(0,Math.min(1,avg));}return n;}

  function pickWeather(n){
    const P=n.P,N=n.N,E=n.E,C=n.C;
    if(N>=0.75&&C<=0.40)return'storm';
    if(P>=0.60&&N>=0.60)return'rainbow';
    if(P>=0.65&&N<=0.35&&C>=0.55)return'sunny';
    if(N>=0.60&&C<=0.50&&E<=0.50)return'rainy';
    if(E<=0.35&&P<=0.40&&N<=0.55)return'night';
    return'cloudy';
  }

  const COPY={
    sunny:{title:'🌤️ 맑음',quote:'“마음이 환하게 열린 날”',
      desc:'긍정과 안정이 균형을 이루며 마음이 가벼운 날이에요. 자연스러운 집중과 활력이 함께 따라오며, 주변에도 밝은 에너지를 전합니다.',
      remind:'오늘 좋았던 장면을 한 줄로 적어보세요. ‘감사’는 생각보다 강력한 회복제예요.'},
    cloudy:{title:'🌥️ 구름 많음',quote:'“조금 둔탁하지만 괜찮아.”',
      desc:'감정이 뚜렷하지 않거나 집중이 흐릿한 상태예요. 완벽하지 않아도 괜찮아요. 작게라도 손을 움직이면 마음의 방향이 다시 잡힙니다.',
      remind:'할 일 중 가장 쉬운 한 가지를 10분만 해보세요. 작은 움직임이 선명도를 높여줘요.'},
    rainy:{title:'🌧️ 비',quote:'“감정의 결이 섬세해지는 날”',
      desc:'내면이 촉촉하고 감정이 풍부하게 느껴지는 날이에요. 때로는 이유 없이 슬퍼도 괜찮아요. 감정을 억누르지 말고 흘려보내는 게 회복의 시작이에요.',
      remind:'감정을 짧게 기록해요. 단어라도 좋아요. 그 순간, 마음의 물기가 정리되기 시작합니다.'},
    storm:{title:'⛈️ 폭풍',quote:'“감정의 파도가 큰 날”',
      desc:'불안이나 분노가 커져서 내면의 균형이 흔들릴 수 있어요. 지금 필요한 건 판단이 아니라 진정이에요. 감정의 출구를 안전하게 마련하세요.',
      remind:'호흡을 깊게 5번, 물 한 컵 마시기. 몸이 진정되면 마음도 따라와요.'},
    rainbow:{title:'🌈 무지개',quote:'“섞였지만, 그래서 아름답다.”',
      desc:'기쁨과 슬픔이 함께 공존하는 감정 스펙트럼의 날이에요. 다양한 마음을 인정하면 오히려 자신이 선명해집니다.',
      remind:'지금 떠오르는 “감사와 아쉬움”을 각각 한 줄씩 써보세요. 그것이 오늘의 색깔이에요.'},
    night:{title:'🌙 밤',quote:'“불 끄고 쉬어가는 시간”',
      desc:'에너지가 낮고 정서가 잔잔한 휴식의 날이에요. 더하지 않아도 괜찮아요. 내일을 위한 회복을 선택하세요.',
      remind:'화면 밝기를 낮추고 조용히 숨을 고르세요. 오늘 하루, 충분히 괜찮았습니다.'}
  };

  function label(p){if(p>=0.8)return'매우 높음';if(p>=0.6)return'높음';if(p>=0.4)return'보통';if(p>=0.2)return'낮음';return'매우 낮음';}

  function meters(n){
    const rows=[['P','긍정'],['N','부정'],['E','에너지'],['C','차분·명료']];
    return `<div class="state-meter">
      ${rows.map(([k,name])=>{
        const pct=Math.round((n[k]??0)*100);
        return `<div class="row">
          <span><b>${name}</b></span>
          <div class="bar"><span class="fill" style="width:${pct}%"></span></div>
          <span class="meter-label">${label(pct/100)} (${pct}%)</span>
        </div>`;}).join('')}
    </div>`;
  }

  function finish(){
    card.style.display='none'; bar.style.width='100%';
    const n=normalize(); const wth=pickWeather(n); const info=COPY[wth];
    result.innerHTML=`
      <div class="result-card">
        <div class="result-hero result-hero--big">
          <img class="animal-hero" src="../assets/weather/weather_${wth}.png"
            alt="${info.title}" onerror="this.src='../assets/mongsil.png'">
          <div><div class="result-title">${info.title}</div>
          <div class="result-desc">${info.quote}</div></div>
        </div>
        <p style="margin:8px 0">${info.desc}</p>
        ${meters(n)}
        <div class="mind-remind"><b>🌿 마음 리마인드:</b> ${info.remind}</div>
        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>`;
    result.style.display='block';
  }

  render();
});