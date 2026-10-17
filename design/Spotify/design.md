---
# Spotify 设计规范 → DeepSeek Harness 消费子集（design-md-switcher v0.8，双配色）
# colors 取浅色、colors.dark 取深色（同一套语义键、两张色表）；
# typography.body / display-xl → 字体族与正文字号；rounded → 圆角；
# components.button-new-session.hover → 侧栏「新会话」按钮悬浮。
version: "alpha"
name: "Spotify"
colors:
  canvas: "#ffffff"
  surface-soft: "#f8f8f8"
  surface-card: "#f0f0f0"
  ink: "#121212"
  body: "#4d4d4d"
  body-strong: "#2a2a2a"
  muted: "#7c7c7c"
  muted-soft: "#b3b3b3"
  hairline: "rgba(18, 18, 18, 0.12)"
  hairline-soft: "rgba(18, 18, 18, 0.08)"
  primary: "#1db954"
  primary-active: "#15873d"
  primary-disabled: "#b3f0c9"
  success: "#1db954"
  warning: "#ffa42b"
  error: "#e91429"
  accent-teal: "#539df5"
  accent-amber: "#ffa42b"
  dark:
    surface-dark: "#121212"
    surface-dark-elevated: "#1f1f1f"
    surface-dark-soft: "#181818"
    on-dark: "#ffffff"
    on-dark-soft: "#b3b3b3"
    primary: "#1ed760"
    primary-active: "#1db954"
    hairline: "rgba(255, 255, 255, 0.16)"
    hairline-soft: "rgba(255, 255, 255, 0.10)"
    success: "#1ed760"
    warning: "#ffa42b"
    error: "#f3727f"
typography:
  body:
    fontFamily: "SpotifyMix, Circular, sans-serif"
    fontSize: "16px"
  display-xl:
    fontFamily: "SpotifyMix, Circular, sans-serif"
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
      shadow: "0 4px 12px rgb(18 18 18 / 0.12)"
      duration: 120ms
---
