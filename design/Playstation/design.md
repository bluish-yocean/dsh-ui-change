---
# PlayStation 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "PlayStation"
colors:
  primary: "#0070d1"
  primary-pressed: "#0064b7"
  primary-active: "#004d8d"
  commerce: "#d53b00"
  ink: "#000000"
  ink-deep: "#121314"
  ink-elevated: "#181818"
  charcoal: "#1f2024"
  mute-light: "#6b6b6b"
  ash-light: "#cccccc"
  canvas-light: "#ffffff"
  surface-soft: "#f3f3f3"
  surface-card: "#f5f7fa"
  warning: "#c81b3a"
  accent-amber: "#d63d00"
  body: "rgba(0,0,0,0.6)"
  hairline: "#f3f3f3"
  hairline-soft: "rgba(0, 0, 0, 0.08)"
  muted: "rgba(0,0,0,0.6)"
  muted-soft: "rgba(0,0,0,0.6)"
  primary-disabled: "#f3f3f3"
  # v0.9.0：success 按 PlayStation 调色板补绿（此前缺 success → state-success 整键跳过）
  success: "#1a7f4b"
  dark:
    mute-dark: "rgba(229,229,229,0.55)"
    ash-dark: "rgba(229,229,229,0.2)"
    canvas-dark: "#000000"
    surface-dark-elevated: "#121314"
    surface-dark-card: "#181818"
    hairline-dark: "rgba(229,229,229,0.2)"
    on-dark: "#ffffff"
    on-dark-mute: "#cccccc"
    primary: "#53b1ff"
typography:
  body:
    fontFamily: "PlayStation SST"
    fontSize: "18px"
  display-xl:
    fontFamily: "PlayStation SST"
rounded:
  sm: 4px
  md: 8px
  lg: 16px
components:
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(0 0 0 / 0.12)"
      duration: 120ms
---
