---
# Ferrari 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "Ferrari"
colors:
  canvas: "#ffffff"
  surface-soft: "#f7f7f7"
  surface-card: "#ebebeb"
  ink: "#181818"
  body: "#666666"
  body-strong: "#181818"
  muted: "#666666"
  muted-soft: "#8f8f8f"
  hairline: "#d2d2d2"
  hairline-soft: "#ebebeb"
  primary: "#da291c"
  primary-active: "#b01e0a"
  primary-disabled: "#d2d2d2"
  success: "#03904a"
  warning: "#f13a2c"
  error: "#b01e0a"
  accent-teal: "#4c98b9"
  accent-amber: "#f6e500"
  dark:
    on-dark: "#ffffff"
    surface-dark: "#181818"
    surface-dark-elevated: "#303030"
    surface-dark-soft: "#222222"
    on-dark-soft: "#969696"
    primary: "#da291c"
    primary-active: "#b01e0a"
    hairline: "#303030"
    hairline-soft: "#2a2a2a"
    success: "#03904a"
    warning: "#f13a2c"
    error: "#b01e0a"
typography:
  body:
    fontFamily: "FerrariSans, sans-serif"
    fontSize: "14px"
  display-xl:
    fontFamily: "FerrariSans, sans-serif"
rounded:
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
components:
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(24 24 24 / 0.12)"
      duration: 120ms
---
