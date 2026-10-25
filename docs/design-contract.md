# design-md-switcher 设计契约（DSH 0.2.0-rc.2）

状态：设计契约（架构分析，不含实现）。宿主实测版本 **0.2.0-rc.2**（F:\App\DSH，app.asar 内 JS 未压缩，下文 `asar:L<行号>` 即 grep 行号锚点）。
证据基线：`research/*.md` 六份切片（全部摘自 asar）、知识库 `site/develop/basic/{index,config,publish}.md`、`site/develop/framework/service.md`、`site/reference/subsystems/{slots,settings,storage,web-client,client-modules,client-resources}.md`、`site/reference/cookbook/adding-a-settings-card.md`、`extra/upgrade-guide/`，以及本次对 asar 的补充 grep（行号随文标注）。

> **实现偏差对照（以实现为准，详见 docs/implementation-notes.md）**：
> ① 内置设计以"预解析 JSON 常量"内嵌于 lib/client.js（D.1 允许的选项），未建 `assets/designs/`；
> ② lib/client.js 直接手写为最终 lazy-CJS factory 格式（C.1 中"由 src/client.ts 构建"不适用，无构建管线）；
> ③ v0.1.1 起 schemastery 3.18.4 等 3 个 MIT 小包 vendor 进 `lib/vendor/`，零外部运行时依赖（E.2 的 Config 契约不变；宿主要求 Config 实现 Standard Schema 接口——KB config.md:48，bare-specifier 解析在本机 pnpm/ESM 组合下不可靠，见实现备注 §0）。

---

## 0. 架构定位（一句话）

本插件是一个**第三方组合包（bundle）**：Host 半侧只占一条 Loader 行并声明带 volatile 字段的 Config schema；一切解析、映射、应用都发生在**客户端半侧**——通过 `ctx.theme.overrideTokens` 以单层 override 叠加在活动主题之上（另有组件面样式层，见 B.5），通过 `ctx.configForms` 的设置命名空间持久化用户选择，通过 `settings.general.item` 插槽提供设置行。

判定依据：DSH 存在两种第三方插件形态——
1. **组合包（bundle）**：`package.json` 声明 `dsh.bundle.patch`，随 profile 持久安装（asar:L292513、KB publish.md）；客户端半侧由 Client 模块系统扫描 `dsh.client` 声明后经 `/plugins` 路由送达页面（asar:L377019、KB client-modules.md）。**跨重启存活**。
2. **动态包（dynamic package）**：会话内由 `define`/`run` 铸造，host 半跑在 `node:vm` 沙箱、浏览器半以 `React/console/styles/host` 符号面求值，`host.call`→`harness.handle` 桥接（asar:L732350、L739569）；定义登记在发起会话名下（asar:L744157 `agentId: SessionId`），页面刷新不恢复（asar:L732330），**重启即消失**。

需求要求"重启后自动恢复"，故**必须走组合包形态**；动态包的 `host.call` 桥不可用于本插件。

---

## A. design.md 规范化 schema

### A.1 输入形态（17 份样例实测）

样例：`design/*/design.md` 自 v0.8.0 起全部为 **frontmatter-only 的 DSH 消费子集**（Claude 自 v0.3.2 起、其余 16 份自 v0.8.0 起）——散文、`spacing`、未映射组件与颜色已删，只留宿主真正读取的字段；v0.5.0 起 `colors` 可含 `dark:` 子表，携带独立暗色配色。原始营销稿（YAML frontmatter + 散文正文）仍保留在 `tests/fixtures/{sap,playstation}.md` 作为解析健壮性样例。frontmatter 顶层键：`version`、`name`、`description`、`colors`、`typography`、`rounded`、`spacing`、`components`。

| 键 | 形状（实测） | 变体 |
|---|---|---|
| `version` | 标量字符串（`alpha`） | — |
| `name` | 标量字符串（`Claude`/`Sap`/`PlayStation`） | — |
| `description` | 单行（Sap）或 `\|` 块标量（PlayStation） | Claude v0.3.2 起删除（解析后无消费者） |
| `colors` | 扁平 map：键→CSS 颜色字符串；v0.5.0 起可含 `dark:` 子 map（暗色配色表，与 `colors` 同词表） | Claude `#cc785c`；PlayStation `rgba(0,0,0,0.6)`；Sap 键集不同（`navy`/`sky`/`band`） |
| `typography` | map：样式名→`{fontFamily, fontSize(带px), fontWeight(数值), lineHeight(带px或无单位), letterSpacing}` | Sap 的 `fontFamily: 72 Brand Variable` 未加引号；`lineHeight` 两种单位并存；Claude 只留 `body`+`display-xl`（宿主读取项） |
| `rounded` | map：键→`4px`/`0px`/`9999px` | Sap 有 `none`；Claude 只留 `xs..xl`（v0.3.2 删 `pill`/`full`） |
| `spacing` | map：键→px 值 | 仅 Sap/PlayStation 有；Claude 已删除（无消费者） |
| `components` | map：组件名→`{backgroundColor, textColor, typography, rounded, padding, height, size, borderColor?, description?}`，值为 `{colors.x}`/`{typography.x}`/`{rounded.x}`/`{spacing.x}` 引用或字面量（`transparent`、`rgba(...)`、裸数值如 `height: 60`）；v0.3.1 起额外接受 `hover: {lift, shadow, duration}` | Claude 只留 `button-new-session.hover`（宿主唯一消费的组件行为）；Sap 组件值含 `description` 字段与裸数值 |

### A.2 解析器接受的**最小字段集**

> 判定前提：**25 个设计基座 Token**（14 基础 + v0.2 的 4 个按钮/交互别名 + v0.4 的 2 个按钮面 + v0.6 的 5 个菜单/焦点/tooltip/开关面）全部为 CSS 颜色/半透明叠色类型；另有 **81 个别名引用 Token**（v0.7，值形如 `var(--基座)` / `color-mix(...)`，见 B.3b），合计 106 个，`overrideTokens` 只接受字符串值对。因此**颜色映射只消费 `colors`**；v0.3.0 起 `rounded`/`typography`（body 字体族与字号、display 字体族）与 v0.3.1 起的 `components.button-new-session.hover` 由组件面样式层（B.5）消费；`spacing` 与其他组件字段仍解析但不应用。

- **必需**：frontmatter 存在且闭合（恰两道 `---`），`colors` 为 map 且含 ≥1 个可解析颜色条目。
- **推荐**：`version`、`name`（用于设置列表的身份展示；缺失时 name 回退为文件名去扩展名，version 回退 `unknown`）。
- **可选（缺失不报错）**：`description`、`typography`、`rounded`、`spacing`、`components`，以及 `colors.dark`（v0.5.0 暗色配色表）。其中 `typography.body`/`display-*`、`rounded`、`components.button-new-session.hover` 由 B.5 应用，其余只解析记录；`colors.dark` 参与 B.3 暗色取值。

### A.3 容错规则（逐条）

| 情形 | 行为 |
|---|---|
| 无 frontmatter / 围栏未闭合 | **拒绝整份文件**，报错"frontmatter 缺失或未闭合"（fail loud，不应用） |
| 围栏后正文 | 忽略（散文不参与解析） |
| `colors` 缺失或为空 map | 拒绝（最小字段集不满足） |
| 单个颜色键的值不是字符串颜色 | 该键按缺失处理 + 诊断记录；其余键继续 |
| `colors.dark` 为空 map | 记诊断、按未提供暗色配色处理（走旧推导） |
| `colors.dark` 内含未知键 | 记入 `unknownKeys` 诊断（`colors.dark.<key>`），不报错 |
| 未知键（`colors` 内或顶层多余键，如 Sap 的 `navy`） | 忽略并记入解析诊断（`unknownKeys` 列表），不报错 |
| YAML 重复键 | 交给标准 YAML 语义（后值胜出），不额外处理 |
| 颜色字符串格式 | 原样接受 `#RGB|#RGBA|#RRGGBB|#RRGGBBAA|rgb()/rgba()` 与合法 CSS 命名色；**推导**（B 节）只支持 hex 与 rgb()/rgba()，其余格式可作直通值但不可作推导输入 |
| `{colors.x}` 引用（样例中出现在 `components` 内；`colors` 自身也可能被作者写成引用） | 引用解析器：仅解析 `{colors.<key>}` 一层，目标存在→替换为目标值；目标不存在或引用嵌套→该字段按缺失处理 + 诊断。`components/typography` 内的引用**解析但不在 v1 使用**（纯 schema 完备性） |
| `height: 60`（裸数值）、`padding: 12px 20px`（复合值） | 属 components 字段，v1 不消费；记录原值不校验 |
| 解析产物 | `DesignDoc { id, name, version, colors: Record<string,string>, darkColors: Record<string,string>, diagnostics: string[], unused: { typography, rounded, spacing, components } }`；`id` = 规范化小写的 name（内置 17 套固定为 `claude|airbnb|apple|bmw|cursor|ferrari|hp|ibm|meta|nvidia|oracle|playstation|sap|spotify|tesla|webflow|zapier`，与包内文件名对齐）；未提供 `colors.dark` 时 `darkColors = {}` |

---

## B. Token 映射表（25 个设计基座 + 81 个别名引用 = 106 个；基座：14 基础 + v0.2 的 4 + v0.4 的 2 + v0.6 的 5，light 来源 + dark 推导）

### B.1 推导原语（确定性、可执行）

- `parse(c)`：解析 hex / rgb() / rgba() / hsl() / hsla() → {r,g,b,a}；其余格式 → null（hsl 分支供 v0.2.0 tint 派生吃回 flip 产物）。
- `lum(c)`：sRGB 线性化后 `0.2126R+0.7152G+0.0722B` 相对亮度。
- `flip(c, lo, hi)`：转 HSL，`L = clamp(1−L, lo, hi)`，H/S 保留，alpha 置 1，输出 `hsl()` 字符串；`parse` 失败 → null。
- `pick(list)`：按顺序取**第一个存在且 parse 可解析**的候选色；全失败 → null。
- 直通例外：候选值若**无需推导**（dark 直接来自文件的 dark 键），可原样使用 rgba() 等任意 CSS 颜色字符串（`validateOverrides` 只校验"字符串对"形状，asar:L698449-698461）。
- 终值规则（v0.5.0 双配色优先级）：
  1. 文件提供 `colors.dark` 时，先取该表里 Token 的 **dark 候选链**（`surface-dark` / `on-dark` …，与旧单表 dark 链同义）；
  2. 再取 `colors.dark` 里**与 light 链同名的语义键**（`hairline` / `success` / `primary` …）——同一套键、两张色表；
  3. 未提供 `colors.dark` 时，沿用旧单表 dark 链；
  4. 仍未命中 → 场景规则（brand/same）或 `flip(light)` 推导。
  推导也失败（light 不可解析）→ **该 Token 从 override 对象中整个省略**（发 null/空串会破坏运行时校验），并在设置行诊断中显示"N 个 Token 被跳过"。**任何情况下不向 overrideTokens 传缺 dark 的条目**。

### B.2 候选键集合（对 17 份样例键集的并集归纳）

- 暗色底：`canvas-dark, surface-dark, surface-dark-elevated, surface-dark-card, surface-dark-soft, ink-deep, ink`
- 暗色卡片层：`surface-dark-card, surface-dark-elevated, surface-dark-soft, charcoal, ink-elevated`
- 暗色浮层：`surface-dark-elevated, surface-dark-card, ink-elevated`
- 暗色边框：`hairline-dark, ash-dark`；暗色正文：`on-dark, canvas-light`；暗色次级文字：`on-dark-mute, on-dark-soft, mute-dark`
- 亮色底：`canvas, canvas-light`；亮色卡片：`surface-card, surface-soft, chrome`；亮色边框：`hairline, hairline-soft`
- 亮色正文：`ink, body-strong, body`；亮色次级：`muted, muted-soft, mute-light, ash-light`
- 状态：success `success|accent-teal`；warn `warning|accent-amber`；error `error|commerce|warning`（PlayStation 无 `error`，`warning:#c81b3a` 实为红色，故 error 链吸收它）；v0.8.10 起再收上游语义别名，见下条
- v0.2.0 新增：按钮 hover `primary-pressed|primary-active|primary-deep|primary`；三级文字 `muted-soft|mute-light|ink-meta|ink-nav|muted|body`；高对比填充 `ink|ink-deep|ink-elevated|body-strong`（dark：`on-dark|canvas-light|canvas`）；悬浮底取 `ink`/`on-dark` 后压透明度（不做推导原语之外的混合）。
- v0.4.0 新增：按钮底色 `canvas|canvas-light|surface-card|surface-soft`（dark：`surface-dark-elevated|surface-dark-card|ink-elevated`，链空 flip 0.10–0.16）；「新会话」hover 底色取 `ink|body-strong|ink-deep`（dark：`on-dark|on-dark-mute|canvas-light`）压 6%/8%（与悬浮底同一 tint 语义）。
- v0.6.0 新增：菜单图标 `muted-soft|muted|mute-light|ink-meta|body|ink`（dark：`on-dark-soft|on-dark-mute|mute-dark`）；菜单材质 `surface-card|surface-soft|canvas` 压 92%（dark：`surface-dark-elevated|…` 压 90%）；焦点环 `primary`（dark：同品牌色）；tooltip 键帽 `surface-soft|surface-card|canvas`（dark：`on-dark|canvas-light`）；开关滑块 `canvas|canvas-light`（dark：`on-dark|canvas-light`）。
- v0.8.10 新增：状态语义别名 success `semantic-success|success-accent|positive`；warn `semantic-warning|accent-warning|attention`；error `semantic-error|critical|accent-danger|negative`（dark 链同这三组，浅底 `*-bg`/`*-surface` 键不入暗色链）。

### B.3 逐 Token 映射表

| # | Token | light 来源（按序取首个存在者） | dark 推导 |
|---|---|---|---|
| 1 | `--dsw-alias-bg-base` | `canvas → canvas-light → surface-soft → surface-card` | pick(暗色底)；否则 `flip(light, 0.04, 0.10)` |
| 2 | `--dsw-alias-bg-layer-1` | `surface-card → surface-soft → chrome → canvas` | pick(暗色卡片层)；否则 `flip(light, 0.10, 0.16)` |
| 3 | `--dsw-alias-bg-layer-2` | `surface-cream-strong → surface-card → surface-soft` | pick(暗色浮层)；否则 `flip(light, 0.16, 0.22)` |
| 4 | `--dsw-alias-bg-overlay` | `canvas → canvas-light` | pick(暗色浮层)；否则 `flip(light, 0.14, 0.20)` |
| 5 | `--dsw-alias-border-l1` | `hairline → primary-disabled → muted` | pick(暗色边框)；否则 `flip(light, 0.26, 0.36)` |
| 6 | `--dsw-alias-border-l2` | `hairline-soft → hairline` | pick(暗色边框)；否则 `flip(light, 0.18, 0.26)`（暗色下 l2 比 l1 更贴近底色=更弱） |
| 7 | `--dsw-alias-brand-primary` | `primary` | `parse(primary)` 且 `lum < 0.25` → `flip(primary, 0.35, 0.55)`；否则 **primary 原样** |
| 8 | `--dsw-alias-label-primary` | `ink → body-strong → body` | pick(暗色正文)；否则 `flip(light, 0.88, 0.96)` |
| 9 | `--dsw-alias-label-secondary` | `muted → muted-soft` | pick(暗色次级文字)；否则 `flip(light, 0.58, 0.70)` |
| 10 | `--dsw-alias-state-idle-primary` | `muted-soft → mute-light → ash-light → muted` | pick(暗色次级文字 ∪ `mute-dark, ash-dark`)；否则 `flip(light, 0.45, 0.55)` |
| 11 | `--dsw-alias-state-success-primary` | `success → accent-teal → semantic-success → success-accent → positive` | pick(暗色同名键 ∪ 语义别名)；否则同 light 值；若 `lum < 0.3` → `flip(·, 0.45, 0.62)` |
| 12 | `--dsw-alias-state-warn-primary` | `warning → accent-amber → semantic-warning → accent-warning → attention` | pick(暗色同名键 ∪ 语义别名)；否则同 light 值；若 `lum < 0.3` → `flip(·, 0.45, 0.62)` |
| 13 | `--dsw-alias-state-error-primary` | `error → commerce → warning → semantic-error → critical → accent-danger → negative` | pick(暗色同名键 ∪ 语义别名)；否则同 light 值；若 `lum < 0.3` → `flip(·, 0.45, 0.62)` |
| 14 | `--dsw-specific-sidebar-fill` | `chrome → surface-soft → surface-card → canvas` | pick(`surface-dark-soft, surface-dark, canvas-dark`)；否则 `flip(light, 0.07, 0.13)` |
| 15 | `--dsw-alias-label-tertiary` | `muted-soft → mute-light → ink-meta → ink-nav → muted → body` | pick(`on-dark-soft, on-dark-mute, mute-dark`)；否则 `flip(light, 0.62, 0.74)` |
| 16 | `--dsw-alias-interactive-bg-hover` | `ink → ink-deep → body-strong → ink-lead`，取 RGB 压 **6%** 输出 `rgba()` | pick(`on-dark, canvas-light, on-dark-mute`) 压 **8%**；链空 → `flip(light, 0.70, 0.90)` 再压 8% |
| 17 | `--dsw-alias-button-primary-hover` | `primary-pressed → primary-active → primary-deep → primary` | 链空 → `flip(light, 0.30, 0.50)`（深底上提亮） |
| 18 | `--dsw-alias-button-contrast-fill` | `ink → ink-deep → ink-elevated → body-strong` | pick(`on-dark, canvas-light, canvas`)；否则 `flip(light, 0.72, 0.92)` |
| 19 | `--dsw-alias-button-elevated-fill` | `canvas → canvas-light → surface-card → surface-soft` | pick(`surface-dark-elevated, surface-dark-card, ink-elevated`)；否则 `flip(light, 0.10, 0.16)` |
| 20 | `--dsw-alias-button-floating-hover` | `ink → body-strong → ink-deep`，取 RGB 压 **6%** 输出 `rgba()` | pick(`on-dark, on-dark-mute, canvas-light`) 压 **8%**；链空 → `flip(light, 0.70, 0.90)` 再压 8% |
| 21 | `--dsw-alias-menu-icon` | `muted-soft → muted → mute-light → ink-meta → body → ink` | pick(`on-dark-soft, on-dark-mute, mute-dark`)；否则 `flip(light, 0.58, 0.70)` |
| 22 | `--dsw-menu-surface-fill` | `surface-card → surface-soft → canvas`，压 **92%** 输出 `rgba()` | pick(`surface-dark-elevated, surface-dark-card, ink-elevated`) 压 **90%**；链空 → `flip(light, 0.10, 0.16)` 再压 90% |
| 23 | `--dsw-focus-ring-color` | `primary` | 无 dark 链：品牌色同值；浅色不可解析时 `flip(light, 0.35, 0.55)` |
| 24 | `--dsw-alias-tooltip-key-bg` | `surface-soft → surface-card → canvas` | pick(`on-dark, canvas-light`)；否则 `flip(light, 0.70, 0.90)` |
| 25 | `--dsw-alias-switch-thumb` | `canvas → canvas-light` | pick(`on-dark, canvas-light`)；否则 `flip(light, 0.88, 0.96)` |

> 为什么加这 4 个（v0.2.0）：宿主把 `--dsw-alias-button-primary-fill` 派生为 `var(--dsw-alias-brand-primary)`（填充色本来就跟随），但 `button-primary-hover`、`interactive-bg-hover`、`label-tertiary`、`button-contrast-fill` 等派生变量直接绑在 `--dsw-static-*` 静态色板上；只覆盖 14 个会出现「蓝色主按钮 hover 变深灰、ghost hover 不跟色板、三级文字恒灰」。这 4 个补上了颜色面，圆角/字号/高度仍无 Token（见 B.4）。

> 为什么加第 19/20 个（v0.4.0）：侧栏「新会话」按钮的底色与 hover 底色同样绑在 `--dsw-static-*`（浅色恒白、hover 恒灰），只覆盖前 18 个时按钮不跟设计走。补上后按钮底色 = 设计的 canvas、hover = 设计 ink 的 6% 叠加，配合 v0.3.1 的 hover 位移/阴影形成完整悬浮反馈。

> 为什么加这 5 个（v0.6.0）：菜单图标、菜单材质、焦点环、tooltip 键帽、开关滑块在宿主里各自绑在 `--dsw-static-*` 或常量上（菜单 `#f8f9fa94`、图标 neutral-800、焦点环 `#4176E6/#7AAAFF`、键帽 = tooltip 底 +18% 白、滑块 neutral-00），只覆盖前 20 个时这些控件仍不跟设计。新增后：菜单图标按次级文字色、菜单材质按卡面容色的 92%/90% 叠色、焦点环用品牌色、键帽/滑块按浅色面，且都是纯颜色（不碰几何）。

> v0.8.10：状态色三行补上游语义别名（`semantic-*`、`success-accent`、`accent-warning`、`accent-danger`、`critical`、`attention`、`positive`、`negative`），前几位顺序不动。一是 Apple / Cursor / Playstation / SAP / Zapier 五套内置方案原本没有状态键，按 B.1 整键省略 → 宿主持有 DSH 默认状态色、观感不跟方案走，现按各自调色板补齐；二是仓库 `design-md/` 的第三方 DESIGN.md 多用这套语义键名，旧链导入即跳过。无上游实测值的方案在 CHANGELOG 标注来源。

### B.3b 别名引用层（v0.7.0，81 个）

值本身就是 CSS 表达式，light/dark 用同一字符串，由浏览器对 `var()` 求解，因此两套配色自动跟随基座（与 DSH 自身“别名引用别名”的结构一致）：

| 家族 | Token（节选） | 表达式 |
|---|---|---|
| 面 | `bg-layer-3`、`bg-module-platform`、`bg-multi-select`、`bg-document-preview` | `var(--dsw-alias-bg-layer-1/2)` |
| 描边 | `border-l3/l4`、`border-l2-darkmode-thin` | `var(--dsw-alias-border-l1/l2)` |
| 品牌 | `brand-text`、`brand-primary-invert` | `var(--dsw-alias-label-primary)` |
| 按钮 | `button-primary-fill/dimmed`、`ghost-active-*`、`info-*`、`tool-bar-*`、`floating-fill` | `var(--dsw-alias-brand-primary)` / `bg-layer-1` / `interactive-bg-hover` / `color-mix(label-primary …)` |
| 交互 | `interactive-bg-active/hover-accent/hover-danger/hover-solid` | `color-mix(label-primary｜brand-primary｜state-error …)` / `bg-layer-1` |
| 文字 | `label-caption/dimmed/primary-*/shimmer/deep-diving*/document-preview` | `var(--dsw-alias-label-primary/secondary/tertiary)` 及 `color-mix` |
| 链接 | `link` | `var(--dsw-alias-brand-primary)` |
| Markdown | `citation`、`code-block(-banner)`、`segment-*`、`inline-code`、`placeholder`、`tag` | `bg-layer-1/2`、`bg-base`、`label-tertiary` |
| 菜单 | `menu-group-header-fill` | `var(--dsw-menu-surface-fill)` |
| 滚动条 | `scrollbar-bg/hover-l1/l2` | `label-tertiary` / `label-secondary` |
| 设置卡 | `settings-card-fill/stroke` | `bg-layer-1` / `border-l1` |
| 状态 | `state-business-*`、`success/error/warn` 的 secondary/tertiary/label | 基座状态色及 `color-mix(… 16%)` |
| 浮层 | `toast-bg/label`、`tooltip-bg`、`turn-trigger-bg(-hover)` | `button-contrast-fill`、`bg-base`、`bg-layer-2`、`interactive-bg-hover` |
| diff | `code-diff-*`、`file-diff-*` | `color-mix(state-success｜error …)` / 基座状态色 |
| 组件专属 | `specific-bubble*`、`input-major`、`login-input`、`menu`、`selector`、`sidebar-nav-item-*`、`tip` | `bg-layer-1/2`、`brand-primary`、`interactive-bg-hover`、`menu-surface-fill` |

- **不覆盖**：`--dsw-static-*` 色阶、`bg-mask-*` / `bg-document-selection` / `bg-skeleton` / `border-inverted*`（中性遮罩/选区常量）、遗留别名 `brand-primary-new-color*`，以及阴影、几何、字体变量。
- 导出 JSON 时这些键的值是 `var()` / `color-mix()` 原文；导入后同样由 CSS 求解。

样例抽验（心算）：Claude bg-base light=#faf9f5(canvas)、dark=pick=#181715(surface-dark) ✓；Sap sidebar light=#f5f6f7(chrome)、dark=#000000(ink 兜底) ✓；PlayStation bg-base dark=#000000(canvas-dark) ✓；Sap 的 `ink:#000000` 作 label-primary dark 候选不会命中（dark 正文候选是 `on-dark`，Sap 无 → flip(#000000,0.88,0.96)=近白）✓。

### B.4 范围天花板与升级路径

- `overrideTokens` 形状校验只查"每键 `{light,dark}` 字符串对"（asar:L698449-698461），**不查 Token 名单**；`composeActive` 按 seq 对每键取活动配色的值（asar:L698415-698423）。因此技术上可覆盖 `design-platform.css` 的 scrollbar/file-diff 等更多别名 Token，v1 **只碰事实 3 的 14 个**（稳定面），**v0.2.0 增补 4 个按钮/交互颜色别名到 18 个**（B.3 #15-18），**v0.4.0 再增补 2 个按钮面到 20 个**（B.3 #19-20），其余仍留作后续扩展点。
- `typography/rounded/spacing` **无对应颜色 Token**，v1 无法应用；v0.3.0 起走**组件面样式层**（B.5）：rounded/字体族/正文字号可用，高度与 padding 仍是组件 CSS 字面量。升级路径：① 宿主未来补充形状/字体别名 Token 后进 B.3/B.5 表；② `register()` 全量主题定义（asar:L698355-698366）可携带任意 Token map，但会进入主题注册表并参与偏好切换，与 override 层是另一机制，v1 不用；③ `setFontSize(10..22)` 是用户偏好写入（asar:L698331-698337），**本插件不得调用**（副作用越权），仅在后续版本做显式 opt-in。

### B.5 组件面样式层（v0.3.0）

颜色走 `overrideTokens`（B.3）；圆角/字体/正文字号没有 Token，走独立 `<style data-plugin-css="design-md-switcher/component.css">`，内容随激活设计更新，恢复默认/删除/设计缺失时清空：

| 宿主变量 | design.md 来源 | 说明 |
|---|---|---|
| `--dsw-radius-xs/sm/md/lg/xl/panel` | `rounded.xs/sm/md/lg/xl`（缺失按上一档回退） | 宿主全局圆角变量，影响所有用 `var(--dsw-radius-*)` 的组件 |
| `--dsw-font-family` | `typography.body.fontFamily`（依次 body→body-md→body-lg→body-sm） | 全局基础字体族 |
| `--dsw-font-family-brand` | `typography.display-xl→display-lg→display→hero-title→section-title` 的 fontFamily；缺失回退基础族 | 品牌/展示字体 |
| `--dsh-content-font-size` | `typography.body.fontSize`（10–22px） | 正文字号；带 `!important` 压过主题 presenter 写在 body 上的内联值，激活期间优先于用户字号偏好，恢复后归还 |
| 侧栏「新会话」按钮（行为） | `components.button-new-session.hover.{lift,shadow,duration}`（v0.3.1） | 追加 `button[class*="_newSession"]` 的 transition / `:hover`（上浮+阴影）/ `:active` 规则；`prefers-reduced-motion: reduce` 关闭位移；lift 仅非负 px、duration 仅 ms/s、shadow 禁 `;{}<>` 且 ≤200 字符 |

- **安全**：design.md 是不可信输入。圆角只收 `0.0–64(px|rem|em)`；字体族拒绝 `{};<>` 并对多词族名补引号；字号只收 10–22px；hover 的 lift/duration/shadow 见上表白名单。任何非法值整条丢弃。
- **高度/padding**：宿主组件 CSS 里的字面量，没有变量可覆盖；宿主 class 是哈希名，按类名注入不可靠，故不应用。
- **hover 选择器**：侧栏按钮类名是 CSS Module 哈希（`_2H3hWW_newSession`，本地名 `newSession` 保留）；不用 `aria-label`（随语言变，且顶部品牌按钮共用同一标签）。宿主升级改了本地名时选择器空匹配——hover 消失但不报错，换版本时以侧栏 CSS 复核。
- **导入的 PaletteDoc**：只有颜色，没有组件信息 → 组件层（含 hover）清空（回退宿主默认）。

---

## C. 插件包结构与客户端半侧激活

### C.1 包结构

```text
# 仓库根即插件包根
├── package.json        # dsh.bundle.patch + dsh.client + exports + engines/peers（见 Interface Contracts）
├── cordis.patch.yml    # - insert: [{ id: 'design-md-switcher', name: 'design-md-switcher' }]
├── lib/index.js        # Host 半侧：导出 Config schema（volatile 字段）；apply 为空体
├── lib/client.js       # 客户端半侧：lazy-CJS factory（由 src/client.ts 经 clientBundle 预设复刻构建）
├── assets/designs/     # claude.md / sap.md / playstation.md（构建期内联进 client bundle）
└── README.md
```

- Host 半侧为**空 apply + Config schema**：这是官方 `ui-settings-*` 伴生包的确切模式——"宿主半侧是一个空的 apply，只为让本包占一条 Loader 行"（asar:L485703/L486191）。设置表单只投影"active 且唯一寻址的 profile 条目"的 volatile 字段（asar:L971819），无 volatile 字段的命名空间会被拒（`Plugin entry "ns" has no volatile fields`，asar:L972460）——**Host 半侧存在的意义就是承载这个 schema**。
- patch 行的 `name` **必须是裸包名**：客户端半侧只挂在 specifier 恰为裸包名的行上（KB adding-a-settings-card.md §5）；`id` 即设置命名空间。
- 客户端 bundle 必须是 lazy-CJS factory 格式（登记包名 + `factory(require)`）；仓库外的包要自己复刻 `packages/client/tsdown.client.ts` 的 clientBundle 预设（KB adding-a-settings-card.md §5）。React 来自浏览器模块表（`PLATFORM_MODULES`，asar:L377053、L292622），无需自带。
- **客户端编写铁律**（官方装饰模板规则，asar:L292610）：不得 require 任何 Harness Client 包作为模块；自绘控件、样式**只引用 `--dsw-alias-*` Token**；`dsh.client.inject` 仅影响激活顺序。

### C.2 客户端半侧激活机制

- **发现**：Client 模块系统 Node 半（`dsh-client-modules`）增量扫描宿主 Loader 条目，找声明了 `dsh.client` 的包；`dsh.client` 合法字段为 `platform: string`、`inject/external: string[]`、`immediately: boolean`（asar:L377358-377363），且必须导出 `exports["./client"]`（asar:L378897）。我们的声明：`platform: "web"`（唯一已文档化的值；desktop 走同一路径）、`immediately: true`（尽早预取脚本，减少基座主题闪烁）、无 `external`（不 import 任何宿主包）。
- **送达**：Host 把 `WebBootGraph` 写入 `window.__DSH_BOOT__`，经 `/plugins/??<pkg>/client.js&rev=…` combo 路由（带 mtime/ctime/size 派生的 revision）提供脚本（KB client-modules.md）。页面侧 lazy-CJS 表物化 factory，Cordis Loader 据此创建 entry；`inject` 声明的服务全部就绪后 `apply` 才执行（KB framework/service.md）。
- **desktop 与 web 的加载路径差异**：**代码路径相同**——desktop 是 Electron 壳加载本机回环 GUI（本会话 GUI 即 http://127.0.0.1:19387），复用同一 webserver + `/plugins` 路由 + 同一 Client 模块系统；desktop 的 profile 是 Electron 保留的 Desktop profile，经 `loadProfileDirectory` 加载（asar:L356344）。差异只在**更新时机**：随附 `web` 模板启用 HMR 实时重载，其余模板 patch 仅在启动时应用（asar:L356344）——即 **web 改动可热生效，desktop 需重启应用**（或刷新页面取新 boot graph）。客户端 bundle 内容变更经 `rebuilt()` 进入图（KB client-modules.md）。
- **注入清单（客户端半侧返回的插件）**：`inject = ['theme', 'slots', 'locale', 'configForms']`。`theme` 由 `@deepseek-ai/dsh-client-ui-theme` 以 `ctx.provide("theme", …)` 提供（asar:L698491），普通服务注入即可用；`configForms` 由 `dsh-client-ui-settings` 提供。无需 `remote`（theme 半侧要它是因为转发设置失效事件，我们不直接订阅 remote）。

---

## D. design.md 的发现与读取

### D.1 结论：v1 全部在客户端侧解决

| 来源 | desktop | web | 通道 |
|---|---|---|---|
| 内置 17 套设计 | ✅ | ✅ | 随包内置：17 份 design.md 在构建期预解析为常量内联（每份 JSON ~1–3KB，合计 ~35KB，可接受）；`tests/fixtures/builtin/*.md` 逐份镜像防漂移 |
| JSON 配色导入/导出 | ✅ | ✅ | 纯客户端：导出=剪贴板/下载（Blob），导入=粘贴文本 + 校验 + 写入 config |
| design.md 文件导入 | ✅ | ✅ | 浏览器 `<input type="file">` + FileReader：用户**主动挑选**文件，desktop 与 web 同样可用（Electron 支持文件选择），客户端侧用 A 节同一解析器 |
| 磁盘目录自动扫描 | ❌ v1 不做 | ❌ | 无可用通道，理由见下 |

**目录扫描不可行的理由（证据在案）**：静态组合包的 Host 半侧没有面向自己客户端半侧的数据通道——`host.call`/`harness.handle` 是动态包专属机制（asar:L732350、L732666）；`ctx.remote.<ns>` 的远端命名空间由 `@deepseek-ai/dsh-api-remotes` 在装配期从内置包选定，第三方 Host 插件无法注册新远端（KB web-client.md：Client 侧 assembly 选择"这些生成贡献"）；`dsh-resource://file` 协议是会话授权的 Workspace 文件元数据（KB client-resources.md），非任意路径读取；精确 Fetch 路由仅文档提及内置功能自有下载，未开放注册 API。唯一的非正式通道（Host 半侧把解析结果写进自己的 volatile config 字段、客户端经 configForms 镜像读取）把"程序数据"混进"用户设置"，且会渲染进插件设置表单，弃用。
**升级路径**：若宿主未来向第三方开放远端命名空间或 Fetch 路由注册，Host 半侧再加"目录扫描→设计集清单"通道；契约预留 Host 半侧 `apply` 的扩展位（当前为空体）。

### D.2 设计集身份与到达顺序

- 设计集注册表（客户端内存态）= 内置 17 套 + `customDesigns`（config 反序列化）+ 本次会话导入未保存项。列表项：`{ id, name, version, origin: 'builtin'|'imported' }`。
- 客户端半侧不向 Host 请求任何设计数据；Host 半侧不感知 design.md 的存在。**理由**：主题应用全在页面侧（overrideTokens 是 client 服务方法）；持久化只需存"映射产物 + 元数据"，不需要存 design.md 原文。

---

## E. 设置交互与持久化

### E.1 信息架构（settings.general.item 行）

注册范式与 ui-theme 一致（asar:L698512-698534：直接 `ctx.slots.inject("settings.general.item", () => ctx.slots.register({ name, id, order }, Row))`，**不用** whileServed 门控——ui-theme 即无门控，行在非回环页面也可显示）。行自绘一切：该插槽 owner 不传任何 props，文案/当前值/写入路径全由注册方通过自有 inject face 提供（asar:L737015-737016）。`id: 'design-md-switcher'`，`order: 12`（appearance=10、font-size=11 之后）。

行内控件（`React.createElement` 工厂，无 JSX 依赖——构建产物里 JSX 已编译；装饰规则要求自绘控件、只引用 `--dsw-alias-*` Token，asar:L292610）：

1. **当前设计摘要**：名称 + 5 枚色板小方块（bg-base/brand-primary/label-primary/success/warn）。
2. **设计选择器**：可用设计列表（内置+导入），点选即**立即应用**（解析→映射→overrideTokens + 组件面样式层），对齐 ui-theme 行为（setTheme 即时生效）。
3. **删除导入设计**（v0.3.0）：导入条目右侧「删除」两段确认（首点变「确认删除」）。删除激活中的设计先回退默认主题（释放颜色层 + 组件层 + 清 `activeDesign`），再从 `customDesigns` 移除；内置设计不可删；`customDesigns` 损坏时不提供删除（先导出原文抢救）。
4. **恢复默认**：清空 override 层 + 组件面层 + `activeDesign=''`。
5. **导入**：两个入口——`导入 JSON`（textarea 粘贴）/ `导入 design.md 文件`（`<input type="file">`）；导入成功即追加进 `customDesigns` 并选中。
6. **导出 JSON**：把当前激活设计的映射产物序列化为 E.3 schema，写入剪贴板（失败降级为行内可复制的展开文本）。
7. **错误/诊断区**：解析失败、Token 跳过数、非回环不可持久化提示（见 F）。

不建独立分区（`settings.section`）：v1 一行足够，`settings.section`（整页 nav 身份）留作升级路径。

### E.2 持久化：DSH 配置系统（不用 localStorage）

- **Config schema（Host 半侧导出，volatile 字段）**：

```ts
import Schema from '@deepseek-ai/schemastery'
export const Config = Schema.object({
  activeDesign: Schema.string().volatile().default(''),      // 激活设计 id；'' = 无
  customDesigns: Schema.string().volatile().default('[]'),   // 导入的设计集数组（JSON 文本）
})
export function apply() {}                                   // Host 半侧空体
```

- 语义依据：设置表单只投影 volatile 字段（asar:L971819）；volatile-only 变更由 Loader **就地提交**并发出 `loader/volatile-update`，不重挂插件；普通字段变更才触发 remount（asar:L272364）。持久化落点 = profile patch（ui-theme 的 `ui-theme` 命名空间"默认持久化到 `$DSH_HOME/cordis.patch.yml`"，asar:L696645），同一机制。
- **客户端读取**：`const scope = ctx.configForms.get('design-md-switcher')`（命名空间=Loader 行 id；theme 即 `ctx.configForms.get('ui-theme')`，asar:L698490）。scope 形状（asar:L489305/489323 与 theme 用法 L698290/L698340）：`getSnapshot(): { value: section }`、`subscribe(fn): unsub`、`set(field, value)`（写走 Host settings API，带修订栅栏）。
- **恢复流程（启动→读配置→解析→应用）**：
  1. 客户端 boot → Cordis Loader 创建本 entry → `apply(ctx)` 执行，`inject` 四服务已就绪；
  2. `ctx.effect(() => scope.subscribe(reapply))` 订阅配置变更；scope 先以 schema 默认值提供自身，再异步采纳 Host 值（"The service provides itself immediately with the schema defaults … then loads the namespace"，asar:L696723）——因此**首次应用可能是默认值（''→无覆盖层），订阅回调随后带来真实选择并再次应用**；
  3. `reapply()`：读 section → 取激活设计（内置 or customDesigns 反序列化）→ A 节解析 → B 节映射 → `ctx.theme.overrideTokens('design-md-switcher', tokens)`；
  4. 幂等性：同 source 再调用=整层替换并重新置顶（事实 2；asar:L698371-698374），重复应用安全；
  5. 卸载/HMR/服务消失：`ctx.effect` 的 disposer 调用 overrideTokens 返回的 disposer → 层被精确移除（asar:L698390-698394），基座主题无损；必需服务消失时依赖插件自动 dispose、重现后自动重载（KB framework/service.md）。
- **非回环页面降级**：非回环 web 不创建 Host-backed scope（asar:L696723），选择仅存浏览器本地 observable、刷新即失（dev tools 开关同款行为，asar:L487967）。设置行显示"当前页面非回环连接，选择仅本页有效"。

---

## F. 失败路径

| 故障 | 行为 | 依据 |
|---|---|---|
| design.md 解析失败（导入时） | 不应用、不写入 customDesigns；行内显示首条诊断（"frontmatter 缺失"等） | A.3 fail-loud |
| 已持久化的设计集缺失/损坏（如升级后内置 id 变更、customDesigns JSON 坏） | 视同未激活：**不发 override 层**，行显示"设计集缺失，已回退默认"并保留原 JSON 供导出抢救 | 最小惊讶 |
| overrideTokens 运行时校验失败（裸字符串/缺 dark） | 校验发生在 `overrides.set` **之前**（asar:L698383-698388），抛错时**上一层原样保留**；客户端 catch 后行内显示"Token 校验失败：<message>" | 事实 2 |
| 部分颜色不可解析导致 Token 省略 | 照常应用其余 Token，行显示"N 个 Token 被跳过" | B.1 |
| theme 服务不存在/被卸载 | Cordis：必需依赖缺失则插件不加载/自动 dispose，已注入层随 effect disposer 移除 | KB framework/service.md |
| configForms 写失败（非回环/修订冲突） | `set()` 包 try/catch；失败仅影响持久化，**不影响本次会话的样式应用**；行内提示 | E.2 |
| **恢复默认** | = dispose 全部 override 层（本插件仅一个 source 层）：调用 overrideTokens disposer + `activeDesign=''`；若有其他插件层则不动（source 隔离，asar:L698374-698377） | — |
| 插件被禁用/卸载 | patch 行 disabled → entry 消失 → effect 清理 → 层移除，UI 回到基座主题 | asar:L892126（开关语义） |

---

## G. engines 字段建议（0.2.0-rc.2 实测）

**两个机制，一真一假**：
1. `engines.dsh` **纯声明性**：当前安装器与加载器**不强制** `dsh.manifestVersion` 或 `engines.dsh`，声明范围不拒绝不兼容宿主、不校验 SemVer 语法（asar:L887829；字段约定见 asar:L887789：SemVer 范围，可精确预发布版，与 `engines.node` 并列）。
2. **真正被强制的是 peerDependencies**：profile 导入插件前，DSH 把对 `@deepseek-ai/dsh` 与 `@deepseek-ai/dsh-*` 的 peer 声明与 `getDshRuntimeVersion()` 的唯一运行时版本逐一比对，**每个声明范围都必须匹配，预发布版参与范围匹配**（asar:L356346）。

**建议**（两处都写，语义一致）：

```jsonc
"engines": { "dsh": ">=0.2.0-rc.2 <0.3.0" },
"peerDependencies": { "@deepseek-ai/dsh": ">=0.2.0-rc.2 <0.3.0" }
```

- SemVer 预发布规则使该范围恰好覆盖 0.2.x 全系（含 rc）：`0.1.7-rc.2` 被 `>=0.2.0-rc.2` 排除；`0.3.0-rc.1` 因其 tuple(0.3.0) 无预发布比较子而不满足 `<0.3.0`。
- **不声明支持 0.1.7**：本插件依赖的 `theme.overrideTokens`/`configForms` 仅在 0.2.0-rc.2 上实证过；本机 upgrade-guide 中 0.1.7↔0.2.0 两版均无 theme/slots/configForms 相关条目（v0.2.0-rc.2 四篇：subpath-plugin-display-manifest、schedule-bundle-retired、remove-runtime-invariants、account-sign-in-errors；v0.1.7-rc.2 两篇：schedule-optional-bundle、transcript-view-legacy-normal），即**无文档化破坏**，但也不构成 0.1.7 可用的证据。若未来要支持 0.1.7：运行时特性探测（`typeof ctx.theme?.overrideTokens === 'function'`）+ 放宽范围，并需 0.1.7 宿主实测——列入 Open Question。
- `需求.md` 示例 `">=0.1.7-rc.2 <0.2.0"` 仅为范围语法示例，语义（锁定实测过的主版本线）由上范围继承。

---

## Interface Contracts

### IC-1 模块边界

| 边界 | 契约 |
|---|---|
| Host 半侧 (`lib/index.js`) | 导出 `Config`（schema，含 volatile 字段）与空 `apply`；**不读文件系统、不感知 design.md**；唯一职责=占 Loader 行 + 供设置服务投影命名空间 |
| 客户端半侧 (`lib/client.js`) | 唯一业务所在：解析/映射/应用/设置行/导入导出；`inject = ['theme','slots','locale','configForms']`；不 import 任何宿主 Client 包 |
| 与 `@deepseek-ai/dsh-client-ui-theme` 的关系 | 只经 `ctx.theme` 服务面交互（overrideTokens 的层语义、theme/change 事件）；不 import 其值、不复制其样式表 |
| 与其他插件的共存 | override 层按 source 隔离（一层 per source，后注册者逐 Token 胜出，asar:L698415-698423）；本插件 source 固定为包名 `design-md-switcher`；若另一插件也写这 20 个 Token，后者置顶胜出——属可预期叠层语义，非冲突 |

### IC-2 manifest 字段（package.json）

```jsonc
{
  "name": "design-md-switcher",
  "version": "0.1.0",
  "type": "module",
  "main": "lib/index.js",
  "exports": { ".": "./lib/index.js", "./client": "./lib/client.js" },
  "files": ["lib", "cordis.patch.yml", "README.md"],
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": { "platform": "web", "immediately": true }
  },
  "engines": { "dsh": ">=0.2.0-rc.2 <0.3.0" },
  "peerDependencies": { "@deepseek-ai/dsh": ">=0.2.0-rc.2 <0.3.0" }
}
```

`cordis.patch.yml`：`- insert:\n    - id: design-md-switcher\n      name: design-md-switcher`（id=设置命名空间；name=裸包名=客户端半侧挂载条件）。安装：Plugin Manager 或 `dsh plugin --profile desktop add <pkg>`；升级后 desktop 需重启（C.2）。

### IC-3 config schema（设置命名空间 `design-md-switcher`）

见 E.2 代码块。字段语义：`activeDesign` ∈ `'' | 'claude' | 'sap' | 'playstation' | <custom id>`；`customDesigns` = `Array<PaletteDoc>` 的 JSON 文本（单份上限 ~64KB、总量 ~256KB，超限导入拒绝并提示——上限值为工程约定，需实测确认无宿主侧隐含限制）。

### IC-4 导出/导入 JSON schema（`PaletteDoc v1`）

```jsonc
{
  "schema": "design-md-switcher.palette/v1",
  "id": "claude",                    // 导入时可重命名，规范小写、包内唯一
  "name": "Claude",
  "origin": { "kind": "design-md", "designName": "Claude", "designVersion": "alpha" },
  "tokens": {                        // ≤106 键；每键必须 light+dark 双字符串（宿主校验）
    "--dsw-alias-bg-base":     { "light": "#faf9f5", "dark": "#181715" },
    "--dsw-alias-brand-primary": { "light": "#cc785c", "dark": "#cc785c" }
    // …其余 104 键同形；允许缺键（应用时该 Token 回退基座）
  },
  "skipped": ["--dsw-alias-state-idle-primary"]   // 映射时被省略的 Token（诊断用，可为空数组）
}
```

导入校验顺序：`schema` 字段精确匹配 → `tokens` 逐键 `{light,dark}` 字符串对 → 至少 1 键 → 通过后写入 `customDesigns` 并激活。导出=当前映射产物的原样序列化（含 `skipped`）。

### IC-5 运行时事件与生命周期流

启动：client boot → apply → scope 订阅 + 首次 reapply → `theme/change` 由 theme 运行时自行发布（本插件不监听、不依赖）。恢复：重启后同一路径自动重放（E.2）。卸载：effect disposer → 层移除。

---

## Open Questions（仅阻塞级）

1. **0.1.7 的 `theme.overrideTokens` 是否存在**——本机只有 0.2.0-rc.2 宿主，无法核验；在获得 0.1.7 宿主实测前，engines/peers 锁 0.2.x 是唯一可守的结论。
2. **非回环页面上 `scope.set()` 的确切行为**（静默本地化还是拒绝/抛错）——证据仅覆盖 developerTools 偏好（"不发送 Host 写入"，asar:L487967），未覆盖任意命名空间；实现时 try/catch 兜底即可，不阻塞设计。
3. **volatile 字段值的体积上限**（设置文档/表单描述符对长 JSON 字符串的容忍度）——未见文档化；IC-3 的 64KB/份为工程自限，上真机验证一次即可解除。
