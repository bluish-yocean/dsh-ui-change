---
# IBM 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "IBM"
colors:
  primary: "#0f62fe"
  ink: "#161616"
  canvas: "#ffffff"
  hairline: "#e0e0e0"
  muted: "#525252"
  muted-soft: "#8c8c8c"
  surface-soft: "#f4f4f4"
  surface-card: "#e0e0e0"
  primary-active: "#002d9c"
  success: "#24a148"
  warning: "#f1c21b"
  error: "#da1e28"
  accent-teal: "#0f62fe"
  hairline-soft: "rgba(22, 22, 22, 0.08)"
  body: "#525252"
  primary-disabled: "#e0e0e0"
  dark:
    surface-dark: "#161616"
    surface-dark-elevated: "#262626"
    on-dark: "#ffffff"
    on-dark-soft: "#c6c6c6"
typography:
  body:
    fontFamily: "IBM Plex Sans"
    fontSize: "16px"
  display-xl:
    fontFamily: "IBM Plex Sans"
rounded:
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
components:
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(22 22 22 / 0.12)"
      duration: 120ms
---
