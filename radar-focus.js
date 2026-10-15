// 航海風險雷達：目前主題（或滑到的主題）保持亮，其他主題的色段、訊號點、軸標退暗——和首頁的風險雷達一致。
(()=>{
 const TOPICS=()=>(typeof RISK_RADAR_TOPICS!=='undefined'?RISK_RADAR_TOPICS.map(t=>t.key):['safety','policy','fuel','ports','countries']);
 let hover=null;
 function apply(){
  const root=document.querySelector('.risk-radar-panel');if(!root)return;
  const keys=TOPICS(),page=typeof currentPage==='undefined'?'':currentPage;
  const focus=hover||(keys.includes(page)?page:null);
  root.classList.toggle('radar-focus',!!focus);
  root.querySelectorAll('.radar-status-arc').forEach((a,i)=>{a.classList.toggle('is-dim',!!focus&&keys[i]!==focus);a.classList.toggle('is-focus',keys[i]===focus)});
  root.querySelectorAll('[data-radar-topic]').forEach(el=>{el.classList.toggle('is-dim',!!focus&&el.dataset.radarTopic!==focus)});
 }
 // 游標在圓內的哪一個扇區（依 RISK_RADAR_TOPICS 的角度，每區 ±36°）；圓外回傳 null
 function sectorAt(svg,e){const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const m=svg.getScreenCTM();if(!m)return null;const q=pt.matrixTransform(m.inverse());const dx=q.x-320,dy=q.y-320;if(Math.hypot(dx,dy)>262)return null;const a=Math.atan2(dy,dx)*180/Math.PI;const topics=typeof RISK_RADAR_TOPICS!=='undefined'?RISK_RADAR_TOPICS:[];let best=null,bd=999;topics.forEach(t=>{let d=Math.abs(((a-t.angle)%360+540)%360-180);if(d<bd){bd=d;best=t.key}});return bd<=36?best:null}
 function bind(){
  const root=document.querySelector('.risk-radar-panel');if(!root||root.dataset.focusBound)return;root.dataset.focusBound='1';
  root.addEventListener('mouseover',e=>{const t=e.target.closest('[data-radar-topic]');if(t&&t.dataset.radarTopic!==hover){hover=t.dataset.radarTopic;apply()}});
  // anywhere inside the ring counts as that sector (not only the label or the signal dots)
  root.addEventListener('mousemove',e=>{if(e.target.closest('[data-radar-topic]'))return;const svg=e.target.closest('svg')||root.querySelector('svg');if(!svg)return;const k=sectorAt(svg,e);if(k!==hover){hover=k;apply()}svg.style.cursor=k?'pointer':''});
  root.addEventListener('click',e=>{if(e.target.closest('[data-radar-topic], a, button'))return;const svg=e.target.closest('svg')||root.querySelector('svg');const k=svg?sectorAt(svg,e):null;if(typeof navigatePage!=='function')return;
   if(k)navigatePage(k);                                   // inside a sector → that topic
   else if(typeof currentPage!=='undefined'&&currentPage!=='intelligence')navigatePage('intelligence'); // elsewhere on the card → back to 情報總覽
  });
  root.addEventListener('mouseleave',()=>{hover=null;apply()});
 }
 // 軸標字級：SVG 會隨面板縮放，依實際縮放比例換算，讓五個主題名稱畫面上和標題「航海風險雷達」一樣大（14px）。
 function sizeLabels(){const p=document.querySelector('.risk-radar-panel');const t=p&&p.querySelector('.radar-topic-label text');if(!t)return;const svg=t.ownerSVGElement;const h=p.querySelector('h2');const target=h?parseFloat(getComputedStyle(h).fontSize):14;
  // layout width (not the screen CTM): the panel scales in on entry and a transform would skew the ratio
  const vb=(svg.getAttribute('viewBox')||'0 0 640 640').split(/\s+/).map(Number),k=(svg.clientWidth||svg.getBoundingClientRect().width)/(vb[2]||640);if(!k)return;
  const fs=(target/k).toFixed(2)+'px';p.style.setProperty('--radar-label-fs',fs);
  // set it on each label directly too (inline, !important) so no stylesheet or font-floor pass can override it
  p.querySelectorAll('.radar-topic-label text').forEach(x=>{x.style.setProperty('font-size',fs,'important');delete x.dataset.ymFloor})}
 const sizeSoon=()=>{sizeLabels();setTimeout(sizeLabels,350);setTimeout(sizeLabels,900)};
 const run=()=>{bind();apply();sizeSoon();watch()};
 let rz=0;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(sizeLabels,150)});
 // the panel's size also changes when the layout settles (fonts, scrollbars, sidebar): follow it, not only the window
 const ro=new ResizeObserver(()=>sizeLabels());const watch=()=>{const p=document.querySelector('.risk-radar-panel');if(p)ro.observe(p)};watch();
 if(typeof renderPage==='function'){const prev=renderPage;renderPage=function(page){prev(page);hover=null;run()}}
 run();
 new MutationObserver(()=>run()).observe(document.getElementById('pageContent')||document.body,{childList:true,subtree:false});
})();
