/* ===================================================
 * 연애 스타일 밸런스 — v2025.2 마음 리마인드(롱카피 확장)
 * ---------------------------------------------------
 * - 14문항 / 5지선다 / 응답시간 가중 ±20%
 * - 축: P(열정), S(안정), I(독립), E(공감)
 * - 결과 8유형 (단일4 + 조합4)
 * - 중간값 편중 완화 + 감정상태·리마인드 출력(장문)
 * - UI: 상태 라벨(강함/적정/중간/낮음), 숫자점수 비노출
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    {k:'P',q:'연애 초반엔 감정이 빠르게 타오르는 편이다.'},
    {k:'P',q:'사랑 표현은 직접적으로 하는 편이다.'},
    {k:'P',q:'사랑은 “설렘”이 없으면 의미가 적다고 생각한다.'},
    {k:'S',q:'갈등이 생기면 대화로 해결하려 노력한다.'},
    {k:'S',q:'관계에서는 신뢰와 일상이 중요하다.'},
    {k:'S',q:'감정보다 “지속력”을 중시한다.'},
    {k:'I',q:'연애 중에도 나만의 시간이 꼭 필요하다.'},
    {k:'I',q:'상대에게 의존하지 않으려 한다.'},
    {k:'I',q:'혼자만의 공간이 에너지를 회복시킨다.'},
    {k:'E',q:'상대의 기분을 잘 읽는 편이다.'},
    {k:'E',q:'감정 표현이 서툰 사람을 보면 도와주고 싶다.'},
    {k:'E',q:'상대의 감정이 내 감정처럼 느껴진다.'},
    {k:'P',q:'사랑에는 약간의 극적인 긴장이 필요하다.'},
    {k:'S',q:'좋은 연애는 편안함 속의 설렘이라고 생각한다.'},
  ];

  const stepLabel=document.getElementById('stepLabel');
  const barFill=document.getElementById('barFill');
  const qText=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const card=document.getElementById('card');
  const result=document.getElementById('result');
  const prevBtn=document.getElementById('prev');
  const skipBtn=document.getElementById('skip');

  let idx=0; const score={P:0,S:0,I:0,E:0}; const counts={P:0,S:0,I:0,E:0};
  const ans=[]; const times=[]; let startTime=Date.now();

  function weight(sec){
    if(sec<1) return 0.9;
    if(sec<4) return 1.0;
    if(sec<8) return 1.15;
    return 1.1;
  }

  function render(){
    stepLabel.textContent=`${idx+1} / ${Q.length}`;
    barFill.style.width=`${(idx/Q.length)*100}%`;
    qText.textContent=Q[idx].q;
    wrap.innerHTML=`
      <button class="choice" data-s="4">매우 그렇다</button>
      <button class="choice" data-s="3">그렇다</button>
      <button class="choice" data-s="2">보통이다</button>
      <button class="choice ghost" data-s="1">아니다</button>
      <button class="choice ghost" data-s="0">전혀 아니다</button>`;
    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click',()=>{
        Array.from(wrap.children).forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      });
    });
    startTime=Date.now();
  }

  function choose(s){
    const elapsed=(Date.now()-startTime)/1000;
    const k=Q[idx].k;
    const w=weight(elapsed);
    ans[idx]=s;
    const adjusted=s+(s*(w-1)*0.2);   // 선택 우선, 시간은 ±20% 이내 보조
    score[k]+=adjusted; counts[k]++;
    next();
  }

  function next(){
    idx++;
    if(idx<Q.length) render();
    else finish();
  }

  prevBtn?.addEventListener('click',()=>{
    if(idx===0)return;
    idx--;
    render();
  });

  skipBtn?.addEventListener('click',()=>{ans[idx]=0;next();});

  function normalize(){
    const max=4* (Q.length/4); // 축당 문항수(=Q.length/4) × 4점
    const n={};
    for(const k in score){ n[k]=score[k]/max; } // 0~1
    return n;
  }

  // 균형형 편중 완화: top1-top2 차이가 0.18 미만이면 조합, 이상이면 단일
  function getType(n){
    const arr=Object.entries(n).sort((a,b)=>b[1]-a[1]);
    const top1=arr[0][0], top2=arr[1][0];
    const diff=arr[0][1]-arr[1][1];
    return diff>0.18 ? top1 : [top1,top2].sort().join('');
  }

  // --------- 결과 카피(롱버전) ----------
  const COPY={
    P:{
      title:'🔥 열정형',
      quote:'“사랑은 지금, 여기에 타오른다.”',
      desc:'당신의 사랑은 시작부터 온도가 높습니다. 눈빛과 말투, 작은 선물과 즉흥적인 제안까지—마음이 움직이는 순간을 놓치지 않죠. 빠르게 몰입하는 만큼 감정의 기복도 생기지만, 그 에너지가 관계에 생명을 불어넣습니다. 단, 속도가 서로 다를 수 있다는 사실을 기억하면, 같은 열정을 더 오래 나눌 수 있어요.',
      mood:'오늘의 마음 리듬은 “고속 점화”에 가깝습니다. 설렘과 추진력은 충분하고, 기다림과 여유가 살짝 부족할 수 있어요. 당신의 진심을 그대로 유지하되, 호흡을 한 템포 맞추면 관계의 불꽃은 더 따뜻하게 타오릅니다.',
      remind:'감정은 숨기지 말고, 속도만 조절해요. “지금 설레는데, 너의 속도도 궁금해” 같은 한 문장은 열정을 배려로 바꿔 줍니다.'
    },
    S:{
      title:'🪷 안정형',
      quote:'“오래 가는 마음은 조용하고 깊다.”',
      desc:'당신은 관계에서 일상과 신뢰를 함께 가꾸는 사람입니다. 큰 감정보다 꾸준한 행동으로 사랑을 보여주는 타입이죠. 다만 표현의 강도가 약하게 보일 때가 있어요. 그러나 당신의 가장 큰 매력은 “변하지 않는 태도” 그 자체입니다. 천천히, 확실하게 쌓인 시간은 결국 가장 단단한 유대가 됩니다.',
      mood:'오늘의 마음 리듬은 “잔잔한 호수”에 가깝습니다. 불필요한 파도는 없지만, 가끔은 잔잔함 속 설렘의 파문이 필요할지 몰라요. 편안함 위에 작은 새로움을 올려보면 균형이 더 좋아집니다.',
      remind:'표현의 크기가 사랑의 크기를 결정하진 않아요. 다만, “말”로 확인받고 싶은 날이 있으니, 가끔은 “오늘도 네가 좋아”를 소리 내어 선물해 보세요.'
    },
    I:{
      title:'🌿 독립형',
      quote:'“가까이 있어도, 나답게.”',
      desc:'당신은 사랑 속에서도 자기만의 공간을 지키는 사람입니다. 스스로 회복하고 생각을 정리할 시간이 있을 때 오히려 더 다정해지죠. 누군가에겐 차분하고 단단한 모습으로 보입니다. 다만 거리감이 오해로 비치지 않도록 “내 리듬”을 말로 공유하면, 독립과 친밀이 아름답게 공존합니다.',
      mood:'오늘의 마음 리듬은 “균형 잡힌 산책”에 가깝습니다. 가깝고 멀어짐을 유연하게 조절하는 감각이 살아 있어요. 혼자만의 시간이 충전이지만, 충전 후 찾아가는 다정함도 잊지 않아요.',
      remind:'자율은 차가움이 아니라 신뢰의 다른 표현이에요. “오늘은 충전하고 내일은 더 길게 함께” 같은 약속은 마음의 거리를 따뜻하게 연결합니다.'
    },
    E:{
      title:'💞 공감형',
      quote:'“너의 기분이, 나의 표정이 된다.”',
      desc:'당신은 상대의 감정을 빠르게 감지하고, 그에 맞춰 온도를 조절하는 사람입니다. 다정함과 배려가 관계의 분위기를 바꿔요. 다만 스스로의 감정이 뒤로 밀릴 때가 있습니다. 공감의 출발점에 “나”를 놓으면, 관계는 더 건강해집니다.',
      mood:'오늘의 마음 리듬은 “섬세한 레이더”에 가깝습니다. 작은 눈빛도 놓치지 않지만, 정보가 많아 피로해질 수도 있어요. 숨 고르기와 간단한 마음 기록이 큰 도움이 됩니다.',
      remind:'“네 마음을 듣고 싶어”만큼이나 “내 마음도 들려줄게”가 중요해요. 공감은 일방향이 아니라, 안전한 왕복이니까요.'
    },
    PS:{
      title:'🌤 균형형(열정+안정)',
      quote:'“설렘은 부드럽게, 편안함은 따뜻하게.”',
      desc:'당신은 불꽃 같은 감정과 잔잔한 일상 사이에서 균형을 잘 잡는 사람입니다. 관계가 흔들릴 때 흥분 대신 호흡을 찾고, 식을 때는 작은 이벤트로 온도를 높이죠. 즉, “지속 가능한 설렘”을 설계하는 타입입니다.',
      mood:'오늘의 마음 리듬은 “포근한 햇살”에 가깝습니다. 흥분과 안정이 자연스럽게 교차하고, 어느 한쪽으로 치우치지 않아요.',
      remind:'균형은 억지로 만드는 게 아니라 업데이트하는 거예요. 한 달에 한 번 “우리 요즘 리듬 어때?”를 묻는 대화만으로도, 사랑은 계절처럼 건강해집니다.'
    },
    PI:{
      title:'⚡ 자유형(열정+독립)',
      quote:'“순간은 뜨겁게, 마음은 가볍게.”',
      desc:'당신은 즉흥과 자유의 결을 동시에 즐깁니다. 관계를 소유가 아니라 “경험”으로 바라보며, 간섭 없는 지지를 원하죠. 가끔은 속도가 빨라 상대를 놓치기도 하지만, 솔직한 합의가 있다면 이 리듬은 오히려 서로를 성장시킵니다.',
      mood:'오늘의 마음 리듬은 “바람을 탄 불꽃”에 가깝습니다. 변주가 빠르지만, 중심은 진심에 있어요.',
      remind:'자유와 책임은 함께 가야 오래 가요. “서로의 자유를 지키는 규칙 한 줄”이 관계를 더 편안하게 해줍니다.'
    },
    SE:{
      title:'🌙 배려형(안정+공감)',
      quote:'“너의 평온을 지키는 손.”',
      desc:'당신은 상대의 안정을 최우선에 두는 따뜻한 동반자형입니다. 작은 불편을 먼저 발견하고, 조용한 방식으로 보듬죠. 다만 과한 양보는 당신의 마음을 흐리게 합니다. “괜찮아” 뒤에 숨은 감정까지 돌보면, 배려는 더 건강해집니다.',
      mood:'오늘의 마음 리듬은 “잔잔한 밤공기”에 가깝습니다. 마음의 볼륨은 낮지만 온도는 높아요.',
      remind:'“네가 편하면 나도 편해”에 “나도 이럴 때가 좋더라”를 더하세요. 균형 잡힌 배려는 오래갑니다.'
    },
    IE:{
      title:'🍃 거리의 온형(독립+공감)',
      quote:'“멀지 않게, 과하지 않게.”',
      desc:'당신은 공감과 자율의 경계를 섬세하게 다룹니다. 필요한 순간엔 다정하게 손을 잡고, 때로는 한 발 물러서 생각할 시간도 건네죠. 관계가 숨 쉴 틈을 알기에, 급하지 않지만 느슨하지도 않습니다.',
      mood:'오늘의 마음 리듬은 “그늘 있는 산책길”에 가깝습니다. 시원하고 여유롭지만, 온기가 사라지진 않아요.',
      remind:'거리를 지키는 일은 “덜 사랑해서”가 아니에요. “어떻게 사랑할지”의 방식일 뿐. 방식을 공유하면 오해는 줄고, 신뢰는 커집니다.'
    }
  };

  function finish(){
    card.style.display='none';
    barFill.style.width='100%';
    const n=normalize();
    const type=getType(n);
    const t=COPY[type]||COPY.S;

    result.innerHTML=`
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/love.png" alt="연애 결과 아이콘">
          <div>
            <div class="result-title">${t.title}</div>
            <div class="result-desc">${t.quote}</div>
          </div>
        </div>

        <p style="margin:10px 0 6px">${t.desc}</p>

        <div class="result-sub">
          <h4>감정상태 요약</h4>
          <p>${t.mood}</p>
        </div>

        <div class="result-sub">
          <h4>🌿 마음 리마인드</h4>
          <p>${t.remind}</p>
        </div>

        <div class="result-sub"><h4>연애 밸런스 보기</h4>
          ${Object.entries(n).map(([k,v])=>{
            const name={P:'열정',S:'안정',I:'독립',E:'공감'}[k];
            const w=Math.round(v*100);
            const state=w>=75?'강함':w>=55?'적정':w>=35?'중간':'낮음';
            return `<div style="margin:8px 0">
              <div style="display:flex;justify-content:space-between;font-weight:700"><span>${name}</span><span>${state}</span></div>
              <div style="height:8px;background:#e8f8f4;border-radius:999px;overflow:hidden">
                <span style="display:block;height:100%;width:${w}%;background:#7ed6c4"></span>
              </div>
            </div>`;
          }).join('')}
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>`;
    result.style.display='block';
  }

  render();
});
