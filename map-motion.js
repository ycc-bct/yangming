/* Decorative route motion: vessel positions illustrate the trade lanes, not AIS. */
const MapMotion=(()=>{
 const paths=new WeakMap();
 function sample(path,t){let entry=paths.get(path);if(!entry){let previous=null,total=0;const points=path.map(([lon,lat])=>{let x=lon;if(previous!==null){while(x-previous>180)x-=360;while(x-previous< -180)x+=360}previous=x;return [x,lat]});const lengths=[0];for(let i=1;i<points.length;i++){total+=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);lengths.push(total)}entry={points,lengths,total};paths.set(path,entry)}const distance=t*entry.total;let i=1;while(i<entry.lengths.length-1&&entry.lengths[i]<distance)i++;const a=entry.points[i-1],b=entry.points[i],u=(distance-entry.lengths[i-1])/(entry.lengths[i]-entry.lengths[i-1]||1);return {lon:a[0]+(b[0]-a[0])*u,lat:a[1]+(b[1]-a[1])*u,angle:Math.atan2(-(b[1]-a[1]),b[0]-a[0])}}
 function ocean(c,w,h,time){const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#071319');g.addColorStop(.5,'#102c35');g.addColorStop(1,'#08151b');c.fillStyle=g;c.fillRect(0,0,w,h);c.save();for(let row=-10;row<h+10;row+=7){c.beginPath();for(let x=-10;x<w+10;x+=12){const y=row+Math.sin(x*.024+row*.037+time*.23)*2+Math.sin(x*.066-row*.029-time*.18)*.8;x===-10?c.moveTo(x,y):c.lineTo(x,y)}c.strokeStyle=row%3===0?'rgba(117,171,183,.13)':'rgba(117,171,183,.065)';c.lineWidth=.65;c.stroke()}c.restore()}
 function ship(c,x,y,angle,selected,time){c.save();c.translate(x,y);c.rotate(angle);const size=selected?1.15:.9;c.scale(size,size);
 // Split wake trails behind the stern; hull points along local +X.
 for(let k=0;k<3;k++){c.beginPath();c.moveTo(-13,0);c.quadraticCurveTo(-24,-3-k*2,-43,-7-k*2);c.moveTo(-13,0);c.quadraticCurveTo(-24,3+k*2,-43,7+k*2);c.strokeStyle=`rgba(198,228,230,${.13-k*.03})`;c.lineWidth=1;c.stroke()}
 c.shadowColor='#000b';c.shadowBlur=7;c.shadowOffsetY=3;c.beginPath();c.moveTo(21,0);c.bezierCurveTo(15,-7,10,-8,5,-8);c.lineTo(-15,-8);c.quadraticCurveTo(-19,-8,-19,-4);c.lineTo(-19,4);c.quadraticCurveTo(-19,8,-15,8);c.lineTo(5,8);c.bezierCurveTo(10,8,15,7,21,0);c.closePath();c.fillStyle='#d5dde0';c.fill();c.shadowBlur=0;c.shadowOffsetY=0;c.strokeStyle=selected?'#fff':'#7d9ca5';c.lineWidth=.8;c.stroke();
 c.fillStyle='#273c44';c.fillRect(-15,-6,24,12);
 const colors=['#b8493d','#e8b56a','#819ca9','#d8e0db','#9d382f'];for(let i=0;i<5;i++)for(let j=0;j<3;j++){c.fillStyle=colors[(i+j)%colors.length];c.fillRect(-7+i*3.4,-5.5+j*3.8,2.8,3.1);c.fillStyle='#ffffff28';c.fillRect(-7+i*3.4,-5.5+j*3.8,.6,3.1)}
 c.fillStyle='#eff3f2';c.fillRect(-15,-6,6,12);c.fillStyle='#364c57';c.fillRect(-14,-4.5,2,9);c.strokeStyle='#c7d6d8';c.lineWidth=.7;c.beginPath();c.moveTo(13,0);c.lineTo(18,0);c.moveTo(13,-3);c.lineTo(13,3);c.stroke();c.restore();
 }
 function vessels(c,routes,selected,time,project,width,height,worldWidth){routes.forEach((r,i)=>{const t=(time/(80+i*7)+.16+i*.127)%1,p=sample(r.path,t),point=project(p.lon,p.lat);for(const offset of [-worldWidth,0,worldWidth]){const x=point[0]+offset,y=point[1];if(x< -45||x>width+45||y<45||y>height-35)continue;ship(c,x,y,p.angle,i===selected,time)}})}
 return {ocean,vessels,sample};
})();
