(function(){
  const signalDynamics={
    policy:[
      ['2026-05-20','指標','貿易政策不確定性回落至 180，近三個月 -40%'],
      ['2026-03-20','事件','美國宣布臨時 10% 全球進口關稅'],
      ['2025-05-15','事件','美方宣布中國建造船舶靠港收費措施'],
      ['2025-05-12','事件','美中暫緩加徵關稅 90 天'],
      ['2025-04-05','事件','美國實施全面基準關稅 10%'],
      ['2025-03-20','事件','美國商品進口月增 12%，提前拉貨訊號浮現']
    ],
    safety:[
      ['2026-03-09','指標','荷莫茲封鎖事件市場機率逼近 100%'],
      ['2026-02-28','事件','戰爭爆發，封鎖機率當週升至約 70%'],
      ['2026-03','事件','荷莫茲衝擊具體化，需交叉確認實際通行條件'],
      ['2025-06','事件','商船航道預警出現'],
      ['2025-04','事件','區域成本預警啟動']
    ],
    fuel:[
      ['2026-04','指標','OVX 圖表期末為 92，圖示高點為 140'],
      ['2026-04','指標','380cst − Brent 近月 1、即期 -2 美元／桶'],
      ['2026-03','事件','裂解價差轉正，一度升至約 16 美元／桶'],
      ['2026-03','事件','WTI 與 Brent 油價開始明顯上漲'],
      ['2026-02','指標','OVX 快速飆升，先於油價反映供應中斷風險']
    ],
    ports:[
      ['2026-04','事件','德國供應環境展望因中東戰事下調'],
      ['2026-03','事件','巴西洪水與土石流影響內陸銜接'],
      ['2026-02','事件','墨西哥治安事件造成道路封鎖'],
      ['2026-01','事件','智利野火造成港口關閉或限制'],
      ['2026-01','事件','荷蘭冬季風暴造成交通中斷']
    ],
    countries:[
      ['七國樣本','指標','阿根廷位於高風險地區，CRR／SRR 均為 DB6a'],
      ['七國樣本','指標','巴西位於高風險地區，需嚴格風控'],
      ['七國樣本','指標','智利、墨西哥與巴拿馬位於優先市場區'],
      ['七國樣本','指標','秘魯列為審慎評估，持續關注 Chancay'],
      ['七國樣本','指標','哥倫比亞列為機會管理，限制曝險']
    ]
  };
  const topicLabels={policy:'政策與關稅',safety:'航道安全',fuel:'燃油成本',ports:'港口與內陸',countries:'國家風險'};
  const scenarioDefaults=[
    {days:28,altDays:36,via:'經蘇伊士',alt:'繞行好望角',watch:'紅海通行條件、船期承諾、好望角海象與可用運力'},
    {days:36,altDays:28,via:'繞行好望角',alt:'恢復蘇伊士航線',watch:'航安通告、恢復通行條件、保險與合約限制'},
    {days:18,altDays:21,via:'經荷莫茲',alt:'調整掛靠與陸運銜接',watch:'替代港承載、陸運接駁、客戶交付要求'},
    {days:16,altDays:16,via:'跨太平洋',alt:'調整出發時段',watch:'政策生效日、訂艙需求、出發日期與到港窗口'},
    {days:30,altDays:33,via:'經巴拿馬',alt:'調整轉運配置',watch:'運河預約、轉運港、接駁班次與到港窗口'},
    {days:32,altDays:35,via:'南美西岸',alt:'調整目的港',watch:'目的港作業、替代港條件、內陸路徑與付款安排'}
  ];
  const money=value=>new Intl.NumberFormat('en-US').format(value);
  function dynamicMarkup(topic){
    return `<div class="signal-dynamics">${signalDynamics[topic].map(([date,kind,copy])=>`<article class="signal-dynamic-item"><div class="signal-dynamic-meta"><time class="signal-dynamic-date">${date}</time><span class="signal-dynamic-topic">${topicLabels[topic]}</span><span class="signal-dynamic-kind ${kind==='指標'?'is-indicator':''}">${kind}</span></div><p class="signal-dynamic-copy">${copy}</p></article>`).join('')}</div>`;
  }
  function scenarioMarkup(routeIndex){
    const s=scenarioDefaults[routeIndex]||scenarioDefaults[0],burn=70,price=600,base=s.days*burn*price,alt=s.altDays*burn*price,dayDelta=s.altDays-s.days,costDelta=alt-base,maxDays=Math.max(s.days,s.altDays),maxCost=Math.max(base,alt);
    const delta=(value,unit)=>value===0?`相同${unit}`:`${value>0?'增加':'減少'} ${money(Math.abs(value))}${unit}`;
    return `<div class="scenario-report"><div class="scenario-intro"><p>分析日期：2026-10-12；目標：比較航程與燃油成本</p><p>每日耗油 70 噸，燃油 USD 600／噸。</p><p><strong>原方案：${s.via}／備援：${s.alt}</strong></p></div><div class="scenario-comparison"><div class="scenario-metric"><div class="scenario-metric-head"><h3>航程</h3><strong>${delta(dayDelta,'天')}</strong></div><div class="scenario-bar-row"><span>原案</span><div class="scenario-bar-track"><i style="width:${s.days/maxDays*100}%"></i></div><b>${s.days} 天</b></div><div class="scenario-bar-row is-alt"><span>備援</span><div class="scenario-bar-track"><i style="width:${s.altDays/maxDays*100}%"></i></div><b>${s.altDays} 天</b></div></div><div class="scenario-metric"><div class="scenario-metric-head"><h3>燃油成本</h3><strong>${delta(costDelta,'美元')}</strong></div><div class="scenario-bar-row"><span>原案</span><div class="scenario-bar-track"><i style="width:${base/maxCost*100}%"></i></div><b>${money(base)} 美元</b></div><div class="scenario-bar-row is-alt"><span>備援</span><div class="scenario-bar-track"><i style="width:${alt/maxCost*100}%"></i></div><b>${money(alt)} 美元</b></div></div></div><div class="scenario-notes"><p>${delta(dayDelta,' 天')}；燃油成本${delta(costDelta,' 美元')}。</p><p>尚未記錄方案選擇。</p><p>持續觀察：${s.watch}</p><p>備註：無</p></div></div>`;
  }
  function syncReport(preview){
    if(typeof pageState==='undefined'||!pageState.report)return;
    pageState.report.body=preview.innerHTML;
    const documentCopy=new DOMParser().parseFromString(pageState.report.html,'text/html');
    const target=documentCopy.querySelector('.report-document')||documentCopy.body;
    target.innerHTML=pageState.report.body;
    pageState.report.html='<!doctype html>'+documentCopy.documentElement.outerHTML;
  }
  function enhanceReport(){
    const preview=document.querySelector('#reportPreview.report-document');
    if(!preview)return;
    preview.querySelector('#report-local-export-overrides')?.remove();
    const exportStyle=document.querySelector('#report-local-overrides')?.cloneNode(true);
    if(exportStyle){exportStyle.id='report-local-export-overrides';preview.append(exportStyle)}
    const executive=[...preview.children].find(section=>section.tagName==='SECTION'&&section.querySelector(':scope>h2')?.textContent.trim()==='執行摘要');
    if(executive){
      preview.querySelector(`.report-section-indicator [data-indicator-for="${executive.id}"]`)?.closest('.report-indicator-option')?.remove();
      executive.remove();
    }
    preview.querySelectorAll('.report-topic').forEach(section=>{
      const topic=[...section.classList].find(()=>false)||Object.keys(topicLabels).find(key=>topicLabels[key]===section.querySelector(':scope>h2')?.textContent.trim());
      if(!topic)return;
      const analysis=section.querySelector('.risk-analysis');
      const cards=analysis?.querySelectorAll('.risk-analysis-grid>.page-card');
      if(cards?.[0]){
        const head=cards[0].querySelector('.page-card-head h2');
        if(head)head.textContent='訊號動態';
        [...cards[0].children].filter(child=>!child.classList.contains('page-card-head')).forEach(child=>child.remove());
        cards[0].insertAdjacentHTML('beforeend',dynamicMarkup(topic));
      }
      if(cards?.[1]){
        cards[1].querySelector('.risk-management')?.remove();
        cards[1].querySelector('.risk-route-exits')?.remove();
        cards[1].querySelector('.report-affected-routes')?.remove();
        cards[1].insertAdjacentHTML('beforeend','<div class="report-affected-routes"><span>影響航線</span><a href="#routes">前往航線方案評估 <b aria-hidden="true">→</b></a></div>');
      }
      analysis?.querySelector('.risk-route-advice')?.remove();
      if(topic==='safety'&&!section.querySelector('.report-safety-supplement')&&!section.querySelector('.safety-evidence-grid')){
        const supplement=document.createElement('div');
        supplement.className='report-safety-supplement';
        supplement.innerHTML='<section class="page-card"><div class="page-card-head"><h2>咽喉點通行量</h2><span>荷莫茲海峽每月通行量 · 各咽喉點</span></div><div class="chokepoint-chart"><div class="chokepoint-legend"><span><i></i>本期</span><span class="is-baseline"><i></i>去年同期</span><span class="is-alert"><i></i>年減 30% 以上（高）</span></div><svg class="chokepoint-plot" viewBox="0 0 620 260" role="img" aria-label="荷莫茲海峽本期與去年同期每月通行量趨勢"><g stroke="#27272a" stroke-width="1"><path d="M46 34H600M46 92H600M46 150H600M46 208H600"/></g><g fill="#71717a" font-size="11"><text x="17" y="38">90</text><text x="17" y="96">60</text><text x="17" y="154">30</text><text x="25" y="212">0</text><text x="46" y="232">2025 年</text><text x="165" y="232">4 月</text><text x="285" y="232">7 月</text><text x="398" y="232">10 月</text><text x="486" y="232">2026 年</text><text x="565" y="232">4 月</text></g><path d="M46 62L101 64L156 66L211 68L266 67L321 68L376 70L431 72L466 82L498 112L530 194L558 207L579 207L600 208L600 208L46 208Z" fill="#3b82f633"/><path d="M46 53L101 55L156 56L211 57L266 56L321 57L376 58L431 59L486 60L542 61L600 63" fill="none" stroke="#71717a" stroke-width="2"/><path d="M46 62L101 64L156 66L211 68L266 67L321 68L376 70L431 72L466 82L498 112L530 194L558 207L579 207L600 208" fill="none" stroke="#60a5fa" stroke-width="2.5"/><g stroke="#52525b"><path d="M156 24V208M211 24V208M530 24V208"/></g><g fill="#101010" stroke="#a1a1aa" stroke-width="1.5"><circle cx="156" cy="20" r="11"/><circle cx="211" cy="20" r="11"/><circle cx="530" cy="20" r="11"/></g><g fill="#e4e4e7" font-size="11" text-anchor="middle"><text x="156" y="24">1</text><text x="211" y="24">2</text><text x="530" y="24">3</text></g><g fill="#101010" stroke="#e4e4e7" stroke-width="2"><circle cx="530" cy="194" r="6"/><circle cx="558" cy="207" r="6"/><circle cx="579" cy="207" r="6"/><circle cx="600" cy="208" r="6" fill="#60a5fa"/></g><text x="600" y="191" fill="#93c5fd" font-size="12" text-anchor="end">2.3</text></svg><div class="chokepoint-events"><span><b>1</b>2025/4 報告警示</span><span><b>2</b>2025/6 報告警示</span><span><b>3</b>2026/2/28 戰爭爆發</span></div></div><div class="chokepoint-table-wrap"><table class="chokepoint-table"><thead><tr><th>咽喉點</th><th>本期</th><th>基準</th><th>變動</th><th>風險</th></tr></thead><tbody><tr><td><span class="chokepoint-name">荷莫茲海峽</span><span class="chokepoint-coordinates">26.6°N 56.4°E</span></td><td>2.3</td><td>76.7</td><td>−97%</td><td><span class="chokepoint-risk is-critical">危急</span></td></tr><tr><td><span class="chokepoint-name">曼德海峽</span><span class="chokepoint-coordinates">12.6°N 43.4°E</span></td><td>23.7</td><td>41.6</td><td>−43%</td><td><span class="chokepoint-risk is-high">高</span></td></tr><tr><td><span class="chokepoint-name">麻六甲海峽</span><span class="chokepoint-coordinates">3.2°N 100.2°E</span></td><td>211.7</td><td>246.2</td><td>−14%</td><td><span class="chokepoint-risk is-medium">中</span></td></tr><tr><td><span class="chokepoint-name">巴拿馬運河</span><span class="chokepoint-coordinates">9.1°N 79.7°W</span></td><td>27.7</td><td>30.1</td><td>−8%</td><td><span class="chokepoint-risk is-low">低</span></td></tr><tr><td><span class="chokepoint-name">蘇伊士運河</span><span class="chokepoint-coordinates">30.0°N 32.6°E</span></td><td>37.0</td><td>39.8</td><td>−7%</td><td><span class="chokepoint-risk is-low">低</span></td></tr><tr><td><span class="chokepoint-name">台灣海峽</span><span class="chokepoint-coordinates">24.3°N 119.6°E</span></td><td>227.1</td><td>239.0</td><td>−5%</td><td><span class="chokepoint-risk is-low">低</span></td></tr><tr><td><span class="chokepoint-name">好望角</span><span class="chokepoint-coordinates">34.4°S 18.5°E</span></td><td>89.0</td><td>92.7</td><td>−4%</td><td><span class="chokepoint-risk is-low">低</span></td></tr></tbody></table></div></section><section class="page-card"><div class="page-card-head"><h2>質化報告</h2><span>航安交叉驗證</span></div><dl class="qualitative-report"><div><dt>風險判讀</dt><dd>關鍵航道風險升溫，繞行可能常態化。</dd></div><div><dt>營運影響</dt><dd>若通行受限，航程、交期、船舶配置與風險附加費將同步承壓。</dd></div><div><dt>驗證依據</dt><dd>航安通告、實際通行、保險承保及客戶到港窗口。</dd></div><div><dt>決策方向</dt><dd>維持主幹與備援，並把延誤及風險附加費納入合約。</dd></div></dl></section>';
        analysis.before(supplement);
      }
    });
    const comparison=[...preview.children].find(section=>section.tagName==='SECTION'&&['情境比較','情境條件與比較'].includes(section.querySelector(':scope>h2')?.textContent.trim()));
    if(comparison){
      comparison.querySelector(':scope>h2').textContent='情境條件與比較';
      [...comparison.children].slice(1).forEach(child=>child.remove());
      const routeIndex=+(document.querySelector('[data-report-route].is-active')?.dataset.reportRoute||0);
      comparison.insertAdjacentHTML('beforeend',scenarioMarkup(routeIndex));
    }
    const countries=[...preview.children].find(section=>section.tagName==='SECTION'&&section.querySelector(':scope>h2')?.textContent.trim()==='國家風險');
    if(comparison&&countries){
      countries.after(comparison);
      const indicator=preview.querySelector('.report-section-indicator');
      const countryOption=indicator?.querySelector(`[data-indicator-for="${countries.id}"]`)?.closest('.report-indicator-option');
      const comparisonOption=indicator?.querySelector(`[data-indicator-for="${comparison.id}"]`)?.closest('.report-indicator-option');
      if(countryOption&&comparisonOption)countryOption.after(comparisonOption);
    }
    syncReport(preview);
  }
  if(typeof makeReport==='function'){
    const makeReportBeforeIndexOverrides=makeReport;
    makeReport=function(){makeReportBeforeIndexOverrides();enhanceReport()};
  }
  if(typeof bindPage==='function'){
    const bindPageBeforeIndexOverrides=bindPage;
    bindPage=function(page){bindPageBeforeIndexOverrides(page);if(page==='reports')requestAnimationFrame(enhanceReport)};
  }
  if(location.hash==='#reports')requestAnimationFrame(enhanceReport);
})();
