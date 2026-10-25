---
# Webflow 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "Webflow"
colors:
  primary: "#080808"
  ink: "#080808"
  body: "#363636"
  hairline: "#d8d8d8"
  canvas: "#ffffff"
  body-strong: "#222222"
  muted: "#5a5a5a"
  muted-soft: "#ababab"
  accent-teal: "#7a3dff"
  accent-amber: "#ed52cb"
  primary-active: "#006acc"
  success: "#00d722"
  error: "#ee1d36"
  # v0.9.0：补显式 warning。此前缺 warning，状态链接到了 accent-amber(#ed52cb 品红)，
  # 色相与警告语义无关。
  warning: "#b45309"
  hairline-soft: "rgba(8, 8, 8, 0.08)"
  surface-soft: "#ffffff"
  surface-card: "#ffffff"
  primary-disabled: "#d8d8d8"
typography:
  body:
    fontFamily: "WF Visual Sans Variable, Inter, system-ui, sans-serif"
    fontSize: "16px"
  display-xl:
    fontFamily: "WF Visual Sans Variable, Inter, system-ui, sans-serif"
rounded:
  xs: 2px
  sm: 4px
  md: 8px
components:
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(8 8 8 / 0.12)"
      duration: 120ms
---
