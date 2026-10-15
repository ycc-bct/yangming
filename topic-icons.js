// 五類風險圖示（design system §5.7）：看到「航道安全／政策與關稅／燃油成本／港口與內陸／國家風險」
// （或短名「航道／政策／燃油／港口／國家」）就在文字左邊放對應的 lucide 圖示。單色、跟隨文字顏色。
(()=>{
 const PATHS={
  lane:'<path d="M2 12q2.5 2 5 0t5 0 5 0 5 0"/><path d="M2 19q2.5 2 5 0t5 0 5 0 5 0"/><path d="M2 5q2.5 2 5 0t5 0 5 0 5 0"/>',
  policy:'<path d="M10 18v-7"/><path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>',
  fuel:'<path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5"/><path d="M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16"/><path d="M2 21h13"/><path d="M3 9h11"/>',
  port:'<path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z"/><path d="M10 21.9V14L2.1 9.1"/><path d="m10 14 11.9-6.9"/><path d="M14 19.8v-8.1"/><path d="M18 17.5V9.4"/>',
  country:'<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>'
 };
 const NAME={'航道安全':'lane','航道':'lane','政策與關稅':'policy','政策':'policy','燃油成本':'fuel','燃油':'fuel','港口與內陸':'port','港口':'port','國家風險':'country','國家':'country',
  safety:'lane',policy:'policy',fuel:'fuel',ports:'port',countries:'country'};
 const NS='http://www.w3.org/2000/svg';
 // sprite
 const sprite=document.createElementNS(NS,'svg');sprite.setAttribute('width','0');sprite.setAttribute('height','0');sprite.style.position='absolute';sprite.setAttribute('aria-hidden','true');
 sprite.innerHTML=Object.entries(PATHS).map(([k,p])=>`<symbol id="ym-ic-${k}" viewBox="0 0 24 24">${p}</symbol>`).join('');
 document.body.prepend(sprite);
 const icon=(k,cls='topic-ic')=>{const s=document.createElementNS(NS,'svg');s.setAttribute('class',cls);s.setAttribute('aria-hidden','true');s.innerHTML=`<use href="#ym-ic-${k}"/>`;return s};
 const ownText=el=>[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();

 function apply(root){
  // HTML：導覽、燈號、卡片標題、矩陣欄位、篩選鈕、狀態列
  root.querySelectorAll('.topic-nav a, .status-topic, .risk-card-heading h3, .heat-col span, .feed-filters button[data-filter], .risk-heatmap th, .risk-status-matrix .status-topic, .intelligence-topic h3, .overview-summary-list strong, #issueType, .page-title h1').forEach(el=>{
   if(el.querySelector(':scope>.topic-ic'))return;
   const key=NAME[el.dataset.filter]||NAME[ownText(el)];if(!key)return;
   el.prepend(icon(key));el.classList.add('has-topic-ic');
  });
  // 雷達軸標（SVG text）：圖示放左邊，整組仍以原本的 x 置中
  root.querySelectorAll('.radar-topic-label').forEach(g=>{
   if(g.querySelector('.topic-ic'))return;const key=NAME[g.dataset.radarTopic];const t=g.querySelector('text');if(!key||!t||!t.getBBox)return;
   let b;try{b=t.getBBox()}catch(e){return}if(!b.width)return;
   const S=16,GAP=6,x=+t.getAttribute('x');t.setAttribute('x',x+(S+GAP)/2);
   const ic=icon(key,'topic-ic radar-ic');ic.setAttribute('width',S);ic.setAttribute('height',S);ic.setAttribute('x',x-b.width/2-(S+GAP)/2);ic.setAttribute('y',b.y+(b.height-S)/2);
   g.insertBefore(ic,t);
  });
 }
 const run=()=>apply(document);
 run();
 if(typeof renderPage==='function'){const prev=renderPage;renderPage=function(page){prev(page);run()}}
 let t=0;new MutationObserver(ms=>{if(ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&!n.classList?.contains('topic-ic'))))clearTimeout(t),t=setTimeout(run,30)}).observe(document.body,{childList:true,subtree:true});
})();
