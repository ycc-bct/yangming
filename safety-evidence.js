/* 航道安全: ① 咽喉點通行量 (quantitative — the data behind the 危急 light) and ② 質化報告 (reports with lead time),
   placed before the prediction-market chart.
   Transit data: RISK_SHARED.chokepoints / hormuzTransits (same as 全球態勢, labelled 示意 there). */
(()=>{
 const LEVEL_OF=y=>{const r=RISK_SHARED.transitRule;return y<=r.crit?'crit':y<=r.high?'high':y<=r.mid?'mid':'low'};

 // Monthly Hormuz transits 2025-01 … 2026-06 against the same month a year earlier; ①②③ mark the reports and the war.
 function transitChart(){
  const t=RISK_SHARED.hormuzTransits,all=t.values,from=12,cur=all.slice(from),prev=all.slice(0,cur.length);
  const W=720,H=230,L=40,R=16,T=34,B=30,max=90,x=i=>L+i*(W-L-R)/(cur.length-1),y=v=>T+(1-v/max)*(H-T-B);
  const path=a=>a.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)).join('');
  const area=path(cur)+`L${x(cur.length-1).toFixed(1)} ${y(0)}L${x(0)} ${y(0)}Z`;
  const yoy=cur.map((v,i)=>Math.round((v/prev[i]-1)*100));
  const marks=[[3,'1','2025/4 報告警示'],[5,'2','2025/6 報告警示'],[13.9,'3','2026/2/28 戰爭爆發']];
  const grid=[0,30,60,90].map(v=>`<line class="tc-grid" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text class="tc-axis" x="${L-8}" y="${y(v)+4}" text-anchor="end">${v}</text>`).join('');
  const ticks=[[0,'2025 年'],[3,'4 月'],[6,'7 月'],[9,'10 月'],[12,'2026 年'],[15,'4 月']].map(([i,l])=>`<text class="tc-axis" x="${x(i)}" y="${H-8}" text-anchor="middle">${l}</text>`).join('');
  const lines=marks.map(([i,n])=>`<line class="tc-mark" x1="${x(i)}" x2="${x(i)}" y1="${T-10}" y2="${y(0)}"/><circle class="tc-mark-dot" cx="${x(i)}" cy="${T-16}" r="9"/><text class="tc-mark-num" x="${x(i)}" y="${T-12}" text-anchor="middle">${n}</text>`).join('');
  const hollow=cur.map((v,i)=>yoy[i]<=RISK_SHARED.transitRule.high?`<circle class="tc-hit" cx="${x(i)}" cy="${y(v)}" r="4.5"><title>${2025+Math.floor(i/12)}/${i%12+1}：${v} 艘/日，年減 ${Math.abs(yoy[i])}%</title></circle>`:'').join('');
  return `<div class="tc-legend"><span><i class="tc-k-cur"></i>本期</span><span><i class="tc-k-prev"></i>去年同期</span><span><i class="tc-k-hit"></i>年減 30% 以上（高）</span></div><svg class="transit-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="荷莫茲海峽每月通行量，2025 年 1 月至 2026 年 6 月，本期與去年同期比較；2026 年 3 月起降至每日約 2 至 7 艘">${grid}${lines}<path class="tc-area" d="${area}"/><path class="tc-prev" d="${path(prev)}"/><path class="tc-cur" d="${path(cur)}"/>${hollow}<circle class="tc-end" cx="${x(cur.length-1)}" cy="${y(cur.at(-1))}" r="4"/><text class="tc-end-label" x="${x(cur.length-1)-6}" y="${y(cur.at(-1))-10}" text-anchor="end">${cur.at(-1)}</text>${ticks}</svg><ol class="tc-notes">${marks.map(([,n,l])=>`<li><b>${n}</b>${l}</li>`).join('')}</ol>`;
 }
 function chokepointTable(){
  const rows=RISK_SHARED.chokepoints.slice().sort((a,b)=>a.yoy-b.yoy).map(c=>{const now=Math.round(c.base*(1+c.yoy/100)*10)/10;return `<tr${c.id==='cp-hormuz'?' class="is-focus"':''}><th scope="row">${escapeHTML(c.label)}<small>${escapeHTML(c.coord)}</small></th><td>${now.toFixed(1)}</td><td>${c.base.toFixed(1)}</td><td>${c.yoy>0?'+':'−'}${Math.abs(c.yoy)}%</td><td>${riskStatusBadge(LEVEL_OF(c.yoy))}</td></tr>`}).join('');
  return `<div class="table-scroll"><table class="data-table chokepoint-table"><thead><tr><th>咽喉點</th><th>本期</th><th>基準</th><th>變動</th><th>風險</th></tr></thead><tbody>${rows}</tbody></table></div><p class="micro-note">艘／日；年減 10% 為中、30% 為高、80% 為危急（與全球態勢相同）。資料時點 ${RISK_SHARED.asOf}。</p>`;
 }
 // Reports first, data confirms later: months between each warning and the war (2026-02-28).
 function reportList(){
  const war=new Date(2026,1,28),months=d=>{const [y,m]=d.split('/').map(Number);return (war.getFullYear()-y)*12+(war.getMonth()+1-m)};
  return `<ul class="report-list">${SAFETY_CHART_EVENTS.map(e=>{const m=months(e.date.slice(0,7)),lead=m>0?`早約 ${m} 個月`:m===0?'事件':'事件後';const [yy,mm]=e.date.split('/');return `<li><time>${yy} 年 ${Number(mm)} 月</time><span class="report-body"><b>${escapeHTML(e.title)}</b><small>${escapeHTML(e.description)}</small></span><span class="report-lead${m>0?' is-lead':''}">${lead}</span></li>`}).join('')}</ul>`;
 }

 const baseSafety=renderSafety;
 renderSafety=function(){
  const cards=panel('咽喉點通行量',transitChart()+chokepointTable(),'荷莫茲海峽每月通行量 · 各咽喉點')+panel('質化報告',reportList(),'報告先警示，通行量隨後確認');
  return baseSafety().replace('<div class="safety-evidence-grid">',()=>'<div class="safety-evidence-grid">'+cards);
 };
})();
