---
# Tesla 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "Tesla"
colors:
  canvas: "#ffffff"
  surface-soft: "#f4f4f4"
  surface-card: "#eeeeee"
  ink: "#171a20"
  body: "#393c41"
  body-strong: "#5c5e62"
  muted: "#8e8e8e"
  muted-soft: "#d0d1d2"
  hairline: "#d0d1d2"
  hairline-soft: "#eeeeee"
  primary: "#3e6ae1"
  primary-active: "#3457b1"
  primary-disabled: "#d0d1d2"
  success: "#1e8e3e"
  warning: "#f5a623"
  error: "#e82127"
  accent-teal: "#5c5e62"
  accent-amber: "#f5a623"
  dark:
    surface-dark: "#171a20"
    surface-dark-elevated: "#1f242c"
    surface-dark-soft: "#12151a"
    on-dark: "#ffffff"
    on-dark-soft: "#8e8e8e"
    primary: "#3e6ae1"
    primary-active: "#3457b1"
    hairline: "rgba(255, 255, 255, 0.16)"
    hairline-soft: "rgba(255, 255, 255, 0.10)"
    success: "#1e8e3e"
    warning: "#f5a623"
    error: "#e82127"
typography:
  body:
    fontFamily: "Gotham SSm, Universal Sans, sans-serif"
    fontSize: "14px"
  display-xl:
    fontFamily: "Gotham SSm, Universal Sans, sans-serif"
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
      shadow: "0 4px 12px rgb(23 26 32 / 0.12)"
      duration: 120ms
---
