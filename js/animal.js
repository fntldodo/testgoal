const animals=[
 {k:'여우 🦊',d:'호기심과 민첩함'},{k:'펭귄 🐧',d:'협동과 포근함'},{k:'고양이 🐱',d:'자율성과 관찰력'},{k:'고래 🐋',d:'깊이 있는 사색'}
];
const box=document.getElementById('quiz-container'); const next=document.getElementById('next-btn');
box.innerHTML=`<div>직관적으로 골라보세요</div><div class='choices'>${animals.map((a,i)=>`<button onclick='pick(${i})'>${a.k}</button>`).join('')}</div>`;
window.pick=function(i){ const a=animals[i]; box.outerHTML=`<div class='result'><h2>${a.k}</h2><p>${a.d} 타입!</p><a class='start' href='../index.html'>메인으로</a></div>`; next.style.display='none';}
next.addEventListener('click',()=>alert('아래 버튼 중 하나를 골라주세요'));