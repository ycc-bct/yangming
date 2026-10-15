/* 航線方案評估 as one decision line for one route: 航線切換 → 本次評估 → 主題依據 → 方案比較 → 記錄結論.
   Wraps assessment.js from the outside (no edits there): its toolbar select stays in the DOM but hidden because
   bindAssessment() binds to it; the evidence card is folded into 主題依據; management actions are a collapsed
   list inside the conclusion card. Topic status colours are topic-wide, not route-specific. */
(()=>{
 const ICON={safety:'lane',policy:'policy',fuel:'fuel',ports:'port',countries:'country'};
 const topicIcon=k=>`<svg class="hub-ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#ym-ic-${ICON[k]}"/></svg>`;
 const statusOf=()=>Object.fromEntries(INTELLIGENCE_TOPICS.map(k=>[k,riskTopicStatus(k).status]));
 const heatLegend=`<div class="heat-legend" aria-hidden="true"><span><i class="heat-act"></i>行動</span><span><i class="heat-watch"></i>觀察</span><span><i class="heat-normal"></i>正常</span><span><i class="heat-empty"></i>無建議</span></div>`;

 // Read-only route × topic grid (kept for the hidden overview block).
 function routeTopicGrid(selected,matrix){
  const status=statusOf();
  const head=`<div class="hub-row hub-head"><span>航線</span>${INTELLIGENCE_TOPICS.map(k=>`<span class="hub-col heat-${status[k]}">${topicIcon(k)}${RISK_TOPIC_SHORT[k]}<i aria-hidden="true"></i></span>`).join('')}<span class="hub-count">主題數</span></div>`;
  const rows=routes.map((route,i)=>{const hits=INTELLIGENCE_TOPICS.filter(k=>matrix[i][k]).length;
   return `<div class="hub-row tone-${riskLevelTone(route.level)}" aria-label="${escapeHTML(route.name+route.via)}，${hits} 個主題有建議"><span class="hub-route"><b>${escapeHTML(route.name)}</b><small>${escapeHTML(route.via)}</small></span>${INTELLIGENCE_TOPICS.map(k=>`<span class="heat-cell ${matrix[i][k]?'is-on heat-'+status[k]:''}" aria-hidden="true">${matrix[i][k]?'<span></span>':''}</span>`).join('')}<span class="hub-count"><b>${hits}</b></span></div>`}).join('');
  return `<section class="page-card hub-picker"><div class="page-card-head"><h2>航線 × 主題</h2><span>亮格＝該主題有建議，顏色為主題狀態</span></div><div class="hub-grid">${head}${rows}</div>${heatLegend}</section>`;
 }
 window.routeTopicGrid=routeTopicGrid;

 // ① Route capsules: name + five dots (topic has advice for this route; colour = topic status).
 function routeCapsules(selected,matrix){
  const status=statusOf();
  return `<nav class="route-capsules" aria-label="評估航線">${routes.map((route,i)=>{const hits=INTELLIGENCE_TOPICS.filter(k=>matrix[i][k]);
   return `<button type="button" class="route-capsule tone-${riskLevelTone(route.level)}" data-hub-route="${i}" aria-pressed="${i===selected}" aria-label="${escapeHTML(route.name+route.via)}，${hits.length} 個主題有建議：${hits.map(k=>TOPIC_LABELS[k]).join('、')||'無'}"><span class="route-capsule-name"><b>${escapeHTML(route.name)}</b><small>${escapeHTML(route.via)}</small></span><span class="route-capsule-dots" aria-hidden="true">${INTELLIGENCE_TOPICS.map(k=>`<i class="${matrix[i][k]?'is-on heat-'+status[k]:''}" title="${TOPIC_LABELS[k]}"></i>`).join('')}</span></button>`}).join('')}</nav>`;
 }

 // ③ Topic evidence: one row per topic = exposure for this route + topic advice + tradeoff chips.
 function topicEvidence(i,matrix){
  const status=statusOf(),bolt='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7Z"/></svg>';
  const rows=EXPOSURE_KEYS.map((k,n)=>{const r=matrix[i][k];
   return `<div class="evidence-row${r?'':' is-quiet'}" role="row"><span class="hub-topic" role="cell">${topicIcon(k)}${TOPIC_LABELS[k]}</span><span role="cell">${riskStatusBadge(status[k])}</span><span class="evidence-exposure" role="cell">${escapeHTML(EXPOSURE[i][n])}</span><span class="evidence-advice" role="cell">${r?`<b>${escapeHTML(r.proposal)}</b><span class="evidence-trigger" tabindex="0" title="啟動條件：${escapeHTML(r.when)}">${bolt}<span class="sr-only">啟動條件：${escapeHTML(r.when)}</span></span>`:'<span class="evidence-none">—</span>'}</span><span class="evidence-impacts" role="cell">${r?riskImpactChips(r)+`<span class="sr-only">方案取捨：${escapeHTML(r.tradeoff)}</span>`:''}</span></div>`}).join('');
  return `<section class="page-card topic-evidence"><div class="page-card-head"><h2>主題依據</h2><span>燈號為主題全局狀態</span></div><div class="evidence-table" role="table" aria-label="主題依據"><div class="evidence-row evidence-head" role="row"><span role="columnheader">主題</span><span role="columnheader">狀態</span><span role="columnheader">這條航線的曝險</span><span role="columnheader">主題建議</span><span role="columnheader">取捨</span></div>${rows}</div><div class="route-impact-legend" aria-hidden="true">${Object.values(RISK_IMPACT_GLYPH).map(([g,t])=>`<span><i>${g}</i>${t}</span>`).join('')}<span class="legend-bolt">${bolt}滑過看啟動條件</span></div></section>`;
 }

 // ⑤ Management actions of the related topics, collapsed inside the conclusion card.
 function actionsDetails(i,matrix){
  const keys=INTELLIGENCE_TOPICS.filter(k=>matrix[i][k]&&riskTopicModel(k).actions.length);
  if(!keys.length)return '';
  const count=keys.reduce((n,k)=>n+riskTopicModel(k).actions.length,0);
  return `<details class="decision-actions-ref"><summary>相關管理建議 <span>${count} 條</span></summary>${keys.map(k=>`<div class="hub-actions-topic"><span class="hub-topic">${topicIcon(k)}${TOPIC_LABELS[k]}</span><ul>${riskTopicModel(k).actions.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul></div>`).join('')}</details>`;
 }

 // Option B carries the difference itself; assessment.js re-renders these cards on focus, so wrap the function.
 const baseCards=assessmentCards;
 assessmentCards=function(s){
  const fuel=(s.altFuel-s.baseFuel)/10000,days=s.altDays-s.days,sign=v=>v>0?'+':v<0?'−':'±';
  const tone=days>0||fuel>0?'up':days<0||fuel<0?'down':'same',text=tone==='same'?'航程與燃油相同':`${sign(days)}${Math.abs(days)} 天 · ${sign(fuel)}${Math.abs(fuel).toFixed(1)} 萬美元`;
  return baseCards(s).replace(/(B · 備援方案[\s\S]*?<\/div><\/div>)/,`$1<span class="option-delta delta-${tone}">${text}</span>`);
 };

 const baseRender=renderRoutes;
 renderRoutes=function(){
  const i=Number(pageState.route)||0,matrix=riskRouteTopicMatrix();
  let html=baseRender();
  // ① hide the select (still bound by bindAssessment), drop the cross-section link, add capsules
  html=html.replace('<div class="assessment-toolbar">','<div class="assessment-toolbar" hidden>').replace('<a href="#overview" class="text-button">查看全局風險</a>','');
  // pull 持續觀察 out of the evidence card, then drop that card (its content lives in 主題依據)
  const watch=(html.match(/<p class="reading"><strong>持續觀察：<\/strong>([\s\S]*?)<\/p>/)||[])[1]||'';
  html=html.replace(/<section class="page-card"><div class="page-card-head"><h2>影響這次選擇的依據<\/h2><\/div>[\s\S]*?<\/section>/,'');
  // ② the question block names what to keep watching instead of a generic line
  html=html.replace(/(<div class="assessment-question"><span>本次評估<\/span><h2>[\s\S]*?<\/h2>)<p>[\s\S]*?<\/p>/,`$1${watch?`<p class="assessment-watch"><span>持續觀察</span>${watch}</p>`:''}`);
  const q=html.indexOf('<div class="assessment-question">');
  if(q>-1)html=html.slice(0,q)+routeCapsules(i,matrix)+html.slice(q);
  // the B card already shows the difference, so this card keeps only the inputs (results stay in the DOM for its script)
  html=html.replace('<h2>改方案，差多少？</h2><span>備援相對原方案</span>','<h2>試算條件</h2><span>調整後更新方案 B 的差異</span>').replace('<section class="page-card"><div class="page-card-head"><h2>試算條件</h2>','<section class="page-card assessment-inputs"><div class="page-card-head"><h2>試算條件</h2>');
  // ③ topic evidence, then ④ the option comparison under one heading
  const l=html.indexOf('<div class="assessment-layout">');
  if(l>-1)html=html.slice(0,l)+topicEvidence(i,matrix)+'<h2 class="hub-section-title">方案比較</h2>'+html.slice(l);
  // ⑤ collapsed management actions at the end of the conclusion card
  const d=html.indexOf('class="page-card assessment-decision"');
  if(d>-1){const end=html.indexOf('</section>',d);if(end>-1)html=html.slice(0,end)+actionsDetails(i,matrix)+html.slice(end)}
  return html;
 };

 const baseBind=bindPage;
 bindPage=function(page){
  baseBind(page);
  if(page!=='routes')return;
  document.querySelectorAll('[data-hub-route]').forEach(b=>b.onclick=()=>{
   if(+b.dataset.hubRoute===(+pageState.route||0))return;
   pageState.route=+b.dataset.hubRoute;assessmentFocus='both';renderPage('routes');
  });
 };
})();
