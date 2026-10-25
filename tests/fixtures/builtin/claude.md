---
# Claude 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.5+，双配色）
# light 取 colors、dark 取 colors.dark；同一套语义键、两张色表。
#   colors / colors.dark     → 25 个设计基座 --dsw-*（light/dark 值对：18 基础 + 2 按钮面 +
#                              菜单图标/材质、焦点环、tooltip 键帽、开关滑块）；
#                              另有 81 个 var()/color-mix 别名引用随基座自动跟随（v0.7）
#   typography.body          → --dsw-font-family + --dsh-content-font-size（10–22px）
#   typography.display-*     → --dsw-font-family-brand
#   rounded                  → --dsw-radius-xs/sm/md/lg/xl（panel 由 xl 兜底）
#   components.button-new-session.hover → 侧栏「新会话」按钮悬浮（lift/shadow/duration）
# 暗色表取自原 design.md：面/文字用 surface-dark* / on-dark*；
# hairline 原稿只有浅色，用 on-dark 的 16%/10% 派生；primary 与状态色沿用同一值。
version: alpha
name: Claude
colors:
  # 浅色配色（与备份 design.md 的基础色一致）
  primary: "#cc785c"
  primary-active: "#a9583e"
  primary-disabled: "#e6dfd8"
  ink: "#141413"
  body: "#3d3d3a"
  body-strong: "#252523"
  muted: "#6c6a64"
  muted-soft: "#8e8b82"
  # 备份里 hairline 是 #e6dfd8/#ebe6df，与宿主卡片底（bg-layer-2=#e8e0d2）几乎同色，
  # 浅色界面线框会消失；改用备份 ink 的 20%/12% 叠色，保证卡片/输入框边框可见。
  hairline: "rgba(20, 20, 19, 0.20)"
  hairline-soft: "rgba(20, 20, 19, 0.12)"
  canvas: "#faf9f5"
  surface-soft: "#f5f0e8"
  surface-card: "#efe9de"
  surface-cream-strong: "#e8e0d2"
  accent-teal: "#5db8a6"
  accent-amber: "#e8a55a"
  success: "#5db872"
  warning: "#d4a017"
  error: "#c64545"
  # 深色配色：面/文字直通暗色系键；描边与状态用同名语义键覆盖 flip 推导
  dark:
    surface-dark: "#181715"
    surface-dark-elevated: "#252320"
    surface-dark-soft: "#1f1e1b"
    on-dark: "#faf9f5"
    on-dark-soft: "#a09d96"
    primary: "#cc785c"
    primary-active: "#a9583e"
    hairline: "rgba(250, 249, 245, 0.16)"
    hairline-soft: "rgba(250, 249, 245, 0.10)"
    success: "#5db872"
    warning: "#d4a017"
    error: "#c64545"
typography:
  # 全局正文字体 + 正文字号（--dsw-font-family / --dsh-content-font-size）
  body:
    fontFamily: "StyreneB, Inter, sans-serif"
    fontSize: 16px
  # 展示字体族（--dsw-font-family-brand，欢迎页标题）
  display-xl:
    fontFamily: "Copernicus, Tiempos Headline, serif"
rounded:
  # --dsw-radius-xs/sm/md/lg/xl；--dsw-radius-panel 由 xl(16px) 兜底
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
components:
  # 侧栏「新会话」按钮 hover（宿主唯一消费的组件行为段）
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(20 20 19 / 0.12)"
      duration: 120ms
---
