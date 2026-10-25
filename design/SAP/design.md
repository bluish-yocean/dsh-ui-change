---
# SAP 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "SAP"
colors:
  primary: "#0057d2"
  primary-deep: "#0040b0"
  canvas: "#ffffff"
  chrome: "#f5f6f7"
  ink: "#000000"
  ink-lead: "#3c3c3c"
  ink-meta: "#475e75"
  ink-nav: "#545454"
  hairline: "#475e75"
  accent-teal: "#6bc0ff"
  surface-soft: "#eaecee"
  body: "#223548"
  muted: "#354a5f"
  hairline-soft: "rgba(0, 0, 0, 0.08)"
  surface-card: "#eaecee"
  muted-soft: "#354a5f"
  primary-active: "#0057d2"
  primary-disabled: "#475e75"
  # v0.8.10：状态色取 Fiori 语义色（此前缺 warning/error → state-warn/error 整键跳过）
  warning: "#e9730c"
  error: "#bb0000"
  dark:
    # 深色取克制的深海军蓝（原稿 navy #022879 过亮）；主色不再走翻转（否则会变成
    # 荧光蓝），显式给中等饱和的 SAP 蓝。
    surface-dark: "#0a1b30"
    surface-dark-elevated: "#162b47"
    surface-dark-soft: "#142a44"
    on-dark: "#f5f7fa"
    on-dark-soft: "#b9c6d6"
    primary: "#4a74c4"
    primary-active: "#3a5fa8"
    hairline: "rgba(245, 247, 250, 0.16)"
    hairline-soft: "rgba(245, 247, 250, 0.10)"
    # 深底上提亮，保证状态色在深海军蓝上仍可辨
    warning: "#f0a04b"
    error: "#e06666"
typography:
  body:
    fontFamily: "72 Brand Variable"
    fontSize: "18px"
  display-xl:
    fontFamily: "72 Brand Variable"
rounded:
  sm: 4px
  md: 8px
  lg: 12px
components:
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(0 0 0 / 0.12)"
      duration: 120ms
---
