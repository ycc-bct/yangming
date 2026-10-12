// Appended inside the reference module before producing graph-app.js.
// Use only the reference's existing nodes and edges for topic highlighting.
const ymTopicSeeds={
 safety:['ev-hormuz-warning','ev-retaliation','ev-war','hormuz-close-prob','asia-eu-transit'],
 fuel:['ovx','wti','crack-380cst','ev-uae-opec'],
 policy:['ev-tariff-exempt','ev-pullforward','ev-base-tariff','ev-us-temp-tariff','ev-china-port-fee','trade-policy-uncertainty','us-goods-imports'],
 ports:['ev-chile-fire','ev-mexico-security','ev-brazil-flood','ev-nl-rail','ev-cbam'],
 countries:dt.filter(node=>node.type==='country').map(node=>node.id)
};
window.addEventListener('message',event=>{
 if(event.source!==window.parent||event.data?.type!=='ym:focus-topic')return;
 const topic=event.data.topic;
 if(topic!=='all'&&!Object.prototype.hasOwnProperty.call(ymTopicSeeds,topic))return;
 const seeds=new Set((ymTopicSeeds[topic]||[]).filter(id=>pt.has(id)));
 const related=new Set(seeds);
 for(const edge of ft){
  if(seeds.has(edge.source)||seeds.has(edge.target)){
   related.add(edge.source);related.add(edge.target);
  }
 }
 Vt.getState().set({screen:'graph',selection:null,highlightIds:[...related],panelOpen:false});
 window.dispatchEvent(new Event('ym:graph-reset'));
 const canvas=document.querySelector('.graph-canvas');
 if(canvas){
  let label=canvas.querySelector('.ym-topic-focus');
  if(!label){label=document.createElement('span');label.className='ym-topic-focus';label.setAttribute('role','status');canvas.appendChild(label);}
  const names={safety:'航道安全',fuel:'燃油成本',policy:'政策與關稅',ports:'港口與內陸',countries:'國家風險'};
  label.textContent=topic==='all'?'全部訊號':names[topic]+' · '+seeds.size+' 個核心節點';
 }
});
