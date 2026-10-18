/* design-md-switcher — client half（浏览器 classic script；Node 自测走 factory stub）。
 * 设计 Token 词表与映射契约：docs/design-contract.md B 节；组件面：B.5。
 */
(function () {
  'use strict';

  var SOURCE = 'design-md-switcher';
  var CSS_TAG_ID = SOURCE + '/row.css';
  var LOCALE_NS = SOURCE;
  var LIMITS = { single: 64 * 1024, total: 256 * 1024 };
  var PALETTE_SCHEMA = 'design-md-switcher.palette/v1';

  /* ══════════════════════ 3. 设计 Token 词表（契约 B.3） ══════════════════════ */

  var TOKEN_TABLE = [
    { token: '--dsw-alias-bg-base', light: ['canvas', 'canvas-light', 'surface-soft', 'surface-card'], dark: ['canvas-dark', 'surface-dark', 'surface-dark-elevated', 'surface-dark-card', 'surface-dark-soft', 'ink-deep', 'ink'], flip: [0.04, 0.10] },
    { token: '--dsw-alias-bg-layer-1', light: ['surface-card', 'surface-soft', 'chrome', 'canvas'], dark: ['surface-dark-card', 'surface-dark-elevated', 'surface-dark-soft', 'charcoal', 'ink-elevated'], flip: [0.10, 0.16] },
    { token: '--dsw-alias-bg-layer-2', light: ['surface-cream-strong', 'surface-card', 'surface-soft'], dark: ['surface-dark-elevated', 'surface-dark-card', 'ink-elevated'], flip: [0.16, 0.22] },
    { token: '--dsw-alias-bg-overlay', light: ['canvas', 'canvas-light'], dark: ['surface-dark-elevated', 'surface-dark-card', 'ink-elevated'], flip: [0.14, 0.20] },
    { token: '--dsw-alias-border-l1', light: ['hairline', 'primary-disabled', 'muted'], dark: ['hairline-dark', 'ash-dark'], flip: [0.26, 0.36] },
    { token: '--dsw-alias-border-l2', light: ['hairline-soft', 'hairline'], dark: ['hairline-dark', 'ash-dark'], flip: [0.18, 0.26] },
    { token: '--dsw-alias-brand-primary', mode: 'brand', light: ['primary'], dark: [], flip: [0.35, 0.55] },
    { token: '--dsw-alias-label-primary', light: ['ink', 'body-strong', 'body'], dark: ['on-dark', 'on-dark-mute', 'canvas-light'], flip: [0.88, 0.96] },
    { token: '--dsw-alias-label-secondary', light: ['muted', 'muted-soft'], dark: ['on-dark-mute', 'on-dark-soft', 'mute-dark'], flip: [0.58, 0.70] },
    { token: '--dsw-alias-state-idle-primary', light: ['muted-soft', 'mute-light', 'ash-light', 'muted'], dark: ['on-dark-mute', 'ash-dark', 'mute-dark', 'on-dark-soft'], flip: [0.45, 0.55] },
    { token: '--dsw-alias-state-success-primary', mode: 'same', light: ['success', 'accent-teal'], dark: [], flip: [0.45, 0.62] },
    { token: '--dsw-alias-state-warn-primary', mode: 'same', light: ['warning', 'accent-amber'], dark: [], flip: [0.45, 0.62] },
    { token: '--dsw-alias-state-error-primary', mode: 'same', light: ['error', 'commerce', 'warning'], dark: [], flip: [0.45, 0.62] },
    { token: '--dsw-specific-sidebar-fill', light: ['chrome', 'surface-soft', 'surface-card', 'canvas'], dark: ['surface-dark-soft', 'surface-dark', 'canvas-dark', 'ink'], flip: [0.07, 0.13] },
    { token: '--dsw-alias-label-tertiary', light: ['muted-soft', 'mute-light', 'ink-meta', 'ink-nav', 'muted', 'body'], dark: ['on-dark-soft', 'on-dark-mute', 'mute-dark'], flip: [0.62, 0.74] },
    { token: '--dsw-alias-interactive-bg-hover', mode: 'tint', light: ['ink', 'ink-deep', 'body-strong', 'ink-lead'], dark: ['on-dark', 'canvas-light', 'on-dark-mute'], alpha: { light: 0.06, dark: 0.08 }, flip: [0.70, 0.90] },
    { token: '--dsw-alias-button-primary-hover', light: ['primary-pressed', 'primary-active', 'primary-deep', 'primary'], dark: [], flip: [0.30, 0.50] },
    { token: '--dsw-alias-button-contrast-fill', light: ['ink', 'ink-deep', 'ink-elevated', 'body-strong'], dark: ['on-dark', 'canvas-light', 'canvas'], flip: [0.72, 0.92] },
    { token: '--dsw-alias-button-elevated-fill', light: ['canvas', 'canvas-light', 'surface-card', 'surface-soft'], dark: ['surface-dark-elevated', 'surface-dark-card', 'ink-elevated'], flip: [0.10, 0.16] },
    { token: '--dsw-alias-button-floating-hover', mode: 'tint', light: ['ink', 'body-strong', 'ink-deep'], dark: ['on-dark', 'on-dark-mute', 'canvas-light'], alpha: { light: 0.06, dark: 0.08 }, flip: [0.70, 0.90] },
    { token: '--dsw-alias-menu-icon', light: ['muted-soft', 'muted', 'mute-light', 'ink-meta', 'body', 'ink'], dark: ['on-dark-soft', 'on-dark-mute', 'mute-dark'], flip: [0.58, 0.70] },
    { token: '--dsw-menu-surface-fill', mode: 'tint', light: ['surface-card', 'surface-soft', 'canvas'], dark: ['surface-dark-elevated', 'surface-dark-card', 'ink-elevated'], alpha: { light: 0.92, dark: 0.90 }, flip: [0.10, 0.16] },
    { token: '--dsw-focus-ring-color', light: ['primary'], dark: [], flip: [0.35, 0.55] },
    // tooltip 键帽改为引用层（相对 tooltip 气泡底提亮），见 LITERAL_TOKENS。
    { token: '--dsw-alias-switch-thumb', light: ['canvas', 'canvas-light'], dark: ['on-dark', 'canvas-light'], flip: [0.88, 0.96] },
    // v0.8.3：tooltip 气泡文字是固定白色（--dsw-static-neutral-bluish-00），
    // 气泡底必须在浅/深两套里都是深色；此前引用会在深色下变亮的
    // button-contrast-fill，导致「白底白字」。深色表取暗面键，无暗表时翻转推导。
    { token: '--dsw-alias-tooltip-bg', light: ['ink', 'ink-deep', 'body-strong', 'body'], dark: ['surface-dark', 'surface-dark-elevated', 'surface-dark-soft', 'ink-elevated'], flip: [0.04, 0.10] }
  ];
  /**
   * v0.7.0：剩余别名层 → 已有设计 Token 的 var()/color-mix 直通。
   * DSH 自己也是「别名引用别名」，这里保持同一结构：design.md 只需驱动
   * 上面 25 个基座 Token，其余 79 个别名自动跟随（light/dark 各自解析）。
   * 只收有设计语义的别名；--dsw-static-* 色阶、遮罩/选区/骨架等中性常量
   * 与几何/阴影/字体不在覆盖范围（见契约 B.3b）。
   */
  var LITERAL_TOKENS = [
    // 面
    ['--dsw-alias-bg-document-preview', 'var(--dsw-alias-bg-layer-2)'],
    ['--dsw-alias-bg-layer-3', 'var(--dsw-alias-bg-layer-1)'],
    ['--dsw-alias-bg-module-platform', 'var(--dsw-alias-bg-layer-2)'],
    ['--dsw-alias-bg-multi-select', 'var(--dsw-alias-bg-layer-2)'],
    // 描边
    ['--dsw-alias-border-l2-darkmode-thin', 'var(--dsw-alias-border-l2)'],
    // v0.8.5：侧栏/工作区分割线与菜单外框用「文字色 28%/36% 叠色」，而不是直通 border-l1：
    // 某些设计的 l1 与面板同色（PlayStation 浅色 #f3f3f3、BMW 深色 #1a2129+灰线），
    // 分割线会完全消失；文字色叠色在浅/深两套下都能保证对比。
    ['--dsw-alias-border-l3', 'color-mix(in srgb, var(--dsw-alias-label-primary) 28%, transparent)'],
    ['--dsw-alias-border-l4', 'color-mix(in srgb, var(--dsw-alias-label-primary) 36%, transparent)'],
    // 品牌
    ['--dsw-alias-brand-primary-invert', 'var(--dsw-alias-label-primary)'],
    ['--dsw-alias-brand-text', 'var(--dsw-alias-label-primary)'],
    // 按钮
    ['--dsw-alias-button-floating-fill', 'var(--dsw-alias-bg-layer-1)'],
    ['--dsw-alias-button-ghost-active-border', 'var(--dsw-alias-border-l1)'],
    ['--dsw-alias-button-ghost-active-fill', 'var(--dsw-alias-interactive-bg-hover)'],
    ['--dsw-alias-button-ghost-active-hover', 'var(--dsw-alias-interactive-bg-hover)'],
    ['--dsw-alias-button-info-fill', 'var(--dsw-alias-brand-primary)'],
    ['--dsw-alias-button-info-hover', 'var(--dsw-alias-button-primary-hover)'],
    ['--dsw-alias-button-primary-dimmed', 'var(--dsw-alias-bg-layer-1)'],
    ['--dsw-alias-button-primary-fill', 'var(--dsw-alias-brand-primary)'],
    ['--dsw-alias-button-tool-bar-fill', 'color-mix(in srgb, var(--dsw-alias-label-primary) 50%, transparent)'],
    ['--dsw-alias-button-tool-bar-fill-invisible', 'color-mix(in srgb, var(--dsw-alias-label-primary) 36%, transparent)'],
    ['--dsw-alias-button-tool-bar-hover', 'color-mix(in srgb, var(--dsw-alias-label-primary) 60%, transparent)'],
    // diff
    ['--dsw-alias-code-diff-added', 'color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent)'],
    ['--dsw-alias-code-diff-deleted', 'color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent)'],
    ['--dsw-alias-file-diff-added-bg', 'color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent)'],
    ['--dsw-alias-file-diff-added-gutter', 'color-mix(in srgb, var(--dsw-alias-state-success-primary) 6%, transparent)'],
    ['--dsw-alias-file-diff-added-marker', 'var(--dsw-alias-state-success-primary)'],
    ['--dsw-alias-file-diff-deleted-bg', 'color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent)'],
    ['--dsw-alias-file-diff-deleted-gutter', 'color-mix(in srgb, var(--dsw-alias-state-error-primary) 6%, transparent)'],
    ['--dsw-alias-file-diff-deleted-marker', 'var(--dsw-alias-state-error-primary)'],
    // 交互态
    ['--dsw-alias-interactive-bg-active', 'color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent)'],
    ['--dsw-alias-interactive-bg-hover-accent', 'color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent)'],
    ['--dsw-alias-interactive-bg-hover-danger', 'color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent)'],
    ['--dsw-alias-interactive-bg-hover-solid', 'var(--dsw-alias-bg-layer-1)'],
    // 文字
    ['--dsw-alias-label-caption', 'var(--dsw-alias-label-tertiary)'],
    ['--dsw-alias-label-deep-diving', 'var(--dsw-alias-brand-primary)'],
    ['--dsw-alias-label-deep-diving-shimmer', 'color-mix(in srgb, var(--dsw-alias-brand-primary) 30%, transparent)'],
    ['--dsw-alias-label-dimmed', 'var(--dsw-alias-label-tertiary)'],
    ['--dsw-alias-label-document-preview', 'var(--dsw-alias-label-secondary)'],
    ['--dsw-alias-label-primary-bluish', 'var(--dsw-alias-label-primary)'],
    ['--dsw-alias-label-primary-dimmed', 'var(--dsw-alias-label-primary)'],
    ['--dsw-alias-label-primary-foreground', 'var(--dsw-alias-bg-base)'],
    ['--dsw-alias-label-primary-inverted', 'var(--dsw-alias-bg-base)'],
    ['--dsw-alias-label-shimmer', 'color-mix(in srgb, var(--dsw-alias-label-primary) 30%, transparent)'],
    ['--dsw-alias-link', 'var(--dsw-alias-brand-primary)'],
    // Markdown
    ['--dsw-alias-markdown-citation', 'var(--dsw-alias-bg-layer-2)'],
    ['--dsw-alias-markdown-code-block', 'var(--dsw-alias-bg-layer-2)'],
    ['--dsw-alias-markdown-code-block-banner', 'var(--dsw-alias-bg-layer-1)'],
    ['--dsw-alias-markdown-code-segment-selected', 'var(--dsw-alias-bg-base)'],
    ['--dsw-alias-markdown-code-segment-unselected', 'var(--dsw-alias-bg-layer-1)'],
    ['--dsw-alias-markdown-inline-code', 'var(--dsw-alias-bg-layer-2)'],
    ['--dsw-alias-markdown-placeholder', 'var(--dsw-alias-label-tertiary)'],
    ['--dsw-alias-markdown-tag', 'var(--dsw-alias-bg-layer-2)'],
    // 菜单
    ['--dsw-alias-menu-group-header-fill', 'var(--dsw-menu-surface-fill)'],
    // 滚动条
    ['--dsw-alias-scrollbar-bg-l1', 'var(--dsw-alias-label-tertiary)'],
    ['--dsw-alias-scrollbar-bg-l2', 'var(--dsw-alias-label-tertiary)'],
    ['--dsw-alias-scrollbar-hover-l1', 'var(--dsw-alias-label-secondary)'],
    ['--dsw-alias-scrollbar-hover-l2', 'var(--dsw-alias-label-secondary)'],
    // 设置卡片
    ['--dsw-alias-settings-card-fill', 'var(--dsw-alias-bg-layer-1)'],
    ['--dsw-alias-settings-card-stroke', 'var(--dsw-alias-border-l1)'],
    // 状态
    ['--dsw-alias-state-business-primary', 'var(--dsw-alias-brand-primary)'],
    ['--dsw-alias-state-business-tertiary', 'color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent)'],
    ['--dsw-alias-state-error-secondary', 'var(--dsw-alias-state-error-primary)'],
    ['--dsw-alias-state-success-secondary', 'var(--dsw-alias-state-success-primary)'],
    ['--dsw-alias-state-success-tertiary', 'color-mix(in srgb, var(--dsw-alias-state-success-primary) 16%, transparent)'],
    ['--dsw-alias-state-warn-label', 'var(--dsw-alias-state-warn-primary)'],
    ['--dsw-alias-state-warn-secondary', 'var(--dsw-alias-state-warn-primary)'],
    ['--dsw-alias-state-warn-tertiary', 'color-mix(in srgb, var(--dsw-alias-state-warn-primary) 16%, transparent)'],
    // 浮层
    ['--dsw-alias-toast-bg', 'var(--dsw-alias-button-contrast-fill)'],
    ['--dsw-alias-toast-label', 'var(--dsw-alias-bg-base)'],
    // 键帽取气泡底提亮 18%（宿主同款推导）：tooltip 的白色键帽字始终可读。
    ['--dsw-alias-tooltip-key-bg', 'color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)'],
    ['--dsw-alias-turn-trigger-bg', 'var(--dsw-alias-bg-layer-2)'],
    ['--dsw-alias-turn-trigger-bg-hover', 'var(--dsw-alias-interactive-bg-hover)'],
    // 组件专属
    ['--dsw-specific-bubble', 'var(--dsw-alias-bg-layer-1)'],
    ['--dsw-specific-bubble-highlight', 'var(--dsw-alias-brand-primary)'],
    ['--dsw-specific-input-major', 'var(--dsw-alias-bg-layer-1)'],
    ['--dsw-specific-login-input', 'var(--dsw-alias-bg-layer-2)'],
    ['--dsw-specific-menu', 'var(--dsw-menu-surface-fill)'],
    ['--dsw-specific-selector', 'var(--dsw-alias-bg-layer-2)'],
    ['--dsw-specific-sidebar-nav-item-active', 'var(--dsw-alias-bg-layer-1)'],
    ['--dsw-specific-sidebar-nav-item-active-accent', 'var(--dsw-alias-brand-primary)'],
    ['--dsw-specific-sidebar-nav-item-hover', 'var(--dsw-alias-interactive-bg-hover)'],
    ['--dsw-specific-tip', 'var(--dsw-alias-bg-layer-2)']
  ];
  var TOKEN_NAMES = TOKEN_TABLE.map(function (entry) { return entry.token; })
    .concat(LITERAL_TOKENS.map(function (pair) { return pair[0]; }));
  /** 摘要色板展示的 5 个 Token（契约 E.1 第 1 条）。 */
  var SUMMARY_TOKENS = ['--dsw-alias-bg-base', '--dsw-alias-brand-primary', '--dsw-alias-label-primary', '--dsw-alias-state-success-primary', '--dsw-alias-state-warn-primary'];

  /**
   * 已知 colors 词表 = 契约 B.2 候选键集合 ∪ B.3 light 链用到的键。
   * colors 里词表之外的键按 A.3「未知键」记入解析诊断（不报错、不参与映射）。
   */
  var KNOWN_COLOR_KEYS = (function () {
    var known = {};
    var extra = ['canvas-dark', 'ink', 'charcoal', 'ink-elevated', 'primary', 'primary-disabled', 'primary-active', 'primary-pressed', 'primary-deep', 'mute-dark', 'ash-dark', 'on-dark-mute', 'on-dark-soft', 'mute-light', 'ash-light', 'ink-meta', 'ink-nav', 'ink-lead', 'error', 'commerce', 'accent-teal', 'accent-amber', 'surface-cream-strong'];
    TOKEN_TABLE.forEach(function (entry) {
      entry.light.forEach(function (k) { known[k] = true; });
      entry.dark.forEach(function (k) { known[k] = true; });
    });
    extra.forEach(function (k) { known[k] = true; });
    return known;
  })();

  var FRONTMATTER_TOP_KEYS = ['version', 'name', 'description', 'colors', 'typography', 'rounded', 'spacing', 'components'];

  /* ══════════════════════ 1. 颜色原语（契约 B.1） ══════════════════════ */

  /** parse(c)：hex(#RGB/#RGBA/#RRGGBB/#RRGGBBAA) / rgb() / rgba() / hsl() / hsla() → {r,g,b,a}；其余 → null。 */
  function parseColor(text) {
    if (typeof text !== 'string') return null;
    var s = text.trim();
    var hex = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(s);
    if (hex) {
      var h = hex[1];
      if (h.length === 3 || h.length === 4) {
        h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2) + (h.length === 4 ? h.charAt(3) + h.charAt(3) : '');
      }
      return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
    }
    var fn = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(s);
    if (fn) {
      return { r: parseFloat(fn[1]), g: parseFloat(fn[2]), b: parseFloat(fn[3]), a: fn[4] === undefined ? 1 : parseFloat(fn[4]) };
    }
    // flipColor 自己产出 hsl()，tint 派生要再吃回去（v0.2.0）。
    var hsl = /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(s);
    if (hsl) {
      var converted = hslToRgb(parseFloat(hsl[1]), parseFloat(hsl[2]) / 100, parseFloat(hsl[3]) / 100);
      return { r: converted.r, g: converted.g, b: converted.b, a: hsl[4] === undefined ? 1 : parseFloat(hsl[4]) };
    }
    return null;
  }

  /** hslToRgb(h, s, l)：h 度数、s/l 0..1 → 0..255 的 RGB（parseColor 的 hsl 分支用）。 */
  function hslToRgb(h, s, l) {
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var hp = (((h % 360) + 360) % 360) / 60;
    var x = c * (1 - Math.abs((hp % 2) - 1));
    var rgb = hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
    var m = l - c / 2;
    return { r: Math.round((rgb[0] + m) * 255), g: Math.round((rgb[1] + m) * 255), b: Math.round((rgb[2] + m) * 255) };
  }

  /** lum(c)：sRGB 线性化后 0.2126R + 0.7152G + 0.0722B（契约 B.1）。 */
  function luminance(rgb) {
    function lin(v) {
      var c = v / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
  }

  /** WCAG 对比度（v0.8.7 描边最小对比度兜底用）。 */
  function contrastRatio(a, b) {
    var la = luminance(a), lb = luminance(b);
    var hi = Math.max(la, lb), lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  }

  function rgbToHsl(rgb) {
    var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h: h, s: s, l: l };
  }

  /**
   * flip(c, lo, hi)：HSL 亮度翻转，L = clamp(1−L, lo, hi)，H/S 保留，alpha 置 1，
   * 输出 `hsl(H, S%, L%)`（H/S/L 取整到整数）。parse 失败 → null（契约 B.1）。
   */
  function flipColor(text, range) {
    var rgb = parseColor(text);
    if (!rgb) return null;
    var hsl = rgbToHsl(rgb);
    var l2 = Math.min(range[1], Math.max(range[0], 1 - hsl.l));
    return 'hsl(' + Math.round(hsl.h) + ', ' + Math.round(hsl.s * 100) + '%, ' + Math.round(l2 * 100) + '%)';
  }

  /** 宽松颜色串判定：parse 可解析，或 hsl()/color()/currentColor，或 3-32 位字母（命名色/transparent）。 */
  function looksLikeColor(text) {
    if (typeof text !== 'string') return false;
    var s = text.trim();
    if (!s || s.length > 128) return false;
    if (parseColor(s)) return true;
    return /^(hsla?\(|color\(|currentColor$)/i.test(s) || /^[a-z]{3,32}$/i.test(s);
  }

  /** withAlpha(c, a)：解析颜色后按给定透明度输出 rgba()；不可解析 → null（tint 派生用）。 */
  function withAlpha(text, alpha) {
    var rgb = parseColor(text);
    if (!rgb) return null;
    return 'rgba(' + Math.round(rgb.r) + ', ' + Math.round(rgb.g) + ', ' + Math.round(rgb.b) + ', ' + alpha + ')';
  }

  /* ══════════════════════ 2. design.md 解析器（契约 A） ══════════════════════ */

  /**
   * YAML 子集逐行解析：扁平 map、一层嵌套 map、标量（去引号/去行尾注释）、
   * `|`/`>` 块标量。重复键后值胜出（A.3）。不引第三方 YAML 库。
   */
  function parseYamlSubset(text) {
    var lines = text.split(/\r?\n/);
    var root = {};
    var stack = [{ indent: -1, target: root }];
    var i = 0;
    while (i < lines.length) {
      var line = lines[i];
      var trimmed = line.trim();
      if (trimmed === '' || trimmed.charAt(0) === '#') { i += 1; continue; }
      var indent = line.length - line.replace(/^ +/, '').length;
      var match = /^([^:#]+):\s?(.*)$/.exec(trimmed);
      if (!match) { i += 1; continue; }
      var key = match[1].trim();
      var rest = match[2];
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
      var parent = stack[stack.length - 1].target;
      if (rest === '|' || rest === '>' || rest === '|-' || rest === '>-') {
        var collected = [];
        var blockIndent = -1;
        i += 1;
        while (i < lines.length) {
          var raw = lines[i];
          var content = raw.trim();
          if (content === '') { collected.push(''); i += 1; continue; }
          var contentIndent = raw.length - raw.replace(/^ +/, '').length;
          if (contentIndent <= indent) break;
          if (blockIndent < 0) blockIndent = contentIndent;
          collected.push(raw.slice(Math.min(blockIndent, contentIndent)));
          i += 1;
        }
        var value = collected.join(rest.charAt(0) === '>' ? ' ' : '\n');
        while (value.charAt(value.length - 1) === '\n') value = value.slice(0, -1);
        parent[key] = value;
        continue;
      }
      if (rest === '') {
        var j = i + 1;
        while (j < lines.length && (lines[j].trim() === '' || lines[j].trim().charAt(0) === '#')) j += 1;
        var nextIndent = j < lines.length ? lines[j].length - lines[j].replace(/^ +/, '').length : -1;
        if (j < lines.length && nextIndent > indent) {
          var child = {};
          parent[key] = child;
          stack.push({ indent: indent, target: child });
          i = j;
          continue;
        }
        parent[key] = '';
        i += 1;
        continue;
      }
      parent[key] = parseScalar(rest);
      i += 1;
    }
    return root;
  }

  /** 标量：去行尾注释（引号外的 " #"），去成对引号并反转义最小集。 */
  function parseScalar(rest) {
    var inQuote = '';
    var out = rest;
    for (var i = 0; i < out.length; i += 1) {
      var ch = out.charAt(i);
      if (inQuote) {
        if (ch === inQuote) inQuote = '';
      } else if (ch === '"' || ch === "'") {
        inQuote = ch;
      } else if (ch === '#' && i > 0 && out.charAt(i - 1) === ' ') {
        out = out.slice(0, i);
        break;
      }
    }
    out = out.trim();
    if (out.length >= 2 && ((out.charAt(0) === '"' && out.charAt(out.length - 1) === '"') || (out.charAt(0) === "'" && out.charAt(out.length - 1) === "'"))) {
      out = out.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    }
    return out;
  }

  function normalizeId(name) {
    var id = String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return id || 'design';
  }

  /**
   * 解析一份 design.md → DesignDoc { id, name, version, colors, diagnostics,
   * description, unused }（契约 A.3 产物）。必需字段不满足时抛错（fail loud）。
   * @param text 文件全文
   * @param fallbackName name 缺失时的回退（文件名去扩展名）
   */
  function parseDesignDoc(text, fallbackName) {
    var body = String(text == null ? '' : text);
    if (body.charCodeAt(0) === 0xfeff) body = body.slice(1);
    var lines = body.split(/\r?\n/);
    var first = 0;
    while (first < lines.length && lines[first].trim() === '') first += 1;
    if (first >= lines.length || lines[first].trim() !== '---') {
      throw new Error('frontmatter 缺失或未闭合');
    }
    var close = -1;
    for (var k = first + 1; k < lines.length; k += 1) {
      if (lines[k].trim() === '---') { close = k; break; }
    }
    if (close < 0) throw new Error('frontmatter 缺失或未闭合');
    var map = parseYamlSubset(lines.slice(first + 1, close).join('\n'));

    var name = typeof map.name === 'string' && map.name.trim() ? map.name.trim() : (fallbackName ? String(fallbackName) : 'unknown');
    var version = typeof map.version === 'string' && map.version.trim() ? map.version.trim() : 'unknown';
    var colorsRaw = map.colors && typeof map.colors === 'object' && !Array.isArray(map.colors) ? map.colors : null;
    if (!colorsRaw) throw new Error('colors 缺失或为空');

    var diagnostics = [];
    var unknownKeys = [];

    /** 读取一张颜色表（colors 或 colors.dark）：值必须像颜色；支持一层 {colors.x} 引用。 */
    function readColorMap(rawMap, label) {
      var out = {};
      Object.keys(rawMap).forEach(function (key) {
        var raw = rawMap[key];
        if (typeof raw !== 'string' || !raw.trim()) {
          diagnostics.push(label + '.' + key + ': 值不是字符串颜色，已按缺失处理');
          return;
        }
        var value = raw.trim();
        var ref = /^\{colors\.([A-Za-z0-9_-]+)\}$/.exec(value);
        if (ref) {
          var target = rawMap[ref[1]];
          if (typeof target === 'string' && target.trim() && !/^\{colors\./.test(target.trim()) && looksLikeColor(target.trim())) {
            out[key] = target.trim();
          } else {
            diagnostics.push(label + '.' + key + ': 引用 {colors.' + ref[1] + '} 无法解析，已按缺失处理');
          }
          return;
        }
        if (!looksLikeColor(value)) {
          diagnostics.push(label + '.' + key + ': 值不是可识别的颜色，已按缺失处理');
          return;
        }
        out[key] = value;
      });
      return out;
    }

    // v0.5.0：colors.dark 是暗色配色表（与 colors 同词表），解析时取出，
    // 不能当成一个颜色值参与浅色映射。
    var darkRaw = colorsRaw.dark && typeof colorsRaw.dark === 'object' && !Array.isArray(colorsRaw.dark) ? colorsRaw.dark : null;
    delete colorsRaw.dark;
    var colors = readColorMap(colorsRaw, 'colors');
    if (Object.keys(colors).length === 0) throw new Error('colors 缺失或为空');
    var darkColors = darkRaw ? readColorMap(darkRaw, 'colors.dark') : {};
    if (darkRaw && Object.keys(darkColors).length === 0) diagnostics.push('colors.dark: 空 map，已按未提供暗色配色处理');

    Object.keys(colors).forEach(function (key) {
      if (!KNOWN_COLOR_KEYS[key]) unknownKeys.push('colors.' + key);
    });
    Object.keys(darkColors).forEach(function (key) {
      if (!KNOWN_COLOR_KEYS[key]) unknownKeys.push('colors.dark.' + key);
    });
    Object.keys(map).forEach(function (key) {
      if (FRONTMATTER_TOP_KEYS.indexOf(key) < 0) unknownKeys.push(key);
    });
    if (unknownKeys.length > 0) diagnostics.push('unknownKeys: ' + unknownKeys.join(', '));

    return {
      id: normalizeId(name),
      name: name,
      version: version,
      colors: colors,
      darkColors: darkColors,
      diagnostics: diagnostics,
      description: typeof map.description === 'string' ? map.description : '',
      unused: { typography: map.typography || null, rounded: map.rounded || null, spacing: map.spacing || null, components: map.components || null }
    };
  }

  /* ══════════════════════ 3. Token 映射器（契约 B） ══════════════════════ */

  /** 候选链取值：按序取首个存在的字符串值；全空 → null。 */
  function pickChain(colors, keys) {
    for (var i = 0; i < keys.length; i += 1) {
      var value = colors[keys[i]];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return null;
  }

  /**
   * DesignDoc → { tokens, skipped }（契约 B.1 终值规则 + B.3 逐条表）。
   * 任何情况下不产出缺 dark 的条目；推导失败整键省略并记入 skipped。
   */
  function mapDesignToTokens(doc) {
    var tokens = {};
    var skipped = [];
    var colors = doc && doc.colors ? doc.colors : {};
    var darkColors = doc && doc.darkColors && typeof doc.darkColors === 'object' ? doc.darkColors : null;
    var hasDarkPalette = darkColors !== null && Object.keys(darkColors).length > 0;
    TOKEN_TABLE.forEach(function (entry) {
      var light = pickChain(colors, entry.light);
      if (!light) { skipped.push(entry.token); return; }
      // v0.5.0 双配色优先级：
      //   1) colors.dark 的暗色系候选键（surface-dark / on-dark …，与旧 dark 链同义）
      //   2) colors.dark 里与 light 链同名的语义键（hairline / success / primary …）
      //   3) 未提供 colors.dark 时，沿用旧单表 dark 链
      //   4) 都没有 → 场景规则（brand/same）或 flip 推导
      var dark = hasDarkPalette
        ? (pickChain(darkColors, entry.dark) || pickChain(darkColors, entry.light))
        : pickChain(colors, entry.dark);
      if (!dark) {
        if (entry.mode === 'brand') {
          // #7：parse(primary) 且 lum < 0.25 → flip(primary, 0.35, 0.55)；否则 primary 原样。
          var brandRgb = parseColor(light);
          dark = brandRgb && luminance(brandRgb) < 0.25 ? flipColor(light, entry.flip) : light;
        } else if (entry.mode === 'same') {
          // #11-13：dark 同 light 值；lum < 0.3 → flip(·, 0.45, 0.62)。
          var stateRgb = parseColor(light);
          dark = stateRgb && luminance(stateRgb) < 0.3 ? flipColor(light, entry.flip) : light;
        } else {
          // 直通例外：dark 键值原样使用（可为 rgba() 等任意 CSS 颜色串，B.1）。
          var flipped = flipColor(light, entry.flip);
          if (!flipped) { skipped.push(entry.token); return; }
          dark = flipped;
        }
      }
      // tint：把选中/推导出的颜色压成同色相的半透明叠加（悬浮底）。
      if (entry.mode === 'tint') {
        light = withAlpha(light, entry.alpha.light);
        dark = withAlpha(dark, entry.alpha.dark);
        if (!light || !dark) { skipped.push(entry.token); return; }
      }
      tokens[entry.token] = { light: light, dark: dark };
    });
    // 别名引用层：值本身就是 var()/color-mix，light/dark 同一表达式，随基座 Token 解析。
    LITERAL_TOKENS.forEach(function (pair) {
      tokens[pair[0]] = { light: pair[1], dark: pair[1] };
    });
    // v0.8.7：描边最小对比度——l1/l2 若与面板（bg-base / bg-layer-1 / bg-layer-2）
    // 近乎同色（如 Ferrari 深色卡片 #303030 配 #303030 描边），换成文字色叠色线，
    // 保证设置卡片、输入框、行分隔等所有线框在 17 套方案里都看得见。
    [['--dsw-alias-border-l1', 18], ['--dsw-alias-border-l2', 12]].forEach(function (pair) {
      var modes = tokens[pair[0]];
      if (!modes) return;
      ['light', 'dark'].forEach(function (scheme) {
        var line = parseColor(modes[scheme]);
        if (!line) return;
        var worst = null;
        ['--dsw-alias-bg-base', '--dsw-alias-bg-layer-1', '--dsw-alias-bg-layer-2'].forEach(function (surfaceName) {
          var surfaceModes = tokens[surfaceName];
          var surface = surfaceModes ? parseColor(surfaceModes[scheme]) : null;
          if (!surface) return;
          var a = line.a == null ? 1 : line.a;
          var blended = {
            r: line.r * a + surface.r * (1 - a),
            g: line.g * a + surface.g * (1 - a),
            b: line.b * a + surface.b * (1 - a),
            a: 1
          };
          var ratio = contrastRatio(blended, surface);
          if (worst === null || ratio < worst) worst = ratio;
        });
        if (worst !== null && worst < 1.2 && tokens['--dsw-alias-label-primary']) {
          modes[scheme] = 'color-mix(in srgb, var(--dsw-alias-label-primary) ' + pair[1] + '%, transparent)';
        }
      });
    });
    return { tokens: tokens, skipped: skipped };
  }

  /* ══════════════════════ 3b. 组件面映射（圆角 / 字体族 / 正文字号） ══════════════════════ */

  /**
   * 宿主把圆角做成全局变量（--dsw-radius-*），字体族是 --dsw-font-family，
   * 正文字号是 --dsh-content-font-size；高度/padding/组件内字号是各组件 CSS
   * 里的字面量，没有可覆盖的变量（见 README 范围天花板）。
   * 设计侧来源：design.md 的 rounded / typography.body / typography.display-*。
   */
  var COMPONENT_RADIUS_TABLE = [
    { name: '--dsw-radius-xs', from: ['xs', 'sm'] },
    { name: '--dsw-radius-sm', from: ['sm', 'md'] },
    { name: '--dsw-radius-md', from: ['md', 'sm'] },
    { name: '--dsw-radius-lg', from: ['lg', 'md'] },
    { name: '--dsw-radius-xl', from: ['xl', 'lg', 'md'] },
    { name: '--dsw-radius-panel', from: ['xxl', 'xl', 'lg'] }
  ];
  /** 正文字号只接受宿主 fontSize 偏好同区间（10–22px），越界不应用。 */
  var CONTENT_FONT_SIZE_RANGE = [10, 22];
  /** CSS 通用字体族关键字，不加引号。 */
  var GENERIC_FAMILIES = {
    serif: 1, 'sans-serif': 1, monospace: 1, cursive: 1, fantasy: 1, 'system-ui': 1,
    'ui-serif': 1, 'ui-sans-serif': 1, 'ui-monospace': 1, 'ui-rounded': 1,
    emoji: 1, math: 1, fangsong: 1, inherit: 1, initial: 1, unset: 1
  };

  /** design.md 的圆角值 → 合法 CSS 长度（只收 0–64 的 px/rem/em，防注入/防离谱值）。 */
  function normalizeRadius(value) {
    if (typeof value !== 'string') return '';
    var m = /^(\d+(?:\.\d+)?)(px|rem|em)$/.exec(value.trim());
    if (!m || parseFloat(m[1]) > 64) return '';
    return m[1] + m[2];
  }

  /** 字体族串 → 安全 CSS：拒绝 {};<>，多词族名补引号，通用族保持裸关键字。 */
  function normalizeFontFamily(value) {
    if (typeof value !== 'string') return '';
    var raw = value.trim();
    if (!raw || raw.length > 160 || /[{};<>]/.test(raw)) return '';
    var parts = raw.split(',');
    var out = [];
    for (var i = 0; i < parts.length; i += 1) {
      var name = parts[i].trim().replace(/^["']|["']$/g, '');
      if (!name || name.length > 64 || /[{};<>"']/.test(name)) return '';
      if (GENERIC_FAMILIES[name.toLowerCase()]) out.push(name);
      else if (/^[A-Za-z0-9_-]+$/.test(name)) out.push(name);
      else if (/^[A-Za-z0-9 _-]+$/.test(name)) out.push('"' + name + '"');
      else return '';
    }
    return out.join(', ');
  }

  /** typography.*.fontSize（"16px"）→ 10–22 的整数；越界/非 px → null。 */
  function normalizeFontSize(value) {
    if (typeof value !== 'string') return null;
    var m = /^(\d+(?:\.\d+)?)px$/.exec(value.trim());
    if (!m) return null;
    var size = Math.round(parseFloat(m[1]));
    if (!isFinite(size) || size < CONTENT_FONT_SIZE_RANGE[0] || size > CONTENT_FONT_SIZE_RANGE[1]) return null;
    return size;
  }

  function pickTypography(typography, keys) {
    if (!typography || typeof typography !== 'object') return null;
    for (var i = 0; i < keys.length; i += 1) {
      var entry = typography[keys[i]];
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) return entry;
    }
    return null;
  }

  function pickRounded(rounded, keys) {
    if (!rounded || typeof rounded !== 'object') return '';
    for (var i = 0; i < keys.length; i += 1) {
      var value = normalizeRadius(rounded[keys[i]]);
      if (value) return value;
    }
    return '';
  }

  /** DesignDoc → 组件面变量表（body{} 里逐条 setProperty 等价物）。 */
  function buildComponentOverrides(doc) {
    var vars = {};
    var unused = doc && doc.unused ? doc.unused : {};
    var rounded = unused.rounded;
    COMPONENT_RADIUS_TABLE.forEach(function (entry) {
      var value = pickRounded(rounded, entry.from);
      if (value) vars[entry.name] = value;
    });
    var typography = unused.typography;
    var body = pickTypography(typography, ['body', 'body-md', 'body-lg', 'body-sm']);
    var display = pickTypography(typography, ['display-xl', 'display-lg', 'display', 'hero-title', 'section-title']);
    var family = normalizeFontFamily(body && body.fontFamily);
    var brandFamily = normalizeFontFamily(display && display.fontFamily) || family;
    if (family) vars['--dsw-font-family'] = family;
    if (brandFamily) vars['--dsw-font-family-brand'] = brandFamily;
    var size = normalizeFontSize(body && body.fontSize);
    if (size !== null) vars['--dsh-content-font-size'] = size + 'px';
    return vars;
  }

  /** 变量表 → body{…} 样式文本；正文字号要压过主题 presenter 写在 body 上的内联值。 */
  function componentCss(vars) {
    var parts = [];
    Object.keys(vars || {}).forEach(function (name) {
      var important = name === '--dsh-content-font-size' ? ' !important' : '';
      parts.push(name + ':' + vars[name] + important + ';');
    });
    return parts.length > 0 ? 'body{' + parts.join('') + '}' : '';
  }

  /* ══════════════════════ 3b. 组件面 hover（新会话按钮，v0.3.1） ══════════════════════ */

  /**
   * Windows 标题栏布局把侧栏的 border-right 关掉了（layout:
   * `[data-windows-titlebar] .sidebarCol{border-right:none}`），侧栏与主区只剩
   * 「侧栏底色 vs bg-base」的色差；设计里两者同色时（BMW 深色、Webflow 浅色等）
   * 分割完全消失。激活设计期间给 centerCol 补一条左描边（与 macOS 布局的
   * border-left 对齐），颜色用 border-l3（文字色叠色，17 套两套配色都有对比）。
   * 类名是 CSS Module 哈希（`BynINW_centerCol`），按本地名子串定位；宿主改本地名
   * 时规则空匹配（分隔消失，不报错），换版本复核一次。
   */
  var LAYOUT_CSS = '[data-windows-titlebar] [class*="_centerCol"]{border-left:.5px solid var(--dsw-alias-border-l3)}'
    + '[data-windows-titlebar] [data-sidebar-collapsed] [class*="_centerCol"]{border-left:none}';

  /**
   * 「新会话」按钮的选择器：宿主类名是 CSS Module 哈希（`_2H3hWW_newSession`），
   * 哈希前缀随构建变、本地名 `newSession` 保留；`aria-label` 随界面语言变，且顶部
   * 品牌按钮共用同一标签，所以按类名子串定位。宿主升级后若本地名改了，这条选择器
   * 只是空匹配（hover 效果消失，不报错）——换版本时用宿主侧栏 CSS 复核一次。
   */
  var NEW_SESSION_SELECTOR = 'button[class*="_newSession"]';
  /** lift 只收非负 px（正数=向上浮）；duration 只收 ms/s；shadow 见下方禁令。 */
  var HOVER_LIFT_RE = /^\d{1,3}(?:\.\d{1,3})?px$/;
  var HOVER_DURATION_RE = /^\d{1,4}(?:\.\d{1,3})?(?:ms|s)$/;
  var HOVER_SHADOW_MAX = 200;

  /**
   * design.md `components.button-new-session.hover` → 宿主「新会话」按钮的 hover
   * 悬浮规则（过渡 + 上浮 + 阴影 + 减动效兜底）。
   *
   * design.md 是不可信输入：位移/时长必须命中白名单，阴影串不得含 `;{}<>`
   * （否则可以改写样式层边界）；任一项不合法就整项丢弃。没有该段的设计
   * （其余内置主题、导入的 PaletteDoc）返回空串，不产生任何规则。
   */
  function buildHoverCss(doc) {
    var components = doc && doc.unused && doc.unused.components;
    var entry = components && components['button-new-session'];
    var hover = entry && entry.hover;
    if (!hover || typeof hover !== 'object' || Array.isArray(hover)) return '';
    var lift = typeof hover.lift === 'string' && HOVER_LIFT_RE.test(hover.lift.trim()) ? hover.lift.trim() : '';
    var duration = typeof hover.duration === 'string' && HOVER_DURATION_RE.test(hover.duration.trim()) ? hover.duration.trim() : '';
    var shadow = typeof hover.shadow === 'string' ? hover.shadow.trim() : '';
    if (shadow.length > HOVER_SHADOW_MAX || /[;{}<>]/.test(shadow)) shadow = '';
    if (!lift && !shadow) return '';
    var css = [];
    if (duration) css.push(NEW_SESSION_SELECTOR + '{transition:transform ' + duration + ' ease,box-shadow ' + duration + ' ease}');
    var hovered = [];
    if (lift) hovered.push('transform:translateY(-' + lift + ')');
    if (shadow) hovered.push('box-shadow:' + shadow);
    css.push(NEW_SESSION_SELECTOR + ':hover{' + hovered.join(';') + '}');
    if (lift) css.push(NEW_SESSION_SELECTOR + ':active{transform:translateY(0)}');
    css.push('@media (prefers-reduced-motion:reduce){' + NEW_SESSION_SELECTOR + '{transition:none}' + NEW_SESSION_SELECTOR + ':hover{transform:none}}');
    return css.join('');
  }

  /* ══════════════════════ 4. PaletteDoc 构建/校验（契约 IC-4） ══════════════════════ */

  /** 映射产物 → PaletteDoc v1（导出 JSON 的形状）。 */
  function buildPalette(doc, mapping) {
    return {
      schema: PALETTE_SCHEMA,
      id: doc.id,
      name: doc.name,
      origin: { kind: 'design-md', designName: doc.name, designVersion: doc.version || 'unknown' },
      tokens: mapping.tokens,
      skipped: mapping.skipped
    };
  }

  function checkSize(text) {
    return typeof text === 'string' && text.length <= LIMITS.single;
  }

  /**
   * PaletteDoc 导入校验（契约 IC-4 顺序）：schema 精确匹配 → tokens 逐键
   * {light,dark} 字符串对 → ≥1 键；另限 ≤TOKEN_NAMES.length 键且键名在词表内、skipped 为
   * 字符串数组。返回 { ok, palette } 或 { ok:false, error }。
   */
  function validatePalette(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, error: 'palette must be an object' };
    if (data.schema !== PALETTE_SCHEMA) return { ok: false, error: 'schema field mismatch (expected ' + PALETTE_SCHEMA + ')' };
    var tokens = data.tokens;
    if (!tokens || typeof tokens !== 'object' || Array.isArray(tokens)) return { ok: false, error: 'tokens must be an object' };
    var keys = Object.keys(tokens);
    if (keys.length === 0) return { ok: false, error: 'tokens must contain at least 1 key' };
    if (keys.length > TOKEN_NAMES.length) return { ok: false, error: 'tokens exceed ' + TOKEN_NAMES.length + ' keys' };
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (TOKEN_NAMES.indexOf(key) < 0) return { ok: false, error: 'unknown token name: ' + key };
      var pair = tokens[key];
      if (!pair || typeof pair !== 'object' || Array.isArray(pair)) return { ok: false, error: 'tokens.' + key + ' must be a { light, dark } pair' };
      if (typeof pair.light !== 'string' || typeof pair.dark !== 'string') return { ok: false, error: 'tokens.' + key + '.light/.dark must both be strings' };
    }
    var skipped = data.skipped === undefined ? [] : data.skipped;
    if (!Array.isArray(skipped) || skipped.some(function (s) { return typeof s !== 'string'; })) {
      return { ok: false, error: 'skipped must be an array of strings' };
    }
    var name = typeof data.name === 'string' && data.name.trim() ? data.name.trim() : normalizeId(typeof data.id === 'string' ? data.id : 'design');
    var id = typeof data.id === 'string' && data.id.trim() ? normalizeId(data.id) : normalizeId(name);
    return {
      ok: true,
      palette: {
        schema: PALETTE_SCHEMA,
        id: id,
        name: name,
        origin: data.origin && typeof data.origin === 'object' && !Array.isArray(data.origin) ? data.origin : { kind: 'palette', designName: name, designVersion: 'imported' },
        tokens: tokens,
        skipped: skipped
      }
    };
  }

  /** customDesigns JSON 文本 → { list, broken, raw }（契约 F：坏 JSON 视同未激活、保留原文）。 */
  function deserializeCustoms(raw) {
    if (typeof raw !== 'string' || raw.trim() === '') return { list: [], broken: false, raw: '' };
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      return { list: [], broken: true, raw: raw };
    }
    if (!Array.isArray(parsed)) return { list: [], broken: true, raw: raw };
    var list = parsed.filter(function (item) {
      return item && typeof item === 'object' && !Array.isArray(item) && item.tokens && typeof item.tokens === 'object' && !Array.isArray(item.tokens);
    });
    return { list: list, broken: list.length !== parsed.length, raw: raw };
  }

  function uniqueId(base, taken) {
    var id = normalizeId(base);
    if (!taken[id]) return id;
    var n = 2;
    while (taken[id + '-' + n]) n += 1;
    return id + '-' + n;
  }

  /* ══════════════════════ 5. 内置三份设计（构建期预解析 JSON 常量，契约 D.1） ══════════════════════ */

  var BUILTIN_DESIGNS = [
    {
      id: 'claude', name: 'Claude', version: 'alpha',
      colors: {
        'primary': '#cc785c', 'primary-active': '#a9583e', 'primary-disabled': '#e6dfd8',
        'ink': '#141413', 'body': '#3d3d3a', 'body-strong': '#252523',
        'muted': '#6c6a64', 'muted-soft': '#8e8b82',
        // 浅色线框：原 hairline(#e6dfd8) 与 bg-layer-2(#e8e0d2) 几乎同色，
        // 宿主卡片/输入框边框会看不见；改用 ink 的 20%/12% 叠色（v0.5.1）。
        'hairline': 'rgba(20, 20, 19, 0.20)', 'hairline-soft': 'rgba(20, 20, 19, 0.12)',
        'canvas': '#faf9f5', 'surface-soft': '#f5f0e8', 'surface-card': '#efe9de', 'surface-cream-strong': '#e8e0d2',
        'accent-teal': '#5db8a6', 'accent-amber': '#e8a55a',
        'success': '#5db872', 'warning': '#d4a017', 'error': '#c64545'
      },
      // v0.5.0 双配色：暗色表与 colors 同词表；面/文字用暗色系键直通，
      // 描边与状态用同名语义键覆盖（不再依赖 flip 推导）。
      darkColors: {
        'surface-dark': '#181715', 'surface-dark-elevated': '#252320', 'surface-dark-soft': '#1f1e1b',
        'on-dark': '#faf9f5', 'on-dark-soft': '#a09d96',
        'primary': '#cc785c', 'primary-active': '#a9583e',
        'hairline': 'rgba(250, 249, 245, 0.16)', 'hairline-soft': 'rgba(250, 249, 245, 0.10)',
        'success': '#5db872', 'warning': '#d4a017', 'error': '#c64545'
      },
      // 组件面来源（与 tests/fixtures/claude.md 对齐；测试按派生结果比对防漂移）
      // 只保留宿主消费的字段：body/display-xl、xs..xl、button-new-session.hover。
      unused: {
        typography: {
          body: { fontFamily: 'StyreneB, Inter, sans-serif', fontSize: '16px' },
          'display-xl': { fontFamily: 'Copernicus, Tiempos Headline, serif' }
        },
        rounded: { xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '16px' },
        // v0.3.1：「新会话」按钮 hover 悬浮（design/Claude/design.md 同段）
        components: {
          'button-new-session': {
            hover: { lift: '1px', shadow: '0 4px 12px rgb(20 20 19 / 0.12)', duration: '120ms' }
          }
        }
      }
    },
    {
      "id": "airbnb",
      "name": "Airbnb",
      "version": "alpha",
      "colors": {
        "primary": "#ff385c",
        "primary-active": "#e00b41",
        "primary-disabled": "#ffd1da",
        "ink": "#222222",
        "body": "#3f3f3f",
        "muted": "#6a6a6a",
        "muted-soft": "#929292",
        "hairline": "#dddddd",
        "hairline-soft": "#ebebeb",
        "canvas": "#ffffff",
        "surface-soft": "#f7f7f7",
        "surface-card": "#ffffff",
        "error": "#c13515",
        "accent-teal": "#460479",
        "accent-amber": "#92174d"
      },
      "darkColors": {
        "on-dark": "#ffffff"
      },
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "Airbnb Cereal VF, Circular, sans-serif",
            "fontSize": "16px"
          },
          "display-xl": {
            "fontFamily": "Airbnb Cereal VF, Circular, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif"
          }
        },
        "rounded": {
          "xs": "4px",
          "sm": "8px",
          "md": "14px",
          "lg": "20px",
          "xl": "32px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(34 34 34 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "apple",
      "name": "Apple",
      "version": "alpha",
      "colors": {
        "primary": "#0066cc",
        "ink": "#1d1d1f",
        "body": "#1d1d1f",
        "hairline": "#e0e0e0",
        "canvas": "#ffffff",
        "muted-soft": "#cccccc",
        "muted": "#7a7a7a",
        "hairline-soft": "#f0f0f0",
        "surface-soft": "#f5f5f7",
        "surface-card": "#fafafc",
        "primary-active": "#0066cc",
        "primary-disabled": "#e0e0e0"
      },
      "darkColors": {
        "on-dark": "#ffffff",
        "primary": "#2997ff",
        "surface-dark-elevated": "#272729",
        "surface-dark-card": "#2a2a2c",
        "surface-dark-soft": "#252527",
        "surface-dark": "#000000"
      },
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "SF Pro Text, system-ui, -apple-system, sans-serif",
            "fontSize": "17px"
          },
          "display-xl": {
            "fontFamily": "SF Pro Display, system-ui, -apple-system, sans-serif"
          }
        },
        "rounded": {
          "xs": "5px",
          "sm": "8px",
          "md": "11px",
          "lg": "18px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(29 29 31 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "bmw",
      "name": "BMW",
      "version": "alpha",
      "colors": {
        "primary": "#1c69d4",
        "primary-active": "#0653b6",
        "primary-disabled": "#d6d6d6",
        "ink": "#262626",
        "body": "#3c3c3c",
        "body-strong": "#1a1a1a",
        "muted": "#6b6b6b",
        "muted-soft": "#9a9a9a",
        "hairline": "#e6e6e6",
        "canvas": "#ffffff",
        "surface-soft": "#f7f7f7",
        "surface-card": "#fafafa",
        "success": "#22c55e",
        "warning": "#f59e0b",
        "error": "#dc2626",
        "accent-teal": "#0066b1",
        "hairline-soft": "rgba(38, 38, 38, 0.08)"
      },
      "darkColors": {
        "surface-dark": "#1a2129",
        "surface-dark-elevated": "#262e38",
        "on-dark": "#ffffff",
        "on-dark-soft": "#bbbbbb"
      },
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "BMW Type Next Latin, sans-serif",
            "fontSize": "16px"
          },
          "display-xl": {
            "fontFamily": "BMW Type Next Latin, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
          }
        },
        "rounded": {
          "xs": "2px",
          "sm": "4px",
          "md": "8px",
          "lg": "12px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(38 38 38 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "cursor",
      "name": "Cursor",
      "version": "alpha",
      "colors": {
        "primary": "#f54e00",
        "primary-active": "#d04200",
        "ink": "#26251e",
        "body": "#5a5852",
        "body-strong": "#26251e",
        "muted": "#807d72",
        "muted-soft": "#a09c92",
        "hairline": "#e6e5e0",
        "hairline-soft": "#efeee8",
        "canvas": "#f7f7f4",
        "surface-card": "#ffffff",
        "surface-soft": "#fafaf7",
        "error": "#cf2d56",
        "success": "#1f8a65",
        "primary-disabled": "#e6e5e0"
      },
      "darkColors": {},
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "CursorGothic, sans-serif",
            "fontSize": "16px"
          },
          "display-xl": {
            "fontFamily": "CursorGothic, sans-serif"
          }
        },
        "rounded": {
          "xs": "4px",
          "sm": "6px",
          "md": "8px",
          "lg": "12px",
          "xl": "16px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(38 37 30 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "ferrari",
      "name": "Ferrari",
      "version": "alpha",
      "colors": {
        "canvas": "#ffffff",
        "surface-soft": "#f7f7f7",
        "surface-card": "#ebebeb",
        "ink": "#181818",
        "body": "#666666",
        "body-strong": "#181818",
        "muted": "#666666",
        "muted-soft": "#8f8f8f",
        "hairline": "#d2d2d2",
        "hairline-soft": "#ebebeb",
        "primary": "#da291c",
        "primary-active": "#b01e0a",
        "primary-disabled": "#d2d2d2",
        "success": "#03904a",
        "warning": "#f13a2c",
        "error": "#b01e0a",
        "accent-teal": "#4c98b9",
        "accent-amber": "#f6e500"
      },
      "darkColors": {
        "on-dark": "#ffffff",
        "surface-dark": "#181818",
        "surface-dark-elevated": "#303030",
        "surface-dark-soft": "#222222",
        "on-dark-soft": "#969696",
        "primary": "#da291c",
        "primary-active": "#b01e0a",
        "hairline": "#303030",
        "hairline-soft": "#2a2a2a",
        "success": "#03904a",
        "warning": "#f13a2c",
        "error": "#b01e0a"
      },
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "FerrariSans, sans-serif",
            "fontSize": "14px"
          },
          "display-xl": {
            "fontFamily": "FerrariSans, sans-serif"
          }
        },
        "rounded": {
          "xs": "2px",
          "sm": "4px",
          "md": "6px",
          "lg": "8px",
          "xl": "12px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(24 24 24 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "hp",
      "name": "HP",
      "version": "alpha",
      "colors": {
        "primary": "#024ad8",
        "primary-deep": "#0e3191",
        "ink": "#1a1a1a",
        "ink-deep": "#000000",
        "canvas": "#ffffff",
        "charcoal": "#3d3d3d",
        "hairline": "#e8e8e8",
        "error": "#b3262b",
        "primary-disabled": "#c9e0fc",
        "body-strong": "#292929",
        "surface-soft": "#f7f7f7",
        "hairline-soft": "#e8e8e8",
        "muted": "#636363",
        "primary-active": "#0e3191",
        "accent-amber": "#ff5050",
        "accent-teal": "#356373",
        "surface-card": "#f7f7f7",
        "body": "#636363",
        "muted-soft": "#636363"
      },
      "darkColors": {},
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "Forma DJR Micro",
            "fontSize": "16px"
          },
          "display-xl": {
            "fontFamily": "Forma DJR Micro"
          }
        },
        "rounded": {
          "xs": "2px",
          "sm": "3px",
          "md": "4px",
          "lg": "8px",
          "xl": "16px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(26 26 26 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "ibm",
      "name": "IBM",
      "version": "alpha",
      "colors": {
        "primary": "#0f62fe",
        "ink": "#161616",
        "canvas": "#ffffff",
        "hairline": "#e0e0e0",
        "muted": "#525252",
        "muted-soft": "#8c8c8c",
        "surface-soft": "#f4f4f4",
        "surface-card": "#e0e0e0",
        "primary-active": "#002d9c",
        "success": "#24a148",
        "warning": "#f1c21b",
        "error": "#da1e28",
        "accent-teal": "#0f62fe",
        "hairline-soft": "rgba(22, 22, 22, 0.08)",
        "body": "#525252",
        "primary-disabled": "#e0e0e0"
      },
      "darkColors": {
        "surface-dark": "#161616",
        "surface-dark-elevated": "#262626",
        "on-dark": "#ffffff",
        "on-dark-soft": "#c6c6c6"
      },
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "IBM Plex Sans",
            "fontSize": "16px"
          },
          "display-xl": {
            "fontFamily": "IBM Plex Sans"
          }
        },
        "rounded": {
          "xs": "2px",
          "sm": "4px",
          "md": "6px",
          "lg": "8px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(22 22 22 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "meta",
      "name": "Meta",
      "version": "alpha",
      "colors": {
        "primary": "#0064e0",
        "primary-deep": "#0457cb",
        "success": "#31a24c",
        "warning": "#f7b928",
        "canvas": "#ffffff",
        "surface-soft": "#f1f4f7",
        "ink-deep": "#0a1317",
        "ink": "#1c1e21",
        "charcoal": "#444950",
        "hairline": "#ced0d4",
        "hairline-soft": "#dee3e9",
        "primary-disabled": "#0091ff",
        "body-strong": "#000000",
        "accent-teal": "#a121ce",
        "error": "#e41e3f",
        "muted": "#4b4c4f",
        "muted-soft": "#8595a4",
        "surface-card": "#f1f4f7",
        "body": "#4b4c4f",
        "primary-active": "#0064e0"
      },
      "darkColors": {},
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "Optimistic VF",
            "fontSize": "16px"
          },
          "display-xl": {
            "fontFamily": "Optimistic VF"
          }
        },
        "rounded": {
          "xs": "2px",
          "sm": "4px",
          "md": "6px",
          "lg": "8px",
          "xl": "16px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(28 30 33 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "nvidia",
      "name": "NVidia",
      "version": "alpha",
      "colors": {
        "primary": "#76b900",
        "ink": "#000000",
        "canvas": "#ffffff",
        "surface-soft": "#f7f7f7",
        "hairline": "#cccccc",
        "body": "#1a1a1a",
        "error": "#e52020",
        "warning": "#df6500",
        "muted": "#757575",
        "muted-soft": "#a7a7a7",
        "success": "#3f8500",
        "accent-amber": "#feeeb2",
        "accent-teal": "#952fc6",
        "hairline-soft": "rgba(0, 0, 0, 0.08)",
        "surface-card": "#f7f7f7",
        "primary-active": "#76b900",
        "primary-disabled": "#cccccc"
      },
      "darkColors": {
        "surface-dark": "#000000",
        "on-dark": "#ffffff",
        "on-dark-mute": "rgba(255,255,255,0.7)",
        "primary": "#5a8d00",
        "surface-dark-elevated": "#1a1a1a"
      },
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "NVIDIA-EMEA",
            "fontSize": "16px"
          },
          "display-xl": {
            "fontFamily": "NVIDIA-EMEA"
          }
        },
        "rounded": {
          "xs": "1px",
          "sm": "2px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(0 0 0 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "oracle",
      "name": "Oracle",
      "version": "alpha",
      "colors": {
        "primary": "#312d2a",
        "primary-pressed": "#47423e",
        "ink": "#161513",
        "ink-deep": "#211e1c",
        "canvas": "#ffffff",
        "hairline": "#e4e1dd",
        "error": "#d63b25",
        "surface-soft": "#fbf9f8",
        "hairline-soft": "#d4cfca",
        "accent-amber": "#f0cc71",
        "accent-teal": "#d6e5e5",
        "muted-soft": "#aea8a2",
        "surface-card": "#fbf9f8",
        "body": "#161513",
        "muted": "#161513",
        "primary-active": "#312d2a",
        "primary-disabled": "#e4e1dd"
      },
      "darkColors": {},
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "Oracle Sans",
            "fontSize": "16px"
          },
          "display-xl": {
            "fontFamily": "Georgia"
          }
        },
        "rounded": {
          "xs": "4px",
          "sm": "6px",
          "md": "8px",
          "lg": "12px",
          "xl": "15px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(22 21 19 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "playstation",
      "name": "PlayStation",
      "version": "alpha",
      "colors": {
        "primary": "#0070d1",
        "primary-pressed": "#0064b7",
        "primary-active": "#004d8d",
        "commerce": "#d53b00",
        "ink": "#000000",
        "ink-deep": "#121314",
        "ink-elevated": "#181818",
        "charcoal": "#1f2024",
        "mute-light": "#6b6b6b",
        "ash-light": "#cccccc",
        "canvas-light": "#ffffff",
        "surface-soft": "#f3f3f3",
        "surface-card": "#f5f7fa",
        "warning": "#c81b3a",
        "accent-amber": "#d63d00",
        "body": "rgba(0,0,0,0.6)",
        "hairline": "#f3f3f3",
        "hairline-soft": "rgba(0, 0, 0, 0.08)",
        "muted": "rgba(0,0,0,0.6)",
        "muted-soft": "rgba(0,0,0,0.6)",
        "primary-disabled": "#f3f3f3"
      },
      "darkColors": {
        "mute-dark": "rgba(229,229,229,0.55)",
        "ash-dark": "rgba(229,229,229,0.2)",
        "canvas-dark": "#000000",
        "surface-dark-elevated": "#121314",
        "surface-dark-card": "#181818",
        "hairline-dark": "rgba(229,229,229,0.2)",
        "on-dark": "#ffffff",
        "on-dark-mute": "#cccccc",
        "primary": "#53b1ff"
      },
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "PlayStation SST",
            "fontSize": "18px"
          },
          "display-xl": {
            "fontFamily": "PlayStation SST"
          }
        },
        "rounded": {
          "sm": "4px",
          "md": "8px",
          "lg": "16px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(0 0 0 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "sap",
      "name": "SAP",
      "version": "alpha",
      "colors": {
        "primary": "#0057d2",
        "primary-deep": "#0040b0",
        "canvas": "#ffffff",
        "chrome": "#f5f6f7",
        "ink": "#000000",
        "ink-lead": "#3c3c3c",
        "ink-meta": "#475e75",
        "ink-nav": "#545454",
        "hairline": "#475e75",
        "accent-teal": "#6bc0ff",
        "surface-soft": "#eaecee",
        "body": "#223548",
        "muted": "#354a5f",
        "hairline-soft": "rgba(0, 0, 0, 0.08)",
        "surface-card": "#eaecee",
        "muted-soft": "#354a5f",
        "primary-active": "#0057d2",
        "primary-disabled": "#475e75"
      },
      "darkColors": {
        "surface-dark": "#022879"
      },
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "72 Brand Variable",
            "fontSize": "18px"
          },
          "display-xl": {
            "fontFamily": "72 Brand Variable"
          }
        },
        "rounded": {
          "sm": "4px",
          "md": "8px",
          "lg": "12px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(0 0 0 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "spotify",
      "name": "Spotify",
      "version": "alpha",
      "colors": {
        "canvas": "#ffffff",
        "surface-soft": "#f8f8f8",
        "surface-card": "#f0f0f0",
        "ink": "#121212",
        "body": "#4d4d4d",
        "body-strong": "#2a2a2a",
        "muted": "#7c7c7c",
        "muted-soft": "#b3b3b3",
        "hairline": "rgba(18, 18, 18, 0.12)",
        "hairline-soft": "rgba(18, 18, 18, 0.08)",
        "primary": "#1db954",
        "primary-active": "#15873d",
        "primary-disabled": "#b3f0c9",
        "success": "#1db954",
        "warning": "#ffa42b",
        "error": "#e91429",
        "accent-teal": "#539df5",
        "accent-amber": "#ffa42b"
      },
      "darkColors": {
        "surface-dark": "#121212",
        "surface-dark-elevated": "#1f1f1f",
        "surface-dark-soft": "#181818",
        "on-dark": "#ffffff",
        "on-dark-soft": "#b3b3b3",
        "primary": "#1ed760",
        "primary-active": "#1db954",
        "hairline": "rgba(255, 255, 255, 0.16)",
        "hairline-soft": "rgba(255, 255, 255, 0.10)",
        "success": "#1ed760",
        "warning": "#ffa42b",
        "error": "#f3727f"
      },
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "SpotifyMix, Circular, sans-serif",
            "fontSize": "16px"
          },
          "display-xl": {
            "fontFamily": "SpotifyMix, Circular, sans-serif"
          }
        },
        "rounded": {
          "xs": "4px",
          "sm": "6px",
          "md": "8px",
          "lg": "12px",
          "xl": "16px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(18 18 18 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "tesla",
      "name": "Tesla",
      "version": "alpha",
      "colors": {
        "canvas": "#ffffff",
        "surface-soft": "#f4f4f4",
        "surface-card": "#eeeeee",
        "ink": "#171a20",
        "body": "#393c41",
        "body-strong": "#5c5e62",
        "muted": "#8e8e8e",
        "muted-soft": "#d0d1d2",
        "hairline": "#d0d1d2",
        "hairline-soft": "#eeeeee",
        "primary": "#3e6ae1",
        "primary-active": "#3457b1",
        "primary-disabled": "#d0d1d2",
        "success": "#1e8e3e",
        "warning": "#f5a623",
        "error": "#e82127",
        "accent-teal": "#5c5e62",
        "accent-amber": "#f5a623"
      },
      "darkColors": {
        "surface-dark": "#171a20",
        "surface-dark-elevated": "#1f242c",
        "surface-dark-soft": "#12151a",
        "on-dark": "#ffffff",
        "on-dark-soft": "#8e8e8e",
        "primary": "#3e6ae1",
        "primary-active": "#3457b1",
        "hairline": "rgba(255, 255, 255, 0.16)",
        "hairline-soft": "rgba(255, 255, 255, 0.10)",
        "success": "#1e8e3e",
        "warning": "#f5a623",
        "error": "#e82127"
      },
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "Gotham SSm, Universal Sans, sans-serif",
            "fontSize": "14px"
          },
          "display-xl": {
            "fontFamily": "Gotham SSm, Universal Sans, sans-serif"
          }
        },
        "rounded": {
          "xs": "4px",
          "sm": "6px",
          "md": "8px",
          "lg": "12px",
          "xl": "16px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(23 26 32 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "webflow",
      "name": "Webflow",
      "version": "alpha",
      "colors": {
        "primary": "#080808",
        "ink": "#080808",
        "body": "#363636",
        "hairline": "#d8d8d8",
        "canvas": "#ffffff",
        "body-strong": "#222222",
        "muted": "#5a5a5a",
        "muted-soft": "#ababab",
        "accent-teal": "#7a3dff",
        "accent-amber": "#ed52cb",
        "primary-active": "#006acc",
        "success": "#00d722",
        "error": "#ee1d36",
        "hairline-soft": "rgba(8, 8, 8, 0.08)",
        "surface-soft": "#ffffff",
        "surface-card": "#ffffff",
        "primary-disabled": "#d8d8d8"
      },
      "darkColors": {},
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "WF Visual Sans Variable, Inter, system-ui, sans-serif",
            "fontSize": "16px"
          },
          "display-xl": {
            "fontFamily": "WF Visual Sans Variable, Inter, system-ui, sans-serif"
          }
        },
        "rounded": {
          "xs": "2px",
          "sm": "4px",
          "md": "8px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(8 8 8 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
    {
      "id": "zapier",
      "name": "Zapier",
      "version": "alpha",
      "colors": {
        "primary": "#ff4f00",
        "ink": "#201515",
        "body": "#605d52",
        "canvas": "#fffefb",
        "body-strong": "#36342e",
        "muted": "#939084",
        "muted-soft": "#c5c0b1",
        "surface-soft": "#f8f4f0",
        "hairline": "rgba(32, 21, 21, 0.12)",
        "hairline-soft": "rgba(32, 21, 21, 0.08)",
        "surface-card": "#f8f4f0",
        "primary-active": "#ff4f00",
        "primary-disabled": "rgba(32, 21, 21, 0.12)"
      },
      "darkColors": {},
      "unused": {
        "typography": {
          "body": {
            "fontFamily": "Inter, system-ui, sans-serif",
            "fontSize": "18px"
          },
          "display-xl": {
            "fontFamily": "Degular Display, Inter, system-ui, -apple-system, sans-serif"
          }
        },
        "rounded": {
          "sm": "6px",
          "md": "12px"
        },
        "spacing": null,
        "components": {
          "button-new-session": {
            "hover": {
              "lift": "1px",
              "shadow": "0 4px 12px rgb(32 21 21 / 0.12)",
              "duration": "120ms"
            }
          }
        }
      }
    },
  ];

  /* ══════════════════════ 6. 双语文案（对齐 configforms-settings-row.md 的 locale.register 范式） ══════════════════════ */

  var LOCALES = {
    en: {
      title: 'UI design scheme',
      active: 'Active design',
      none: 'Default theme (no override)',
      originBuiltin: 'built-in',
      originImported: 'imported',
      noDesigns: 'No designs available',
      selected: 'Selected',
      expandMore: 'Show %s more schemes',
      collapse: 'Collapse',
      restore: 'Restore default',
      exportJson: 'Export JSON',
      exportBackup: 'Export raw custom designs',
      importMd: 'Import design.md',
      importJson: 'Add pasted JSON',
      importPlaceholder: 'Paste an exported palette JSON here, then press "Add pasted JSON".',
      copied: 'Copied to clipboard.',
      added: 'Imported and activated.',
      copyFailed: 'Clipboard unavailable — copy the text below manually.',
      tooLarge: 'Rejected: content exceeds the 64 KB per-design limit.',
      tooLargeTotal: 'Rejected: total stored designs would exceed 256 KB.',
      invalidJson: 'Rejected: the pasted text is not valid JSON.',
      invalidPalette: 'Rejected: ',
      parseFailed: 'design.md parse failed: ',
      missingDesign: 'Design "%s" is missing — falling back to the default theme.',
      brokenJson: 'Stored custom designs JSON is corrupted — export the raw text below to rescue it before importing again.',
      nonLoopback: 'This page has no loopback Host connection — choices last for this page only.',
      skippedNote: '%s token(s) not derivable, skipped: ',
      nothingActive: 'No design is currently active.',
      deleteDesign: 'Delete',
      confirmDelete: 'Confirm delete',
      deleted: 'Deleted the imported design.',
      notDeletable: 'Only imported designs can be deleted.',
      deleteUnavailable: 'Stored custom designs JSON is corrupted — export the raw text and fix it before deleting.'
    },
    zh: {
      title: 'UI设计方案选择',
      active: '当前设计',
      none: '默认主题（无覆盖）',
      originBuiltin: '内置',
      originImported: '导入',
      noDesigns: '暂无可用设计',
      selected: '已选择',
      expandMore: '展开其余 %s 个方案',
      collapse: '收起',
      restore: '恢复默认',
      exportJson: '导出 JSON',
      exportBackup: '导出自定义设计原文',
      importMd: '导入 design.md',
      importJson: '添加粘贴的 JSON',
      importPlaceholder: '把导出的配色 JSON 粘贴到这里，再点「添加粘贴的 JSON」。',
      copied: '已复制到剪贴板。',
      added: '已导入并激活。',
      copyFailed: '剪贴板不可用——请手动复制下方文本。',
      tooLarge: '已拒绝：内容超过单份 64 KB 上限。',
      tooLargeTotal: '已拒绝：累计存储将超过 256 KB 上限。',
      invalidJson: '已拒绝：粘贴的文本不是有效 JSON。',
      invalidPalette: '已拒绝：',
      parseFailed: 'design.md 解析失败：',
      missingDesign: '设计「%s」缺失——已回退默认主题。',
      brokenJson: '已存储的自定义设计 JSON 损坏——请先导出下方原文抢救，再重新导入。',
      nonLoopback: '当前页面非回环连接——选择仅本页有效。',
      skippedNote: '%s 个 Token 无法推导，已跳过：',
      nothingActive: '当前没有激活的设计。',
      deleteDesign: '删除',
      confirmDelete: '确认删除',
      deleted: '已删除该导入设计。',
      notDeletable: '只能删除导入的设计。',
      deleteUnavailable: '自定义设计 JSON 已损坏——请先导出原始文本修复，再执行删除。'
    }
  };

  /* ══════════════════════ 7. 行样式（只引用 --dsw-alias-*，契约 C.1 铁律） ══════════════════════ */

  var ROW_CSS = [
    '.dmds-row{display:flex;flex-direction:column;gap:8px;padding:16px 0;border-bottom:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}',
    '.dmds-title{font-weight:500}',
    '.dmds-summary{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.dmds-swatch{width:14px;height:14px;border-radius:4px;border:.5px solid var(--dsw-alias-border-l2);display:inline-block}',
    '.dmds-list{display:flex;flex-direction:column;gap:4px}',
    '.dmds-item-row{display:flex;gap:6px;align-items:center}',
    '.dmds-item-row .dmds-item{flex:1;width:auto}',
    '.dmds-del{flex:none;border:.5px solid var(--dsw-alias-border-l1);border-radius:6px;background:transparent;color:var(--dsw-alias-state-error-primary);font:inherit;font-size:12px;line-height:18px;padding:4px 10px;cursor:pointer}',
    '.dmds-del:hover{background:var(--dsw-alias-interactive-bg-hover-danger)}',
    '.dmds-del[data-confirm="true"]{border-color:var(--dsw-alias-state-error-primary)}',
    '.dmds-item{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;border:.5px solid transparent;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px;cursor:pointer;text-align:left;width:100%}',
    '.dmds-item:hover{background:var(--dsw-alias-interactive-bg-hover)}',
    // v0.8.4：选中态用品牌色画框 + 12% 品牌底 + 加粗（此前用 border-l1 + bg-layer-1，
    // 在暗色方案里两者可能与卡片同色 → 选中框看不见，Ferrari 等复现）。
    '.dmds-item[data-active="true"]{border-color:transparent;background:color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent);box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary);font-weight:600}',
    '.dmds-check{flex:none;color:var(--dsw-alias-brand-primary);font-weight:700}',
    '.dmds-item-name{flex:1;overflow-wrap:anywhere}',
    '.dmds-meta{color:var(--dsw-alias-label-secondary);font-size:12px}',
    '.dmds-actions{display:flex;gap:8px;flex-wrap:wrap}',
    '.dmds-btn{border:.5px solid var(--dsw-alias-border-l1);border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;padding:4px 12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}',
    '.dmds-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}',
    '.dmds-btn[disabled]{opacity:.5;cursor:default}',
    '.dmds-input{width:100%;box-sizing:border-box;min-height:72px;border:.5px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:8px;resize:vertical}',
    '.dmds-error{color:var(--dsw-alias-state-error-primary);font-size:12px;overflow-wrap:anywhere}',
    '.dmds-note{color:var(--dsw-alias-label-secondary);font-size:12px;overflow-wrap:anywhere}'
  ].join('\n');

  /* ══════════════════════ 8. 工厂体（浏览器物化入口） ══════════════════════ */

  function messageOf(err) {
    return err && err.message ? String(err.message) : String(err);
  }

  function fmt(template) {
    var args = Array.prototype.slice.call(arguments, 1);
    return String(template).replace(/%s|%d/g, function () {
      return args.length > 0 ? String(args.shift()) : '';
    });
  }

  function fallbackT(key) {
    return LOCALES.en[key] || key;
  }

  /**
   * data-plugin-css 去重选择器。属性值按 CSS 字符串转义（`\` → `\\`、`"` → `\"`），
   * 禁止再套 JSON.stringify：它会自带一层双引号，拼出
   * `style[data-plugin-css=""id""]` 这种非法选择器，querySelector 在模块
   * import 期就抛错，整个 web boot 直接失败（v0.1.3 根因）。
   */
  function cssTagIdSelector(tagId) {
    return 'style[data-plugin-css="' + String(tagId).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"]';
  }

  function factory(require) {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

    /**
     * CSS 注入属模块体副作用，留在 factory 闭包内（asar:377075 教义）。
     * 用官方 bundle 范式：手动 <style> + data-plugin-css 去重（150+ 处先例，
     * 如 session-log 伴生包）；`styles` builtin 是动态包专属，bundle 作用域
     * 里没有它（v0.1.2 修复：此前经 styles builtin 注入被静默跳过，行样式全丢）。
     */
    if (typeof document !== 'undefined' && document.querySelector(cssTagIdSelector(CSS_TAG_ID)) === null) {
      var cssTag = document.createElement('style');
      cssTag.dataset.plugin = SOURCE;
      cssTag.dataset.pluginCss = CSS_TAG_ID;
      cssTag.textContent = ROW_CSS;
      document.head.appendChild(cssTag);
    }

    /**
     * 组件面样式层（圆角/字体族/正文字号）：同一 <style> 随激活设计更新，
     * 恢复默认时清空文本（宿主 :root 与 presenter 内联值自动回位）。
     */
    var componentTag = null;
    function applyComponentCss(css) {
      if (typeof document === 'undefined') return;
      if (!componentTag) {
        componentTag = document.createElement('style');
        componentTag.dataset.plugin = SOURCE;
        componentTag.dataset.pluginCss = SOURCE + '/component.css';
        document.head.appendChild(componentTag);
      }
      if (componentTag.textContent !== css) componentTag.textContent = css;
    }

    /** React 懒取（Node 自测路径不触发 require('react')）。 */
    var reactRef = null;
    function react() {
      if (reactRef === null) reactRef = require('react');
      return reactRef;
    }

    /**
     * 业务 API：解析/映射/应用/恢复/导入导出的唯一实现。
     * @param ctx 客户端 Cordis context（theme 服务由此取得）
     * @param scope ctx.configForms.get(SOURCE) 的命名空间 scope
     */
    function makeApi(ctx, scope) {
      var disposer = null;
      var status = {
        activeId: '', paletteName: null, tokens: null, skipped: [],
        missingId: null, brokenJson: false, rawCustom: '', applyError: null, palette: null
      };

      function currentSection() {
        var snap = scope.getSnapshot();
        return snap && snap.value && typeof snap.value === 'object' ? snap.value : {};
      }

      function currentCustoms() {
        var section = currentSection();
        return deserializeCustoms(typeof section.customDesigns === 'string' ? section.customDesigns : '[]');
      }

      function releaseLayer() {
        if (disposer) { disposer(); disposer = null; }
      }

      /** 解析 activeId → 映射 → overrideTokens；失败路径按契约 F 逐条兜底。 */
      function applyResult(activeId, customs) {
        status.activeId = activeId;
        status.brokenJson = customs.broken;
        status.rawCustom = customs.raw;
        var resolvedDoc = null;
        var resolvedPalette = null;
        if (activeId) {
          for (var i = 0; i < BUILTIN_DESIGNS.length; i += 1) {
            if (BUILTIN_DESIGNS[i].id === activeId) { resolvedDoc = BUILTIN_DESIGNS[i]; break; }
          }
          if (!resolvedDoc) {
            for (var j = 0; j < customs.list.length; j += 1) {
              if (customs.list[j].id === activeId) { resolvedPalette = customs.list[j]; break; }
            }
          }
        }
        if (!resolvedDoc && !resolvedPalette) {
          // activeDesign='' 或设计缺失 → 视同未激活：不发层（契约 E.2/F）。
          status.missingId = activeId || null;
          status.tokens = null; status.skipped = []; status.palette = null; status.paletteName = null;
          releaseLayer();
          applyComponentCss('');
          return;
        }
        status.missingId = null;
        var tokens, skipped, palette;
        if (resolvedDoc) {
          var mapping = mapDesignToTokens(resolvedDoc);
          tokens = mapping.tokens; skipped = mapping.skipped;
          palette = buildPalette(resolvedDoc, mapping);
        } else {
          palette = resolvedPalette;
          tokens = palette.tokens;
          skipped = Array.isArray(palette.skipped) ? palette.skipped : [];
        }
        try {
          // 校验发生在 overrides.set 之前；失败时上一层原样保留（契约 F）。
          var next = ctx.theme.overrideTokens(SOURCE, tokens);
          if (disposer) disposer();
          disposer = next;
          // 组件面只在内置 design.md 上有来源；导入的 PaletteDoc 只有颜色 → 清空。
          // hover 段同理：只在内置设计带 components 段时追加到同一 <style>。
          applyComponentCss(componentCss(buildComponentOverrides(resolvedDoc)) + buildHoverCss(resolvedDoc) + LAYOUT_CSS);
          status.tokens = tokens; status.skipped = skipped; status.palette = palette; status.paletteName = palette.name;
          status.applyError = null;
        } catch (err) {
          console.error(SOURCE + ': token override rejected: ' + messageOf(err));
          status.applyError = messageOf(err);
        }
      }

      /** 订阅回调 / 启动恢复：以 Host 快照为真源重放（幂等）。 */
      function reapply() {
        var section = currentSection();
        applyResult(typeof section.activeDesign === 'string' ? section.activeDesign : '', currentCustoms());
      }

      /** 写配置尽力而为：失败只影响持久化，不影响本次会话的样式（契约 F）。 */
      function safeSet(field, value) {
        try {
          var result = scope.set(field, value);
          if (result && typeof result.catch === 'function') result.catch(function () { /* 非回环/修订冲突：静默 */ });
        } catch (err) { /* 同上 */ }
      }

      function activate(id) {
        applyResult(id, currentCustoms());
        safeSet('activeDesign', id);
      }

      function restoreDefault() {
        applyResult('', currentCustoms());
        safeSet('activeDesign', '');
      }

      /** 导入（JSON 或 design.md 产物共用）：追加进 customDesigns 并激活。 */
      function importPalette(palette) {
        var customs = currentCustoms();
        var list = customs.broken ? [] : customs.list.slice();
        var taken = {};
        BUILTIN_DESIGNS.forEach(function (d) { taken[d.id] = true; });
        list.forEach(function (p) { if (p && p.id) taken[p.id] = true; });
        palette.id = uniqueId(palette.id || palette.name, taken);
        list.push(palette);
        var json = JSON.stringify(list);
        if (json.length > LIMITS.total) return { ok: false, errorKey: 'tooLargeTotal' };
        safeSet('customDesigns', json);
        applyResult(palette.id, { list: list, broken: false, raw: json });
        safeSet('activeDesign', palette.id);
        return { ok: true };
      }

      function importPaletteJson(text) {
        if (!checkSize(text)) return { ok: false, errorKey: 'tooLarge' };
        var data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          return { ok: false, errorKey: 'invalidJson' };
        }
        var checked = validatePalette(data);
        if (!checked.ok) return { ok: false, errorKey: 'invalidPalette', detail: checked.error };
        return importPalette(checked.palette);
      }

      function importDesignMd(text, fallbackName) {
        if (!checkSize(text)) return { ok: false, errorKey: 'tooLarge' };
        var doc;
        try {
          doc = parseDesignDoc(text, fallbackName);
        } catch (err) {
          return { ok: false, errorKey: 'parseFailed', detail: messageOf(err) };
        }
        return importPalette(buildPalette(doc, mapDesignToTokens(doc)));
      }

      function exportActive() {
        if (!status.palette) return { ok: false, errorKey: 'nothingActive' };
        return { ok: true, text: JSON.stringify(status.palette, null, 2) };
      }

      function exportRawCustoms() {
        return { ok: true, text: currentSection().customDesigns || '[]' };
      }

      /**
       * 删除一条已导入设计（内置设计不可删；坏 JSON 时不提供删除，避免误伤原文）。
       * 若正激活：先回退默认主题（释放 override/组件层 + 清 activeDesign），
       * 再从 customDesigns 移除，避免刷新时出现悬空 activeId。
       */
      function removeCustom(id) {
        var customs = currentCustoms();
        if (customs.broken) return { ok: false, errorKey: 'deleteUnavailable' };
        var list = customs.list.filter(function (p) { return p && p.id !== id; });
        if (list.length === customs.list.length) return { ok: false, errorKey: 'notDeletable' };
        if (currentSection().activeDesign === id) {
          applyResult('', customs);
          safeSet('activeDesign', '');
        }
        safeSet('customDesigns', JSON.stringify(list));
        return { ok: true };
      }

      /** 设置行视图：快照 + 内置/导入清单 + 应用状态。 */
      function getView() {
        var snap = scope.getSnapshot();
        var customs = currentCustoms();
        status.brokenJson = customs.broken;
        status.rawCustom = customs.raw;
        var section = currentSection();
        var items = BUILTIN_DESIGNS.map(function (d) {
          return { id: d.id, name: d.name, version: d.version, origin: 'builtin' };
        }).concat(customs.list.map(function (p) {
          return { id: p.id, name: p.name || p.id, version: (p.origin && p.origin.designVersion) || 'imported', origin: 'imported' };
        }));
        return {
          activeId: typeof section.activeDesign === 'string' ? section.activeDesign : '',
          items: items,
          status: status,
          // 非回环/未就绪判定用官方语义：ConfigFormController 快照
          // { value, status: 'idle'|'loading'|'ready'|'error', writable }
          // （先例：设置表单 L441587、session-log 行 L535609）。
          // v0.1.2 修复：此前误查不存在的 mode 字段，host-backed 页恒报非回环。
          hostBacked: !!snap && snap.status === 'ready' && snap.writable !== false
        };
      }

      return {
        reapply: reapply,
        release: releaseLayer,
        activate: activate,
        restoreDefault: restoreDefault,
        importPaletteJson: importPaletteJson,
        importDesignMd: importDesignMd,
        removeCustom: removeCustom,
        exportActive: exportActive,
        exportRawCustoms: exportRawCustoms,
        getView: getView
      };
    }

    /** 设置行组件（契约 E.1）：React.createElement 自绘，无 JSX。 */
    function createRow(scope, t, api) {
      function Row() {
        var R = react();
        var h = R.createElement;
        var tickState = R.useState(0);
        var setTick = tickState[1];
        var textState = R.useState('');
        var text = textState[0];
        var setText = textState[1];
        var msgState = R.useState(null);
        var msg = msgState[0];
        var setMsg = msgState[1];
        var outState = R.useState(null);
        var out = outState[0];
        var setOut = outState[1];
        var pendingState = R.useState('');
        var pending = pendingState[0];
        var setPending = pendingState[1];
        // v0.8.4：列表折叠——默认只显示前 6 个，其余点「展开」再看（17 套太长）。
        var expandedState = R.useState(false);
        var expanded = expandedState[0];
        var setExpanded = expandedState[1];
        R.useEffect(function () {
          return scope.subscribe(function () { setTick(function (n) { return n + 1; }); });
        }, []);

        function refresh() { setTick(function (n) { return n + 1; }); }

        function copyOut(content) {
          if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(content).then(function () {
              setMsg({ tone: 'info', text: t('copied') });
            }, function () {
              setOut(content);
              setMsg({ tone: 'error', text: t('copyFailed') });
            });
          } else {
            setOut(content);
            setMsg({ tone: 'error', text: t('copyFailed') });
          }
        }

        function doExport() {
          var result = api.exportActive();
          if (!result.ok) { setMsg({ tone: 'error', text: t(result.errorKey) }); return; }
          copyOut(result.text);
        }

        function doExportRaw() {
          var result = api.exportRawCustoms();
          copyOut(result.text);
        }

        function doImportJson() {
          if (!text.trim()) return;
          setMsg(null);
          var result = api.importPaletteJson(text);
          if (result.ok) { setText(''); setMsg({ tone: 'info', text: t('added') }); } else {
            setMsg({ tone: 'error', text: fmt(t(result.errorKey), result.detail || '') });
          }
          refresh();
        }

        function onFile(event) {
          var file = event.target.files && event.target.files[0];
          event.target.value = '';
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function () {
            setMsg(null);
            var result = api.importDesignMd(String(reader.result), file.name.replace(/\.md$/i, ''));
            if (result.ok) { setMsg({ tone: 'info', text: t('added') }); } else {
              setMsg({ tone: 'error', text: fmt(t(result.errorKey), result.detail || '') });
            }
            refresh();
          };
          reader.onerror = function () { setMsg({ tone: 'error', text: t('parseFailed') }); };
          reader.readAsText(file);
        }

        var view = api.getView();
        var st = view.status;
        var children = [];
        children.push(h('div', { className: 'dmds-title' }, t('title')));

        var swatches = SUMMARY_TOKENS.map(function (name) {
          var value = st.tokens && st.tokens[name] ? st.tokens[name].light : null;
          return h('span', { key: name, className: 'dmds-swatch', style: { background: value || 'transparent' } });
        });
        children.push(h('div', { className: 'dmds-summary' },
          h('span', null, t('active') + ': ' + (st.paletteName || t('none'))),
          swatches));

        var visibleItems = expanded ? view.items : view.items.slice(0, 6);
        var list = visibleItems.map(function (item) {
          var select = h('button', {
            type: 'button', className: 'dmds-item', 'data-active': item.id === view.activeId,
            onClick: function () { setMsg(null); setPending(''); api.activate(item.id); refresh(); }
          },
          h('span', { className: 'dmds-item-name' }, item.name),
          item.id === view.activeId ? h('span', { className: 'dmds-check', 'aria-label': t('selected'), title: t('selected') }, '✓') : null,
          h('span', { className: 'dmds-meta' }, item.version + ' · ' + t(item.origin === 'builtin' ? 'originBuiltin' : 'originImported')));
          if (item.origin !== 'imported') {
            return h('div', { key: item.id, className: 'dmds-item-row' }, select);
          }
          var confirming = pending === item.id;
          return h('div', { key: item.id, className: 'dmds-item-row' },
            select,
            h('button', {
              type: 'button', className: 'dmds-del', 'data-confirm': confirming, title: t('deleteDesign'),
              onClick: function () {
                if (!confirming) { setMsg(null); setPending(item.id); return; }
                var result = api.removeCustom(item.id);
                setPending('');
                setMsg(result.ok ? { tone: 'info', text: t('deleted') } : { tone: 'error', text: t(result.errorKey) });
                refresh();
              }
            }, confirming ? t('confirmDelete') : t('deleteDesign')));
        });
        children.push(h('div', { className: 'dmds-list' },
          list.length > 0 ? list : h('span', { className: 'dmds-meta' }, t('noDesigns'))));
        // 折叠开关：默认只露出前 6 个，其余 11 个点开再看。
        if (view.items.length > 6) {
          children.push(h('button', {
            type: 'button', className: 'dmds-btn dmds-toggle', 'data-expanded': expanded,
            onClick: function () { setExpanded(!expanded); }
          }, expanded ? t('collapse') : fmt(t('expandMore'), view.items.length - 6)));
        }

        children.push(h('div', { className: 'dmds-actions' },
          h('button', { type: 'button', className: 'dmds-btn', onClick: function () { setMsg(null); api.restoreDefault(); refresh(); } }, t('restore')),
          h('button', { type: 'button', className: 'dmds-btn', onClick: doExport }, t('exportJson')),
          h('label', { className: 'dmds-btn' }, t('importMd'),
            h('input', { type: 'file', accept: '.md,text/markdown,text/plain', style: { display: 'none' }, onChange: onFile }))));

        children.push(h('textarea', {
          className: 'dmds-input', value: text, placeholder: t('importPlaceholder'),
          onChange: function (event) { setText(event.target.value); }
        }));
        children.push(h('div', { className: 'dmds-actions' },
          h('button', { type: 'button', className: 'dmds-btn', disabled: !text.trim(), onClick: doImportJson }, t('importJson'))));

        if (st.brokenJson) {
          children.push(h('button', { type: 'button', className: 'dmds-btn', onClick: doExportRaw }, t('exportBackup')));
          children.push(h('div', { className: 'dmds-error' }, t('brokenJson')));
        }
        if (out !== null) {
          children.push(h('textarea', { className: 'dmds-input', readOnly: true, value: out, onFocus: function (event) { event.target.select(); } }));
        }
        if (msg) children.push(h('div', { className: msg.tone === 'error' ? 'dmds-error' : 'dmds-note' }, msg.text));
        if (st.applyError) children.push(h('div', { className: 'dmds-error' }, t('invalidPalette') + st.applyError));
        if (st.missingId) children.push(h('div', { className: 'dmds-error' }, fmt(t('missingDesign'), st.missingId)));
        if (st.skipped && st.skipped.length > 0) children.push(h('div', { className: 'dmds-note' }, fmt(t('skippedNote'), st.skipped.length) + st.skipped.join(', ')));
        if (!view.hostBacked) children.push(h('div', { className: 'dmds-note' }, t('nonLoopback')));

        return h('div', { className: 'dmds-row' }, children);
      }
      return Row;
    }

    /** 客户端插件体（契约 C.2/IC-1）：inject 四服务就绪后 apply 才执行。 */
    var INJECT = ['theme', 'slots', 'locale', 'configForms'];

    function apply(ctx) {
      var scope = ctx.configForms.get(SOURCE);
      var api = makeApi(ctx, scope);
      // 订阅 + 首次应用 + 卸载清理（契约 E.2 恢复流程；scope 先默认后真实，
      // 订阅回调会带来真实选择并再次幂等应用）。
      ctx.effect(function () {
        var unsubscribe = scope.subscribe(function () { api.reapply(); });
        api.reapply();
        return function () {
          unsubscribe();
          api.release();
          applyComponentCss('');
        };
      }, SOURCE + ': override layer');
      ctx.effect(function () {
        return ctx.locale.register(LOCALE_NS, LOCALES);
      }, LOCALE_NS + ': dictionaries');
      var t = ctx.locale && typeof ctx.locale.bind === 'function' ? ctx.locale.bind(LOCALE_NS) : fallbackT;
      // 设置行（契约 E.1）：对齐 ui-theme 范式，无 whileServed 门控。
      ctx.slots.inject('settings.general.item', function () {
        return ctx.slots.register({ name: 'settings.general.item', id: SOURCE, order: 12, locale: LOCALE_NS }, createRow(scope, t, api));
      });
    }

    exports.inject = INJECT;
    exports.apply = apply;
    /** 纯逻辑暴露（Node 自测分支消费；Loader 只读 inject/apply，额外键无害——ui-theme 同样导出内部符号，asar:698537-698540）。 */
    exports.__internal = {
      parseDesignDoc: parseDesignDoc,
      mapDesignToTokens: mapDesignToTokens,
      buildPalette: buildPalette,
      validatePalette: validatePalette,
      deserializeCustoms: deserializeCustoms,
      checkSize: checkSize,
      normalizeId: normalizeId,
      uniqueId: uniqueId,
      parseColor: parseColor,
      luminance: luminance,
      flipColor: flipColor,
      BUILTIN_DESIGNS: BUILTIN_DESIGNS,
      TOKEN_NAMES: TOKEN_NAMES,
      LITERAL_TOKENS: LITERAL_TOKENS,
      KNOWN_COLOR_KEYS: KNOWN_COLOR_KEYS,
      SUMMARY_TOKENS: SUMMARY_TOKENS,
      LIMITS: LIMITS,
      PALETTE_SCHEMA: PALETTE_SCHEMA,
      cssTagIdSelector: cssTagIdSelector,
      buildComponentOverrides: buildComponentOverrides,
      componentCss: componentCss,
      buildHoverCss: buildHoverCss,
      normalizeRadius: normalizeRadius,
      normalizeFontFamily: normalizeFontFamily,
      normalizeFontSize: normalizeFontSize,
      makeApi: makeApi
    };
    return module.exports;
  }

  /* ══════════════════════ 9. 登记（浏览器）/ 自测暴露（Node） ══════════════════════ */

  if (typeof window !== 'undefined' && window.__ModuleLoader__ && typeof window.__ModuleLoader__.load === 'function') {
    window.__ModuleLoader__.load({ id: SOURCE, factory: factory });
  } else if (typeof globalThis !== 'undefined') {
    // Node / 自测：以 stub require 物化一次，暴露纯逻辑（生产代码本身，防漂移）。
    globalThis.__designMdSwitcherInternal = factory(function (name) {
      throw new Error('design-md-switcher: browser-only module require: ' + name);
    });
  }
})();
