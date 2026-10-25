# Changelog — design-md-switcher

## 0.9.0 (2026-10-25)

9 套内置方案补齐状态色 + 状态色候选链收上游语义别名 + 移除第二品牌色兜底 + 状态色相闸门 + 徽章可见性修复：

- **修复提问卡「推荐」徽章文字不可见**：宿主 `dsh-client-ui-user-questions` 的徽章把
  `--dsw-specific-sidebar-nav-item-active-accent` 当背景、`--dsw-alias-button-info-fill` 当文字，
  而本插件把前者也映射成 `brand-primary` → 背景与文字同值，徽章只剩一块色块。
  该 Token 在宿主里是「强调色的最浅阶」（浅色 `#e4edfd` 淡蓝底、深色深灰底），本就不该是饱和色；
  现改映射为 `color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent)` ——
  品牌淡底 + 饱和品牌字，深浅两套配色自动跟随。此 Token 全仓只有徽章一个使用方，无其他面副作用。
- **补齐 5 套内置方案的状态色（第一批）**：Apple / Cursor / Playstation / SAP / Zapier 的
  `colors` 缺状态键，浅色链全空 → 映射器按 B.1 整键省略 `state-success/warn/error-primary`，
  宿主因此保留 DSH 默认状态色、观感不跟方案走。取值：Apple 取 Apple HIG 系统色
  （浅 `#34c759/#ff9500/#ff3b30`，深 `#30d158/#ff9f0a/#ff453a`）；Cursor 的 warning
  取上游 timeline-done 实测色 `#c08532`；Playstation 的 success 按自身调色板补
  `#1a7f4b`；SAP 取 Fiori 语义色（浅 `#e9730c/#bb0000`，深 `#f0a04b/#e06666`）；
  Zapier 按自身调色板补 `#1f8a65/#b45309/#c0392b`。
  **Playstation / Zapier 无上游状态色实测数据**，这两套的值按各自调色板补齐，非实测。
- **补齐 5 套内置方案的状态色（第二批）**：Airbnb（`success #008a05` / `warning #b26a00`）、
  HP（`#0e8a3e` / `#a85b00`）、Oracle（`#1d7a3e` / `#8a6100`）、SAP（补 `success #256f3a`，
  warning/error 已在第一批）、Webflow（补 `warning #b45309`，success 沿用 `#00d722`）。
  这 5 套缺 success/warning 键时，状态链兜底到 `accent-teal` / `accent-amber`，借到的是各方案
  「第二品牌色」的色相：Airbnb success 紫 274°、warn 洋红 334°；HP 青灰 195° / 红 0°；
  Oracle 近白青 180° / 浅金 43°；SAP 天蓝 206°；Webflow 品红 313°。
  **这 5 套无上游状态色实测数据**，值按各自调色板补齐。只补浅色表：这几套缺暗色状态键时，
  `mode:'same'` 会按 `lum < 0.3` 自动翻转提亮（B.3 #11-13）。
- **状态色候选链收上游语义别名**：success 追加 `semantic-success|success-accent|positive`、
  warn 追加 `semantic-warning|accent-warning|attention`、error 追加
  `semantic-error|critical|accent-danger|negative`（dark 链同这三组）。仓库 `design-md/`
  的第三方 DESIGN.md 多用这套键名，此前导入即整键跳过。既有方案命中的位置在前几位，
  顺序未动，取色不漂移。
- **状态链移除第二品牌色兜底（行为变化）**：`accent-teal` / `accent-amber` 从 success / warn 的浅色链删除
  （dark 链本来没有这两个键，error 链不动）。这两个键是各方案的「第二品牌色」，色相与
  成功 / 警告语义无关，留着会让后续新增的方案继续借到紫 / 蓝 / 品红。
  影响面：只给这两个键、不给 success/warning 的第三方 design.md，状态 Token 现在**整键省略**、
  回落 DSH 默认状态色，不再借到错色相——这是 0.9.0 相对 0.8.x 唯一的观感级破坏性变更。
- **测试闸门**：新增「17 套内置 `skipped` 全空 + 三个状态 Token 均有非空 light/dark」、
  「`semantic-*` 别名喂进状态 Token」与「状态色相必须语义正确」（success 落 [85,175]、
  error 落 [340,360]∪[0,30]、warn 不得与 error 同色；`hsl()`/`rgba()` 值跳过不误判）三条用例；
  测试 77 项全绿（`node tests/run.js`）。
- `design/{Apple,Cursor,Playstation,SAP,Zapier,Airbnb,HP,Oracle,Webflow}/design.md` 与
  `tests/fixtures/builtin/` 下同名 fixture 字节级同步；契约 B.2 候选键、B.3 第 11/12/13 行与说明同步。

## 0.8.9 (2026-10-25)

github spec 安装修复：包根迁到仓库根 + vendor 纳入 git。

- **包根迁到仓库根**：`package.json`、`lib/`、`tests/`、`cordis.patch.yml`、
  `CHANGELOG.md` 从 `design-md-switcher/` 子目录上移到仓库根。此前仓库根没有
  `package.json`，`dsh plugin --profile desktop add github:bluish-yocean/dsh-ui-change`
  取不到包清单，装不上；现在只有一份 `package.json`，是唯一版本真源
  （`repository.directory` 随之删除）。
- **`lib/vendor` 纳入 git**：此前 `.gitignore` 的 `node_modules/` 规则把
  `lib/vendor/node_modules/` 一并吞掉，clone 后 vendor 缺失。规则收窄为
  `/node_modules/`（只锚定仓库根，不用 `!` 反选），schemastery 3.18.4 /
  cosmokit / @standard-schema/spec 的 vendor 树随之入库，仍零依赖下载、
  无 postinstall / prepare。
- **修复 Config 降级**：vendor 缺失时 `lib/index.js` 的 schemastery 静态导入失败，
  Host 半侧 Config 降级为纯形状对象，宿主拒建设置命名空间并抛
  `Cannot read properties of undefined (reading 'validate')`。vendor 入库后走真实
  Schema，Host 断言恢复通过。
- **打包白名单补 `CHANGELOG.md`**：`files` 增加该文件，包内可见变更记录。
- 测试 73 项全绿（`node tests/run.js`，零依赖）。

## 0.8.8 (2026-10-18)

侧栏与主工作区底色区分 + SAP 深色收敛：

- **侧栏/主区最小色差**：部分设计两者取到同一表面（SAP/IBM/NVIDIA/BMW 深色、Webflow
  浅色等），侧栏与工作区背景完全一样。映射后新增兜底：侧栏与 `bg-base` 对比度
  < 1.1 时改成 `color-mix(bg-base 92%, label-primary 8%)`，17 套 × 浅/深都保证
  可辨差异（实测 1.10–1.37）。
- **SAP 深色重调**：原 `navy #022879` 作整页底色过亮、且主色翻转成荧光蓝。
  改为克制的深海军蓝 `surface-dark #0a1b30`、抬高面 `#162b47`、侧栏 `#142a44`，
  主色显式 `#4a74c4`（hover `#3a5fa8`），描边用 `on-dark` 的 16%/10% 叠色；
  深浅对比保留但不再刺眼。
- 新增闸门：17 套两套配色「侧栏 vs bg-base 对比度 ≥ 1.1」+ SAP 深色主色/底色的显式断言；
  测试 73 项全绿。
- `design/SAP/design.md` 与 `tests/fixtures/builtin/sap.md` 字节级同步。

## 0.8.7 (2026-10-18)

修复设置卡片/输入框/行分隔线在部分方案下消失（Ferrari 深色等）：

- **根因**：`--dsw-alias-border-l1/l2` 直接取设计里的 hairline；Ferrari 深色的
  hairline（#303030/#2a2a2a）与设置卡片底（bg-layer-1 = #303030）几乎同色，
  「恢复默认/导出/导入」按钮、textarea、行分隔等线框全部看不见。
- **修复**：映射完成后做「描边最小对比度」兜底——l1/l2 若与面板
  （bg-base / bg-layer-1 / bg-layer-2）对比度 < 1.2，则该方案换成文字色叠色线
  （l1 18%、l2 12% 的 label-primary）。设计本身的 hairline 在对比度足够时保持原样。
- 覆盖 17 套 × 浅/深；新增对比度闸门（每个描边 Token 对三种面板都 ≥ 1.2）；
  测试 72 项全绿。

## 0.8.6 (2026-10-18)

修复 Windows 标题栏布局下分割线仍然不可见：

- **0.8.5 为什么不够**：Windows 标题栏布局把侧栏的 `border-right` 关掉了
  （layout：`[data-windows-titlebar] .sidebarCol{border-right:none}`），侧栏与主区
  只靠「侧栏底色 vs `bg-base`」区分；BMW 深色两者都是 `#1a2129`，改 border-l3
  不会有任何线被画出来。
- **修复**：激活设计期间在组件面样式层追加
  `[data-windows-titlebar] [class*="_centerCol"]{border-left:.5px solid var(--dsw-alias-border-l3)}`
  （与 macOS 布局的 centerCol 左描边对齐；侧栏折叠时 `[data-sidebar-collapsed]`
  自动关闭）。描边色仍用 0.8.5 的 border-l3 文字色叠色，17 套两套配色都有对比。
- 类名按 CSS Module 本地名子串定位（`_centerCol`，同 `_newSession` 先例）；宿主改
  本地名时规则空匹配，不报错。
- 测试 71 项全绿（组件层闸门新增该规则断言）。

## 0.8.5 (2026-10-18)

修复侧栏/工作区分割线在部分方案下消失：

- **根因**：布局把分割线画在 `--dsw-alias-border-l3` 上，而插件此前把 l3/l4 直通
  `border-l1`；部分设计的 l1 与面板同色（PlayStation 浅色 `#f3f3f3`、BMW 深色
  `#1a2129` 等），分割线对比度只有 1.0–1.2，等于看不见。
- **修复**：l3/l4 改为「当前文字色叠色」——`color-mix(in srgb, var(--dsw-alias-label-primary) 28%, transparent)`
  与 36%。浅色下是深色半透明线、深色下是浅色半透明线，17 套方案两套配色下都与
  侧栏/主工作区保持对比；菜单外框（深色菜单用 l3）同步受益。
- 新增 17 套 × 浅/深的分割线对比度闸门（label-primary 28% 叠加后与 sidebar/bg
  对比度 ≥ 1.5）；测试 71 项全绿。

## 0.8.4 (2026-10-18)

设置行交互改进：

- **选中框可见性**：此前选中项用 `border-l1` + `bg-layer-1`，在暗色方案里两者可能与
  设置卡片同色（Ferrari 等复现「选中框看不见」）。改为品牌色 1px 内描边 +
  12% 品牌色底 + 加粗 + 右侧 ✓，17 套浅/深方案下选中态都醒目；同时移除对
  `border-l1`/`bg-layer-1` 的依赖。
- **列表折叠**：默认只显示前 6 套方案，底部「展开其余 11 个方案」按钮展开/收起。
- **行标题与插件描述**：设置行标题从「设计规范（design.md）」改为「UI设计方案选择」
  （中英文案同步），包 `description` 与 README 安装路径同步更新。
- 测试 70 项全绿（新增选中态/折叠/标题的源码闸门）。

## 0.8.3 (2026-10-18)

修复 tooltip 白底白字（17 套配色全量检查）：

- **根因**：DSH 的 tooltip 气泡文字是固定白色（`--dsw-static-neutral-bluish-00`），
  而 `--dsw-alias-tooltip-bg` 此前直通 `var(--dsw-alias-button-contrast-fill)`；
  该 Token 在深色方案下是亮色（on-dark），于是深色界面里出现白底白字
  （上下文用量、会话/工作区悬停提示等全部受影响）。
- **修复**：`--dsw-alias-tooltip-bg` 改为设计基座 Token——浅色取 ink（深底），
  深色取 `surface-dark` 系列（无暗色表时翻转推导为 4–10% 亮度），保证
  两套配色下气泡始终是深色；`--dsw-alias-tooltip-key-bg` 改为
  `color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)`（宿主同款推导），
  白色键帽字在任何方案下都可读。
- 新增 17 套内置设计的 tooltip 对比度闸门（浅/深两套 luminance < 0.25）；
  同时审计了宿主 CSS 里所有“固定白/黑字 + 主题背景”的组合，只有 tooltip 一处。
- 测试 70 项全绿。

## 0.8.2 (2026-10-17)

17 套内置设计的浅色方案修正（参考 design-md/<id>/DESIGN.md 原始稿，ID 忽略大小写）：

- **Ferrari**：原稿是暗底品牌（canvas #181818），浅色表误用了暗色；改为原稿 light 家族：
  canvas `#ffffff`、surface-soft `#f7f7f7`、surface-card `#ebebeb`、ink `#181818`、
  hairline `#d2d2d2`、body-on-light `#181818`；深色表保留原暗色面。
- **Spotify**：原稿为纯暗色（无 frontmatter），浅色表此前直接沿用暗色；改为白底派生
  （canvas `#ffffff`、surface-soft `#f8f8f8`、ink `#121212`、primary `#1db954`），
  深色表保留原暗色品牌色。
- **NVidia**：`surface-elevated #1a1a1a`（暗色抬高面）此前被映射到浅色 `surface-card`，
  导致浅色卡片发黑；改为映射到 `colors.dark.surface-dark-elevated`，浅色卡面回落到
  `surface-soft #f7f7f7`。
- 校验：17 套浅色 bg-base 亮度全部 ≥ 0.93（15 套纯白，Claude 0.95、Cursor 0.93、
  Zapier 0.99）；`design/*/design.md` ≡ `tests/fixtures/builtin/*.md` 逐份一致；
  测试 69 项全绿。

## 0.8.1 (2026-10-17)

插件列表说明文字：

- `exports` 增加 `"./package.json": "./package.json"`：宿主插件清单（`readPluginMeta`）
  通过包导出解析 `design-md-switcher/package.json`，之前未导出导致列表行无说明。
- `description` 改为中文一句话，作为列表行说明（与 dsh-doc-suite 同机制；
  需要多语言时可在 `locale/<lang>.json` 的 `meta.title/description` 覆盖）。
- 测试 69 项全绿。

## 0.8.0 (2026-10-17)

内置设计从 3 套扩到 **17 套**，且全部整理为 DSH 消费子集：

- 新增内置：Airbnb / Apple / BMW / Cursor / Ferrari / HP / IBM / Meta / NVidia /
  Oracle / Spotify / Tesla / Webflow / Zapier（连同 Claude、SAP、PlayStation 共 17）。
- 每份 `design/*/design.md` 按 Claude 的做法重新整理：删除散文与未消费字段，
  只保留 `colors`（可带 `colors.dark`）/`typography`（body + display-xl）/
  `rounded`（xs..xl）/`components.button-new-session.hover`；未知颜色键按语义
  归并到设计基座（如 `hairline-strong → hairline`、`semantic-error → error`），
  缺失的 hairline/面/文字档位用 ink 叠色或同族最近值补位。
- 16 份非 Claude 规范由脚本从原始营销稿生成；Spotify（暗色品牌）与 Tesla（亮色品牌）
  无 frontmatter，按正文品牌色手工重构为双配色基座。
- `BUILTIN_DESIGNS` 预解析常量重写为 17 条；`tests/fixtures/builtin/<id>.md` 逐份镜像，
  一致性测试扩到 17 套；原始 Sap/PlayStation 营销稿保留为解析健壮性 fixture。
- README 增加说明：「通用 → 通用设置 → 设计规范」内置 17 套配色，也支持上传自定义
  MarkDown 文件。
- 测试 69 项全绿（+17 套内置一致性 +1 内置计数/唯一性闸门）。

## 0.7.0 (2026-10-17)

别名层全覆盖（Token 25 → 106）：新增 81 个 `var()` / `color-mix()` 引用 Token，
结构对齐 DSH 自身“别名引用别名”，两套配色自动跟随 25 个设计基座：

- **面/描边**：`bg-layer-3`、`bg-module-platform`、`bg-multi-select`、`bg-document-preview`、
  `border-l3/l4`、`border-l2-darkmode-thin`。
- **品牌/按钮**：`brand-text`、`brand-primary-invert`、`button-primary-fill/dimmed`、
  `button-floating-fill`、`button-ghost-active-*`、`button-info-*`、`button-tool-bar-*`。
- **交互**：`interactive-bg-active`、`interactive-bg-hover-accent/danger/solid`。
- **文字/链接**：`label-caption`、`label-dimmed`、`label-primary-bluish/dimmed/foreground/inverted`、
  `label-shimmer`、`label-deep-diving(-shimmer)`、`label-document-preview`、`link`。
- **Markdown/菜单/滚动条/设置卡**：`markdown-*`（8）、`menu-group-header-fill`、
  `scrollbar-*`（4）、`settings-card-fill/stroke`。
- **状态/浮层/diff/组件专属**：`state-*`（8）、`toast-bg/label`、`tooltip-bg`、
  `turn-trigger-bg(-hover)`、`code-diff-*`、`file-diff-*`（6）、`specific-*`（10）。
- **不覆盖**（DSH 有意固定/非设计语义）：`--dsw-static-*` 色阶、`bg-mask-*`、
  `bg-document-selection`、`bg-skeleton`、`border-inverted*`、遗留别名
  `brand-primary-new-color*`、阴影/几何/字体变量。
- design.md 不需要新字段；导出 JSON 中这些键的值是 `var()` / `color-mix()` 原文。
- 测试 54 项全绿（引用层全覆盖/不跳过、Sap 清单改为按基座减去跳过项校验）。

## 0.6.0 (2026-10-17)

菜单/焦点/浮层颜色跟随设计（Token 20 → 25）：

- **新增 5 个 Token**（契约 B.3 #21-25）：
  - `--dsw-alias-menu-icon` ← `muted-soft|muted|mute-light|ink-meta|body|ink`
    （dark：`on-dark-soft|on-dark-mute|mute-dark`）——菜单前置图标色。
  - `--dsw-menu-surface-fill` ← `surface-card|surface-soft|canvas` 压 **92%** 叠色
    （dark：`surface-dark-elevated|…` 压 **90%**）——菜单卡片材质，保留一点透感。
  - `--dsw-focus-ring-color` ← `primary`（dark：同品牌色）——焦点环改品牌色；
    宿主未定义时回退 `#4176E6/#7AAAFF`。
  - `--dsw-alias-tooltip-key-bg` ← `surface-soft|surface-card|canvas`
    （dark：`on-dark|canvas-light`）——深色 tooltip 气泡上的浅色键帽。
  - `--dsw-alias-switch-thumb` ← `canvas|canvas-light`（dark：`on-dark|canvas-light`）
    ——开关滑块。
- design.md 不需要新字段：现有设计色即可覆盖；Sap/PlayStation 无 dark 表，暗色走旧推导。
- 旧 PaletteDoc（≤20 键）继续有效，缺键回退基座。
- 测试 53 项全绿（新增 v0.6 取值断言；Sap 跳过清单/T 清单同步）。

## 0.5.1 (2026-10-17)

浅色界面线框不可见修复（Claude 浅色配色）：

- **根因**：浅色 `hairline`/`hairline-soft` 取原设计的 `#e6dfd8`/`#ebe6df`，与宿主卡片底
  `bg-layer-2 = #e8e0d2`（surface-cream-strong）几乎同色，1px 边框在卡片/输入框上等于隐形。
- **修复**：浅色 hairline 改为备份 `ink #141413` 的 20%/12% 叠色（`rgba(20,20,19,0.20)` /
  `rgba(20,20,19,0.12)`），`border-l1`/`border-l2` 在 cream 底上清晰可见；暗色表不变。
- 同步 fixture 与内置常量；文档注明该值为「备份派生」（原稿没有低对比线框）。
- 测试 52 项全绿。

## 0.5.0 (2026-10-17)

design.md 双配色：`colors` 下新增 `dark:` 暗色配色表（Token 仍 20 个）：

- **schema**：`colors.dark` 是与 `colors` 同词表的一张色表；解析进 `DesignDoc.darkColors`，
  不参与浅色映射；空 map/未知键按诊断处理、不报错。
- **映射优先级**（B.1 终值规则）：① `colors.dark` 的暗色系候选键（`surface-dark` / `on-dark` …）
  ② `colors.dark` 里与 light 链同名的语义键（`hairline` / `success` / `primary` …）
  ③ 未提供 `colors.dark` 时沿用旧单表 dark 链 ④ 场景规则 / flip 推导。
- **Claude**：按备份 `design.md.bak-20261017-172115` 拆成两套——light 取原基础色；
  dark 取原暗色面/文字（`surface-dark #181715`、`on-dark #faf9f5` 等），描边用
  `on-dark` 的 16%/10% 派生。结果：边框/状态色不再靠 flip（如 border-l1 =
  `rgba(250,249,245,0.16)`、state-error 保持 `#c64545`），暗色下有独立的按钮面
  （`#252320`）与 sidebar（`#1f1e1b`）。
- **兼容**：未带 `colors.dark` 的 design.md 与全部旧 JSON 调色板行为不变（测试覆盖）。
- 测试 52 项全绿（新增双配色取值、局部暗色表回退、fixture/内置暗色表一致性）。

## 0.4.0 (2026-10-17)

「新会话」按钮底色/hover 底色跟随设计（Token 18 → 20）：

- **新增 2 个按钮面 Token**（契约 B.3 #19-20）：
  - `--dsw-alias-button-elevated-fill` ← `canvas|canvas-light|surface-card|surface-soft`
    （dark：`surface-dark-elevated|surface-dark-card|ink-elevated`；链空 `flip(·,0.10,0.16)`）。
    侧栏「新会话」按钮底色不再恒白（宿主 `--dsw-static-*`），跟随当前设计。
  - `--dsw-alias-button-floating-hover` ← `ink|body-strong|ink-deep` 压 **6%**
    （dark：`on-dark|on-dark-mute|canvas-light` 压 **8%**；链空 `flip(·,0.70,0.90)` 再压 8%）。
    hover 底色跟随设计，与 ghost 悬浮底同一 tint 语义。
- **design.md 不需要新字段**：`canvas`/`ink` 本就在三份内置设计的 colors 里；
  导入的旧 PaletteDoc（≤18 键）继续有效，缺键回退基座。
- 与 v0.3.1 的 hover 位移/阴影叠加，构成完整悬浮反馈。
- 测试 50 项全绿（新增 v0.4 三个内置设计的按钮面断言；Token 清单 18→20）。

## 0.3.2 (2026-10-17)

Claude design.md 收敛为 DSH 消费子集（唯一一份样例同步）：

- **删除（宿主不消费）**：围栏后的全部散文正文（Overview/Colors/Typography/Layout/
  Elevation/Shapes/Components/Responsive/Iteration/Do-Don't/Known Gaps）、`spacing`
  段、除 `button-new-session.hover` 外的全部 `components` 条目、未被映射的颜色
  `on-primary`、`typography` 中除 `body`/`display-xl` 外的 12 条、`rounded` 的
  `pill`/`full`、`description`（解析后无任何消费者）。
- **新增（DSH 有效内容）**：分组注释逐条标注落到的 `--dsw-alias-*`/组件面变量；
  显式 `typography.body`（宿主主键，原来只有 `body-md` 走回退链）；
  顶部消费契约注释（colors/typography/rounded/hover 各自去向）。
- **同步**：`tests/fixtures/claude.md` 字节级镜像；`BUILTIN_DESIGNS.claude` 同形
  （colors 24 键、typography body+display-xl、rounded xs..xl）。
- **测试**：claude 解析断言改为"零诊断 + 结构白名单"（无死键）；49 项全绿。

## 0.3.1 (2026-10-17)

「新会话」按钮 hover 悬浮（design.md 驱动的第一条组件面行为）：

- **design.md 新段**：`components.button-new-session.hover`，可选
  `lift`（非负 px，正数向上）、`shadow`（CSS box-shadow 文本）、`duration`
  （ms/s）。只在内置设计上有来源（与既有组件面一致；导入的 PaletteDoc 仍只有颜色）。
- **应用**：`buildHoverCss` 生成
  `button[class*="_newSession"]` 的过渡 + `:hover` 上浮/阴影 + `:active` 回落
  + `prefers-reduced-motion` 兜底，拼进同一组件面 `<style>`；恢复默认/切到无该段的
  设计即清空。
- **选择器**：宿主按钮类名是 CSS Module 哈希（`_2H3hWW_newSession`，本地名
  `newSession` 保留）；不用 `aria-label`（随语言变，且顶部品牌按钮同标签）。
  宿主升级改本地名时这条选择器空匹配，hover 消失但不报错。
- **注入安全**：lift/duration 白名单、shadow 禁 `;{}<>` 且 ≤200 字符，任一项不合法
  整项丢弃（design.md 是不可信输入）。
- Claude 内置设计补该段（`design/Claude/design.md` 与 fixture 同步）。
- 测试 49 项全绿（新增 hover CSS 生成、解析、注入拒绝 2 项，另加解析断言）。

## 0.3.0 (2026-10-17)

组件面样式 + 删除导入设计：

- **组件面样式层**（独立 `<style data-plugin-css="design-md-switcher/component.css">`）：
  - 圆角：design.md `rounded` → `--dsw-radius-xs/sm/md/lg/xl/panel`（宿主全局变量）。
  - 字体族：`typography.body` → `--dsw-font-family`；`typography.display-*` →
    `--dsw-font-family-brand`。
  - 正文字号：`typography.body.fontSize`（10–22px）→ `--dsh-content-font-size`，
    带 `!important` 压过主题 presenter 写在 body 上的内联值；恢复默认即归还
    用户字号偏好。
  - 导入的 PaletteDoc 只有颜色，没有组件信息 → 清空该层；恢复默认/设计缺失同。
  - 值做安全校验：圆角只收 0–64 的 px/rem/em；字体族拒绝 `{};<>` 并对多词族名
    补引号；字号只收 10–22px。design.md 是不可信输入，防 CSS 注入。
- **删除导入设计**：设置行每个导入条目新增「删除」，两段确认（首点变「确认删除」）。
  删除激活中的设计时先回退默认主题（释放颜色层 + 组件层 + 清 `activeDesign`），
  再从 `customDesigns` 移除；内置设计不可删；存储 JSON 损坏时不提供删除。
- **未做**：高度 / padding / 组件内字号在宿主是组件 CSS 字面量，没有可覆盖变量
  （README 范围天花板已写明）。
- 测试 47 项全绿（组件变量映射、注入安全、删除语义、组件层写入与清理）。

## 0.2.0 (2026-10-17)

按钮/交互颜色跟随 design.md（Token 14 → 18，仍全部是颜色）：

- **新增 4 个别名 Token**：
  - `--dsw-alias-button-primary-hover` ← `primary-pressed → primary-active →
    primary-deep`（dark 链空时 `flip` 提亮）。修复「蓝色主按钮 hover 变深灰」。
  - `--dsw-alias-interactive-bg-hover` ← `ink`/`on-dark` 压 6%/8% 透明度，
    ghost/次要按钮的悬浮底不再恒为宿主的半透明蓝灰。
  - `--dsw-alias-label-tertiary` ← `muted-soft / mute-light / ink-meta / ink-nav`，
    三级说明文字跟随设计灰阶。
  - `--dsw-alias-button-contrast-fill` ← `ink`（dark 取 `on-dark/canvas`）。
- **原因**：宿主把 `--dsw-alias-button-primary-fill` 派生自 `brand-primary`
  （填充本来就跟随），但 hover、悬浮底、三级文字、高对比填充直接绑
  `--dsw-static-*` 静态色板，只覆盖 14 个时会与设计色脱节。
- `parseColor` 增 `hsl()/hsla()` 分支（tint 派生要读回 `flip` 的产物）。
- Palette schema 不变（v1 形状）：旧调色板（≤18 键）继续有效，缺键回退基座。
- 未做：圆角/字号/高度/padding 没有对应 Token，仍不应用（README 范围天花板）。
- 测试 41 项全绿（新增 claude/sap/playstation 的 4 个新 Token 断言）。

## 0.1.3 (2026-10-17)

修复 v0.1.2 引入的启动崩溃（`web boot: 1 entry did not activate`）：

- **根因**：data-plugin-css 去重选择器把 `CSS_TAG_ID` 又套了一层
  `JSON.stringify`，拼出 `style[data-plugin-css=""design-md-switcher/row.css""]`。
  `JSON.stringify` 自带双引号，与属性选择器外层引号冲突 → 选择器非法，
  `document.querySelector` 在模块 import 期抛 SyntaxError，整条 web boot 失败
  （真机日志：`'style[data-plugin-css=""…""]' is not a valid selector`）。
- **修复**：新增 `cssTagIdSelector()` 按 CSS 字符串转义（`\` → `\\`、`"` → `\"`），
  注入处改为 `document.querySelector(cssTagIdSelector(CSS_TAG_ID))`；不再用
  `JSON.stringify`。
- **闸门**：新增选择器单测（合法形态 + 引号/反斜杠转义）与源码闸门
  （禁止 `JSON.stringify(CSS_TAG_ID)`），旧实现必红。

## 0.1.2 (2026-10-17)

修复真机首验发现的两处设置行缺陷（功能本体不受影响）：

- **设置行样式全丢**（按钮挤成一行、色板方块消失）：`styles` builtin 是动态包
  专属，bundle 作用域不存在，`styles.insert` 被守卫静默跳过。改用官方 bundle
  范式：手动 `<style>` + `data-plugin-css` 去重标签（150+ 处宿主先例）。
- **desktop 回环页误报「非回环连接」**：此前误查 scope 快照上不存在的 `mode`
  字段。ConfigFormController 快照真实形状是
  `{ value, status: 'idle'|'loading'|'ready'|'error', writable }`（设置表单与
  session-log 行的官方判定均为 `status === 'ready' && writable`），host-backed
  判定改为同一语义。
- 两处均以源码闸门锁进测试（38+ 项全绿）。

## 0.1.1 (2026-10-17)

修复：宿主激活失败（`TypeError: Cannot read properties of undefined (reading 'validate')`）。

- 根因：宿主要求 `Config` 实现 Standard Schema 接口（KB config.md:48），而
  schemastery 经 pnpm link 后无法从插件真实路径解析（`ERR_MODULE_NOT_FOUND`），
  降级形状对象没有 `~standard`，cordis `resolveConfig` 取 `.validate` 即崩
  （asar:L275635-275641）。
- 修复：schemastery 3.18.4（含 cosmokit、@standard-schema/spec，共 3 个 MIT
  小包，<1MB）**vendor 进插件** `lib/vendor/node_modules/`，相对路径静态导入，
  插件零外部运行时依赖。不做 node_modules 依赖安装（Windows 上 pnpm 隔离式
  junction 在本机 Node 的 ESM 解析下不落 realpath；hoisted 模式又会强制安装
  peer 整树）。
- 顺带把 volatile 字段语义实证清楚并锁进测试：volatile 字段宿主侧解析为
  `.get()` 引用（设置服务内部消费），客户端经 configForms 拿到的是解包裸值
  （ui-theme 先例 asar:L698340）。

## 0.1.0 (2026-10-17)

首次发布。

- 内置三份设计（Claude / Sap / PlayStation），design.md 的 `colors` 解析为
  14 个 `--dsw-alias-*` Token（light 候选链 + dark 直通/翻转推导）。
- 设置页 General 区新增「设计规范（design.md）」行：点选即应用、恢复默认、
  design.md 文件导入、JSON 粘贴导入、JSON 导出（剪贴板 + 降级文本框）、
  诊断区（解析失败 / Token 跳过数 / 设计缺失回退 / 非回环提示）。
- 持久化走 Host 配置系统（volatile 字段 `activeDesign` / `customDesigns`），
  重启自动恢复；卸载时 effect disposer 精确移除 override 层。
- 失败路径按契约 F 逐条兜底：解析失败不应用不写入；已存设计集损坏视同未
  激活并保留原文可导出；overrideTokens 校验失败保留上一层并行内报错。
- 测试：`node tests/run.js`（零依赖，38 项：解析器 / 映射器 / PaletteDoc /
  内置一致性 / manifest 结构）。
