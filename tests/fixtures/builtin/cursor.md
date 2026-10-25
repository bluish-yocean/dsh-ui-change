---
# Cursor 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "Cursor"
colors:
  primary: "#f54e00"
  primary-active: "#d04200"
  ink: "#26251e"
  body: "#5a5852"
  body-strong: "#26251e"
  muted: "#807d72"
  muted-soft: "#a09c92"
  hairline: "#e6e5e0"
  hairline-soft: "#efeee8"
  canvas: "#f7f7f4"
  surface-card: "#ffffff"
  surface-soft: "#fafaf7"
  error: "#cf2d56"
  success: "#1f8a65"
  primary-disabled: "#e6e5e0"
typography:
  body:
    fontFamily: "CursorGothic, sans-serif"
    fontSize: "16px"
  display-xl:
    fontFamily: "CursorGothic, sans-serif"
rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
components:
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(38 37 30 / 0.12)"
      duration: 120ms
---
