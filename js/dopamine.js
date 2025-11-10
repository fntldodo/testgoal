/* =========================================================
 * 내 안의 ‘도파민 공장장’ — 몽실몽실 v2025.3b (픽셀아이콘 제거 버전)
 * - 카테고리: hobby
 * - 12문항 / 5지선다(0~4) + 반응시간 보조(±20%, 선택 우선)
 * - 결과 4종: 롤러코스터 / 지식 부자 / 인싸 제조기 / 아보하 마스터
 * - 기존 dot-hero(큰 도트 패턴) · PNG 로고 기능은 그대로 유지
 * - .pixel-icon 기반 CSS 픽셀아트만 전부 제거
 * ========================================================= */
(function bootstrapDopamine(){
  if (window.__dopamine_booted) return;
  window.__dopamine_booted = true;

  const boot = () => {
    try {
      // ---------- 문항(12) ----------
      const Q = [
        {k:"N", q:"새로운 장소·경험을 찾아 나서는 편이다."},
        {k:"N", q:"지루하면 즉시 자극적인 것을 찾는다(영상·게임·간식 등)."},
        {k:"S", q:"사람들과의 상호작용이 기분 좋은 에너지를 준다."},
        {k:"S", q:"‘좋아요/댓글/메시지’ 알림이 오면 바로 확인한다."},
        {k:"K", q:"궁금한 건 끝까지 파고들어 지식으로 쌓는다."},
        {k:"K", q:"정보 정리나 아카이빙을 습관처럼 한다."},
        {k:"B", q:"루틴(수면·식사·운동)을 유지하려 노력한다."},
        {k:"B", q:"즉흥적 충동이 와도 한 번 멈추고 선택하려 한다."},
        {k:"N", q:"즉석 결정을 즐기는 편이다."},
        {k:"S", q:"모임·행사·네트워킹이 기대된다."},
        {k:"K", q:"새 개념을 이해했을 때 쾌감이 크다."},
        {k:"B", q:"작은 보상(차·산책·스트레칭)으로 스스로를 달랜다."}
      ];

      // ---------- 상태 ----------
      let idx = 0, startTime = Date.now();
      const score = {N:0, S:0, K:0, B:0}, count = {N:0, S:0, K:0, B:0};
      const ans   = [], times = [];

      // ---------- DOM ----------
      const stepLabel = document.getElementById("stepLabel");
      const barFill   = document.getElementById("barFill");
      const qText     = document.getElementById("qText");
      const wrap      = document.getElementById("choiceWrap");
      const card      = document.getElementById("card");
      const resultBox = document.getElementById("result");
      const prevBtn   = document.getElementById("prev");
      const skipBtn   = document.getElementById("skip");

      if (!stepLabel || !barFill || !qText || !wrap || !card || !resultBox) {
        console.warn('[dopamine] 필수 DOM이 아직 없음. DOM 준비 후 재시도');
        return;
      }

      // ---------- 시간 가중(±20%) ----------
      function weight(sec){
        if (sec < 1) return 0.9;
        if (sec < 4) return 1.0;
        if (sec < 8) return 1.15;
        return 1.10;
      }

      // ---------- 렌더 ----------
      function render(){
        stepLabel.textContent = `${idx+1} / ${Q.length}`;
        barFill.style.width   = `${(idx / Q.length) * 100}%`;
        qText.textContent     = Q[idx].q;

        wrap.innerHTML = `
          <button class="choice" data-s="4" type="button">매우 그렇다</button>
          <button class="choice" data-s="3" type="button">그렇다</button>
          <button class="choice" data-s="2" type="button">보통이다</button>
          <button class="choice ghost" data-s="1" type="button">아니다</button>
          <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
        `;

        const prevSel = ans[idx];
        if (prevSel !== undefined){
          [...wrap.children].forEach(b=>{
            if (Number(b.dataset.s) === prevSel) b.classList.add("selected");
          });
        }

        [...wrap.children].forEach(btn=>{
          btn.addEventListener("click", ()=>{
            [...wrap.children].forEach(c=>c.classList.remove("selected"));
            btn.classList.add("selected");
            setTimeout(()=>choose(Number(btn.dataset.s)), 140);
          }, { passive:true });
        });

        startTime = Date.now();
      }

      // ---------- 응답 ----------
      function choose(s){
        const sec = (Date.now() - startTime) / 1000;
        const w   = weight(sec);
        const k   = Q[idx].k;

        const adj = s + (s * (w - 1) * 0.2); // 선택 우선, 뒤엎지 않음
        score[k] += adj;
        count[k] += 1;

        ans[idx]   = s;
        times[idx] = sec;

        if (++idx < Q.length) render();
        else finish();
      }

      // ---------- 이전/건너뛰기 ----------
      prevBtn?.addEventListener("click", ()=>{
        if (window.__prevBusy) return;
        window.__prevBusy = true;
        setTimeout(()=>window.__prevBusy=false, 120);

        if (idx === 0) return;
        idx--;

        // 전체 재계산
        score.N = score.S = score.K = score.B = 0;
        count.N = count.S = count.K = count.B = 0;
        for (let i=0; i<idx; i++){
          const s   = ans[i] ?? 0;
          const k   = Q[i].k;
          const w   = weight(times[i] ?? 3);
          const adj = s + (s * (w - 1) * 0.2);
          score[k] += adj;
          count[k] += 1;
        }
        render();
      });

      skipBtn?.addEventListener("click", ()=>{
        ans[idx]   = 0;
        times[idx] = (Date.now() - startTime) / 1000;
        if (++idx < Q.length) render();
        else finish();
      });

      // ---------- 정규화 ----------
      function norm01(v){ return Math.max(0, Math.min(1, v)); }
      function normalize(){
        return {
          N: norm01((score.N/Math.max(1,count.N))/4),
          S: norm01((score.S/Math.max(1,count.S))/4),
          K: norm01((score.K/Math.max(1,count.K))/4),
          B: norm01((score.B/Math.max(1,count.B))/4),
        };
      }

      // ---------- 분류(4종 + 근소차 하이브리드 표시) ----------
      const TYPE = {
        ROLLER: {title:"🎢 롤러코스터", key:"dandelion"},
        KNOW:   {title:"📚 지식 부자",   key:"pine"},
        SOCIAL: {title:"🎉 인싸 제조기", key:"rose"},
        AVOHA:  {title:"🥑 아보하 마스터", key:"bamboo"},
      };

      function classify4(n){
        const arr = [
          {k:'ROLLER', v:n.N},
          {k:'SOCIAL', v:n.S},
          {k:'KNOW',   v:n.K},
          {k:'AVOHA',  v:n.B},
        ].sort((a,b)=>b.v-a.v);

        const main   = arr[0];
        const second = arr[1];
        const gap    = main.v - second.v;
        const hybrid = gap < 0.08 ? second.k : null;
        return { main: main.k, hybrid, n };
      }

      // ---------- 결과 카피 ----------
      const COPY = {
        ROLLER: {
          quote:'오늘의 재미는 오늘 만든다!',
          desc:'새로움과 강한 자극에 반응하는 유형이에요. 계획보다 실행, 안정보다 재미에 먼저 반응하죠. 단, 과열되기 전에 스스로를 식히는 버튼이 필요해요.',
          summary:['자극 선호','즉흥 실행','새로움 탐색'],
          remind:['15분만 즐기고 멈춰보기','설탕/카페인은 낮 시간대 최소화'],
        },
        KNOW: {
          quote:'이해의 순간, 보상은 터진다.',
          desc:'지식을 쌓고 연결할 때 가장 큰 쾌감을 느껴요. 집중력이 강점이지만 과몰입으로 리듬이 깨지지 않도록 휴식 타이밍을 설계해요.',
          summary:['지식 보상 큼','정리/아카이빙 선호','깊은 집중'],
          remind:['50/10 리듬(집중/휴식)','새로 배운 1가지 기록'],
        },
        SOCIAL: {
          quote:'사람 사이를 잇는 도파민.',
          desc:'상호작용, 인정, 함께함에서 에너지가 솟아요. 네트워킹이 동력인 만큼, 알림과 감정 리듬을 주기적으로 정돈해두면 더 오래 갑니다.',
          summary:['상호작용 보상','인정 민감','네트워킹 동력'],
          remind:['알림 묶음 확인(시간 지정)','오늘 대화 1건 성의 있게'],
        },
        AVOHA: {
          quote:'작은 행복을 꾸준히.',
          desc:'루틴과 소소한 보상으로 안정적으로 달리는 타입. 큰 파동은 적지만 오래 가는 에너지예요. 가끔은 의도적 새로움으로 활력을 더해보세요.',
          summary:['루틴 보상','안정 추구','지속성 강점'],
          remind:['산책 10분 + 물 1컵','루틴에 “새로움 1개” 얹기'],
        },
      };

      function labelOf(p){
        return p>=0.76 ? '매우 높음'
             : p>=0.56 ? '높음'
             : p>=0.36 ? '보통'
             : p>=0.21 ? '낮음'
             : '아주 낮음';
      }

      function finish(){
        card.style.display  = "none";
        barFill.style.width = "100%";

        const n      = normalize();
        const result = classify4(n);
        const key    = result.main;
        const info   = COPY[key];
        const meta   = TYPE[key];
        const hybrid = result.hybrid;
        const dotKey = TYPE[key].key;

        resultBox.innerHTML = `
          <div class="result-card hobby">
            <div class="result-hero">
              <img src="../assets/brain.png" alt="${meta.title}"
                   onerror="this.onerror=null; this.src='../assets/mongsil.png'">
              <div>
                <div class="result-title">
                  ${meta.title}${hybrid ? ' · ' + TYPE[hybrid].title.replace(/^[^ ]+ /,'') : ''}
                </div>
                <div class="result-desc">“${info.quote}”</div>
              </div>
            </div>

            <p style="margin:8px 0">${info.desc}</p>

            <div id="res-summary" style="margin:6px 0 10px">
              ${info.summary.map(t=>`<span class="pill" style="margin-right:6px">${t}</span>`).join('')}
              ${hybrid ? `<span class="pill" style="margin-right:6px; background:#f4eeff">하이브리드 성향</span>` : ''}
            </div>

            <div class="state-meter">
              ${Object.entries(n).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([name,val])=>{
                const tag = labelOf(val);
                const pct = Math.round(val*100);
                const labelMap = {N:'자극성', S:'사회성', K:'지식추구', B:'균형도'};
                return `
                  <div class="row">
                    <span><b>${labelMap[name] || name}</b></span>
                    <div class="bar"><span class="fill" style="width:${pct}%"></span></div>
                    <span class="meter-label">${tag} (${pct}%)</span>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="mind-remind" style="margin-top:10px">
              <b>🌿 마음 리마인드</b>
              <div style="margin-top:6px">
                ${info.remind.map(t=>`<div>${t}</div>`).join('')}
              </div>
            </div>

            <div class="result-actions">
              <a class="start" href="../index.html">메인으로</a>
              <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
            </div>
          </div>
        `;

        resultBox.style.display = "block";

        // 결과 도트 그래픽 삽입 (기존 dot-hero 로직 그대로)
        if (window.MongsilDot?.mount){
          const seed = `N:${Math.round(n.N*100)};S:${Math.round(n.S*100)};K:${Math.round(n.K*100)};B:${Math.round(n.B*100)}`;
          window.MongsilDot.mount({
            key: dotKey,
            seed,
            mode: 'replace',
            container: '.result-hero'
          });
        }
      }

      // ---------- 시작 ----------
      document.getElementById('card')?.classList.add('hobby');
      render();

    } catch (err) {
      console.error('[dopamine] 초기화 실패:', err);
    }
  };

  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();