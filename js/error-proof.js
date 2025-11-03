
// === 몽실몽실 공통 안정 템플릿 (error-proof.js) ===
// 각 테스트 JS 파일보다 위에서 실행되어야 함.

(function(){
  console.log("몽실몽실 안정 템플릿 로드 완료 ✅");

  // 질문 배열 검증
  window.validateQuestions = function(Q){
    if(!Array.isArray(Q)) return console.error("❌ Q가 배열이 아닙니다.");
    Q.forEach((item,i)=>{
      if(!item.k || !item.q){
        console.warn(`⚠️ ${i+1}번째 질문에 k나 q 누락:`, item);
        item.k = item.k || "X"; // fallback
        item.q = item.q || "(질문 누락)";
      }
    });
  };

  // 점수 차이로 타입 결정 (균형 처리)
  window.classifySafe = function(score, mapping){
    const sorted = Object.entries(score).sort((a,b)=>b[1]-a[1]);
    const diff = sorted[0][1] - sorted[1][1];
    if(diff < 3) return mapping["HYBRID"] || "HYBRID";
    return mapping[sorted[0][0]] || sorted[0][0];
  };

  // 최대 문항 기반 백분율 계산
  window.calcPercent = function(sc, Q){
    const counts = {};
    Q.forEach(q => counts[q.k]=(counts[q.k]||0)+1);
    const maxes = Object.keys(sc).map(k=>[k,counts[k]*4]);
    const pct = {};
    for(const [k,max] of maxes) pct[k] = Math.round(sc[k]/max*100);
    return pct;
  };

  // 이미지 로드 fallback
  window.safeImage = function(img, fallbackPath){
    img.onerror = ()=>{ img.src = fallbackPath; };
  };

  // 응답 시간 가중치 적용 (±20%)
  window.applyTimeWeight = function(score, startTimes, endTimes){
    const avgTime = (endTimes.reduce((a,b)=>a+b,0)/endTimes.length)||1000;
    Object.keys(score).forEach(k=>{
      const t = endTimes[k]||avgTime;
      const weight = (t>avgTime*1.2)?0.9:(t<avgTime*0.8)?1.1:1;
      score[k] = Math.round(score[k]*weight);
    });
  };

})();
