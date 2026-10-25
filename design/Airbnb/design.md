---
# Airbnb 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "Airbnb"
colors:
  primary: "#ff385c"
  primary-active: "#e00b41"
  primary-disabled: "#ffd1da"
  ink: "#222222"
  body: "#3f3f3f"
  muted: "#6a6a6a"
  muted-soft: "#929292"
  hairline: "#dddddd"
  hairline-soft: "#ebebeb"
  canvas: "#ffffff"
  surface-soft: "#f7f7f7"
  surface-card: "#ffffff"
  error: "#c13515"
  accent-teal: "#460479"
  accent-amber: "#92174d"
  # v0.8.10：补显式状态色。此前缺 success/warning，状态链接到了
  # accent-teal(#460479 紫)/accent-amber(#92174d 洋红)，色相与语义无关。
  success: "#008a05"
  warning: "#b26a00"
  dark:
    on-dark: "#ffffff"
typography:
  body:
    fontFamily: "Airbnb Cereal VF, Circular, sans-serif"
    fontSize: "16px"
  display-xl:
    fontFamily: "Airbnb Cereal VF, Circular, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif"
rounded:
  xs: 4px
  sm: 8px
  md: 14px
  lg: 20px
  xl: 32px
components:
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(34 34 34 / 0.12)"
      duration: 120ms
---
