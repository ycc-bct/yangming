/* 航線方案評估 views 方案比較 and 地圖 (風險網路 is route-network.js). Wording follows 全球態勢／風險情報.
   Data: A/B days and fuel from assessment.js (draftFor), route chokepoints and their levels from risk-shared.js
   (global view rule), topic levels from the shared risk lights. Leg days are estimated from route distance.
   Business inputs (war-risk premium, judgement) come from RISK_SHARED.decisions and are simply not shown until set. */
(()=>{
 const RANK={crit:4,high:3,mid:2,low:1,none:0},BAR={crit:100,high:80,mid:55,low:28,none:8};
 const ORDER=['safety','fuel','ports','countries','policy'];
 const CP=Object.fromEntries(RISK_SHARED.chokepoints.map(c=>[c.id,c]));
 const cpLevel=c=>{const r=RISK_SHARED.transitRule;return c.yoy<=r.crit?'crit':c.yoy<=r.high?'high':c.yoy<=r.mid?'mid':'low'};
 const altRoute=i=>{const p=assessmentCases[i].path;return p==null?i:p};
 // Route-level 航道安全: the worst chokepoint on the route (global view rule); no chokepoint = 低.
 function laneOf(r){const cps=(RISK_SHARED.routeChokepoints[r]||[]).map(id=>CP[id]);if(!cps.length)return {level:'low',worst:null,cps};const worst=cps.reduce((a,b)=>b.yoy<a.yoy?b:a);return {level:cpLevel(worst),worst,cps}}
 // Shared with route-network.js so 風險網路 and 方案比較 show the same route-level 航道安全.
 window.routeLaneLevel=r=>laneOf(r).level;
 window.routeTopicLevel=(r,k)=>k==='safety'?laneOf(r).level:riskTopicStatus(k).status;
 const levelsFor=r=>Object.fromEntries(ORDER.map(k=>[k,k==='safety'?laneOf(r).level:riskTopicStatus(k).status]));
 const ui={tab:'net',fuelPct:0,tolerance:12,prob:null,mapFocus:'both',cp:null};

 // ── 方案比較 ──
 function optionCard(i,which){
  const s=draftFor(i).s,c=assessmentCases[i],isB=which==='B',r=isB?altRoute(i):i,lane=laneOf(r),lv=levelsFor(r),lvA=levelsFor(i),war=RISK_SHARED.decisions[i]?.warRisk;
  const days=isB?s.altDays:s.days,fuel=(isB?s.altFuel:s.baseFuel)/10000,dDays=s.altDays-s.days,dFuel=s.baseFuel?Math.round((s.altFuel/s.baseFuel-1)*100):0;
  const sub=(v,unit,txt)=>isB?`<em class="rc-delta ${v>0?'is-up':v<0?'is-down':''}">${txt}</em>`:'<em class="rc-base">基準</em>';
  const path=lane.cps.length?lane.cps.map(x=>x.label).join(' → '):'不經主要咽喉點';
  const warTile=war?`<div><strong>${(isB?war.b:war.a).toFixed(1)}</strong><span>萬美元 · 戰爭險</span>${isB?sub(war.b-war.a,'',`${war.b>=war.a?'+':'−'}${Math.round(Math.abs(war.b/war.a-1)*100)}%`):sub()}</div>`:'';
  const bars=ORDER.map(k=>{const l=lv[k],d=isB&&RANK[l]!==RANK[lvA[k]]?(RANK[l]>RANK[lvA[k]]?' ↑':' ↓'):'';return `<li><span class="rc-topic">${TOPIC_LABELS[k]}</span><span class="rc-bar"><i class="bar-${l}" style="width:${BAR[l]}%"></i></span>${riskStatusBadge(l).replace('</span>',d+'</span>')}</li>`}).join('');
  const basis=[lane.worst?`${lane.worst.label}通行量年減 ${Math.abs(lane.worst.yoy)}%（${RISK_STATUS[lane.level].label}）`:'航線不經主要咽喉點，航道安全為低',isB?`航程 ${dDays>0?'+':dDays<0?'−':'±'}${Math.abs(dDays)} 天、燃油 ${dFuel>0?'+':''}${dFuel}%`:`燃油 ${fuel.toFixed(1)} 萬美元（航程 ${days} 天）`,isB?c.altTrade:c.baseTrade];
  return `<article class="rc-card${isB?' is-b':''}"><span class="rc-kicker">${isB?'B · 備援方案':'A · 原方案'}</span><h3>${escapeHTML(isB?c.alternative:routes[i].via)}</h3><p class="rc-path">${escapeHTML(path)}</p><div class="rc-metrics${war?'':' is-two'}"><div><strong>${days}</strong><span>天 · 航程</span>${sub(dDays,'天',`${dDays>0?'+':dDays<0?'−':'±'}${Math.abs(dDays)} 天`)}</div><div><strong>${fuel.toFixed(1)}</strong><span>萬美元 · 燃油</span>${sub(dFuel,'%',`${dFuel>0?'+':''}${dFuel}%`)}</div>${warTile}</div><h4>五類風險</h4><ul class="rc-bars">${bars}</ul><h4>主要依據</h4><ul class="rc-basis">${basis.map(b=>`<li>${escapeHTML(b)}</li>`).join('')}</ul></article>`;
 }
 function judgeFacts(i){
  const s=draftFor(i).s,d=s.altDays-s.days,fuel=(s.altFuel-s.baseFuel)/10000,a=laneOf(i),b=laneOf(altRoute(i));
  const tol=d<=ui.tolerance?`在交期容忍 ${ui.tolerance} 天內`:`超出交期容忍 ${ui.tolerance} 天`;
  return [`B 航程 ${d>0?'+':d<0?'−':'±'}${Math.abs(d)} 天，${tol}`,`B 燃油 ${fuel>=0?'+':'−'}${Math.abs(fuel).toFixed(1)} 萬美元`,`航道安全 A ${RISK_STATUS[a.level].label} → B ${RISK_STATUS[b.level].label}`];
 }
 function sidePanel(i){
  const dec=RISK_SHARED.decisions[i]||{},prob=ui.prob??HORMUZ_ODDS.at(-1)[1],j=dec.judgement;
  const slider=(id,label,min,max,step,val,fmt)=>`<label class="rc-slider"><span>${label}<b id="${id}Out">${fmt(val)}</b></span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
  return `<aside class="rc-side"><section class="rc-box"><h4>條件試算</h4>${slider('rcProb','荷莫茲封鎖機率（預測市場）',0,100,1,prob,v=>v+'%')}${slider('rcFuel','燃油價格變動',-30,50,5,ui.fuelPct,v=>(v>0?'+':'')+v+'%')}${slider('rcTol','交期容忍天數',0,30,1,ui.tolerance,v=>v+' 天')}</section><section class="rc-box rc-judge"><span class="rc-kicker">本次判讀</span>${j?`<h4>${escapeHTML(j.headline)}</h4><p>${escapeHTML(j.detail)}</p>`:''}<ul class="rc-facts">${judgeFacts(i).map(f=>`<li>${escapeHTML(f)}</li>`).join('')}</ul><div class="rc-actions"><button type="button" class="rc-btn" data-rc-record="base">記錄選擇 A</button><button type="button" class="rc-btn is-primary" data-rc-record="alt">記錄選擇 B</button></div><p class="rc-status" id="rcStatus" aria-live="polite"></p></section></aside>`;
 }
 function compareView(i){
  const c=assessmentCases[i];
  return `<div class="rc-head"><h2>${escapeHTML(c.question)}</h2><span>${escapeHTML(routes[i].name)} · 單航次</span></div><div class="rc-grid">${optionCard(i,'A')}${optionCard(i,'B')}${sidePanel(i)}</div>`;
 }

 // ── 地圖 ──
 const rad=d=>d*Math.PI/180,dist=([a,b],[c,d])=>{const x=Math.sin(rad(d-b)/2)**2+Math.cos(rad(b))*Math.cos(rad(d))*Math.sin(rad(c-a)/2)**2;return 2*Math.asin(Math.sqrt(x))};
 // Legs split at the route's chokepoints (nearest path point); days are the total days shared by leg distance.
 function legsFor(r,totalDays){
  const path=routes[r].path,cps=(RISK_SHARED.routeChokepoints[r]||[]).map(id=>CP[id]).map(c=>({c,idx:path.reduce((best,p,k)=>dist(p,c.lonlat)<dist(path[best],c.lonlat)?k:best,0)})).sort((a,b)=>a.idx-b.idx);
  const cut=[{name:'起運區域',idx:0}].concat(cps.map(x=>({name:x.c.label,idx:x.idx,cp:x.c})),[{name:'目的區域',idx:path.length-1}]);
  const seg=(a,b)=>{let d=0;for(let k=a;k<b;k++)d+=dist(path[k],path[k+1]);return d},lens=cut.slice(1).map((x,k)=>seg(cut[k].idx,x.idx)),sum=lens.reduce((a,b)=>a+b,0)||1;
  const raw=lens.map(l=>l/sum*totalDays),days=raw.map(Math.floor);let rest=totalDays-days.reduce((a,b)=>a+b,0);raw.map((v,k)=>[v-Math.floor(v),k]).sort((a,b)=>b[0]-a[0]).forEach(([,k])=>{if(rest>0){days[k]++;rest--}});
  return cut.slice(1).map((x,k)=>({from:cut[k].name,to:x.name,days:days[k],cp:x.cp||cut[k].cp||null}));
 }
 function mapView(i){
  const s=draftFor(i).s,b=altRoute(i),legsA=legsFor(i,s.days),legsB=b!==i?legsFor(b,s.altDays):[],rows=[];
  legsA.forEach(l=>rows.push({...l,a:l.days,b:null}));
  legsB.forEach(l=>{const same=rows.find(r=>r.from===l.from&&r.to===l.to);if(same)same.b=l.days;else rows.push({...l,a:null,b:l.days})});
  if(!ui.cp||!(RISK_SHARED.routeChokepoints[i]||[]).concat(RISK_SHARED.routeChokepoints[b]||[]).includes(ui.cp))ui.cp=laneOf(i).worst?.id||laneOf(b).worst?.id||null;
  const row=r=>{const lv=r.cp?cpLevel(r.cp):null;return `<tr${r.cp?` data-rc-cp="${r.cp.id}" tabindex="0"`:''} class="${r.cp&&r.cp.id===ui.cp?'is-on':''}"><td>${escapeHTML(r.from)} → ${escapeHTML(r.to)}</td><td>${r.a??'—'}</td><td>${r.b??'—'}</td><td>${lv?riskStatusBadge(lv)+'<span class="rc-cat">航道</span>':'<span class="rc-cat">—</span>'}</td></tr>`};
  const toggle=[['base','A '+routes[i].via],['alt','B '+assessmentCases[i].alternative],['both','兩案疊加']].map(([f,l])=>`<button type="button" data-rc-focus="${f}" aria-pressed="${ui.mapFocus===f}">${escapeHTML(l)}</button>`).join('');
  return `<div class="rm-grid"><section class="rm-map"><div class="rm-toggle" role="group" aria-label="地圖顯示">${toggle}</div><div id="rcMap">${assessmentMap(i,ui.mapFocus)}</div></section><aside class="rm-side"><section class="rc-box"><div class="rm-head"><h4>航段比較</h4><span>天數依航線距離估算</span></div><table class="rm-table"><thead><tr><th>航段</th><th>A</th><th>B</th><th>主要風險</th></tr></thead><tbody>${rows.map(row).join('')}<tr class="rm-total"><td>合計</td><td>${s.days}</td><td>${b!==i?s.altDays:'—'}</td><td></td></tr></tbody></table>${b===i?`<p class="rc-note">B「${escapeHTML(assessmentCases[i].alternative)}」不改變海上路徑。</p>`:''}</section><section class="rc-box" id="rmDetail">${cpDetail(i)}</section></aside></div>`;
 }
 function cpDetail(i){
  const c=CP[ui.cp];if(!c)return '<p class="rc-note">這條航線不經主要咽喉點。</p>';
  const lv=cpLevel(c),inA=(RISK_SHARED.routeChokepoints[i]||[]).includes(c.id),inB=(RISK_SHARED.routeChokepoints[altRoute(i)]||[]).includes(c.id)&&altRoute(i)!==i;
  const now=Math.round(c.base*(1+c.yoy/100)*10)/10;
  return `<h4>${escapeHTML(c.label)} ${riskStatusBadge(lv)}</h4><p>通行量 ${now} 艘/日，較基準 ${c.base} 年減 ${Math.abs(c.yoy)}%。${inA&&inB?'A、B 兩案都會經過。':inA?'A 方案經過此段；B 方案避開。':'僅 B 方案經過。'}</p>`;
 }

 window.routeViews=function(i,matrix){
  const tabs=[['net','風險網路'],['compare','方案比較'],['map','地圖']];
  const panel=(k,html)=>`<div class="rv-panel" data-rv-panel="${k}" ${ui.tab===k?'':'hidden'}>${html}</div>`;
  return `<section class="route-view"><div class="rv-head"><p class="rv-crumb">航線方案評估 <span aria-hidden="true">›</span> <b>${escapeHTML(routes[i].name)}・${escapeHTML(routes[i].via)}</b></p><div class="rv-tabs" role="tablist">${tabs.map(([k,l])=>`<button type="button" role="tab" data-rv-tab="${k}" aria-selected="${ui.tab===k}">${l}</button>`).join('')}</div></div>${panel('net',routeNetwork(i,matrix,'',''))}${panel('compare',compareView(i))}${panel('map',mapView(i))}</section>`;
 };

 window.bindRouteViews=function(){
  const root=document.querySelector('.route-view');if(!root)return;
  const i=+pageState.route||0;
  root.querySelectorAll('[data-rv-tab]').forEach(b=>b.onclick=()=>{ui.tab=b.dataset.rvTab;root.querySelectorAll('[data-rv-tab]').forEach(x=>x.setAttribute('aria-selected',x===b));root.querySelectorAll('[data-rv-panel]').forEach(p=>p.hidden=p.dataset.rvPanel!==ui.tab);if(ui.tab==='net'){window.bindRouteNetwork?.();dispatchEvent(new Event('resize'))}});
  const rerenderCompare=()=>{const p=root.querySelector('[data-rv-panel="compare"]');p.innerHTML=compareView(i);bindCompare()};
  const bindCompare=()=>{
   const prob=root.querySelector('#rcProb'),fuel=root.querySelector('#rcFuel'),tol=root.querySelector('#rcTol');
   prob.oninput=()=>{ui.prob=+prob.value;root.querySelector('#rcProbOut').textContent=prob.value+'%'};prob.onchange=rerenderCompare;
   tol.oninput=()=>{ui.tolerance=+tol.value;root.querySelector('#rcTolOut').textContent=tol.value+' 天'};tol.onchange=rerenderCompare;
   fuel.oninput=()=>{root.querySelector('#rcFuelOut').textContent=(+fuel.value>0?'+':'')+fuel.value+'%'};
   // Fuel price change feeds assessment.js's own 試算 form, so A/B numbers stay one state.
   fuel.onchange=()=>{ui.fuelPct=+fuel.value;const f=document.querySelector('#assessmentForm');if(f){f.price.value=Math.round(assessmentDefault(i).price*(1+ui.fuelPct/100));f.requestSubmit()}rerenderCompare();const m=root.querySelector('[data-rv-panel="map"]');m.innerHTML=mapView(i);bindMap()};
   // 記錄選擇 fills assessment.js's decision form.
   root.querySelectorAll('[data-rc-record]').forEach(b=>b.onclick=()=>{const f=document.querySelector('#assessmentDecisionForm');if(!f)return;f.querySelector(`input[value="${b.dataset.rcRecord}"]`).checked=true;f.querySelector('#assessmentReason').value=judgeFacts(i).join('；');f.requestSubmit();const ok=!document.querySelector('#assessmentReport').disabled;root.querySelector('#rcStatus').textContent=ok?`已記錄選擇 ${b.dataset.rcRecord==='alt'?'B':'A'}。`:'無法記錄，請重新試算後再試。'});
  };
  const bindMap=()=>{
   root.querySelectorAll('[data-rc-focus]').forEach(b=>b.onclick=()=>{ui.mapFocus=b.dataset.rcFocus;root.querySelectorAll('[data-rc-focus]').forEach(x=>x.setAttribute('aria-pressed',x===b));root.querySelector('#rcMap').innerHTML=assessmentMap(i,ui.mapFocus)});
   root.querySelectorAll('[data-rc-cp]').forEach(tr=>{const pick=()=>{ui.cp=tr.dataset.rcCp;root.querySelectorAll('[data-rc-cp]').forEach(x=>x.classList.toggle('is-on',x===tr));root.querySelector('#rmDetail').innerHTML=cpDetail(i)};tr.onclick=pick;tr.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}}});
  };
  bindCompare();bindMap();
  // 風險網路 fills the rest of the screen below the capsules and tabs.
  const fit=()=>{const net=root.querySelector('.rv-panel>.risk-net'),pc=document.querySelector('#pageContent');if(!net||!document.body.contains(net))return removeEventListener('resize',fit);if(innerWidth<=1000){net.style.minHeight='';return}const top=net.getBoundingClientRect().top-pc.getBoundingClientRect().top,pad=parseFloat(getComputedStyle(pc).paddingBottom)||0;net.style.minHeight=Math.max(480,Math.floor(pc.clientHeight-top-pad))+'px'};
  fit();requestAnimationFrame(fit);document.fonts?.ready.then(fit);addEventListener('resize',fit);
 };
})();
