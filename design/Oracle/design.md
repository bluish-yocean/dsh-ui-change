---
# Oracle 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "Oracle"
colors:
  primary: "#312d2a"
  primary-pressed: "#47423e"
  ink: "#161513"
  ink-deep: "#211e1c"
  canvas: "#ffffff"
  hairline: "#e4e1dd"
  error: "#d63b25"
  surface-soft: "#fbf9f8"
  hairline-soft: "#d4cfca"
  accent-amber: "#f0cc71"
  accent-teal: "#d6e5e5"
  muted-soft: "#aea8a2"
  surface-card: "#fbf9f8"
  body: "#161513"
  muted: "#161513"
  primary-active: "#312d2a"
  primary-disabled: "#e4e1dd"
  # v0.8.10：补显式状态色。此前缺 success/warning，状态链接到了
  # accent-teal(#d6e5e5 近白青)/accent-amber(#f0cc71 浅金)，色相与语义无关。
  success: "#1d7a3e"
  warning: "#8a6100"
typography:
  body:
    fontFamily: "Oracle Sans"
    fontSize: "16px"
  display-xl:
    fontFamily: "Georgia"
rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 15px
components:
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(22 21 19 / 0.12)"
      duration: 120ms
---
