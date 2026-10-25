---
# HP 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "HP"
colors:
  primary: "#024ad8"
  primary-deep: "#0e3191"
  ink: "#1a1a1a"
  ink-deep: "#000000"
  canvas: "#ffffff"
  charcoal: "#3d3d3d"
  hairline: "#e8e8e8"
  error: "#b3262b"
  primary-disabled: "#c9e0fc"
  body-strong: "#292929"
  surface-soft: "#f7f7f7"
  hairline-soft: "#e8e8e8"
  muted: "#636363"
  primary-active: "#0e3191"
  accent-amber: "#ff5050"
  accent-teal: "#356373"
  surface-card: "#f7f7f7"
  body: "#636363"
  muted-soft: "#636363"
  # v0.9.0：补显式状态色。此前缺 success/warning，状态链接到了
  # accent-teal(#356373 青灰)/accent-amber(#ff5050 红)，色相与语义无关。
  success: "#0e8a3e"
  warning: "#a85b00"
typography:
  body:
    fontFamily: "Forma DJR Micro"
    fontSize: "16px"
  display-xl:
    fontFamily: "Forma DJR Micro"
rounded:
  xs: 2px
  sm: 3px
  md: 4px
  lg: 8px
  xl: 16px
components:
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(26 26 26 / 0.12)"
      duration: 120ms
---
