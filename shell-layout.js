(()=>{
 function syncShell(){const slot=document.querySelector('#topicNavSlot'),nav=document.querySelector('#pageContent .topic-nav');slot.replaceChildren();if(nav){slot.append(nav);document.querySelector('#pageContent .page-breadcrumb')?.remove();document.querySelector('#pageContent .page-title>a[href="#overview"]')?.remove();}slot.hidden=!nav;document.body.classList.toggle('has-topic-nav',Boolean(nav));requestAnimationFrame(resize)}
 const beforeShellRender=renderPage;renderPage=function(page){beforeShellRender(page);syncShell()};syncShell();
})();
