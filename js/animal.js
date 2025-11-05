/* ===================================================
 * 나는 어떤 동물? — v2025.2 (14문항, 상태형 결과, 중립 편중 방지)
 * =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    {k:'A', q:'즉흥적인 제안이 오면 기분이 먼저 움직인다.'},
    {k:'A', q:'몸을 쓰는 활동(산책/운동/정리)이 마음을 시원하게 한다.'},
    {k:'A', q:'문제 앞에서 일단 시도해보고 배우는 편이다.'},
    {k:'A', q:'함께 움직일 때 에너지가 눈에 띄게 오른다.'},
    {k:'N', q:'새로운 방법을 실험하거나 변화를 주는 게 즐겁다.'},
    {k:'N', q:'낯선 장소/문화에 대한 호기심이 크다.'},
    {k:'N', q:'틀을 바꾸거나 업그레이드하는 상상을 자주 한다.'},
    {k:'N', q:'가능성과 아이디어를 떠올리며 동기부여가 된다.'},
    {k:'C', q:'상대의 감정 신호를 빨리 캐치하는 편이다.'},
    {k:'C', q:'대화의 온도와 흐름을 조율하는 편이다.'},
    {k:'C', q:'연락이 끊기면 마음이 쓰이고 먼저 다가가려 한다.'},
    {k:'S', q:'결정 전, 정보를 비교/검토하고 계획을 세운다.'},
    {k:'S', q:'루틴과 규칙이 있으면 마음이 안정된다.'},
    {k:'S', q:'큰 변화를 한 번에 주는 것보다 단계적 변화가 편하다.'}
  ];

  let idx=0, start=Date.now();
  const score={A:0,N:0,C:0,S:0}, count={A:0,N:0,C:0,S:0};
  const ans=[], times=[];
  const step=document.getElementById('stepLabel');
  const bar=document.getElementById('barFill');
  const qText=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const card=document.getElementById('card');
  const result=document.getElementById('result');
  const prev=document.getElementById('prev');
  const skip=document.getElementById('skip');

  const weight=(sec)=> sec<1?0.9: sec<4?1.0: sec<8?1.15:1.10;

  function render(){
    step.textContent=`${idx+1} / ${Q.length}`;
    bar.style.width=`${(idx/Q.length)*100}%`;
    qText.textContent=Q[idx].q;
    wrap.innerHTML=`
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>`;
    const prevSel=ans[idx];
    if(prevSel!==undefined){ [...wrap.children].forEach(b=>{ if(Number(b.dataset.s)===prevSel) b.classList.add('selected'); }); }
    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click',()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      });
    });
    start=Date.now();
  }

  function choose(s){
    const sec=(Date.now()-start)/1000, w=weight(sec);
    const adj=s + (s*(w-1)*0.2);
    ans[idx]=s; times[idx]=sec;
    const k=Q[idx].k; score[k]+=adj; count[k]+=1;
    next();
  }
  function next(){ idx++; if(idx<Q.length) render(); else finish(); }

  prev?.addEventListener('click',()=>{ if(idx===0) return; idx--; recalc(idx); render(); });
  skip?.addEventListener('click',()=>{ ans[idx]=0; times[idx]=(Date.now()-start)/1000; next(); });

  function recalc(end){
    score.A=score.N=score.C=score.S=0; count.A=count.N=count.C=count.S=0;
    for(let i=0;i<end;i++){
      const s=ans[i]??0, k=Q[i].k, sec=times[i]??3, w=weight(sec);
      const adj=s + (s*(w-1)*0.2); score[k]+=adj; count[k]+=1;
    }
  }

  const normalize=()=>{
    const n={}; for(const k of ['A','N','C','S']){
      const avg=(score[k]/Math.max(1,count[k]))/4;
      n[k]=Math.max(0,Math.min(1,avg));
    } return n;
  };

  function tieBreakTop2(k1,k2){
    let d=0;
    for(let i=Math.max(0,Q.length-3); i<Q.length; i++){
      const ax=Q[i].k; if(ax!==k1 && ax!==k2) continue;
      const sec=times[i]??3, w=weight(sec), s=ans[i]??0;
      const mag=(s>=3?1:(s===2?0.3:0.1));
      d += (ax===k1?1:-1)*w*mag;
    }
    return d>=0? k1:k2;
  }

  function classify(){
    const n=normalize();
    const arr=Object.entries(n).sort((a,b)=>b[1]-a[1]);
    const [k1,v1]=arr[0],[k2,v2]=arr[1],[,v3]=arr[2];
    const diff12=v1-v2, spread=v1-v3;
    const first = (diff12<0.10)? tieBreakTop2(k1,k2): k1;
    const second = (first===k1? k2:k1);

    const combo=[first,second].sort().join('');
    const keyMap={ AN:'FOX', AC:'OTTER', AS:'CAT', CN:'DOLPHIN', CS:'PENGUIN', NS:'OWL' };
    const type = keyMap[combo] || 'FOX';
    const dominant=(diff12>=0.18 && spread>=0.26);
    return {type, tag:dominant?'dominant':'blend', n};
  }

  const COPY={
    FOX:{title:'🦊 여우형', quote:'“일단 해보고 배우자!”',
      desc:'기민하고 재치 있는 도전자예요. 새로운 판을 여는 데 주저가 없고, 임기응변이 빠릅니다. 함께할 때 분위기를 띄우며, 흐름을 바꾸는 추진력이 강점이에요.',
      remind:'즉흥을 살리되, 체크포인트 2개만 세우고 출발해요.'},
    OTTER:{title:'🦦 수달형', quote:'“같이 하면 더 재밌지!”',
      desc:'분위기 메이커이자 팀플레이어예요. 함께할 때 에너지가 커지고 지속력이 붙습니다. 타인의 감정 변화를 민감하게 감지해 흐름을 부드럽게 만들어요.',
      remind:'연락 리듬을 가볍게 고정하고, 휴식 신호를 미리 공유해요.'},
    CAT:{title:'🐱 고양이형', quote:'“거리는 내가 정해. 정성은 진심으로.”',
      desc:'집중과 자율이 강점이에요. 필요할 때 번개처럼 몰입하고, 에너지를 효율적으로 씁니다. 루틴과 자유의 균형을 잘 맞출 때 성과가 납니다.',
      remind:'자유 시간을 일정처럼 확보하고 50-10 타이머로 무리 방지.'},
    DOLPHIN:{title:'🐬 돌고래형', quote:'“센스×배려 콜라보!”',
      desc:'감각적이고 영리한 조율가예요. 공감과 창의로 흐름을 바꾸며 대화를 리드합니다. 아이디어를 실제 행동으로 이어갈 때 빛나요.',
      remind:'아이디어 1개만 바로 시도하고, 충전 타임을 예약해요.'},
    PENGUIN:{title:'🐧 펭귄형', quote:'“천천히, 하지만 함께.”',
      desc:'성실하고 의리 있는 협력가예요. 꾸준함으로 팀의 항로를 지키고, 신뢰로 안정감을 줍니다. 속도보다 지속에 강해요.',
      remind:'규칙 + 작은 예외 규칙을 두고, 감정 체크를 일정에 넣어요.'},
    OWL:{title:'🦉 부엉이형', quote:'“빨리보다 정확하게.”',
      desc:'차분한 통찰가예요. 근거 기반으로 새로움을 구조화하고, 계획을 세워 안정적으로 실행합니다. 탐색 시간을 정하면 더 멀리 가요.',
      remind:'탐색 시간 상한을 정하고, 작은 단위로 시범 운행하세요.'}
  };

  const label = (p)=> p>=0.80?'매우 높음': p>=0.60?'높음': p>=0.40?'보통': p>=0.20?'낮음':'매우 낮음';

  function meters(n){
    const rows=[['A','활동성'],['N','새로움'],['C','공감'],['S','신중']];
    return `
      <div class="state-meter">
        ${rows.map(([k,name])=>{
          const pct=Math.round((n[k]??0)*100);
          return `
            <div class="row">
              <span><b>${name}</b></span>
              <div class="bar"><span class="fill" style="width:${pct}%"></span></div>
              <span class="meter-label">${label(pct/100)}${pct?` (${pct}%)`:''}</span>
            </div>`;
        }).join('')}
      </div>`;
  }

  const ANIMAL_IMG = {
    FOX:      '../assets/animals/fox.png',
    OTTER:    '../assets/animals/otter.png',
    CAT:      '../assets/animals/cat.png',
    DOLPHIN:  '../assets/animals/dolphin.png',
    PENGUIN:  '../assets/animals/penguin.png',
    OWL:      '../assets/animals/owl.png',
  };

  function finish(){
    card.style.display='none'; bar.style.width='100%';
    const {type, tag, n}=classify();
    const info=COPY[type] || COPY.FOX;
    const badge = tag==='dominant'
      ? `<div class="pill">단일 성향 또렷</div>`
      : `<div class="pill">두 성향의 조화</div>`;

    result.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <img class="animal-hero"
               src="${ANIMAL_IMG[type] || '../assets/animal.png'}"
               alt="${info.title}"
               onerror="this.onerror=null; this.src='../assets/animal.png'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
            <div style="margin-top:6px">${badge}</div>
          </div>
        </div>

        <p style="margin:10px 0">${info.desc}</p>

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

  render();
});