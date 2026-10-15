// 風險情報：把訊號動態與可討論選項放到各主題頁（全部）和情報總覽的主題卡（最新 2 則 + 1 條選項）。
// 資料來源 signals.js（與全球態勢共用同一份）。
(()=>{
 const S=window.YM_SIGNALS;if(!S)return;
 const CAT={safety:'航道安全',policy:'政策與關稅',fuel:'燃油成本',ports:'港口與內陸',countries:'國家風險'};
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const feedOf=cat=>S.feed.filter(f=>f.cat===cat).sort((a,b)=>a.date<b.date?1:-1);
 const item=f=>`<li class="sig-item"><span class="sig-meta num">${esc(f.date)}<span class="sig-cat">${esc(f.cat)}</span>${f.kind?`<span class="sig-kind t-${esc(f.kindType)}"><i></i>${esc(f.kind)}</span>`:''}</span><span class="sig-title">${esc(f.title)}</span></li>`;
 function topicSections(key){
  const cat=CAT[key],feed=feedOf(cat),opts=S.options[cat]||[];
  // Janet 的主題頁已有「訊號動態」卡，這裡只補「可討論選項」。
  void feed;
  return `<div class="page-grid signal-grid"><section class="page-card"><div class="page-card-head"><h2>可討論選項</h2></div><ul class="opt-list">${opts.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></section></div>`;
 }
 function apply(){
  const page=typeof currentPage==='undefined'?'':currentPage,root=document.getElementById('pageContent');if(!root)return;
  root.querySelectorAll('.page-card-head > span').forEach(sp=>{if(/^\s*\d+\s*則\s*$/.test(sp.textContent))sp.remove()});
  if(CAT[page]&&!root.querySelector('.signal-grid')){
   const host=root.querySelector('.risk-workspace-main')||root;host.insertAdjacentHTML('beforeend',topicSections(page));
  }
  // 情報總覽的五張卡維持 Janet 的版本（不插入最新訊號），訊號動態只放在各主題頁。
 }
 // 主題頁的「訊號動態」卡改用和首頁一樣的列：日期 · 主題（含圖示）… 右側物件類型；標題獨立一行。
 if(typeof riskFeedList==='function'){
  const CATKEY={safety:'航道安全',policy:'政策與關稅',fuel:'燃油成本',ports:'港口與內陸',countries:'國家風險'};
  riskFeedList=function(key){const items=feedOf(CATKEY[key]||'');return items.length?`<ul class="sig-list">${items.map(item).join('')}</ul>`:'<p class="risk-scope-note">目前沒有此主題的訊號。</p>'};
 }
 if(typeof renderPage==='function'){const prev=renderPage;renderPage=function(page){prev(page);apply()}}
 apply();
})();
