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
