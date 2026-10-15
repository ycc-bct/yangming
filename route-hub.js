/* 航線方案評估: route capsules, then one route seen three ways — 風險網路／方案比較／地圖 (route-compare.js).
   Wraps assessment.js from the outside (no edits there): its toolbar select stays in the DOM but hidden because
   bindAssessment() binds to it; the evidence card is folded into 主題依據; management actions are a collapsed
   list inside the conclusion card. Topic status colours are topic-wide, not route-specific. */
(()=>{
 const ICON={safety:'lane',policy:'policy',fuel:'fuel',ports:'port',countries:'country'};
 const topicIcon=k=>`<svg class="hub-ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#ym-ic-${ICON[k]}"/></svg>`;
 const statusOf=()=>Object.fromEntries(INTELLIGENCE_TOPICS.map(k=>[k,riskTopicStatus(k).status]));
 const heatLegend=`<div class="heat-legend" aria-hidden="true"><span><i class="heat-crit"></i>危急</span><span><i class="heat-high"></i>高</span><span><i class="heat-mid"></i>中</span><span><i class="heat-low"></i>低</span><span><i class="heat-empty"></i>無建議</span></div>`;

 // Read-only route × topic grid (kept for the hidden overview block).
 function routeTopicGrid(selected,matrix){
  const status=statusOf();
  const head=`<div class="hub-row hub-head"><span>航線</span>${INTELLIGENCE_TOPICS.map(k=>`<span class="hub-col heat-${status[k]}">${topicIcon(k)}${RISK_TOPIC_SHORT[k]}<i aria-hidden="true"></i></span>`).join('')}<span class="hub-count">主題數</span></div>`;
  const rows=routes.map((route,i)=>{const hits=INTELLIGENCE_TOPICS.filter(k=>matrix[i][k]).length;
   return `<div class="hub-row tone-${riskLevelTone(route.level)}" aria-label="${escapeHTML(route.name+route.via)}，${hits} 個主題有建議"><span class="hub-route"><b>${escapeHTML(route.name)}</b><small>${escapeHTML(route.via)}</small></span>${INTELLIGENCE_TOPICS.map(k=>`<span class="heat-cell ${matrix[i][k]?'is-on heat-'+status[k]:''}" aria-hidden="true">${matrix[i][k]?'<span></span>':''}</span>`).join('')}<span class="hub-count"><b>${hits}</b></span></div>`}).join('');
  return `<section class="page-card hub-picker"><div class="page-card-head"><h2>航線 × 主題</h2><span>亮格＝該主題有建議，顏色為主題狀態</span></div><div class="hub-grid">${head}${rows}</div>${heatLegend}</section>`;
 }
 window.routeTopicGrid=routeTopicGrid;

 // ① Route capsules: name + the route's overall risk level (from the route data).
 const LEVEL_TONE={'危急':'high','高':'high','中':'medium','低':'low'};
 function routeCapsules(selected){
  return `<nav class="route-capsules" aria-label="評估航線">${routes.map((route,i)=>`<button type="button" class="route-capsule tone-${riskLevelTone(route.level)}" data-hub-route="${i}" aria-pressed="${i===selected}" aria-label="${escapeHTML(route.name+route.via)}，綜合風險${escapeHTML(route.level)}"><span class="route-capsule-name"><b>${escapeHTML(route.name)}</b><small>${escapeHTML(route.via)}</small></span><span class="route-capsule-level level-${LEVEL_TONE[route.level]||'low'}" aria-hidden="true">${escapeHTML(route.level)}</span></button>`).join('')}</nav>`;
 }

 // ⑤ Management actions of the related topics, collapsed inside the conclusion card.
 function actionsDetails(i,matrix){
  const keys=INTELLIGENCE_TOPICS.filter(k=>matrix[i][k]&&riskTopicModel(k).actions.length);
  if(!keys.length)return '';
  const count=keys.reduce((n,k)=>n+riskTopicModel(k).actions.length,0);
  return `<details class="decision-actions-ref"><summary>相關管理建議 <span>${count} 條</span></summary>${keys.map(k=>`<div class="hub-actions-topic"><span class="hub-topic">${topicIcon(k)}${TOPIC_LABELS[k]}</span><ul>${riskTopicModel(k).actions.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul></div>`).join('')}</details>`;
 }

 // Option B carries the difference itself: a tag at the top-right of its 天數 and of its 燃油 figure.
 // assessment.js re-renders these cards on focus and after 試算, so wrap the function.
 const baseCards=assessmentCards;
 assessmentCards=function(s){
  const tag=(v,digits=0)=>{const tone=v>0?'up':v<0?'down':'same';return `<em class="metric-delta delta-${tone}">${tone==='same'?'相同':(v>0?'+':'−')+Math.abs(v).toFixed(digits)}</em>`};
  const tags=[tag(s.altDays-s.days),tag((s.altFuel-s.baseFuel)/10000,1)]; // units are already under each figure
  return baseCards(s).replace(/(B · 備援方案[\s\S]*?<div class="option-metrics">)([\s\S]*?)(<\/div><\/div>)/,(m,head,metrics,tail)=>{let n=0;return head+metrics.replace(/<div>/g,()=>'<div>'+(tags[n++]||''))+tail});
 };

 const baseRender=renderRoutes;
 renderRoutes=function(){
  const i=Number(pageState.route)||0,matrix=riskRouteTopicMatrix();
  let html=baseRender();
  // ① hide the select (still bound by bindAssessment), drop the cross-section link, add capsules
  html=html.replace('<div class="assessment-toolbar">','<div class="assessment-toolbar" hidden>').replace('<a href="#overview" class="text-button">查看全局風險</a>','');
  // pull 持續觀察 out of the evidence card, then drop that card (the network shows each topic's exposure and advice)
  const watch=(html.match(/<p class="reading"><strong>持續觀察：<\/strong>([\s\S]*?)<\/p>/)||[])[1]||'';
  html=html.replace(/<section class="page-card"><div class="page-card-head"><h2>影響這次選擇的依據<\/h2><\/div>[\s\S]*?<\/section>/,'');
  // ② + ③ the question and 主題依據 become one risk network (route-network.js)
  const question=(html.match(/<div class="assessment-question"><span>本次評估<\/span><h2>([\s\S]*?)<\/h2>/)||[])[1]||'';
  html=html.replace(/<div class="assessment-question">[\s\S]*?<\/div>/,'<div class="assessment-question"></div>');
  // the three views (風險網路／方案比較／地圖) replace the old question block (route-compare.js)
  html=html.replace('<div class="assessment-question"></div>',()=>routeCapsules(i)+routeViews(i,matrix));
  // the B card already shows the difference, so this card keeps only the inputs (results stay in the DOM for its script)
  html=html.replace('<h2>改方案，差多少？</h2><span>備援相對原方案</span>','<h2>試算條件</h2><span>調整後更新方案 B 的差異</span>').replace('<section class="page-card"><div class="page-card-head"><h2>試算條件</h2>','<section class="page-card assessment-inputs"><div class="page-card-head"><h2>試算條件</h2>');
  // 試算條件 is always open (the card title already names it)
  html=html.replace('<details class="assessment-assumptions">','<details class="assessment-assumptions" open>');
  const l=html.indexOf('<div class="assessment-layout">');
  // assessment.js's own comparison stays in the DOM (its handlers bind to it) but is hidden: the views above replace it
  html=html.replace('<div class="assessment-layout">','<div class="assessment-layout" hidden>');
  // ⑤ collapsed management actions at the end of the conclusion card
  const d=html.indexOf('class="page-card assessment-decision"');
  if(d>-1){const end=html.indexOf('</section>',d);if(end>-1)html=html.slice(0,end)+actionsDetails(i,matrix)+html.slice(end)}
  // put the conclusion card inside .assessment-lower so 試算條件 and 記錄評估結論 sit side by side
  const ds=html.indexOf('<section class="page-card assessment-decision"');
  if(ds>-1&&html.slice(0,ds).endsWith('</div>')){const de=html.indexOf('</section>',ds)+10;html=html.slice(0,ds-6)+html.slice(ds,de)+'</div>'+html.slice(de)}
  // 試算條件 and 記錄評估結論 are hidden for now; they stay in the DOM because assessment.js binds to their forms
  html=html.replace('<div class="assessment-lower">','<div class="assessment-lower" hidden>');
  return html;
 };

 const baseBind=bindPage;
 bindPage=function(page){
  baseBind(page);
  if(page!=='routes')return;
  document.querySelectorAll('#pageContent>.page-title .page-breadcrumb, #pageContent>.page-title h1').forEach(el=>el.remove());
  bindRouteNetwork();
  bindRouteViews();
  document.querySelectorAll('[data-hub-route]').forEach(b=>b.onclick=()=>{
   if(+b.dataset.hubRoute===(+pageState.route||0))return;
   pageState.route=+b.dataset.hubRoute;assessmentFocus='both';renderPage('routes');
  });
 };
})();
