# 航運風險戰情室 · Design System

這份文件是整個網站（航運情報 + 全球態勢 GlobalView + 貨量動能戰情室）共用的視覺規範。
目的：之後任何人做新頁面、新圖表，照這份做就不會跑掉。

- **程式上的唯一來源**：`design-tokens.css`（所有顏色、字級、圓角都是 `--ym-*` 變數）。
- **範例頁**：`design-system.html`（每個 token 和元件的實際樣子，可以直接複製 class）。
- GlobalView 在 `globalview/src/styles/tokens.css` 的 `.theme-ym` 區塊鏡射同一組值；`src/lib/theme.ts` 給 deck.gl / ECharts 這類讀不到 CSS 變數的程式用。**改值時三個地方一起改**（tokens.css → theme-ym → theme.ts）。

---

## 1. 原則

1. **中性底，語意色只給風險與互動。** 底色、卡片、邊線全部是中性灰；紅／橘／黃／綠只用來表示風險等級，藍只用來表示「可以點」或「機會」。一般文字、裝飾不用彩色。
2. **狀態一定有文字或形狀，不能只靠顏色。** 危急 ■、高 ◆、中 ▲、低 ●，旁邊永遠帶「危急／高／中／低」字樣。色弱、黑白列印都要能讀。
3. **數字用等寬字。** 任何會對齊、會變動的數字（指標、日期、百分比、艘/日）用 JetBrains Mono，開 tabular-nums。
4. **最小字級 12px。** 沒有例外，包含圖表刻度和標籤。小於 12 的舊樣式會被 `design-apply.js` 自動拉到 12。
5. **一個畫面一個主角。** 首頁主角是地圖，風險情報主角是雷達／矩陣；其他區塊用較低的對比退到後面。
6. **示意數據要標示。** 任何重建、推估的數字旁邊要有「示意數據」或資料區間。

---

## 2. 色彩

### 介面（中性灰）

| Token | 值 | 用途 |
|---|---|---|
| `--ym-bg` | `#101010` | 頁面底色 |
| `--ym-surface-1` | `#111113` | 卡片 |
| `--ym-surface-2` | `#18181B` | 卡片內次層、hover、提示框 |
| `--ym-surface-3` | `#27272A` | 選取、標籤底、分隔 |
| `--ym-line` | `#27272A` | 一般邊線 |
| `--ym-line-strong` | `#3F3F46` | 輸入框、需要更清楚的邊線 |
| `--ym-text` | `#F1F1F1` | 主要文字 |
| `--ym-text-2` | `#D4D4D8` | 說明句 |
| `--ym-text-muted` | `#A1A1AA` | 單位、時間、標籤、輔助文字 |

### 品牌與互動

| Token | 值 | 用途 |
|---|---|---|
| `--ym-brand` | `#004EA2` | 陽明藍：主要按鈕（登入、送出）、選取中的導覽 |
| `--ym-brand-red` | `#E60012` | 陽明紅：**只用在 logo**，避免和風險紅混淆 |
| `--ym-accent` | `#60A5FA` | 互動：連結、hover 游標線、被點選的列、「機會」標籤 |

### 風險語意

| 等級 | 形狀 | Token | 值 |
|---|---|---|---|
| 危急 | ■ | `--ym-risk-crit` | `#EF4444` |
| 高 | ◆ | `--ym-risk-high` | `#F97316` |
| 中 | ▲ | `--ym-risk-mid` | `#FBBF24` |
| 低／正常 | ● | `--ym-risk-low` | `#34D399` |
| 無訊號 | ● | `--ym-risk-none` | `#A1A1AA` |

淡底寫法：`color-mix(in srgb, var(--ym-risk-crit) 16%, transparent)`。標籤文字用原色或 `color-mix(... 70%, white)` 提亮。

### 資料類型（關聯圖、圖表序列）

| Token | 值 | 用途 |
|---|---|---|
| `--ym-type-event` | `#F87171` | 事件 |
| `--ym-type-indicator` | `#FBBF24` | 指標 |
| `--ym-type-route` | `#60A5FA` | 航線 |
| `--ym-type-country` | `#A78BFA` | 國家 |

圖表多序列的順序：藍 `#60A5FA` → 綠 `#34D399` → 黃 `#FBBF24` → 紫 `#A78BFA`。紅只留給事件線和風險。

---

## 3. 字體與字級

| 用途 | Token | 大小 / 字重 | 字體 |
|---|---|---|---|
| 頁面標題 | `--ym-fs-page` | 22px / 700 | Inter + Noto Sans TC |
| 區塊標題（卡片 h2） | `--ym-fs-section` | 14px / 600 | 同上 |
| 內文 | `--ym-fs-body` | 14px / 400，行高 1.55 | 同上 |
| 導覽、按鈕、連結 | `--ym-fs-nav` | 13px / 500 | 同上 |
| 輔助文字、圖表刻度、標籤 | `--ym-fs-small` | 12px / 400 | 同上 |
| 關鍵數字（KPI） | `--ym-fs-kpi` | 24px / 600 | JetBrains Mono |
| 開場大數字 | `--ym-fs-hero` | 48px / 700 | JetBrains Mono |

- 中文用 Noto Sans TC，英數用 Inter（`--ym-font-ui` 已照順序排好，直接用）。
- 數字、日期、代碼：`--ym-font-data` + `font-variant-numeric: tabular-nums`。
- 行高：標題 1.3、內文 1.55、提示框 1.6。

---

## 4. 形狀、間距、動態

| 項目 | 值 |
|---|---|
| 卡片／按鈕／提示框圓角 | `--ym-radius` 8px |
| 標籤／小方塊圓角 | `--ym-radius-s` 4px |
| 間距 | 4 的倍數：卡片內距 16–24，卡片間距 12，欄間距 12–16 |
| 陰影 | 只有浮動元素（提示框、選單、對話框）用 `--ym-shadow` |
| 動態 | hover 150ms、展開切換 250ms、版面進場 800ms，曲線 `--ym-ease` |
| 減少動態 | 尊重 `prefers-reduced-motion`：直接顯示完成狀態 |

---

## 5. 元件

### 卡片 `.page-card` / `.card`
底 `--ym-surface-1`，1px `--ym-line`，圓角 8，內距 16–24。標題 14/600，右上角可放一行 12px 的輔助文字（例如「點格子查看建議」）。

### 風險等級標籤 `.lv-chip`
高 22px，圓角 4，字 12/700，形狀 + 文字。例：`<span class="lv-chip lv-crit"><i>■</i>危急</span>`。

### 按鈕
- 主要：`--ym-brand` 底、白字、圓角 8，一頁最多一個。
- 次要／幽靈：透明底、1px `--ym-line`，hover 底 `--ym-surface-2`。
- 文字連結：`--ym-accent`，不加底線，hover 才加。

### 導覽
頂部導覽 13/500，目前頁 `--ym-text` 並在下方加 2px `--ym-brand` 線；其他 `--ym-text-muted`。

### 提示框 `.chart-tip`
底 `--ym-surface-2` 96%、1px `--ym-line`、圓角 8、12px 字，第一行日期用 muted，數值右對齊用等寬字。

### 圖表
- 背景透明；格線 `--ym-line` 虛線；刻度文字 12px `--ym-text-muted`。
- 線寬 2px；最後一點畫 3px 實心點。
- Hover：十字線（`--ym-text-muted` 虛線）+ 各序列圓點 + `.chart-tip`。
- 事件標記：紅色虛直線 + 日期標籤。
- 單位和觀測區間放在圖表標題旁或下方，不放在軸上。

### 五類風險圖示 `.topic-ic`
五類風險在站內任何地方出現，文字左邊都放同一個圖示（lucide，線寬 1.75）：

| 類別 | 圖示 | lucide |
|---|---|---|
| 航道安全 | 波浪 | `waves` |
| 政策與關稅 | 政府建築 | `landmark` |
| 燃油成本 | 加油機 | `fuel` |
| 港口與內陸 | 貨櫃 | `container` |
| 國家風險 | 旗幟 | `flag` |

- 大小：文字列 14px；雷達軸標、卡片標題 16px；頁面標題 20px。左側，間距 6px，垂直置中。
- 顏色：**單色**，跟隨旁邊文字（預設 `--ym-text-muted`，選取時 `--ym-text`）。不隨風險等級變色。
- HTML 頁面由 `topic-icons.js` 自動插入（辨認全名或短名「航道／政策／燃油／港口／國家」）；React 用 `components/TopicIcon.tsx`。

### 地圖（全球態勢）
- 陸地 `--ym-surface-2`，國界 `--ym-line`。
- 航線依等級上色；備援航線虛線；低／無訊號用 `--ym-risk-none`。
- 咽喉點用形狀標記 + 名稱 + 「艘/日 · 年增率」。

---

## 6. 怎麼套用

**既有 HTML 頁面**（航運情報、貨量動能戰情室）
```html
<!-- 放在所有樣式之後 -->
<link rel="stylesheet" href="design-tokens.css">
<!-- 放在所有 script 之後：字級 12px 安全網 -->
<script src="design-apply.js"></script>
```
新寫 CSS 一律用 `var(--ym-*)`，不要再寫色碼或 px 字級。舊的 `--background`、`--card`、`--border` 等名字會自動對到新值，但新程式碼不要再用。

**GlobalView（React）**
- 已內建：`?embed=1` 時 `<html class="theme-ym">`，`tokens.css` 的 `.theme-ym` 區塊生效。
- CSS 用 `var(--bg)`、`var(--risk-high)` 等（名稱對照見 `tokens.css`）。
- TS 裡要給 deck.gl / ECharts 的顏色，從 `src/lib/theme.ts` 的 `C` 拿，**不要寫死色碼**。

**改 token 的流程**
1. 改 `design-tokens.css`。
2. 同步 `globalview/src/styles/tokens.css` 的 `.theme-ym` 和 `src/lib/theme.ts` 的 `YM`。
3. 開 `design-system.html` 看一眼，再開首頁和風險情報各一頁確認。

---

## 7. 交付前檢查

- [ ] 沒有任何文字小於 12px（DevTools 搜 `data-ym-floor`，應該是 0 才代表 CSS 本身就對）。
- [ ] 風險狀態都有形狀或文字，不是只有顏色。
- [ ] 數字用等寬字，對得齊。
- [ ] 色碼只出現在 `design-tokens.css` / `tokens.css` / `theme.ts`。
- [ ] 卡片圓角 8、標籤圓角 4。
- [ ] 示意數據有標示。
- [ ] 開「減少動態」時頁面仍可用。
