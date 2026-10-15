// Design system 安全網：任何算出來小於 12px 的文字（含 SVG 刻度）拉到 12px。
// 真正的字級請在 CSS 用 --ym-fs-* 設定；這裡只是避免舊樣式漏網。
(()=>{
 const MIN=12;
 function floor(root){root.querySelectorAll('*').forEach(el=>{if(el.children.length&&!el.matches('text'))return;const fs=parseFloat(getComputedStyle(el).fontSize);if(fs&&fs<MIN){el.style.fontSize=MIN+'px';el.dataset.ymFloor=fs}})}
 const run=()=>floor(document.body);
 run();
 if(typeof renderPage==='function'){const prev=renderPage;renderPage=function(page){prev(page);run()}}
 new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)floor(n)}).observe(document.body,{childList:true,subtree:true});
})();

// 全球態勢（首頁）不該有第二層主題導覽：shell-layout 會把隱藏頁面裡的 .topic-nav 搬到槽位，這裡在首頁時收起來。
(()=>{
 const fix=()=>{if(typeof currentPage==='undefined'||currentPage!=='overview')return;const slot=document.getElementById('topicNavSlot');if(slot)slot.hidden=true;document.body.classList.remove('has-topic-nav','has-risk-workspace')};
 if(typeof renderPage==='function'){const prev=renderPage;renderPage=function(page){prev(page);fix()}}
 fix();
})();
