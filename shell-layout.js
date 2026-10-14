(()=>{
 function syncShell(){
  const slot=document.querySelector('#topicNavSlot'),content=document.querySelector('#pageContent'),nav=content.querySelector('.topic-nav');
  slot.replaceChildren();
  const isRisk=Boolean(nav&&['intelligence','safety','policy','fuel','ports','countries'].includes(currentPage));
  if(isRisk){
   content.querySelector('.page-breadcrumb')?.remove();
   content.querySelector('.page-title>a[href="#overview"]')?.remove();
   const title=content.querySelector('.page-title'),description=title?.querySelector('p');
   if(description){description.classList.add('risk-topic-description');title.replaceWith(description)}else{title?.remove()}
   const workspace=document.createElement('div'),radar=document.createElement('aside'),main=document.createElement('div');
   workspace.className='risk-workspace';radar.className='risk-radar-panel';main.className='risk-workspace-main';
   radar.setAttribute('aria-label','五類風險雷達');radar.innerHTML=renderRiskRadar(currentPage);
   main.append(nav);while(content.firstChild)main.append(content.firstChild);
   workspace.append(radar,main);content.append(workspace);bindRiskRadar(radar);
  }else if(nav){slot.append(nav)}
  slot.hidden=!nav||isRisk;
  document.body.classList.toggle('has-topic-nav',Boolean(nav&&!isRisk));
  document.body.classList.toggle('has-risk-workspace',isRisk);
  requestAnimationFrame(resize);
 }
 const beforeShellRender=renderPage;renderPage=function(page){radarMotionCleanup();beforeShellRender(page);syncShell()};syncShell();
})();
