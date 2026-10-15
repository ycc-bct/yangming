/* Strategy layer. Deck narratives are transcribed; chart arrays are visual reconstructions, not live observations. */
const TOPICS=['policy','safety','fuel','ports','countries'];
const TOPIC_LABELS={policy:'政策與關稅',safety:'航道安全',fuel:'燃油成本',ports:'港口與內陸',countries:'國家風險'};
const INTELLIGENCE_TOPICS=['safety','policy','fuel','ports','countries'];
function intelligenceDistribution(rows){const max=Math.max(...rows.map(r=>r[1]),1);return `<div class="intelligence-distribution">${rows.map(([name,value,color])=>`<div><span>${name}</span><i style="--bar-width:${value/max*100}%;--bar-color:${color||'#60a5fa'}"></i><b>${value}</b></div>`).join('')}</div>`}
// Caption segments never break mid-word; a trailing period (e.g. 2025/11–2026/3) goes on its own line.
function overviewCaption(text){const parts=text.split(' · '),last=parts.at(-1),dated=/\d/.test(last)&&parts.length>1,head=dated?parts.slice(0,-1):parts;return `<span class="cap-head">${head.map(x=>`<span class="nowrap">${x}</span>`).join(' · ')}</span>${dated?`<span class="cap-time nowrap">${last}</span>`:''}`}
function renderIntelligence(){
 const countryAverageCRR=COUNTRY_ROWS.reduce((sum,row)=>sum+row[4],0)/COUNTRY_ROWS.length;
 const countryAverageSRR=COUNTRY_ROWS.reduce((sum,row)=>sum+row[5],0)/COUNTRY_ROWS.length;
 const highRiskCountries=COUNTRY_ROWS.filter(row=>row[4]>countryAverageCRR&&row[5]>countryAverageSRR).length;
 const cards={
  safety:{chart:spark(RISK_SHARED.hormuzTransits.values.slice(12),'荷莫茲海峽每月通行量（艘/日），2025/1–2026/6','#60a5fa'),caption:'荷莫茲海峽通行量 · 艘/日 · 2025/1–2026/6'},
  fuel:{chart:spark(CRACK.near,'380cst − Brent 裂解價差（近月，美元/桶），2025/5–2026/4','#60a5fa'),caption:'380cst 裂解價差 · 美元/桶 · 2025/5–2026/4'},
  ports:{chart:intelligenceDistribution(['已發生','常態化','前瞻預警'].map((stage,i)=>[stage,PORT_EVENTS.filter(e=>e.status===stage).length,['#f87171','#fbbf24','#60a5fa'][i]])),caption:'追蹤議題分布 · 筆'},
  countries:{chart:intelligenceDistribution([4,5,6].map((level,i)=>['DB'+level,COUNTRY_ROWS.filter(c=>Math.floor(c[4])===level).length,['#fbbf24','#f87171','#ef4444'][i]])),caption:'CRR 國家風險級距 · 國'},
  policy:{chart:spark(TPU_MA7,'全球貿易政策不確定性 MA7 指數，2023/9–2026/5','#60a5fa'),caption:'貿易政策不確定性 MA7 · 指數 · 2023/9–2026/5'}
 };
 // Overview: five topic cards; the read-only route × topic grid is kept below but hidden for now.
 const topicCards=`<section class="risk-overview-grid" aria-label="五類風險概況">${INTELLIGENCE_TOPICS.map(key=>{const c=cards[key],model=riskTopicModel(key);return `<article class="risk-overview-card" data-topic="${key}"><div class="risk-overview-focus"><div class="risk-card-heading"><h3>${TOPIC_LABELS[key]}</h3><span>${model.signal}</span></div>${(st=>`<div class="risk-status-row">${riskStatusBadge(st.status)}</div><h2 class="risk-card-value">${escapeHTML(st.line)}</h2>`)(riskTopicStatus(key))}<p>${model.description}</p><div class="risk-card-chart">${c.chart}</div><small>${overviewCaption(c.caption)}</small></div><a href="#${key}">查看主題分析</a></article>`}).join('')}</section>`;
 const heatmap=typeof routeTopicGrid==='function'?`<div class="overview-heatmap" hidden>${routeTopicGrid(-1,riskRouteTopicMatrix(),false)}</div>`:'';
 return topicCards+heatmap;
}
const STRATEGY={
 policy:{signal:'政策尚未定案，貨主已提前出貨',impact:'貨流與船位需求在政策窗口前先行改變。',action:'提前保留船位、規劃加班船，評估替代樞紐。'},
 safety:{signal:'關鍵航道風險升溫，繞行可能常態化',impact:'航程、船舶配置與合約成本同步承壓。',action:'主幹＋備援；把延誤、風險附加費納入合約。'},
 fuel:{signal:'波動率先行、裂解價差收斂或轉正',impact:'原油平穩不代表船用燃料成本穩定。',action:'比較成本敏感度與燃料油期貨鎖價方案。'},
 ports:{signal:'非戰爭事件也會造成立即營運中斷',impact:'港口、內陸運輸與付款流程共同影響交付。',action:'依已發生、常態化、前瞻預警安排應對。'},
 countries:{signal:'新興市場的收益與風險並存',impact:'國家環境與航運產業風險需要分開判讀。',action:'依 CRR／SRR 決定進入順序與曝險配置。'}
};
function summaryBlock(key){const v=STRATEGY[key];return `<div class="strategy-summary"><div><small>關鍵訊號</small><p>${v.signal}</p></div><div><small>營運影響</small><p>${v.impact}</p></div><div><small>決策方向</small><p>${v.action}</p></div></div>`}
function topicNav(active){const ic={safety:'lane',policy:'policy',fuel:'fuel',ports:'port',countries:'country'}[active],icon=ic?`<svg class="hub-ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#ym-ic-${ic}"/></svg>`:'';return active==='intelligence'?`<nav class="topic-nav topic-back" aria-label="風險情報"><span class="topic-back-current" aria-current="page">情報總覽</span></nav>`:`<nav class="topic-nav topic-back" aria-label="風險情報"><a href="#intelligence" class="topic-back-link"><span aria-hidden="true">←</span>情報總覽</a><span class="topic-back-sep" aria-hidden="true">/</span><span class="topic-back-current" aria-current="page">${icon}${TOPIC_LABELS[active]}</span></nav>`}
// Approximate deck shapes. Raw daily TPU series is unavailable, so MA7 is also a visual reconstruction.
const TPU_DAILY=[30,45,25,70,40,85,55,65,40,100,70,130,80,170,220,400,260,610,380,900,520,1350,700,1950,880,1100,570,870,430,750,280,500,220,380,180,550,150,340,100,250];
const TPU_MA7=[35,40,42,45,49,54,56,60,63,70,78,90,100,145,210,300,360,410,480,610,750,840,900,1050,920,810,730,610,490,420,360,310,270,240,250,280,230,190,170,150];
function policyUncertaintyChart(){const s=[{name:'全球貿易政策不確定性指數（日）',color:'#60a5fa',points:TPU_DAILY.map((n,i)=>[i,n])},{name:'MA7（7 日移動平均）',color:'#34d399',points:TPU_MA7.map((n,i)=>[i,n])}];return legend(s)+lineChart({series:s,x:[0,39],min:0,max:2500,ticks:[0,500,1000,1500,2000,2500],xTicks:[[0,'2023/9'],[8,'2024/5'],[16,'2025/1'],[24,'2025/9'],[32,'2026/5']].map(([m,l])=>[m*39/32,l]),label:'全球貿易政策不確定性指數與 MA7；單位：指數'})}
function importsChart(){const data=[['工業用品','#60a5fa',[90,84,86,87,91,90,94,96,100,132,138,76,73,79,72,78,77,82]],['資本財','#34d399',[85,86,89,91,94,97,100,102,100,105,111,113,118,116,105,124,139,143]],['消費財','#fbbf24',[90,88,91,90,92,93,96,97,100,108,142,90,74,83,73,87,75,81]]];const s=data.map(([name,color,v])=>({name,color,points:v.map((n,i)=>[i,n])}));return legend(s)+lineChart({series:s,x:[0,17],min:60,max:160,ticks:[60,80,100,120,140,160],zero:100,xTicks:[[0,'2023/1'],[4,'2024/1'],[8,'2024/12'],[10,'2025/3'],[14,'2025/11'],[17,'2026/3']],label:'美國商品進口分類指數，2024 年 12 月＝100'})}
function policyActions(){return `<ul class="plain-list"><li>關稅政策反覆調整，企業為避險而提前出貨。</li><li>多國報告顯示供應鏈已開始重組，而非等待政策穩定。</li><li>「提前拉貨」已成為實際市場行為，跨國比對其一致性。</li><li>將政策前出貨視為預期需求，提前規劃船位保留與加班船。</li><li>優先監控亞洲—美國、亞洲—歐洲的貨流與船位壓力。</li></ul>`}
function hubs(){return table(['替代樞紐','評估重點'],[['墨西哥','北美供應鏈延伸與跨境銜接'],['沙烏地','區域轉運與替代配置'],['阿聯酋','中東物流樞紐與貨流重組']])}
renderPolicy=function(){return `
<div class="page-grid equal policy-row">
 ${panel('全球貿易政策不確定性',policyUncertaintyChart()+'<p class="micro-note">指標說明：貿易政策不確定性以指數呈現；MA7 為 7 日移動平均。</p>','指數 · 2023/9–2026/5')}
 ${panel('美國商品進口結構',importsChart()+'<p class="micro-note">指標說明：以 2024 年 12 月為基準 100，比較各類商品進口量的變化。</p>','2024/12＝100')}
</div>
${riskAnalysis('policy')}
`};
const baseCountryUpdate=updateCountries;
updateCountries=function(){baseCountryUpdate()};
// Qualitative exposure mapping: source-based associations, not calculated risk scores.
const EXPOSURE=[
 ['紅海與曼德航道','繞行與燃油價差','亞歐提前出貨','歐洲運輸與施工','歐洲營運環境'],
 ['好望角備援','航程增加耗油','亞歐提前出貨','歐洲交付延誤','歐洲營運環境'],
 ['荷莫茲通行','供應中斷與價差','沙烏地／阿聯酋樞紐','替代掛靠與內陸銜接','中東區域風險'],
 ['跨太平洋通行','燃油價格敏感度','美國進口／提前拉貨','墨西哥跨境與治安','墨西哥 DB4a／DB4c'],
 ['巴拿馬運河','燃油價格敏感度','美國進口／提前拉貨','跨境交付銜接','巴拿馬 DB4a／DB4d'],
 ['南美海上銜接','燃油價格敏感度','供應鏈重組','中南美事件與新港','七國 CRR／SRR 比較']
];
const EXPOSURE_KEYS=['safety','fuel','policy','ports','countries'];
function exposureTable(interactive=true){return table(['航線',...EXPOSURE_KEYS.map(k=>TOPIC_LABELS[k]),...(interactive?['']:[])],routes.map((r,i)=>[r.name+'<small class="table-sub">'+r.via+'</small>',...EXPOSURE[i].map((v,k)=>interactive?`<a href="#${EXPOSURE_KEYS[k]}" class="text-button">${v}</a>`:v),...(interactive?[`<button class="text-button" data-pick-route="${i}">評估方案</button>`]:[])]))}
const baseRoutes=renderRoutes;
renderRoutes=function(){const html=baseRoutes(),start=html.indexOf('<div class="page-grid equal">');return panel('航線 × 戰略議題',exposureTable(),'議題關聯 · 點選查看依據')+html.slice(start)};
function routeContext(i){return panel('此航線的決策依據',table(['主題','關聯與依據'],EXPOSURE[i].map((v,k)=>[TOPIC_LABELS[EXPOSURE_KEYS[k]],`<a href="#${EXPOSURE_KEYS[k]}" class="text-button">${v}</a>`]))+'<p class="reading">依據各主題訊號建立方案，再比較航程與燃油成本；議題關聯不等於量化風險評分。</p>')}
const oldBind=bindPage;
bindPage=function(page){if(page!=='policy')oldBind(page);else bindRouteButtons();if(page==='routes'){const form=$('#scenarioForm');form.insertAdjacentHTML('beforebegin','<div id="routeContext"></div>');const change=()=>{pageState.route=+$('#scenarioRoute').value;$('#routeContext').innerHTML=routeContext(pageState.route);$('#scenarioResult').innerHTML=emptyData('設定條件後計算，查看時間與燃油成本差異。');if(pageState.scenario?.route===pageState.route)showScenario()};$('#scenarioRoute').onchange=change;document.querySelectorAll('[data-pick-route]').forEach(b=>b.onclick=()=>{$('#scenarioRoute').value=b.dataset.pickRoute;change();form.scrollIntoView({behavior:'smooth',block:'start'})});change();}if(page==='reports'){document.querySelectorAll('.report-sections input').forEach(c=>c.onchange=makeReport)}};
const originalReports=renderReports;
renderReports=function(){return originalReports().replace('<legend>包含章節</legend>','<legend>包含章節</legend>'+TOPICS.map(k=>`<label><input type="checkbox" value="${k}" checked>${TOPIC_LABELS[k]}</label>`).join(''))};
function countryReportGraph(){
 const plot={left:205,right:790,top:110,bottom:465},averageCRR=COUNTRY_ROWS.reduce((sum,row)=>sum+row[4],0)/COUNTRY_ROWS.length,averageSRR=COUNTRY_ROWS.reduce((sum,row)=>sum+row[5],0)/COUNTRY_ROWS.length;
 const x=value=>plot.left+(value-3.5)/3*(plot.right-plot.left),y=value=>plot.bottom-(value-3.5)/3*(plot.bottom-plot.top),midX=x(averageCRR),midY=y(averageSRR);
 const labels={'智利':{dx:22,dy:30},'墨西哥':{dx:22,dy:46},'巴拿馬':{dx:22,dy:8},'秘魯':{dx:-22,dy:-19,anchor:'end'},'哥倫比亞':{dx:22,dy:8},'巴西':{dx:22,dy:-19},'阿根廷':{dx:-22,dy:-19,anchor:'end'}};
 const pointColor=row=>row[4]>averageCRR?(row[5]>averageSRR?'#ff5257':'#5ba6ff'):(row[5]>averageSRR?'#ffbf2f':'#34d1a1');
 const grid=[4,5,6].map(value=>`<path d="M${x(value)} ${plot.top}V${plot.bottom} M${plot.left} ${y(value)}H${plot.right}"/>`).join('');
 const ticks=[4,5,6].map(value=>`<text x="${x(value)}" y="500" text-anchor="middle">DB${value}</text><text x="170" y="${y(value)+7}" text-anchor="end">DB${value}</text>`).join('');
 const points=COUNTRY_ROWS.map(row=>{const label=labels[row[0]];return `<g data-country="${escapeHTML(row[0])}"><circle cx="${x(row[4])}" cy="${y(row[5])}" r="12" fill="${pointColor(row)}"><title>${escapeHTML(row[0])}：CRR ${escapeHTML(row[1])}、SRR ${escapeHTML(row[2])}</title></circle><text class="country-point-label" x="${x(row[4])+label.dx}" y="${y(row[5])+label.dy}" text-anchor="${label.anchor||'start'}">${escapeHTML(row[0])}</text></g>`}).join('');
 return `<svg class="country-risk-chart" viewBox="0 0 900 550" role="img" aria-label="國家與航運產業風險四象限圖；橫軸為 CRR，縱軸為 SRR"><text class="country-chart-title" x="24" y="36">國家 × 航運產業風險</text><text class="country-chart-meta" x="876" y="36" text-anchor="end">CRR / SRR</text><text class="country-chart-axis" x="130" y="90">SRR ↑</text><text class="country-chart-axis" x="750" y="535">CRR →</text><rect class="quadrant quadrant-caution" x="${plot.left}" y="${plot.top}" width="${midX-plot.left}" height="${midY-plot.top}"/><rect class="quadrant quadrant-risk" x="${midX}" y="${plot.top}" width="${plot.right-midX}" height="${midY-plot.top}"/><rect class="quadrant quadrant-priority" x="${plot.left}" y="${midY}" width="${midX-plot.left}" height="${plot.bottom-midY}"/><rect class="quadrant quadrant-opportunity" x="${midX}" y="${midY}" width="${plot.right-midX}" height="${plot.bottom-midY}"/><g class="country-chart-grid">${grid}</g><path class="country-chart-average" d="M${midX} ${plot.top}V${plot.bottom} M${plot.left} ${midY}H${plot.right}"/><rect class="country-chart-frame" x="${plot.left}" y="${plot.top}" width="${plot.right-plot.left}" height="${plot.bottom-plot.top}"/><g class="country-chart-ticks">${ticks}</g><text class="quadrant-label label-caution" x="${plot.left+16}" y="${plot.top+28}">審慎評估</text><text class="quadrant-label label-risk" x="${midX+16}" y="${plot.top+28}">高風險</text><text class="quadrant-label label-priority" x="${plot.left+16}" y="${midY+30}">優先市場</text><text class="quadrant-label label-opportunity" x="${midX+16}" y="${midY+30}">機會管理</text><g class="country-chart-points">${points}</g></svg>`
}
function reportTopic(key){let content='';if(key==='policy')content=renderPolicy();if(key==='safety')content=renderSafety();if(key==='fuel')content=renderFuel();if(key==='ports')content=table(['國家','階段','事件','影響與行動'],PORT_EVENTS.map(e=>[e.country,e.status,e.title,e.impact]));if(key==='countries')content=countryReportGraph()+table(['國家','CRR','SRR','策略'],COUNTRY_ROWS.map(c=>c.slice(0,4)))+'<p>四象限：優先市場區、審慎評估區、高風險地區、機會管理區。國家與航運產業風險分開判讀；阿根廷貨幣危機、巴西港口擁堵與政治不穩定為背景議題。</p>';content=content.replace(/<button class="page-button" data-open-route="\d+">(.*?) →<\/button>/g,'<span class="route-chip">$1</span>').replace('<div id="safetyRoutes"></div>',`<p class="reading">${[0,2].map(i=>routes[i].name+' · '+routes[i].via+'（'+routes[i].node+'）').join('、')}；備援：${routes[1].name} · ${routes[1].via}</p>`).replace(/<form[\s\S]*?<\/form>/g,'').replace(/<button[\s\S]*?<\/button>/g,'').replace(/<a href="#.*?<\/a>/g,'').replace(/<div id="(?:safetyRoutes|fuelResult)"><\/div>/g,'');content=content.replace(/<section class="page-card"><div class="page-card-head"><h2>[^<]*<\/h2>(?:<span>[^<]*<\/span>)?<\/div>\s*<\/section>/g,'');return `<section class="report-topic"><h2>${TOPIC_LABELS[key]}</h2>${summaryBlock(key)}${content}</section>`}
const baseMakeReport=makeReport;
makeReport=function(){baseMakeReport();const selectedSections=[...document.querySelectorAll('.report-sections input:checked')].map(c=>c.value);const chapters=TOPICS.filter(k=>selectedSections.includes(k)).map(reportTopic).join('');const r=pageState.report;r.body+=chapters;r.html=r.html.replace('</body>','');r.html=r.html.replace(/<\/html>$/,'')+chapters+`<style>svg{width:100%;height:auto;max-height:360px;background:#101e32;padding:12px;box-sizing:border-box}.page-grid{display:block}.page-card{margin:20px 0;break-inside:avoid}h3{font-size:16px}.strategy-summary{background:#eef3fa;padding:14px}.strategy-summary small{font-weight:bold}.chart-legend{display:flex;gap:14px;flex-wrap:wrap;background:#101e32;padding:12px}.source-details{font-size:12px;color:#60718b;margin:20px 0}a{color:#22599b}.micro-note{font-size:12px}.report-topic{break-before:page}table{font-size:13px}.page-card-head span{font-size:12px}.odds-pair{display:flex;gap:20px}.odds-pair strong{margin-left:8px}.route-chip{display:inline-block;margin:0 8px 8px 0;padding:4px 12px;border:1px solid #9db4d1;border-radius:14px;font-size:13px;color:#25405f}</style></html>`;$('#reportPreview').innerHTML=r.body};
PAGE_MAP.overview=['全球態勢','掌握全球風險與優先決策'];PAGE_MAP.routes=['航線決策','把風險依據轉為航線與成本方案'];PAGE_MAP.reports=['決策報告','整合情報、策略與情境比較'];
const baseRenderPage=renderPage;
renderPage=function(page){baseRenderPage(page);const key=currentPage;document.querySelectorAll('.primary-nav a').forEach(a=>{const active=a.dataset.page===key||(a.dataset.page==='intelligence'&&TOPICS.includes(key));a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});if(TOPICS.includes(key)){$('#pageContent').insertAdjacentHTML('afterbegin',topicNav(key))}if(key==='intelligence'){$('#pageContent').insertAdjacentHTML('afterbegin',topicNav(key))}};
// Homepage keeps the full-height globe and links each concern to its evidence page.
const originalShowEvents=showEvents;
showEvents=function(f){originalShowEvents(f);document.querySelectorAll('.attention-card').forEach(b=>{const e=events[+b.dataset.event],key=Object.keys(TOPIC_LABELS).find(k=>TOPIC_LABELS[k]===e.type);if(key){const a=document.createElement('a');a.href='#'+key;a.className='home-topic-link';a.textContent='查閱'+TOPIC_LABELS[key];b.insertAdjacentElement('afterend',a)}})};
showEvents('全部');
// Initial render is handled by assessment.js.

$('#overviewSummaryCount').innerHTML=events.length+' 則訊號<br>'+new Set(events.map(e=>e.route)).size+' 條航線';

/* Route × topic presence (a topic has advice for the route) feeds the routes-page picker; the overview shows the status matrix only. */
const RISK_TOPIC_SHORT={safety:'航道',policy:'政策',fuel:'燃油',ports:'港口',countries:'國家'};
function riskRouteTopicMatrix(){
 const scopes={ports:{entries:PORT_EVENTS,area:'全部',status:'全部'}},map=routes.map(()=>({}));
 INTELLIGENCE_TOPICS.forEach(key=>riskTopicModel(key,scopes[key]||{}).routeIdeas.forEach(r=>{map[r.index][key]=r}));
 return map;
}
