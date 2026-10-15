/* Shared risk data, same as 全球態勢 (globalview) at its data time point.
   Source: globalview/assets/index-*.js — the risk-light rules (function computing 航道安全／燃油成本／政策與關稅／
   港口與內陸／國家風險 at t = 2026-06-30) and its 22-item signal feed. The global view is a compiled bundle with no
   exported data file, so this is a copy: when the colleague exports shared data (e.g. globalview/data/*.json),
   replace this file with a reader for it so both views keep one source.
   Levels use the global view's scale: crit 危急 · high 高 · mid 中 · low 低 · none 無訊號. */
const RISK_SHARED={
 asOf:'2026-06-30',
 lights:{
  safety:{level:'crit',line:'荷莫茲海峽通行量年減 97%',lead:'訊號提前 10 個月'},
  fuel:{level:'mid',line:'油價平穩，裂解價差近 3 個月最高 +4.5'},
  policy:{level:'none',line:'貿易政策不確定性 186，近三個月 −15%'},
  ports:{level:'low',line:'沒有進行中的災害事件'},
  countries:{level:'mid',line:'南美七國有 3 國評級在 DB5 以上'}
 },
 // Chokepoint transits (global view: chokepoints[].base / yoy anchors, level rule Je: ≤−80% 危急, ≤−30% 高, ≤−10% 中, else 低).
 // Values are the global view's labelled-illustrative series（咽喉點通行量（示意））. yoy = latest anchor on or before asOf.
 transitRule:{crit:-80,high:-30,mid:-10},
 chokepoints:[
  {id:'cp-hormuz',lonlat:[56.4,26.6],label:'荷莫茲海峽',coord:'26.6°N 56.4°E',base:76.7,yoy:-97},
  {id:'cp-bab',lonlat:[43.4,12.6],label:'曼德海峽',coord:'12.6°N 43.4°E',base:41.6,yoy:-43},
  {id:'cp-malacca',lonlat:[100.2,3.2],label:'麻六甲海峽',coord:'3.2°N 100.2°E',base:246.2,yoy:-14},
  {id:'cp-panama',lonlat:[-79.7,9.1],label:'巴拿馬運河',coord:'9.1°N 79.7°W',base:30.1,yoy:-8},
  {id:'cp-suez',lonlat:[32.55,30],label:'蘇伊士運河',coord:'30.0°N 32.6°E',base:39.8,yoy:-7},
  {id:'cp-taiwan',lonlat:[119.6,24.3],label:'台灣海峽',coord:'24.3°N 119.6°E',base:239,yoy:-5},
  {id:'cp-cape',lonlat:[18.5,-34.4],label:'好望角',coord:'34.4°S 18.5°E',base:92.7,yoy:-4}
 ],
 // Chokepoints each route passes (global view routes[].chokepoints; index = routes[] in app.js). Empty = no major chokepoint.
 routeChokepoints:{0:['cp-malacca','cp-bab','cp-suez'],1:['cp-malacca','cp-cape'],2:['cp-malacca','cp-hormuz'],3:[],4:['cp-panama'],5:[]},
 // Decision inputs for 方案比較 — TO BE PROVIDED BY THE BUSINESS (null = shown as 待業務提供):
 //   warRisk: war-risk premium per voyage in 萬美元 {a,b}; switchProb: blockade probability (%) below which A's total cost is lower than B;
 //   judgement: {headline, detail, recommend:'A'|'B'} for 本次判讀.
 decisions:{0:{warRisk:null,switchProb:null,judgement:null},1:{warRisk:null,switchProb:null,judgement:null},2:{warRisk:null,switchProb:null,judgement:null},3:{warRisk:null,switchProb:null,judgement:null},4:{warRisk:null,switchProb:null,judgement:null},5:{warRisk:null,switchProb:null,judgement:null}},
 // 荷莫茲海峽通行量, ships/day, monthly 2024-01 … 2026-06 (global view series hormuz-transits, 示意).
 hormuzTransits:{start:'2024-01',values:[76,75.5,75,74.5,74,73.5,74,74.5,74,73.5,73,72.5,72,71.5,71,70.5,70,69.5,70,69.5,69,68.5,68,67.5,66,56,7,2.3,2.3,2.3]},
 feed:[
  {date:'2026-06-10',type:'報告',topic:'countries',title:'阿根廷維持 DB6a，建議極度限制曝險'},
  {date:'2026-05-20',type:'數據',topic:'policy',title:'貿易政策不確定性回落至 180，近三個月 −40%'},
  {date:'2026-04-20',type:'數據',topic:'safety',title:'亞歐航程平均增加 12 天，繞行好望角常態化'},
  {date:'2026-04-15',type:'報告',topic:'countries',title:'德國下調供應展望，中東戰事致供應受限'},
  {date:'2026-03-25',type:'數據',topic:'safety',title:'曼德海峽通行量年減 35%，升為高'},
  {date:'2026-03-20',type:'公告',topic:'policy',title:'美國宣布臨時 10% 全球進口關稅'},
  {date:'2026-03-12',type:'數據',topic:'safety',title:'荷莫茲海峽通行量年減 90%，升為危急'},
  {date:'2026-03-10',type:'事件',topic:'ports',title:'巴西南部洪水與土石流，運輸中斷'},
  {date:'2026-03-05',type:'數據',topic:'fuel',title:'380cst 裂解價差轉正並升至 +15 美元/桶'},
  {date:'2026-03-03',type:'市場',topic:'safety',title:'預測市場：荷莫茲封鎖機率跳升至約 70%'},
  {date:'2026-02-28',type:'事件',topic:'safety',title:'以伊戰爭爆發，荷莫茲衝擊具體化'},
  {date:'2026-02-22',type:'事件',topic:'ports',title:'墨西哥治安事件，道路封鎖、港口短暫停擺'},
  {date:'2026-02-04',type:'數據',topic:'fuel',title:'OVX 原油波動率一週上升 25%，油價仍平穩'},
  {date:'2026-01-28',type:'市場',topic:'safety',title:'預測市場：荷莫茲年內封鎖機率升至 29%'},
  {date:'2026-01-18',type:'事件',topic:'ports',title:'智利中部野火，港口關閉或限制作業'},
  {date:'2026-01-01',type:'公告',topic:'ports',title:'歐盟 CBAM 正式實施，荷蘭為主要入口'},
  {date:'2025-12-15',type:'數據',topic:'fuel',title:'380cst 裂解價差三個月收窄 60%'},
  {date:'2025-06-20',type:'報告',topic:'safety',title:'國家風險報告：報復性攻擊可能波及商船航道'},
  {date:'2025-05-15',type:'公告',topic:'policy',title:'美方宣布中國建造船舶靠港收費措施'},
  {date:'2025-04-20',type:'報告',topic:'safety',title:'多國風險報告警示荷莫茲周邊擾動，成本可能上升'},
  {date:'2025-04-05',type:'公告',topic:'policy',title:'美國實施全面基準關稅 10%'},
  {date:'2025-03-20',type:'數據',topic:'policy',title:'美國商品進口月增 12%，提前拉貨訊號浮現'}
 ]
};
