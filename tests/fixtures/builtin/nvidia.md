---
# NVidia 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "NVidia"
colors:
  primary: "#76b900"
  ink: "#000000"
  canvas: "#ffffff"
  surface-soft: "#f7f7f7"
  hairline: "#cccccc"
  body: "#1a1a1a"
  error: "#e52020"
  warning: "#df6500"
  muted: "#757575"
  muted-soft: "#a7a7a7"
  success: "#3f8500"
  accent-amber: "#feeeb2"
  accent-teal: "#952fc6"
  hairline-soft: "rgba(0, 0, 0, 0.08)"
  surface-card: "#f7f7f7"
  primary-active: "#76b900"
  primary-disabled: "#cccccc"
  dark:
    surface-dark: "#000000"
    on-dark: "#ffffff"
    on-dark-mute: "rgba(255,255,255,0.7)"
    primary: "#5a8d00"
    surface-dark-elevated: "#1a1a1a"
typography:
  body:
    fontFamily: "NVIDIA-EMEA"
    fontSize: "16px"
  display-xl:
    fontFamily: "NVIDIA-EMEA"
rounded:
  xs: 1px
  sm: 2px
components:
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(0 0 0 / 0.12)"
      duration: 120ms
---
