/* P0 risk registry: one place for signal values, thresholds, data dates and route triggers.
   Values still come from the existing presentation series (visual reconstructions, not live feeds).
   Thresholds are PROVISIONAL until the business confirms them; change them only here. */
const RISK_STALE_DAYS=60;
const RISK_THRESHOLDS_PROVISIONAL=true;
const RISK_STATUS={act:{label:'行動',rank:3},watch:{label:'觀察',rank:2},normal:{label:'正常',rank:1},info:{label:'未設門檻',rank:0}};

const RISK_SIGNALS={
 'safety.hormuz':{name:'荷莫茲封鎖事件市場機率',unit:'%',asOf:'2026-03',source:'Polymarket（簡報圖表重建）',
  value:()=>HORMUZ_ODDS.at(-1)[1],compare:()=>({label:'期初',value:HORMUZ_ODDS[0][1]}),thresholds:{watch:30,act:60},range:[0,100]},
 'safety.timeline':{name:'預警時間軸',asOf:'2026-03',source:'簡報預警時間軸'},
 'policy.tpu':{name:'全球貿易政策不確定性 MA7',unit:'指數',asOf:'2026-05',source:'TPU 指數（簡報圖表重建）',
  value:()=>TPU_MA7.at(-1),compare:()=>({label:'圖示高點',value:Math.max(...TPU_MA7)}),thresholds:{watch:200,act:500},range:[0,1200]},
 'policy.imports':{name:'美國商品進口結構',asOf:'2026-03',source:'美國進口分類（簡報圖表重建）'},
 'fuel.ovx':{name:'原油波動率 OVX',unit:'指數',asOf:'2026-04',source:'CBOE OVX（簡報圖表重建）',
  value:()=>OVX_WEEKS.ovx.at(-1),compare:()=>({label:'期初',value:OVX_WEEKS.ovx[0]}),thresholds:{watch:50,act:80},range:[0,150]},
 'fuel.crack':{name:'380cst − Brent 裂解價差（近月）',unit:'美元／桶',asOf:'2026-04',source:'新加坡燃料油（簡報圖表重建）',
  value:()=>CRACK.near.at(-1),compare:()=>({label:'圖示高點',value:Math.max(...CRACK.near)}),thresholds:{watch:0,act:5},range:[-10,20]},
 'ports.occurred':{name:'已發生事件',unit:'件',asOf:'2026-04',source:'Shipping Related Developments 2026',
  value:scope=>(scope.entries||PORT_EVENTS).filter(e=>e.status==='已發生').length,thresholds:{watch:1,act:3},range:[0,8]},
 'ports.ongoing':{name:'常態化／前瞻預警',unit:'件',asOf:'2026-04',source:'Shipping Related Developments 2026',
  value:scope=>(scope.entries||PORT_EVENTS).filter(e=>e.status!=='已發生').length},
 'countries.highRisk':{name:'高風險地區',unit:'國',asOf:null,source:'CRR／SRR 評級（評等日期未標示）',
  value:scope=>{const high=highRiskCountryRows();return (scope.countryRows||COUNTRY_ROWS).filter(c=>high.includes(c)).length},thresholds:{watch:1,act:2},range:[0,7]},
 'countries.ratings':{name:'國家與產業評級',unit:'國',asOf:null,source:'CRR／SRR 評級（評等日期未標示）',
  value:scope=>(scope.countryRows||COUNTRY_ROWS).length}
};
const RISK_TOPIC_SIGNALS={safety:['safety.hormuz','safety.timeline'],policy:['policy.tpu','policy.imports'],fuel:['fuel.ovx','fuel.crack'],ports:['ports.occurred','ports.ongoing'],countries:['countries.highRisk','countries.ratings']};

/* Route triggers, keyed topic|routeIndex. checks = need a person to confirm (shown on screen).
   data = proxy signal mappings inferred during P0; NOT shown until the business confirms mappings and thresholds. */
const RISK_TRIGGERS={
 'safety|0':{data:[],checks:['紅海／曼德航安通告顯示通行受限','限制超出船期與承保容許範圍']},
 'safety|2':{data:[{signal:'safety.hormuz',level:'act'}],checks:['替代港與陸運具可用容量']},
 'policy|3':{data:[{signal:'policy.tpu',level:'watch'}],checks:['政策窗口前訂艙增加','到港時間有明確需求']},
 'policy|4':{data:[],checks:['美東交付窗口或運河預約無法配合出貨集中期']},
 'policy|0':{data:[{signal:'policy.tpu',level:'watch'}],checks:['跨市場訂艙顯示需求轉移']},
 'fuel|0':{data:[{signal:'fuel.ovx',level:'watch'},{signal:'fuel.crack',level:'watch'}],checks:['已確認兩案航程與燃油報價']},
 'fuel|1':{data:[],checks:['航安、保險及合約限制均允許恢復通行']},
 'ports|0':{data:[{events:{area:'歐洲',status:'已發生'},label:'歐洲已發生事件 ≥ 1 件'}],checks:['事件影響既定到港窗口']},
 'ports|3':{data:[{events:{country:'墨西哥',status:'已發生'},label:'墨西哥已發生事件 ≥ 1 件'}],checks:['事件影響既定交付']},
 'ports|5':{data:[{events:{route:5,status:'已發生'},label:'南美西岸已發生事件 ≥ 1 件'}],checks:['替代港具可用容量與內陸連接']},
 'countries|5':{data:[{signal:'countries.highRisk',level:'watch'}],checks:['目的港實際條件影響商業目標']},
 'countries|3':{data:[],checks:['跨境需求支持北美延伸']},
 'countries|4':{data:[],checks:['港口與接駁容量符合轉運需求']}
};

function riskFreshness(asOf){
 if(!asOf)return {state:'unknown',label:'資料日期未標示'};
 const [y,m]=asOf.split('-').map(Number),end=new Date(y,m,0),days=Math.max(0,Math.floor((Date.now()-end)/864e5));
 return {state:days>RISK_STALE_DAYS?'stale':'fresh',days,label:'資料截至 '+y+'/'+m};
}
function riskStatusOf(value,t){if(!t||value==null)return 'info';return value>=t.act?'act':value>=t.watch?'watch':'normal'}
function riskSignal(id,scope={}){
 const def=RISK_SIGNALS[id],value=def.value?def.value(scope):null,compare=def.compare?def.compare():null;
 return {id,...def,value,compare,status:riskStatusOf(value,def.thresholds),freshness:riskFreshness(def.asOf)};
}
function riskWorstFreshness(list){
 const order={unknown:3,stale:2,fresh:1};
 return list.reduce((w,f)=>!w||order[f.state]>order[w.state]||(f.state===w.state&&(f.days||0)>(w.days||0))?f:w,null);
}
function riskTopicStatus(topic,scope={}){
 const signals=RISK_TOPIC_SIGNALS[topic].map(id=>riskSignal(id,scope));
 const status=signals.reduce((s,x)=>RISK_STATUS[x.status].rank>RISK_STATUS[s].rank?x.status:s,'info');
 return {status,signals,freshness:riskWorstFreshness(signals.map(s=>s.freshness))};
}
function riskEventCount(f){return PORT_EVENTS.filter(e=>Object.entries(f).every(([k,v])=>e[k]===v)).length}
function riskTriggerState(topic,index){
 const def=RISK_TRIGGERS[topic+'|'+index]||{data:[],checks:[]};
 const data=def.data.map(d=>{
  if(d.events){const n=riskEventCount(d.events);return {label:d.label,met:n>=1,current:n+' 件',freshness:riskFreshness(RISK_SIGNALS['ports.occurred'].asOf)}}
  const s=riskSignal(d.signal),need=s.thresholds[d.level];
  return {label:s.name+' ≥ '+RISK_STATUS[d.level].label+'門檻 '+riskFormat(need,s.unit),met:RISK_STATUS[s.status].rank>=RISK_STATUS[d.level].rank,current:riskFormat(s.value,s.unit),freshness:s.freshness};
 });
 return {data,checks:def.checks,met:data.filter(d=>d.met).length};
}
function riskFormat(v,unit){if(v==null)return '—';return unit==='%'?v+'%':v+(unit?' '+unit:'')}
function riskDelta(s){if(!s.compare||s.value==null)return '';const d=s.value-s.compare.value;return '較'+s.compare.label+' '+(d>0?'+':d<0?'−':'±')+Math.abs(d)+(s.unit==='%'?' 個百分點':'')}

/* Markup helpers shared by topic pages and the overview. */
function riskStatusBadge(status){return `<span class="risk-status risk-status-${status}">${RISK_STATUS[status].label}</span>`}
function riskFreshnessTag(f){
 const text=f.state==='stale'?f.label+' · 已逾 '+f.days+' 天':f.label;
 return `<span class="risk-freshness risk-freshness-${f.state}">${f.state==='fresh'?'':'⚠ '}${escapeHTML(text)}</span>`;
}
function riskBullet(s){
 if(!s.thresholds||!s.range)return '';
 const [lo,hi]=s.range,pct=v=>Math.min(100,Math.max(0,(v-lo)/(hi-lo)*100)),w=pct(s.thresholds.watch),a=pct(s.thresholds.act);
 return `<div class="risk-bullet" role="img" aria-label="${escapeHTML(s.name)}：目前 ${escapeHTML(riskFormat(s.value,s.unit))}，觀察門檻 ${escapeHTML(riskFormat(s.thresholds.watch,s.unit))}，行動門檻 ${escapeHTML(riskFormat(s.thresholds.act,s.unit))}"><i class="zone-normal" style="width:${w}%"></i><i class="zone-watch" style="width:${a-w}%"></i><i class="zone-act" style="width:${100-a}%"></i><b style="left:${pct(s.value)}%"></b></div>`;
}

/* Route advice visuals. impacts restate each tradeoff sentence as glyph chips:
   up = 增加, down = 降低, same = 維持, eval = 需評估 (the sentence gives no direction). */
const RISK_ROUTE_VISUAL={
 'safety|0':{alt:1,impacts:[['航程','up'],['燃油','up'],['運力占用','up'],['紅海曝險','down']]},
 'safety|2':{impacts:[['港費','eval'],['陸運費','eval'],['交付能力','eval']]},
 'policy|3':{impacts:[['海路','same'],['加班船','up'],['閒置運力','up']]},
 'policy|4':{impacts:[['轉運等待','up'],['轉運港容量','eval'],['接駁班次','eval']]},
 'policy|0':{impacts:[['紅海航安','eval'],['備援成本','up']]},
 'fuel|0':{alt:1,impacts:[['耗油','down'],['航道風險','up']]},
 'fuel|1':{alt:0,impacts:[['燃油成本','down'],['航段曝險','up']]},
 'ports|0':{alt:1,impacts:[['航程','eval'],['內陸運輸','eval'],['費用','eval']]},
 'ports|3':{impacts:[['海路','same'],['跨境流程','eval'],['資金週轉','eval']]},
 'ports|5':{impacts:[['港費','eval'],['內陸距離','eval'],['時程','eval']]},
 'countries|5':{impacts:[['內陸成本','eval'],['付款風險','eval'],['收益','eval']]},
 'countries|3':{impacts:[['海路','same'],['跨境交付','eval']]},
 'countries|4':{impacts:[['運河預約','eval'],['轉運費用','eval'],['接駁時程','eval']]}
};
const RISK_IMPACT_GLYPH={up:['▲','增加'],down:['▼','降低'],same:['─','維持'],eval:['◇','需評估']};
