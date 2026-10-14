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
