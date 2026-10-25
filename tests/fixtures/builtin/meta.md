---
# Meta 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "Meta"
colors:
  primary: "#0064e0"
  primary-deep: "#0457cb"
  success: "#31a24c"
  warning: "#f7b928"
  canvas: "#ffffff"
  surface-soft: "#f1f4f7"
  ink-deep: "#0a1317"
  ink: "#1c1e21"
  charcoal: "#444950"
  hairline: "#ced0d4"
  hairline-soft: "#dee3e9"
  primary-disabled: "#0091ff"
  body-strong: "#000000"
  accent-teal: "#a121ce"
  error: "#e41e3f"
  muted: "#4b4c4f"
  muted-soft: "#8595a4"
  surface-card: "#f1f4f7"
  body: "#4b4c4f"
  primary-active: "#0064e0"
typography:
  body:
    fontFamily: "Optimistic VF"
    fontSize: "16px"
  display-xl:
    fontFamily: "Optimistic VF"
rounded:
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 16px
components:
  button-new-session:
    hover:
      lift: 1px
      shadow: "0 4px 12px rgb(28 30 33 / 0.12)"
      duration: 120ms
---
