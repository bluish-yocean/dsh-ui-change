---
# BMW 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "BMW"
colors:
  primary: "#1c69d4"
  primary-active: "#0653b6"
  primary-disabled: "#d6d6d6"
  ink: "#262626"
  body: "#3c3c3c"
  body-strong: "#1a1a1a"
  muted: "#6b6b6b"
  muted-soft: "#9a9a9a"
  hairline: "#e6e6e6"
  canvas: "#ffffff"
  surface-soft: "#f7f7f7"
  surface-card: "#fafafa"
  success: "#22c55e"
  warning: "#f59e0b"
  error: "#dc2626"
  accent-teal: "#0066b1"
  hairline-soft: "rgba(38, 38, 38, 0.08)"
  dark:
    surface-dark: "#1a2129"
    surface-dark-elevated: "#262e38"
    on-dark: "#ffffff"
    on-dark-soft: "#bbbbbb"
typography:
  body:
    fontFamily: "BMW Type Next Latin, sans-serif"
    fontSize: "16px"
  display-xl:
    fontFamily: "BMW Type Next Latin, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
rounded:
  xs: 2px
  sm: 4px
  md: 8px
  lg: 12px
components:
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(38 38 38 / 0.12)"
      duration: 120ms
---
