/* Supply trusted, self-hosted fonts as data URLs to the network-isolated report. */
(function(){
 const root=new URL('./',document.baseURI),cache=new Map();let rulesPromise;
 function ranges(rule){const match=rule.match(/unicode-range:([^;}]+)/);if(!match)return null;return match[1].split(',').map(value=>{const token=value.trim().replace(/^U\+/i,'');if(token.includes('?'))return [parseInt(token.replace(/\?/g,'0'),16),parseInt(token.replace(/\?/g,'F'),16)];const parts=token.split('-');return [parseInt(parts[0],16),parseInt(parts[1]||parts[0],16)]})}
 function encode(bytes){let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary)}
 async function font(url){if(!cache.has(url))cache.set(url,fetch(url).then(response=>{if(!response.ok)throw Error('Font unavailable');return response.arrayBuffer()}).then(buffer=>'data:font/'+(url.endsWith('.ttf')?'ttf':'woff2')+';base64,'+encode(new Uint8Array(buffer))));return cache.get(url)}
 window.ReportFonts={async inlineFor(html){
  rulesPromise??=fetch(new URL('fonts.css',root)).then(response=>{if(!response.ok)throw Error('Fonts unavailable');return response.text()}).then(css=>css.match(/@font-face\s*\{[^}]+\}/g)||[]);
  const points=[...new Set(Array.from(html).map(character=>character.codePointAt(0)))];
  const rules=(await rulesPromise).filter(rule=>{const spans=ranges(rule);return !spans||points.some(point=>spans.some(([lo,hi])=>point>=lo&&point<=hi))});
  const output=await Promise.all(rules.map(async rule=>{const source=rule.match(/url\(([^)]+)\)/);if(!source)return '';const url=new URL(source[1],root);if(!['assets/inter-','reference-graph/assets/noto-sans-tc-'].some(path=>url.href.startsWith(new URL(path,root).href)))return '';return rule.replace(source[1],await font(url.href))}));
  return output.join('\n');
 }};
})();
