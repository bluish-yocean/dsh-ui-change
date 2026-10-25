---
# Zapier 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "Zapier"
colors:
  primary: "#ff4f00"
  ink: "#201515"
  body: "#605d52"
  canvas: "#fffefb"
  body-strong: "#36342e"
  muted: "#939084"
  muted-soft: "#c5c0b1"
  surface-soft: "#f8f4f0"
  hairline: "rgba(32, 21, 21, 0.12)"
  hairline-soft: "rgba(32, 21, 21, 0.08)"
  surface-card: "#f8f4f0"
  primary-active: "#ff4f00"
  primary-disabled: "rgba(32, 21, 21, 0.12)"
  # v0.9.0：状态色按 Zapier 调色板补齐（此前缺三键 → 三个 state Token 整键跳过）
  success: "#1f8a65"
  warning: "#b45309"
  error: "#c0392b"
typography:
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "18px"
  display-xl:
    fontFamily: "Degular Display, Inter, system-ui, -apple-system, sans-serif"
rounded:
  sm: 6px
  md: 12px
components:
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(32 21 21 / 0.12)"
      duration: 120ms
---
