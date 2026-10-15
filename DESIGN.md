# Yang Ming UI foundation

The platform supports shipping risk analysis and route decisions. Readers move from the global route overview to risk evidence, compare route options, and produce a report URL. The user requests shadcn/ui styling, a black background with white text, red brand accents, Noto Sans TC for Traditional Chinese, and Inter for English and numbers.

## Principles

- Keep the existing information architecture and graph interactions. The strategic overview retains its full viewport layout; data pages can scroll.
- Summaries precede detailed evidence. Keep units and observation periods next to chart values.
- Status always includes a label or symbol. Brand red denotes a primary action or selected control; risk red also requires a risk label.
- Use neutral surfaces and borders to group data. Avoid decorative blue glow and colored text for ordinary prose.

## Tokens and boundaries

Source: https://ui.shadcn.com/docs/theming . The semantic token structure and component treatments are adapted to the existing HTML/CSS/JavaScript application; this is not a React migration.

- Background `#09090b`, card `#111113`, secondary `#27272a`: page, card and supporting surfaces respectively. Do not tint them blue.
- Foreground `#fafafa`, muted foreground `#a1a1aa`: primary and secondary information. Do not dim essential instructions below the muted foreground.
- Primary `#dc2626`, foreground `#ffffff`: primary buttons and active navigation. Do not use solid red behind entire analytical panels.
- Border `#27272a`, input `#3f3f46`, ring `#f87171`: separators, input boundaries, keyboard focus.
- Destructive `#ef4444`, warning `#fbbf24`, success `#34d399`, informational `#60a5fa`: error/high-risk, caution, low-risk/success and informational states; pair with text.
- Chart palette red, amber, emerald, blue, violet: distinguish series and graph node types, with a legend. Data series colors do not automatically imply a risk assessment.
- Card radius 10px, control radius 6px: use these scales consistently.
- Spacing 8/12/16/24/32px: related controls use 8–16px; card padding 20–24px; sections 24–32px.

## Typography

Self-host fonts with `fonts.css`. Use `Inter, Noto Sans TC, sans-serif` so Latin characters and numerals use Inter, and Chinese falls back to Noto Sans TC. Enable tabular numerals.

- Page title 28px/600; section title 18px/600; paragraphs 14–15px/400 with 1.7–1.9 leading.
- Form, table and navigation text 13–14px; secondary metadata 12px; graph labels 12px.
- Key data 28–32px/600. Keep units in smaller adjacent text.
- Reports use the same hierarchy on screen and a white background with dark text for print. Retain the report reader's scriptless sandbox and network isolation.

## Component choices

Use neutral bordered cards for independent information groups, rows for comparable records, segmented tabs for risk subpages, outline buttons for supporting actions and red buttons for the main action. Keep detail and summary editable fields native and keyboard accessible. Adapt shadcn treatments without changing business logic or the password gate.

## Avoid

- Blue page backgrounds or decorative glow.
- Tiny 8–10px body copy.
- Color-only status.
- Multiple unrelated corner-radius scales.
- Shadows or gradients as the primary hierarchy.
- Changing route geometry or risk calculations during a styling task.
- Removing the password gate or weakening report isolation for previewing.

## Overview map motion
The user's October 13 reference permits a dark ocean texture and top-down container ships on route paths. Keep other pages black. Ships and wakes are illustrative, never presented as live AIS positions. Preserve route geometry, keep labels above vessels, pause motion offscreen and honor reduced motion.

## Current palette (October 13 update)
Primary #004ea2, background #101010, foreground #f1f1f1 replace the previous red primary palette. Use lighter blue #609fe4 for small links on dark surfaces for legibility. Keep red, amber and emerald risk meanings; preserve the Yang Ming logo colors and the ocean illustration.

## Maritime risk radar (October 14 update)
The user requests a ship-inspired animated radar in the left half of the risk intelligence workspace. Blue instrument glow, sweep light, bearing ticks, a central container ship and illustrated wake are permitted within this radar. Keep labels stationary, pair risk colors with accessible textual status and the legend, honor reduced motion and pause offscreen. Since the P1 prototype, thresholded radar signals are placed by distance to their provisional thresholds (行動區 inside r≈112, 觀察區 to r≈176, 正常 beyond) and coloured by status; signals without thresholds sit on the outer band as 未設門檻. Positions are still not live vessel coordinates. Preserve equal columns and the viewport-fit left panel.

## Risk intelligence evidence and recommendations
Use one shared model for overview copy, radar evidence and topic interpretation. Keep presentation chart series, axes, colors and country coordinates unchanged. Below evidence, use the same sections: 關鍵訊號 (value, unit, period, evidence), 分析判讀 (營運影響, 條件式預判, 後續確認), 航線建議 (action type, existing route, proposal, 啟動條件, 方案取捨). Label the common action 評估航線方案. Distinguish sea rerouting from schedule, transshipment, port and inland changes. Forecast wording is conditional; historical chart endpoints are never labeled as live readings. Port/country filters must also update the evidence and applicable recommendations. Do not reintroduce the removed top summaries. Cards in the right column of every risk subpage use one 20px vertical gap (`--risk-card-gap`), equal to the radar column gap; country-risk chart and rating table stack vertically.

## Port event matrix
Group the same 14 source events by region rows and stage columns. Use text with red/amber/blue stage colors, country → event → impact order, and separators within each cell. Counts and analysis must follow active region/stage filters. Show the complete event and impact inline; event entries have no click action or detail modal. At narrow widths, stack stages under each region and retain the region selector. Preserve all event content directly in the matrix.

## Risk registry (P0, October 14 update)
`risk-registry.js` is the single source for signal values, data dates (`asOf`), thresholds and route triggers. Thresholds are provisional until the business confirms them and are labeled 暫定 on screen; edit them only in the registry. Each thresholded signal shows a status label (行動／觀察／正常, or 未設門檻), a bullet bar against the thresholds and a comparison basis taken from the same series. Data dates (`asOf`) stay in the registry but are not shown on screen; never describe the series as current. The proxy data-trigger mappings and manual checks in the registry stay hidden until the business confirms them.

## Route advice cards (October 14 update)
The client wants a cool, fashion-forward look: prefer visuals over explanatory copy. Each card pairs a mini route map (country silhouettes, glowing current route, pulsing chokepoint in the route's risk tone, dashed green alternative when one exists) with the route name, proposal, one trigger line and tradeoff chips (▲ 增加, ▼ 降低, ─ 維持, ◇ 需評估) defined in `RISK_ROUTE_VISUAL`. Chip directions only restate the tradeoff sentence; use ◇ when the sentence gives no direction. Keep the full tradeoff in screen-reader text, the risk tone paired with a text level, and motion off under reduced motion. The map is illustrative geometry, not live positions.

## P1 prototype: overview heatmap and status matrix (October 14 update)
The 情報總覽 page opens with 航線 × 主題 (routes × five topics) and 主題狀態, above the existing topic cards. Heatmap cells are presence only: a lit cell means that topic has route advice for the route, its colour is the topic's current status, and there is no intensity until the business supplies exposure weights. Clicking a cell opens the topic and spotlights the matching route card. The status matrix shows each topic's first thresholded signal with a bullet bar, value and a trend glyph against the series' own comparison basis. Thresholds remain provisional.

## Navigation rules: risk data vs route decisions (October 15 update)
The manager found the cross-page jumps confusing, so each top-level section has one job.
- 風險情報 shows data only: key signals, charts, 分析判讀. It has no route advice and no 管理建議. Topic tabs switch subpages, and so do radar signal nodes (each opens its own topic). Radar topic labels are static labels that only show which topic is active. Radar node labels are taken from each topic page's 關鍵訊號 titles (long titles wrap to two lines), and the radar always shows the global, unfiltered view. Its footnote reads only 越靠中心越接近行動門檻。 The overview shows the five topic cards only (the 主題狀態 matrix was removed); a read-only route × topic grid sits below them but is hidden (`hidden`) until the team decides to show it.
- The single exit from a risk subpage is 影響航線 under 分析判讀: route chips labelled 前往航線方案評估 ↗, opening that route.
- In 方案比較 the left third holds A (original, left) and B (alternative, right) side by side and the map takes the right two thirds (1:2); inside each option card 天數 sits above 燃油 with one hairline under both, and card B shows its difference as a tag at the top-right of each figure (red up, green down, grey 相同) (CSS order and grid; assessment.js markup unchanged). 試算條件 is always open with its collapse toggle hidden.
- 航線方案評估 is one decision line for one route, wrapped around assessment.js by route-hub.js (assessment.js is not edited): ① route capsules (name + the route's overall level badge — the five-dot version was dropped as unclear) replace the select and the heatmap; the page breadcrumb and h1 are removed on this page; ②③ a risk network (route-network.js, modelled on the client's reference image): question + 持續觀察 on top (the network sits right under it); route core (orb, 綜合風險 from the route level, evidence count, A/B options) → five topic cards (evidence count for this route, topic-wide status, sorted) → evidence leaves on an arc (registry signals with sparklines on solid wires; warning timeline, this route's port events and mapped country ratings on dashed wires). net-info is a floating panel on desktop: hovering or focusing a topic card shows that topic's exposure, proposal, trigger and tradeoff chips to the right of the card; hovering a leaf shows its detail to the leaf's left; it hides on leave. Clicking a topic still selects it (highlighted leaves and wires). Below 1000px net-info is static under the topics and shows the selected topic. Only existing data is shown: no per-route level is invented, and A/B does not re-score evidence. Below 1000px the wires hide and only the selected topic's leaves show; ④ 方案比較 — map, A/B cards with per-figure difference tags on card B, and a 試算條件 card holding only the inputs, placed half-and-half beside ⑤ 記錄結論 (相關管理建議 collapsed); they stack below 1100px. Both cards are currently hidden (`hidden` on .assessment-lower) but kept in the DOM for assessment.js. Each fact appears once; nothing links back to risk pages.
- No auto-scroll or spotlight jumps. Any control that leaves a section names its destination.

- Spacing on all six risk subpages: cards are 20px apart (overview card grid included), and the last card has no trailing margin from itself or any wrapper, so when scrolled to the end it lines up with the radar panel's bottom edge.

## Unified status wording, radar labels and overview (October 15 update)
- Status labels on risk intelligence and route assessment follow the global view's scale 危急／高／中／低／無訊號. Thresholded signals map to 危急／中／低 (formerly 行動／觀察／正常; the top level reads 危急 to match the global view) and signals without thresholds show 無訊號 (formerly 未設門檻); 危急 stays for route levels. Threshold lines read 中 ≥ … · 危急 ≥ …; the radar legend, ring labels and footnote use the same words.
- The topic tabs are gone. Radar topic labels are larger, white and clickable (they switch subpages, as do signal nodes); the active topic is light blue. The top of the right column shows 情報總覽 on the overview, and on subpages a back link (← 情報總覽 / current topic).
- 情報總覽 fits one screen: the five topic cards are one per row, text on the left (name, status, headline, one-line description) and the chart on the right; the whole card links to its topic.
- The radar heading shows only 航海風險雷達 (the MARITIME INTELLIGENCE kicker was removed). Each topic sector has a status arc on the rim (危急 red, 中 amber, 低 green, 無訊號 grey) using the topic-wide status; topic labels sit further out (radius 322) with no badge.

## One risk-status source: the global view (October 15 update)
- `risk-shared.js` holds a copy of what 全球態勢 shows at its data time point (2026-06-30): the five risk lights (level, line, lead) and its 22-item signal feed. The global view is a compiled bundle with no exported data, so this file is a copy; when the colleague exports shared data, replace it with a reader so both views read one source. 全球態勢 itself is unchanged.
- Topic status everywhere in risk intelligence and route assessment (overview cards, radar rim arcs and nodes, route-network topics, hidden route grid) comes from those lights, on the global view's five-level scale: 危急 ■ red, 高 ◆ orange, 中 ▲ amber, 低 ● green, 無訊號 ● grey.
- The provisional per-signal thresholds no longer drive anything on screen: key signals show values and evidence only (no status chip, bullet bar or threshold line), and evidence leaves carry no level. Radar nodes take their topic's colour and sit in that level's band (closer to the centre = more severe); the ring labels were removed.
- Overview cards show the light's line as the headline, plus its lead tag (e.g. 訊號提前 10 個月). Each topic page has a 訊號動態 card listing that topic's feed items (date, type chip, title), newest first.
- 航道安全 opens with ① 咽喉點通行量 (monthly Hormuz transits 2025/1–2026/6 vs the same month a year earlier, ①②③ marking the 2025/4 and 2025/6 reports and the 2026/2/28 war, hollow points for ≥30% year-on-year drops; plus a table of seven chokepoints with current ships/day, baseline, change and level by the global view's rule: −10% 中, −30% 高, −80% 危急) and ② 質化報告 (each warning with its lead time before the war). Both come from risk-shared.js (`chokepoints`, `hormuzTransits`, the global view's illustrative series). The prediction-market chart follows.
- 港口與內陸: the area and stage filters sit in the event-matrix card header; the event-count note is hidden (kept in the DOM for updatePorts).
- 國家風險: the country select sits in the header of 國家 × 航運產業風險 (same as the port filters); the CRR／SRR toolbar note is dropped. Source tags on cards were removed.
- Topic pages no longer show a 關鍵訊號 card: its values repeated the evidence charts (and the radar shows the same signals). The analysis area is 訊號動態 (full feed, same as 全球態勢) then 分析判讀 with 影響航線.

## 航線方案評估: one route, three views (October 15 update)
Route capsules stay on top. Below them, a breadcrumb (航線方案評估 › route) and tabs switch in place between 風險網路, 方案比較 and 地圖 (route-compare.js). assessment.js's own comparison, inputs and conclusion stay in the DOM but hidden, because its handlers own the state: the fuel slider writes its 試算 form and 記錄選擇 fills its decision form.
- 航道安全 is route-level here: the worst chokepoint the route passes (risk-shared.js `routeChokepoints`, global view rule −10% 中 / −30% 高 / −80% 危急; no chokepoint = 低). The network's 航道 card uses the same value, so both views agree. The other four topics use the shared topic-wide lights, so A and B show the same level for them.
- 方案比較: A and B cards (chokepoint path, days, fuel, war-risk premium; 五類風險 bars with ↑/↓ where B differs; 主要依據 from data) and a side column: 條件試算 (封鎖機率 from the market series, 燃油價格變動 feeding assessment.js, 交期容忍天數) and 本次判讀 (data facts, plus the business judgement once provided). The 切換點 box was removed.
- Business inputs live in risk-shared.js `decisions` (warRisk, judgement). Until filled they are simply not shown (no 待業務提供 text; the war-risk tile and judgement headline only appear with data); nothing is invented.
- 地圖: assessment.js's map with A / B / 兩案疊加 toggles; 航段比較 splits each option's total days across legs between its chokepoints by route distance (labelled 天數依航線距離估算), with the leg's chokepoint level; clicking a leg shows that chokepoint. Endpoints use 起運區域／目的區域 like the map.
- The network core no longer shows the A/B mini cards (方案比較 covers them). Each view fits one 1600×1000 screen with tighter spacing; the selected route capsule is filled blue with a glow.
- 風險網路's card fills the rest of the screen (min-height set by route-compare.js from the space below the tabs, recalculated after fonts load and on resize; off below 1000px). In 方案比較 the side column stretches to the option cards' height and 本次判讀 fills it with its record buttons at the bottom; the 加入報告 button was removed.
- #pageContent padding is 28px 32px on every page (phones ≤760px: 20px 16px). The sticky radar height is 100dvh − 120px (header 64 + 28 + 28) so it still ends level with the last card, and the black mask above the sticky topic bar covers the 28px top padding.
