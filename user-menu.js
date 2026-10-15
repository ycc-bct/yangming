// 右上角 YM：點開選單 → 登出（清掉登入狀態，回到登入頁）
(()=>{
 const trigger=document.getElementById('userMenuTrigger'),menu=document.getElementById('userMenu'),logout=document.getElementById('logoutBtn');
 if(!trigger||!menu)return;
 const open=o=>{menu.hidden=!o;trigger.setAttribute('aria-expanded',String(o))};
 trigger.addEventListener('click',e=>{e.stopPropagation();open(menu.hidden)});
 document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target))open(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){open(false);trigger.focus()}});
 logout.addEventListener('click',()=>{
  try{sessionStorage.removeItem('gv-auth');sessionStorage.removeItem('gv-intro')}catch(e){}
  location.replace('index.html'); // 重新載入：嵌入畫面會先顯示登入頁
 });
})();
