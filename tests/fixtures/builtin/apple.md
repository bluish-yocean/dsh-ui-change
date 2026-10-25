---
# Apple 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "Apple"
colors:
  primary: "#0066cc"
  ink: "#1d1d1f"
  body: "#1d1d1f"
  hairline: "#e0e0e0"
  canvas: "#ffffff"
  muted-soft: "#cccccc"
  muted: "#7a7a7a"
  hairline-soft: "#f0f0f0"
  surface-soft: "#f5f5f7"
  surface-card: "#fafafc"
  primary-active: "#0066cc"
  primary-disabled: "#e0e0e0"
  dark:
    on-dark: "#ffffff"
    primary: "#2997ff"
    surface-dark-elevated: "#272729"
    surface-dark-card: "#2a2a2c"
    surface-dark-soft: "#252527"
    surface-dark: "#000000"
typography:
  body:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: "17px"
  display-xl:
    fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif"
rounded:
  xs: 5px
  sm: 8px
  md: 11px
  lg: 18px
components:
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(29 29 31 / 0.12)"
      duration: 120ms
---
