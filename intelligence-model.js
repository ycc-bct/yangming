/* Common evidence → interpretation → route action model. Values come from the
   existing presentation series; no new forecasts or live observations are inferred. */
function riskTopicModel(key,scope={}){
 const models={
  safety:{headline:'荷莫茲封鎖機率上升',signal:'關鍵航道風險升溫，需評估備援',description:'事件市場機率與預警時間軸共同指向航道中斷風險。',
   signals:[['荷莫茲封鎖事件市場機率',HORMUZ_ODDS.at(-1)[1]+'%','2025/11–2026/3 · 圖表期末','機率由期初 '+HORMUZ_ODDS[0][1]+'% 升至圖表期末；屬事件市場預期。'],['預警時間軸','2025/4 起','2025/4–2026/3','先有區域成本與商船攻擊預警，後續事件衝擊具體化。']],
   impact:'若通行受限，航程、交期、船舶配置與風險附加費將同步承壓。',outlook:'若航安通告與通行條件持續惡化，備援安排可能延長；市場機率不能單獨作為改道依據。',watch:'航安通告、實際通行、保險承保及客戶到港窗口。',actions:['採主幹＋備援配置，避免高價值船舶長時間停留高曝險航段。','將延誤與風險附加費納入條款，評估長約與短約比例。'],
   routeIdeas:[{index:0,kind:'海上改道',proposal:'比較繞行好望角',when:'紅海或曼德通行限制超出船期與承保容許範圍。',tradeoff:'避開紅海航段，增加航程、耗油與運力占用。'},{index:2,kind:'掛靠與陸運',proposal:'評估替代掛靠與陸運銜接',when:'荷莫茲通行受限，且替代港與陸運具可用容量。',tradeoff:'需另外確認港費、陸運費及交付能力；尚無獨立替代海路。'}]},
  policy:{headline:'關稅變動影響出貨',signal:'政策窗口改變出貨時點與船位需求',description:'比對政策不確定性與美國商品進口結構，辨識提前出貨。',
   signals:[['全球貿易政策不確定性 MA7',TPU_MA7.at(-1)+' 指數','2023/9–2026/5 · 圖表期末','圖示高點 '+Math.max(...TPU_MA7)+'，期末回落；MA7 為 7 日移動平均。'],['美國商品進口結構','基準 100','2023/1–2026/3 · 2024/12＝100','工業用品、資本財與消費財走勢分歧，需分別觀察需求。']],
   impact:'貨主可能在政策生效前集中出貨，造成短期船位壓力與後續貨量回落。',outlook:'若訂艙增加同時接近政策生效日，可優先評估提前出貨情境；不宜將短期增量直接外推為長期成長。',watch:'政策公告與生效日、訂艙量、進口分類及歷史季節性。',actions:['跨市場比對提前拉貨訊號，再安排船位保留或加班船。','供應鏈重組時評估墨西哥、沙烏地與阿聯酋的承載及轉運條件。'],
   routeIdeas:[{index:3,kind:'船期與船位',proposal:'評估提前出發與船位配置',when:'政策窗口前訂艙增加，且到港時間有明確需求。',tradeoff:'維持跨太平洋海路；需評估加班船與閒置運力風險。'},{index:4,kind:'轉運配置',proposal:'比較轉運與接駁安排',when:'美東交付窗口或運河預約無法配合出貨集中期。',tradeoff:'需確認轉運港容量與接駁班次，可能增加等待。'},{index:0,kind:'需求配置',proposal:'同步評估亞歐運力需求',when:'跨市場訂艙與政策訊號顯示需求轉移。',tradeoff:'需同時納入紅海航安限制與備援成本。'}]},
  fuel:{headline:'燃油價格波動升高',signal:'波動率先行，裂解價差反映供給壓力',description:'一起觀察 OVX、油價與燃料油裂解價差，評估航程成本。',
   signals:[['原油波動率 OVX',OVX_WEEKS.ovx.at(-1)+' 指數','2025/11–2026/4 · 圖表期末','圖示高點 '+Math.max(...OVX_WEEKS.ovx)+'；波動率較油價提早上升。'],['380cst − Brent 裂解價差','近月 '+CRACK.near.at(-1)+'／即期 '+CRACK.spot.at(-1),'美元／桶 · 2026/4 圖表期末','3 月一度轉正，期末近月與即期已分歧，須分開判讀。']],
   impact:'原油價格平穩不代表船用燃料成本穩定；較長航程會放大單價變動對總成本的影響。',outlook:'若價差再次擴大且燃料供應偏緊，繞行成本可能增加；價差回落時仍需核對實際加油報價。',watch:'近月與即期價差、實際燃油報價、航程天數及每日耗油量。',actions:['透過航線方案的燃油成本比較衡量航程與價格變動，再評估燃料油鎖價安排。','簡報列出的阿聯酋 OPEC 供給情境需確認是否落實，再納入長期成本判斷。'],
   routeIdeas:[{index:0,kind:'航程成本',proposal:'比較蘇伊士與好望角燃油成本',when:'航安條件允許比較，且已確認兩案航程與燃油報價。',tradeoff:'較短航程可減少耗油，但仍須衡量航道風險。'},{index:1,kind:'備援復航',proposal:'評估維持備援或恢復蘇伊士',when:'航安、保險及合約限制均允許恢復通行。',tradeoff:'不能僅因燃油成本下降而採用高曝險航段。'}]},
  ports:{headline:PORT_EVENTS.length+' 件港口與內陸事件',signal:'港口與內陸中斷共同影響交付',description:'依已發生、常態化與前瞻預警區分事件，追蹤交付影響。',
   signals:[['已發生事件',PORT_EVENTS.filter(e=>e.status==='已發生').length+' 件','Shipping Related Developments 2026','包含治安、天災、法規與供應鏈中斷。'],['持續與前瞻事件',(PORT_EVENTS.filter(e=>e.status==='常態化').length+PORT_EVENTS.filter(e=>e.status==='前瞻預警').length)+' 件','Shipping Related Developments 2026','常態化 '+PORT_EVENTS.filter(e=>e.status==='常態化').length+' 件；前瞻預警 '+PORT_EVENTS.filter(e=>e.status==='前瞻預警').length+' 件。']],
   impact:'港口作業、道路鐵路、付款與文件流程都可能影響港到門交付。',outlook:'若中斷持續且無法在到港窗口前恢復，需評估替代交付安排；前瞻事件先確認時程與影響範圍。',watch:'港口復工、道路與鐵路容量、接駁時程及付款安排。',actions:['依事件階段安排立即處理、持續追蹤或預先備援。','提早預訂港口與運輸，評估分批出貨；新港機會需核對實際營運能力。'],
   routeIdeas:[{index:0,kind:'航程與交付',proposal:'比較亞歐主線與備援船期',when:'歐洲交付中斷，需同步調整海上航程與到港窗口。',tradeoff:'此處比較蘇伊士與好望角航程；內陸替代運輸與費用需另外確認。'},{index:3,kind:'船期與交付',proposal:'調整美西到港與跨境安排',when:'墨西哥治安或跨境流程影響既定交付。',tradeoff:'需核對跨境與資金週轉，不直接推導更換海路。'},{index:5,kind:'目的港配置',proposal:'比較南美目的港與內陸銜接',when:'原港作業受限，替代港具有可用容量與內陸連接。',tradeoff:'重新估算港費、內陸距離、時程與付款條件。'}]},
  countries:{headline:highRiskCountryRows().length+' 個高風險地區',signal:'結合國家與航運產業評級配置曝險',description:'以 CRR 與 SRR 同時高於七國樣本平均辨識高風險地區。',
   signals:[['高風險地區',highRiskCountryRows().length+' 國','七國樣本 · CRR 與 SRR 均高於平均',highRiskCountryRows().map(c=>countryLabel(c[0])).join('、')+'；樣本平均不是官方警示門檻。'],['國家與產業評級',COUNTRY_ROWS.length+' 國','CRR／SRR · 1–7 級', '數字越大風險越高；a–d 子級僅作排序，不代表風險機率。']],
   impact:'國家環境、貨幣、港口與產業風險共同影響市場進入方式與資產曝險。',outlook:'若目的地國家與航運產業風險同時偏高，宜先限制曝險並比較交付配置；評級本身不能預測單次延誤。',watch:'國家與產業評級、目的港作業、付款條件、運量與商業目標。',actions:['阿根廷依既有評級限制曝險；巴西結合港口擁堵與營運條件加強風控。','對智利、墨西哥、巴拿馬及秘魯依評級與市場條件選擇進入方式。'],
   routeIdeas:[{index:5,kind:'市場與目的港',proposal:'比較南美目的港及曝險配置',when:'目的地評級與實際港口條件影響商業目標。',tradeoff:'現有路徑為南美西岸示意；巴西與阿根廷需另確認實際掛靠。並評估內陸成本、付款風險及收益。'},{index:3,kind:'北美市場配置',proposal:'評估墨西哥需求與船期安排',when:'國家與產業評級、跨境需求支持北美延伸。',tradeoff:'海上航程維持跨太平洋，需確認跨境與內陸交付條件。'},{index:4,kind:'轉運配置',proposal:'評估巴拿馬轉運安排',when:'港口與接駁容量符合轉運需求。',tradeoff:'核對運河預約、轉運費用與接駁時程。'}]}
 };
 Object.entries(models).forEach(([k,m])=>m.routeIdeas.forEach(r=>{r.topic=k}));
 const model=models[key];
 if(key==='ports'&&scope.entries){
  const entries=scope.entries;
  model.signals=[['已發生事件',entries.filter(e=>e.status==='已發生').length+' 件','目前篩選 · '+scope.area+'／'+scope.status,'對照事件詳情確認受影響節點與交付。'],['常態化／前瞻預警',entries.filter(e=>e.status==='常態化').length+'／'+entries.filter(e=>e.status==='前瞻預警').length+' 件','目前篩選 · Shipping Related Developments 2026','分開處理持續干擾與尚待確認的前瞻影響。']];
  const indices=new Set(entries.map(e=>e.route));
  model.routeIdeas=model.routeIdeas.filter(r=>indices.has(r.index));
  if(indices.has(2))model.routeIdeas.push({...models.safety.routeIdeas[1]});
  if(!entries.length){model.impact='目前篩選沒有對應事件。';model.outlook='請調整篩選後再判讀影響。';model.actions=[]}
 }
 if(key==='countries'&&scope.countryRows){
  const selected=scope.countryRows,high=highRiskCountryRows().filter(c=>selected.includes(c));
  model.signals=[['高風險地區',high.length+'／'+selected.length+' 國','目前選取 · 以完整七國樣本平均判定',high.length?high.map(c=>countryLabel(c[0])).join('、')+'的 CRR 與 SRR 均高於七國平均。':'目前選取未同時高於七國 CRR 與 SRR 平均。'],['國家與產業評級',selected.length+' 國','CRR／SRR · 1–7 級',selected.length===1?countryLabel(selected[0][0])+'：CRR '+selected[0][1]+'／SRR '+selected[0][2]:'國家環境與航運產業風險分開觀察。']];
  model.actions=selected.map(c=>c[0]+'：'+c[3]+'。'+(c[0]==='阿根廷'?'搭配貨幣與政治風險觀察。':c[0]==='巴西'?'搭配港口擁堵與營運風險觀察。':''));
  const indices=new Set(selected.map(c=>c[0]==='墨西哥'?3:c[0]==='巴拿馬'?4:5));model.routeIdeas=model.routeIdeas.filter(r=>indices.has(r.index));
 }
 return model;
}
function highRiskCountryRows(){const x=COUNTRY_ROWS.reduce((s,c)=>s+c[4],0)/COUNTRY_ROWS.length,y=COUNTRY_ROWS.reduce((s,c)=>s+c[5],0)/COUNTRY_ROWS.length;return COUNTRY_ROWS.filter(c=>c[4]>x&&c[5]>y)}
// riskSignalList is no longer rendered on topic pages (its values repeated the charts); kept for reuse.
function riskSignalList(model){return `<div class="risk-signal-list">${model.signals.map(([label,value,period,evidence])=>`<article><div class="risk-signal-line"><h3>${escapeHTML(label)}</h3><div class="risk-signal-value"><strong>${escapeHTML(value)}</strong></div></div><small>${escapeHTML(period)}</small><p>${escapeHTML(evidence)}</p></article>`).join('')}</div>`}
const RISK_FEED_TYPE={'數據':'data','市場':'market','事件':'event','報告':'report','公告':'notice'};
function riskFeedList(key){const items=riskTopicFeed(key);return items.length?`<ol class="risk-feed">${items.map(f=>`<li><time datetime="${f.date}">${f.date}</time><span class="feed-type feed-${RISK_FEED_TYPE[f.type]||'report'}">${escapeHTML(f.type)}</span><span class="feed-title">${escapeHTML(f.title)}</span></li>`).join('')}</ol>`:'<p class="risk-scope-note">目前沒有此主題的訊號。</p>'}
function riskLevelTone(level){return level==='危急'||level==='高'?'high':level==='中'?'medium':'low'}
function riskImpactChips(r){const v=RISK_ROUTE_VISUAL[r.topic+'|'+r.index];if(!v)return '';return `<ul class="route-impacts" aria-label="方案取捨">${v.impacts.map(([label,state])=>`<li class="impact-${state}" title="${escapeHTML(label+RISK_IMPACT_GLYPH[state][1])}"><i aria-hidden="true">${RISK_IMPACT_GLYPH[state][0]}</i><span>${escapeHTML(label)}</span><span class="sr-only">${RISK_IMPACT_GLYPH[state][1]}</span></li>`).join('')}</ul>`}
// Risk pages show data only. The one way out is 影響航線, which opens 航線方案評估 for that route.
function riskRouteExits(m){const seen=[...new Set(m.routeIdeas.map(r=>r.index))];if(!seen.length)return '';return `<div class="risk-route-exits"><div class="risk-route-exits-head"><span>影響航線</span><small>前往航線方案評估 ↗</small></div><div class="risk-route-exit-list">${seen.map(i=>`<button type="button" class="risk-route-exit tone-${riskLevelTone(routes[i].level)}" data-open-route="${i}" aria-label="前往航線方案評估：${escapeHTML(routes[i].name+routes[i].via)}"><b>${escapeHTML(routes[i].name)}</b><small>${escapeHTML(routes[i].via)}</small><i aria-hidden="true">↗</i></button>`).join('')}</div></div>`}
function riskAnalysis(key,scope={}){const m=riskTopicModel(key,scope);return `<section class="risk-analysis" data-analysis-topic="${key}"><div class="risk-analysis-grid">${panel('訊號動態',riskFeedList(key),riskTopicFeed(key).length+' 則')}${panel('分析判讀',`<dl class="risk-interpretation"><div><dt>營運影響</dt><dd>${escapeHTML(m.impact)}</dd></div><div><dt>條件式預判</dt><dd>${escapeHTML(m.outlook)}</dd></div><div><dt>後續確認</dt><dd>${escapeHTML(m.watch)}</dd></div></dl>${riskRouteExits(m)}`)}</div></section>`}

// Keep analysis and affected routes in sync with the evidence filters.
const updatePortsBeforeIntelligence=updatePorts;
updatePorts=function(){updatePortsBeforeIntelligence();const area=$('#portArea').value,status=$('#portStage').value,entries=PORT_EVENTS.filter(e=>(area==='全部'||e.area===area)&&(status==='全部'||e.status===status));$('#portsAnalysis').innerHTML=riskAnalysis('ports',{entries,area,status});bindRouteButtons()};
const updateCountriesBeforeIntelligence=updateCountries;
updateCountries=function(){updateCountriesBeforeIntelligence();const value=$('#countrySelect').value,countryRows=value==='all'?COUNTRY_ROWS:[COUNTRY_ROWS[+value]];$('#countriesAnalysis').innerHTML=riskAnalysis('countries',{countryRows});bindRouteButtons()};

// Ports: the area/stage filters sit in the event-matrix card header; the event count note is hidden
// (#portCount stays in the DOM because updatePorts writes to it).
const renderPortsBeforeIntelligence=renderPorts;
renderPorts=function(){
 let html=renderPortsBeforeIntelligence();
 const bar=html.match(/<div class="page-toolbar">([\s\S]*?)<span id="portCount" class="toolbar-note"><\/span><\/div>/);
 if(!bar)return html;
 html=html.replace(bar[0],'');
 return html.replace('<div class="page-card-head"><h2>港口與內陸事件矩陣</h2></div>',()=>`<div class="page-card-head port-matrix-head"><h2>港口與內陸事件矩陣</h2><div class="port-filters">${bar[1]}<span id="portCount" hidden></span></div></div>`);
};

// Countries: the country select sits in the header of 國家 × 航運產業風險 (same pattern as the port filters); the toolbar note is dropped.
const renderCountriesBeforeIntelligence=renderCountries;
renderCountries=function(){
 let html=renderCountriesBeforeIntelligence();
 const bar=html.match(/<div class="page-toolbar">(<label>[\s\S]*?<\/label>)<span class="toolbar-note">[\s\S]*?<\/span><\/div>/);
 if(!bar)return html;
 html=html.replace(bar[0],'');
 return html.replace(/<div class="page-card-head"><h2>國家 × 航運產業風險<\/h2>(<span>[\s\S]*?<\/span>)?<\/div>/,(m,sub)=>`<div class="page-card-head country-head"><h2>國家 × 航運產業風險</h2><div class="port-filters">${bar[1]}</div></div>`);
};

