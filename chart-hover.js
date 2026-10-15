// 圖表 hover：折線圖（lineChart / miniChart）十字線＋數值提示；散點、長條圖顯示提示框。
// 不改 Janet 的繪圖函式，只包一層記錄資料，再用事件委派處理滑鼠。
(()=>{
 const charts=new Map();let seq=0;
 const tag=(svg,id)=>svg.replace('<svg ',`<svg data-hover="${id}" `);
 // lineChart：記下座標設定，之後可由滑鼠位置反推資料點。
 const baseLine=lineChart;
 lineChart=function(o){const id='lc'+(++seq);const W=o.w||530,H=o.h||210,pl=34,pr=o.y2?38:12,top=12,bottom=H-26;charts.set(id,{kind:'line',o,W,H,pl,pr,top,bottom});return tag(baseLine(o),id)};
 const baseMini=miniChart;
 miniChart=function(values,color,label,gid){const id='mc'+(++seq);charts.set(id,{kind:'mini',values,color,label});return tag(baseMini(values,color,label,gid),id)};

 const tip=document.createElement('div');tip.className='chart-tip';tip.hidden=true;document.body.appendChild(tip);
 const show=(html,x,y)=>{tip.innerHTML=html;tip.hidden=false;const w=tip.offsetWidth,h=tip.offsetHeight;let left=x+14,topY=y+14;if(left+w>innerWidth-8)left=x-w-14;if(topY+h>innerHeight-8)topY=y-h-14;tip.style.left=left+'px';tip.style.top=topY+'px'};
 const hide=()=>{tip.hidden=true;document.querySelectorAll('g.hv').forEach(g=>g.remove())};
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const fmt=v=>Math.abs(v)>=100?Math.round(v):Math.round(v*10)/10;
 const svgPoint=(svg,e)=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())};
 const pad=n=>String(n).padStart(2,'0');
 // 由 x 軸刻度標籤推出該點的日期：把每個刻度解析成日期，在相鄰刻度間線性內插（刻度間距不一定均勻）。
 // 支援「M/D」「YY/M」「YYYY/M」「n 月」「n 月底」；解析不出就顯示第幾點。
 function tickDate(l){let m;if((m=/^(\d{4})\/(\d{1,2})$/.exec(l)))return {d:new Date(+m[1],+m[2]-1,1),day:false};if((m=/^(\d{2})\/(\d{1,2})$/.exec(l))&&+m[1]>=20)return {d:new Date(2000+ +m[1],+m[2]-1,1),day:false};if((m=/^(\d{1,2})\/(\d{1,2})$/.exec(l)))return {d:new Date(+m[1]>=9?2025:2026,+m[1]-1,+m[2]),day:true};if((m=/^(\d{1,2}) 月(底?)$/.exec(l)))return {d:new Date(+m[1]>=9?2025:2026,+m[1]-1,m[2]?28:1),day:false};return null}
 function xLabel(o,x){const t=(o.xTicks||[]).map(([v,l])=>({v,...(tickDate(l)||{})})).filter(k=>k.d);if(t.length<2)return `第 ${x+1} 點`;let a=t[0],b=t[1];for(let i=1;i<t.length;i++){if(x>=t[i-1].v){a=t[i-1];b=t[i]}}const f=(x-a.v)/(b.v-a.v||1),ms=a.d.getTime()+f*(b.d.getTime()-a.d.getTime()),d=new Date(ms);return `${d.getFullYear()}/${pad(d.getMonth()+1)}${a.day?'/'+pad(d.getDate()):''}`}
 const layer=(svg)=>{let g=svg.querySelector('g.hv');if(!g){g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','hv');svg.appendChild(g)}return g};

 function hoverLine(svg,c,e){const {o,W,pl,pr,top,bottom}=c,[x0,x1]=o.x,p=svgPoint(svg,e);if(p.x<pl-6||p.x>W-pr+6)return hide();const sx=v=>pl+(v-x0)/(x1-x0)*(W-pl-pr),sy=(v,ax)=>{const a=ax==='right'?o.y2:o;return bottom-(v-a.min)/(a.max-a.min)*(bottom-top)};
  // 以第一條序列的 x 為準，找最近的資料點。
  const xs=o.series[0].points.map(q=>q[0]);let i=0,bd=Infinity;xs.forEach((v,k)=>{const d=Math.abs(sx(v)-p.x);if(d<bd){bd=d;i=k}});const xv=xs[i];
  const rows=o.series.map(s=>{const q=s.points.find(q=>q[0]===xv)||s.points[Math.min(i,s.points.length-1)];return {s,q}}).filter(r=>r.q);
  const g=layer(svg);g.innerHTML=`<line x1="${sx(xv)}" x2="${sx(xv)}" y1="${top}" y2="${bottom}" stroke="#a1a1aa" stroke-dasharray="3 3"/>`+rows.map(({s,q})=>`<circle cx="${sx(q[0])}" cy="${sy(q[1],s.axis)}" r="4.5" fill="${s.color}" stroke="#101012" stroke-width="1.5"/>`).join('');
  show(`<small>${esc(xLabel(o,xv))}</small>`+rows.map(({s,q})=>`<div><i style="background:${s.color}"></i>${esc(s.name)}<b>${fmt(q[1])}${s.axis==='right'?'':(o.unit||'')}</b></div>`).join(''),e.clientX,e.clientY)}
 function hoverMini(svg,c,e){const {values,color,label}=c,n=values.length,min=Math.floor(Math.min(...values)/10)*10-10,max=Math.ceil(Math.max(...values)/10)*10+10,x=i=>28+i*232/(n-1),y=v=>70-(v-min)/(max-min)*56,p=svgPoint(svg,e);if(p.x<20||p.x>268)return hide();let i=Math.round((p.x-28)/232*(n-1));i=Math.max(0,Math.min(n-1,i));
  const g=layer(svg);g.innerHTML=`<line x1="${x(i)}" x2="${x(i)}" y1="14" y2="70" stroke="#a1a1aa" stroke-dasharray="3 3"/><circle cx="${x(i)}" cy="${y(values[i])}" r="4" fill="${color}" stroke="#101012" stroke-width="1.5"/>`;
  const diff=i?values[i]-values[i-1]:0;show(`<small>${esc(label)} · 第 ${i+1} 期${i===n-1?'（本期）':''}</small><div><i style="background:${color}"></i>數值<b>${fmt(values[i])}</b></div>${i?`<div><span class="muted">較前期</span><b class="${diff>0?'up':diff<0?'down':''}">${diff>0?'+':''}${fmt(diff)}</b></div>`:''}`,e.clientX,e.clientY)}

 document.addEventListener('mousemove',e=>{
  const t=e.target;
  // 散點／其他 SVG 元素：把原生 <title> 換成自訂提示框。
  const titled=t.closest&&t.closest('svg circle, svg rect, svg path');
  if(titled&&titled.closest('#pageContent')){const tt=titled.querySelector('title');if(tt){titled.dataset.tip=tt.textContent;tt.remove()}if(titled.dataset.tip){const [head,...rest]=titled.dataset.tip.split('：');return show(`<strong>${esc(head)}</strong>${rest.length?`<p>${esc(rest.join('：'))}</p>`:''}`,e.clientX,e.clientY)}}
  const svg=t.closest&&t.closest('svg[data-hover]');
  if(svg){const c=charts.get(svg.dataset.hover);if(!c)return;return c.kind==='line'?hoverLine(svg,c,e):hoverMini(svg,c,e)}
  const bar=t.closest&&t.closest('.intelligence-distribution>div');
  if(bar){return show(`<strong>${esc(bar.querySelector('span')?.textContent||'')}</strong><div>數量<b>${esc(bar.querySelector('b')?.textContent||'')}</b></div>`,e.clientX,e.clientY)}
  if(!tip.hidden)hide();
 });
 document.addEventListener('mouseleave',hide);document.addEventListener('scroll',hide,true);
 // 第一次載入的頁面是在包裝前畫的，重畫一次讓圖表帶上 hover。
 if(typeof renderPage==='function'&&typeof currentPage!=='undefined'&&currentPage!=='overview')renderPage(currentPage);
})();
