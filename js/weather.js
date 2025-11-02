const Q = [
  {k:'P',q:'요즘 감정의 기복이 잦다고 느낀다.'},
  {k:'P',q:'하루 중 기분이 오르락내리락한다.'},
  {k:'S',q:'혼자 있는 게 마음이 편하다.'},
  {k:'S',q:'감정보다는 상황을 분석하려 한다.'},
  {k:'E',q:'작은 일에도 쉽게 기분이 좋아진다.'},
  {k:'E',q:'좋은 일이 생기면 바로 주변에 공유한다.'},
  {k:'C',q:'스트레스가 쌓이면 금방 몸이 반응한다.'},
  {k:'C',q:'피곤할 때 감정 통제가 어려워진다.'},
  {k:'R',q:'최근 나를 위로해준 사람이 있었다.'},
  {k:'R',q:'감정의 파도가 지나가면 금세 회복된다.'},
  {k:'T',q:'나는 내 기분의 이유를 분석해보는 편이다.'},
  {k:'T',q:'지금의 감정이 영원히 가지는 않는다고 안다.'},
  {k:'H',q:'불안하거나 답답한 순간에도 작은 희망을 느낀다.'},
  {k:'H',q:'요즘 나에게 “괜찮아”라는 말을 자주 건넨다.'},
  {k:'H',q:'감정이 흔들려도 결국 다시 중심을 잡는다.'},
];

let idx=0;
const score={P:0,S:0,E:0,C:0,R:0,T:0,H:0};
const ans=[];
const stepLabel=document.getElementById('stepLabel');
const barFill=document.getElementById('barFill');
const qText=document.getElementById('qText');
const wrap=document.getElementById('choiceWrap');
const card=document.getElementById('card');
const resultBox=document.getElementById('result');

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
      Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
      btn.classList.add('selected');
      setTimeout(()=>choose(Number(btn.dataset.s)),220);
    });
  });
}
function choose(s){ ans[idx]=s; score[Q[idx].k]+=s; next(); }
function next(){ idx++; if(idx<Q.length) render(); else finish(); }
function recalc(){ for(let k in score) score[k]=0; for(let i=0;i<idx;i++) score[Q[i].k]+=ans[i]??0; }
document.getElementById('prev').addEventListener('click',()=>{ if(idx===0)return; idx--; recalc(); render(); });
document.getElementById('skip').addEventListener('click',()=>{ ans[idx]=0; next(); });

function classify(sc){
  const total = Object.values(sc).reduce((a,b)=>a+b,0);
  if(sc.E>=sc.P && sc.H>sc.C) return 'SUNNY';
  if(sc.R>sc.C && sc.P>sc.S) return 'CLOUDY';
  if(sc.P>sc.H && sc.C>sc.R) return 'RAINY';
  if(sc.C>sc.E && sc.S>sc.H) return 'STORM';
  if(sc.H>sc.C && sc.R>sc.P) return 'RAINBOW';
  return 'NIGHT';
}

const WEATHER={
  SUNNY:{
    title:'☀️ 햇살 회복형',
    img:'../assets/weather_sunny.png',
    desc:`당신의 마음은 따뜻한 햇살처럼 빛나고 있어요. 최근 감정의 물결이 지나간 뒤, 평온함과 긍정이 중심을 차지하고 있습니다.  
    주변 사람들에게 밝은 에너지를 전하고, 작은 일에도 감사함을 느낄 줄 아는 시기예요.  
    무리하지 않고 지금의 여유를 지켜주세요.`,
    msg:`"햇살은 언제나 구름 뒤에 있어요. 오늘의 평온을 잘 간직하세요 ☀️"`
  },
  CLOUDY:{
    title:'🌤️ 사색 구름형',
    img:'../assets/weather_cloudy.png',
    desc:`당신의 마음엔 약간의 구름이 끼어 있지만, 그 안엔 깊은 생각과 진심이 담겨 있어요.  
    때로는 조용히 자신을 돌아보며, 스스로를 이해하려는 여정이 진행 중이에요.  
    이 시기엔 완벽함보다 '괜찮음'을 선택하는 게 중요합니다.`,
    msg:`"잠시 구름이 낀다고 하늘이 사라지는 건 아니에요 ☁️"`
  },
  RAINY:{
    title:'🌧️ 감정 순환형',
    img:'../assets/weather_rainy.png',
    desc:`당신은 지금 감정의 비를 맞고 있어요. 하지만 그건 단순한 슬픔이 아니라, 마음을 정화하고 성장시키는 과정입니다.  
    비는 지나가고, 공기는 더 맑아지죠. 지금의 감정도 언젠가 감사한 기억으로 남을 거예요.`,
    msg:`"울 수 있다는 건 마음이 아직 살아있다는 증거예요 💧"`
  },
  STORM:{
    title:'⛈️ 내면 폭풍형',
    img:'../assets/weather_storm.png',
    desc:`최근의 당신은 여러 감정이 한꺼번에 밀려드는 시기를 지나고 있습니다.  
    분노, 피로, 불안이 얽혀 있지만 그 속엔 분명한 변화의 신호가 숨어 있어요.  
    폭풍은 무너뜨리기보다 새 시작을 준비시키는 자연의 과정이에요.`,
    msg:`"지금의 폭풍은 당신을 더 단단하게 만들어줄 거예요 ⛈️"`
  },
  RAINBOW:{
    title:'🌈 회복 전환형',
    img:'../assets/weather_rainbow.png',
    desc:`당신은 최근 여러 감정을 경험했지만, 이제는 희망의 빛을 다시 찾고 있어요.  
    무지개는 비가 끝나야 나타나듯, 당신의 회복은 이미 시작됐습니다.  
    이 시기엔 자신을 격려하는 말 한마디가 큰 힘이 될 거예요.`,
    msg:`"감정의 끝에는 언제나 색이 피어나요 🌈"`
  },
  NIGHT:{
    title:'🌙 고요한 밤형',
    img:'../assets/weather_night.png',
    desc:`당신은 지금 고요함 속에 머무르고 있어요.  
    외롭거나 공허하게 느껴질 수 있지만, 그건 마음이 ‘생각의 쉼표’를 찾는 과정이에요.  
    조용히 자신을 돌아보고, 충분히 쉬어가도 괜찮습니다.`,
    msg:`"별은 어둠 속에서 더 잘 보여요 🌙"`
  }
};

function finish(){
  card.style.display='none';
  barFill.style.width='100%';
  const type=classify(score);
  const c=WEATHER[type];
  resultBox.innerHTML=`
  <div class="result-card">
    <div class="result-hero">
      <img src="${c.img}" alt="${c.title}" style="width:100px;height:100px;object-fit:contain">
      <div>
        <div class="result-title">${c.title}</div>
        <div class="result-desc">${c.msg}</div>
      </div>
    </div>
    <p style="margin:8px 0 12px;white-space:pre-line">${c.desc}</p>
    <div class="result-actions">
      <a class="start" href="../index.html">메인으로</a>
      <button class="start" onclick="location.reload()">다시 테스트</button>
    </div>
  </div>`;
  resultBox.style.display='block';
}
render();