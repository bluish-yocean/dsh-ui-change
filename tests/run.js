/**
 * design-md-switcher 零依赖测试（node:assert + 自写 runner）。
 * 运行：在仓库根运行 `node tests/run.js`。
 *
 * 解析器/映射器断言直接消费 lib/client.js 经 Node 分支物化的生产代码
 * （globalThis.__designMdSwitcherInternal.__internal），单一真相源防漂移；
 * 内置一致性测试把 BUILTIN_DESIGNS 与 tests/fixtures/*.md 的解析产物对表。
 */
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { pathToFileURL, fileURLToPath } from 'node:url'

const libDir = new URL('../lib/', import.meta.url)
await import(pathToFileURL(fileURLToPath(new URL('client.js', libDir))).href)
const api = globalThis.__designMdSwitcherInternal
assert.ok(api && api.__internal, 'client.js must expose __designMdSwitcherInternal in Node')
const internal = api.__internal

const mod = await import(pathToFileURL(fileURLToPath(new URL('index.js', libDir))).href)

const fixturesDir = new URL('./fixtures/', import.meta.url)
const builtinDir = new URL('builtin/', fixturesDir)
const builtinFixtures = {}
for (const name of await readdir(builtinDir)) {
  if (name.endsWith('.md')) builtinFixtures[name.slice(0, -3)] = await readFile(new URL(name, builtinDir), 'utf8')
}
const fixtures = {
  claude: builtinFixtures.claude,
  sap: await readFile(new URL('sap.md', fixturesDir), 'utf8'),
  playstation: await readFile(new URL('playstation.md', fixturesDir), 'utf8')
}

const tests = []
const test = (name, fn) => tests.push({ name, fn })
const T = internal.TOKEN_NAMES
const hslLightness = (value) => {
  const m = /^hsl\(\d+, \d+%, (\d+)%\)$/.exec(String(value))
  assert.ok(m, `expected an hsl(H, S%, L%) string, got ${JSON.stringify(value)}`)
  return Number(m[1])
}
const inBand = (value, lo, hi) => {
  const l = hslLightness(value)
  assert.ok(l >= lo && l <= hi, `hsl lightness ${l} not in [${lo}, ${hi}] for ${value}`)
}

/* ── 解析器（契约 A） ── */

test('parser: claude fixture → DesignDoc (id/name/version/colors/unknownKeys/unused)', () => {
  const doc = internal.parseDesignDoc(fixtures.claude, 'claude')
  assert.equal(doc.id, 'claude')
  assert.equal(doc.name, 'Claude')
  assert.equal(doc.version, 'alpha')
  assert.equal(doc.colors.canvas, '#faf9f5')
  assert.equal(doc.colors.primary, '#cc785c')
  assert.equal(Object.keys(doc.colors).length, 19)
  assert.deepEqual(doc.diagnostics, [], 'DSH-targeted sample has no dead keys (v0.3.2: prose/spacing/unmapped entries removed)')
  assert.deepEqual(Object.keys(doc.darkColors).sort(), [
    'error', 'hairline', 'hairline-soft', 'on-dark', 'on-dark-soft', 'primary', 'primary-active',
    'success', 'surface-dark', 'surface-dark-elevated', 'surface-dark-soft', 'warning'
  ], 'v0.5.0: colors.dark is a parallel palette parsed into doc.darkColors')
  assert.equal(doc.darkColors['surface-dark'], '#181715')
  assert.ok(doc.unused.components, 'components parsed but unused (A.2)')
  assert.deepEqual(Object.keys(doc.unused.components), ['button-new-session'], 'only the consumed component behavior remains')
  assert.deepEqual(Object.keys(doc.unused.typography).sort(), ['body', 'display-xl'], 'only the host-read typography entries remain')
  assert.deepEqual(Object.keys(doc.unused.rounded).sort(), ['lg', 'md', 'sm', 'xl', 'xs'], 'only the mapped radius steps remain')
  assert.equal(doc.unused.spacing, null, 'spacing has no host consumer')
  assert.equal(doc.unused.typography['display-xl'].fontFamily, 'Copernicus, Tiempos Headline, serif')
})

test('parser: sap fixture → unquoted fontFamily scalar + navy into unknownKeys', () => {
  const doc = internal.parseDesignDoc(fixtures.sap, 'sap')
  assert.equal(doc.id, 'sap')
  assert.equal(doc.name, 'Sap')
  assert.equal(doc.colors.chrome, '#f5f6f7')
  assert.equal(doc.colors.ink, '#000000')
  assert.equal(Object.keys(doc.colors).length, 17)
  assert.equal(doc.unused.typography['display'].fontFamily, '72 Brand Variable', 'Sap fontFamily is an unquoted YAML plain scalar')
  assert.equal(doc.unused.components['nav-bar'].height, '60', 'bare numeric component value recorded verbatim (A.3)')
  assert.ok(doc.diagnostics.join('\n').includes('navy'), 'contract A.3 example: Sap navy → unknownKeys')
})

test('parser: playstation fixture → block scalar description + rgba colors + unknownKeys', () => {
  const doc = internal.parseDesignDoc(fixtures.playstation, 'playstation')
  assert.equal(doc.id, 'playstation')
  assert.equal(doc.colors['canvas-dark'], '#000000')
  assert.equal(doc.colors['body-light'], 'rgba(0,0,0,0.6)')
  assert.equal(Object.keys(doc.colors).length, 36)
  assert.ok(doc.description.includes('three-surface'), 'description: | block scalar is parsed (A.1)')
  assert.ok(doc.diagnostics.join('\n').includes('marathon-yellow'))
})

test('parser: no frontmatter → reject (A.3)', () => {
  assert.throws(() => internal.parseDesignDoc('name: X\ncolors:\n  a: "#111111"\n'), /frontmatter/)
})

test('parser: unclosed fence → reject (A.3)', () => {
  assert.throws(() => internal.parseDesignDoc('---\nname: X\n'), /frontmatter/)
})

test('parser: colors missing / empty / all-invalid → reject (A.2/A.3)', () => {
  assert.throws(() => internal.parseDesignDoc('---\nname: X\nversion: v\n---\n'), /colors/)
  assert.throws(() => internal.parseDesignDoc('---\nname: X\ncolors: {}\n---\n'), /colors/)
  assert.throws(() => internal.parseDesignDoc('---\nname: X\ncolors:\n  a: 123\n  b: "hello world"\n---\n'), /colors/)
})

test('parser: one non-color key is dropped with diagnostic, others continue (A.3)', () => {
  const doc = internal.parseDesignDoc('---\nname: T\ncolors:\n  primary: "#cc785c"\n  bogus: 123\n---\n')
  assert.deepEqual(Object.keys(doc.colors), ['primary'])
  assert.ok(doc.diagnostics.join('\n').includes('bogus'))
})

test('parser: {colors.x} single-level reference resolution (A.3)', () => {
  const doc = internal.parseDesignDoc([
    '---', 'name: R', 'colors:',
    '  primary: "#123456"',
    '  sky: "{colors.primary}"',
    '  sea: "{colors.nope}"',
    '  a: "{colors.b}"',
    '  b: "{colors.c}"',
    '  c: "#000000"',
    '---'
  ].join('\n'))
  assert.equal(doc.colors.sky, '#123456', 'existing target → replaced with target value')
  assert.ok(!('sea' in doc.colors) && doc.diagnostics.join('\n').includes('colors.sea'), 'missing target → dropped + diagnostic')
  assert.equal(doc.colors.b, '#000000', 'one level resolves')
  assert.ok(!('a' in doc.colors) && doc.diagnostics.join('\n').includes('colors.a'), 'nested reference → dropped (single-level only)')
})

test('parser: duplicate key → last wins (A.3)', () => {
  const doc = internal.parseDesignDoc('---\nname: First\nname: Second\ncolors:\n  a: "#111111"\n---\n')
  assert.equal(doc.name, 'Second')
})

test('parser: unknown top-level key recorded; prose body ignored (A.3)', () => {
  const doc = internal.parseDesignDoc('---\nname: T\nwidget: x\ncolors:\n  a: "#111111"\n---\n\n## Prose\n\nignored\n')
  assert.equal(doc.colors.a, '#111111')
  assert.ok(doc.diagnostics.join('\n').includes('widget'))
  assert.ok(!doc.description.includes('ignored'))
})

/* ── 映射器（契约 B） ── */

test('mapper: claude → every token (base + reference layer), no skips (B.1/B.3)', () => {
  const doc = internal.BUILTIN_DESIGNS.find((d) => d.id === 'claude')
  const { tokens, skipped } = internal.mapDesignToTokens(doc)
  assert.deepEqual(skipped, [])
  assert.deepEqual(Object.keys(tokens).sort(), [...T].sort())
  for (const key of T) {
    assert.equal(typeof tokens[key].light, 'string', `${key}.light`)
    assert.equal(typeof tokens[key].dark, 'string', `${key}.dark`)
  }
})

test('mapper: contract B.3 spot-check — claude bg-base = #faf9f5 / #181715', () => {
  const doc = internal.BUILTIN_DESIGNS.find((d) => d.id === 'claude')
  const { tokens } = internal.mapDesignToTokens(doc)
  assert.deepEqual(tokens['--dsw-alias-bg-base'], { light: '#faf9f5', dark: '#181715' })
})

test('mapper: claude brand-primary lum≈0.27 ≥ 0.25 → dark stays #cc785c (B.3 #7, matches IC-4 example)', () => {
  const doc = internal.BUILTIN_DESIGNS.find((d) => d.id === 'claude')
  const { tokens } = internal.mapDesignToTokens(doc)
  assert.equal(tokens['--dsw-alias-brand-primary'].light, '#cc785c')
  assert.equal(tokens['--dsw-alias-brand-primary'].dark, '#cc785c')
  assert.ok(internal.luminance(internal.parseColor('#cc785c')) >= 0.25)
})

test('mapper: contract B.3 spot-check — sap sidebar gets the min-difference tint in both schemes', () => {
  const doc = internal.parseDesignDoc(fixtures.sap)
  const { tokens } = internal.mapDesignToTokens(doc)
  // 原 fixture 无暗色表：sidebar 与 bg-base 都落到 ink #000000（浅色则与 canvas 几乎同色），
  // v0.8.8 起用 8% 叠色兜底，保证侧栏与主区可辨。
  assert.deepEqual(tokens['--dsw-specific-sidebar-fill'], {
    light: 'color-mix(in srgb, var(--dsw-alias-bg-base) 92%, var(--dsw-alias-label-primary) 8%)',
    dark: 'color-mix(in srgb, var(--dsw-alias-bg-base) 92%, var(--dsw-alias-label-primary) 8%)'
  })
})

test('mapper: contract B.3 spot-check — playstation bg-base dark = #000000 (canvas-dark)', () => {
  const doc = internal.parseDesignDoc(fixtures.playstation)
  const { tokens } = internal.mapDesignToTokens(doc)
  assert.equal(tokens['--dsw-alias-bg-base'].light, '#ffffff', 'light chain: canvas missing → canvas-light')
  assert.equal(tokens['--dsw-alias-bg-base'].dark, '#000000')
})

test('mapper: contract B.3 spot-check — sap label-primary dark = flip(#000000, 0.88, 0.96), band-asserted', () => {
  const doc = internal.parseDesignDoc(fixtures.sap)
  const { tokens } = internal.mapDesignToTokens(doc)
  assert.equal(tokens['--dsw-alias-label-primary'].light, '#000000')
  inBand(tokens['--dsw-alias-label-primary'].dark, 88, 96)
})

test('mapper: v0.6.0 menu/focus/tooltip/switch tokens follow the design palette', () => {
  const claude = internal.mapDesignToTokens(internal.BUILTIN_DESIGNS.find((d) => d.id === 'claude')).tokens
  assert.deepEqual(claude['--dsw-alias-menu-icon'], { light: '#8e8b82', dark: '#a09d96' }, 'muted-soft / on-dark-soft')
  assert.deepEqual(claude['--dsw-menu-surface-fill'], { light: 'rgba(239, 233, 222, 0.92)', dark: 'rgba(37, 35, 32, 0.9)' }, 'card surface 92% / elevated dark 90%')
  assert.deepEqual(claude['--dsw-focus-ring-color'], { light: '#cc785c', dark: '#cc785c' }, 'brand coral ring in both schemes')
  assert.deepEqual(claude['--dsw-alias-tooltip-key-bg'], { light: 'color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)', dark: 'color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)' }, 'keycap is a lighter shade of the bubble')
  assert.deepEqual(claude['--dsw-alias-switch-thumb'], { light: '#faf9f5', dark: '#faf9f5' })

  const ps = internal.mapDesignToTokens(internal.parseDesignDoc(fixtures.playstation)).tokens
  assert.deepEqual(ps['--dsw-alias-menu-icon'], { light: '#6b6b6b', dark: '#cccccc' }, 'mute-light / on-dark-mute')
  assert.deepEqual(ps['--dsw-alias-switch-thumb'], { light: '#ffffff', dark: '#ffffff' }, 'canvas-light / on-dark')
})

test('mapper: v0.7.0 reference layer follows the base tokens', () => {
  const doc = internal.BUILTIN_DESIGNS.find((d) => d.id === 'claude')
  const { tokens, skipped } = internal.mapDesignToTokens(doc)
  assert.deepEqual(skipped, [], 'references never skip')
  assert.equal(tokens['--dsw-alias-button-primary-fill'].light, 'var(--dsw-alias-brand-primary)')
  assert.equal(tokens['--dsw-alias-toast-bg'].light, 'var(--dsw-alias-button-contrast-fill)')
  assert.equal(tokens['--dsw-alias-toast-label'].light, 'var(--dsw-alias-bg-base)')
  assert.equal(tokens['--dsw-alias-scrollbar-bg-l1'].light, 'var(--dsw-alias-label-tertiary)')
  assert.equal(tokens['--dsw-alias-menu-group-header-fill'].light, 'var(--dsw-menu-surface-fill)')
  assert.equal(tokens['--dsw-alias-code-diff-added'].light, 'color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent)')
  for (const [name, expr] of internal.LITERAL_TOKENS) {
    assert.deepEqual(tokens[name], { light: expr, dark: expr }, name + ' is a scheme-neutral reference')
  }
})

test('mapper: v0.8.3 tooltip bubble stays dark in all 17 palettes (fixed white label)', () => {
  const keycap = 'color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)'
  for (const d of internal.BUILTIN_DESIGNS) {
    const { tokens } = internal.mapDesignToTokens(d)
    const bg = tokens['--dsw-alias-tooltip-bg']
    assert.ok(bg, d.id + ': tooltip-bg is mapped')
    for (const scheme of ['light', 'dark']) {
      const rgb = internal.parseColor(bg[scheme])
      assert.ok(rgb, `${d.id}.${scheme}: parseable tooltip-bg ${JSON.stringify(bg[scheme])}`)
      assert.ok(internal.luminance(rgb) < 0.25, `${d.id}.${scheme}: tooltip bubble must stay dark for the fixed white label`)
    }
    assert.deepEqual(tokens['--dsw-alias-tooltip-key-bg'], { light: keycap, dark: keycap })
  }
})

test('mapper: v0.8.5 sidebar divider (border-l3/l4) keeps contrast in every palette', () => {
  const l3 = 'color-mix(in srgb, var(--dsw-alias-label-primary) 28%, transparent)'
  const l4 = 'color-mix(in srgb, var(--dsw-alias-label-primary) 36%, transparent)'
  const over = (c, bg) => {
    const a = c.a ?? 1
    return { r: c.r * a + bg.r * (1 - a), g: c.g * a + bg.g * (1 - a), b: c.b * a + bg.b * (1 - a), a: 1 }
  }
  const ratio = (a, b) => {
    const la = internal.luminance(a), lb = internal.luminance(b)
    const hi = Math.max(la, lb), lo = Math.min(la, lb)
    return (hi + 0.05) / (lo + 0.05)
  }
  const SIDEBAR_TINT = 'color-mix(in srgb, var(--dsw-alias-bg-base) 92%, var(--dsw-alias-label-primary) 8%)'
  const surfaceOf = (tokens, name, scheme) => {
    const value = tokens[name] && tokens[name][scheme]
    if (value === SIDEBAR_TINT) {
      const base = internal.parseColor(tokens['--dsw-alias-bg-base'][scheme])
      const text = internal.parseColor(tokens['--dsw-alias-label-primary'][scheme])
      return over(Object.assign({}, text, { a: 0.08 }), base)
    }
    return internal.parseColor(value)
  }
  for (const d of internal.BUILTIN_DESIGNS) {
    const { tokens } = internal.mapDesignToTokens(d)
    assert.deepEqual(tokens['--dsw-alias-border-l3'], { light: l3, dark: l3 }, d.id + ': l3 divider')
    assert.deepEqual(tokens['--dsw-alias-border-l4'], { light: l4, dark: l4 }, d.id + ': l4 divider')
    for (const scheme of ['light', 'dark']) {
      const text = internal.parseColor(tokens['--dsw-alias-label-primary'][scheme])
      for (const surface of ['--dsw-specific-sidebar-fill', '--dsw-alias-bg-base']) {
        const bg = surfaceOf(tokens, surface, scheme)
        assert.ok(bg, `${d.id}.${scheme} ${surface}: resolvable`)
        const cr = ratio(over(Object.assign({}, text, { a: 0.28 }), bg), bg)
        assert.ok(cr >= 1.5, `${d.id}.${scheme} ${surface}: divider contrast ${cr.toFixed(2)} < 1.5`)
      }
    }
  }
})

test('mapper: v0.8.8 sidebar and workspace backgrounds differ in every palette', () => {
  const SIDEBAR_TINT = 'color-mix(in srgb, var(--dsw-alias-bg-base) 92%, var(--dsw-alias-label-primary) 8%)'
  const over = (c, bg) => {
    const a = c.a ?? 1
    return { r: c.r * a + bg.r * (1 - a), g: c.g * a + bg.g * (1 - a), b: c.b * a + bg.b * (1 - a), a: 1 }
  }
  const ratio = (a, b) => {
    const la = internal.luminance(a), lb = internal.luminance(b)
    const hi = Math.max(la, lb), lo = Math.min(la, lb)
    return (hi + 0.05) / (lo + 0.05)
  }
  for (const d of internal.BUILTIN_DESIGNS) {
    const { tokens } = internal.mapDesignToTokens(d)
    for (const scheme of ['light', 'dark']) {
      const base = internal.parseColor(tokens['--dsw-alias-bg-base'][scheme])
      const value = tokens['--dsw-specific-sidebar-fill'][scheme]
      const side = value === SIDEBAR_TINT
        ? over(Object.assign({}, internal.parseColor(tokens['--dsw-alias-label-primary'][scheme]), { a: 0.08 }), base)
        : internal.parseColor(value)
      assert.ok(side, `${d.id}.${scheme}: sidebar resolvable`)
      const cr = ratio(side, base)
      assert.ok(cr >= 1.1, `${d.id}.${scheme}: sidebar vs bg-base contrast ${cr.toFixed(2)} < 1.1`)
    }
  }
  // SAP 深色：主色显式给出，不再翻转成荧光蓝；背景是克制的深海军蓝。
  const sap = internal.mapDesignToTokens(internal.BUILTIN_DESIGNS.find((d) => d.id === 'sap')).tokens
  assert.equal(sap['--dsw-alias-brand-primary'].dark, '#4a74c4')
  assert.equal(sap['--dsw-alias-bg-base'].dark, '#0a1b30')
})

test('mapper: v0.8.7 border-l1/l2 keep contrast against panel surfaces in every palette', () => {
  const expr = (a) => `color-mix(in srgb, var(--dsw-alias-label-primary) ${a}%, transparent)`
  const over = (c, bg) => {
    const a = c.a ?? 1
    return { r: c.r * a + bg.r * (1 - a), g: c.g * a + bg.g * (1 - a), b: c.b * a + bg.b * (1 - a), a: 1 }
  }
  const ratio = (a, b) => {
    const la = internal.luminance(a), lb = internal.luminance(b)
    const hi = Math.max(la, lb), lo = Math.min(la, lb)
    return (hi + 0.05) / (lo + 0.05)
  }
  for (const d of internal.BUILTIN_DESIGNS) {
    const { tokens } = internal.mapDesignToTokens(d)
    for (const [name, alpha] of [['--dsw-alias-border-l1', 18], ['--dsw-alias-border-l2', 12]]) {
      const modes = tokens[name]
      if (!modes) continue
      for (const scheme of ['light', 'dark']) {
        const line = modes[scheme] === expr(alpha)
          ? Object.assign({}, internal.parseColor(tokens['--dsw-alias-label-primary'][scheme]), { a: alpha / 100 })
          : internal.parseColor(modes[scheme])
        assert.ok(line, `${d.id}.${scheme} ${name}: parseable`)
        for (const surfaceName of ['--dsw-alias-bg-base', '--dsw-alias-bg-layer-1', '--dsw-alias-bg-layer-2']) {
          const surfaceModes = tokens[surfaceName]
          if (!surfaceModes) continue
          const surface = internal.parseColor(surfaceModes[scheme])
          const cr = ratio(over(line, surface), surface)
          assert.ok(cr >= 1.2, `${d.id}.${scheme} ${name} vs ${surfaceName}: ${cr.toFixed(2)} < 1.2`)
        }
      }
    }
  }
})

test('mapper: sap skips 6 tokens whose light chains are empty (B.1 omission)', () => {
  const doc = internal.parseDesignDoc(fixtures.sap)
  const { tokens, skipped } = internal.mapDesignToTokens(doc)
  assert.deepEqual(skipped, [
    '--dsw-alias-bg-layer-2',
    '--dsw-alias-label-secondary',
    '--dsw-alias-state-idle-primary',
    '--dsw-alias-state-success-primary',
    '--dsw-alias-state-warn-primary',
    '--dsw-alias-state-error-primary'
  ])
  assert.deepEqual(Object.keys(tokens).sort(), T.filter((name) => !skipped.includes(name)).sort(), 'every non-skipped token is mapped (reference layer included)')
})

test('mapper: playstation — rgba() direct dark pass-through + commerce absorbed into error chain', () => {
  const doc = internal.parseDesignDoc(fixtures.playstation)
  const { tokens, skipped } = internal.mapDesignToTokens(doc)
  assert.deepEqual(skipped, ['--dsw-alias-border-l1', '--dsw-alias-border-l2', '--dsw-alias-label-secondary', '--dsw-alias-state-success-primary'])
  assert.equal(tokens['--dsw-alias-label-primary'].dark, '#ffffff', 'on-dark picked verbatim')
  assert.equal(tokens['--dsw-alias-state-idle-primary'].light, '#6b6b6b')
  assert.equal(tokens['--dsw-alias-state-idle-primary'].dark, '#cccccc', 'on-dark-mute picked verbatim')
  assert.equal(tokens['--dsw-alias-state-error-primary'].light, '#d53b00', 'error missing → commerce (B.2)')
  assert.equal(tokens['--dsw-specific-sidebar-fill'].light, '#f3f3f3')
  assert.equal(tokens['--dsw-specific-sidebar-fill'].dark, 'color-mix(in srgb, var(--dsw-alias-bg-base) 92%, var(--dsw-alias-label-primary) 8%)', 'canvas-dark == bg-base → min-difference tint (v0.8.8)')
})

test('mapper: playstation state-warn dark = flip(#c81b3a, 0.45, 0.62) since lum < 0.3', () => {
  const doc = internal.parseDesignDoc(fixtures.playstation)
  const { tokens } = internal.mapDesignToTokens(doc)
  inBand(tokens['--dsw-alias-state-warn-primary'].dark, 45, 62)
})

test('mapper: v0.2.0 button/interactive aliases follow the design palette (claude)', () => {
  const doc = internal.BUILTIN_DESIGNS.find((d) => d.id === 'claude')
  const { tokens } = internal.mapDesignToTokens(doc)
  // 三级文字：muted-soft / on-dark-soft
  assert.deepEqual(tokens['--dsw-alias-label-tertiary'], { light: '#8e8b82', dark: '#a09d96' })
  // 悬浮底：ink 6% / on-dark 8%
  assert.deepEqual(tokens['--dsw-alias-interactive-bg-hover'], { light: 'rgba(20, 20, 19, 0.06)', dark: 'rgba(250, 249, 245, 0.08)' })
  // 主 CTA hover：primary-active；dark 由 colors.dark.primary-active 显式给出（v0.5.0）
  assert.equal(tokens['--dsw-alias-button-primary-hover'].light, '#a9583e')
  assert.equal(tokens['--dsw-alias-button-primary-hover'].dark, '#a9583e', 'explicit dark palette (no flip)')
  assert.notEqual(tokens['--dsw-alias-button-primary-hover'].light, tokens['--dsw-alias-brand-primary'].light, 'hover 不应等于填充色')
  // 高对比填充：ink / on-dark
  assert.deepEqual(tokens['--dsw-alias-button-contrast-fill'], { light: '#141413', dark: '#faf9f5' })
})

test('mapper: v0.2.0 aliases for sap/playstation fall back to flip/ink without skips', () => {
  const sap = internal.mapDesignToTokens(internal.parseDesignDoc(fixtures.sap)).tokens
  assert.equal(sap['--dsw-alias-label-tertiary'].light, '#475e75', 'ink-meta')
  inBand(sap['--dsw-alias-label-tertiary'].dark, 62, 74)
  assert.deepEqual(sap['--dsw-alias-interactive-bg-hover'], { light: 'rgba(0, 0, 0, 0.06)', dark: 'rgba(230, 230, 230, 0.08)' })
  assert.equal(sap['--dsw-alias-button-primary-hover'].light, '#0040b0', 'primary-deep')
  assert.equal(sap['--dsw-alias-button-contrast-fill'].light, '#000000', 'ink')
  assert.equal(sap['--dsw-alias-button-contrast-fill'].dark, '#ffffff', 'canvas picked before flip')

  const ps = internal.mapDesignToTokens(internal.parseDesignDoc(fixtures.playstation)).tokens
  assert.equal(ps['--dsw-alias-label-tertiary'].light, '#6b6b6b', 'mute-light')
  assert.equal(ps['--dsw-alias-button-primary-hover'].light, '#0064b7', 'primary-pressed')
  assert.deepEqual(ps['--dsw-alias-interactive-bg-hover'], { light: 'rgba(0, 0, 0, 0.06)', dark: 'rgba(255, 255, 255, 0.08)' })
  assert.deepEqual(ps['--dsw-alias-button-contrast-fill'], { light: '#000000', dark: '#ffffff' })
})

test('mapper: v0.4.0 new-session button surface/hover follow the design palette', () => {
  const claude = internal.mapDesignToTokens(internal.BUILTIN_DESIGNS.find((d) => d.id === 'claude')).tokens
  assert.deepEqual(claude['--dsw-alias-button-elevated-fill'], { light: '#faf9f5', dark: '#252320' }, 'canvas / surface-dark-elevated')
  assert.deepEqual(claude['--dsw-alias-button-floating-hover'], { light: 'rgba(20, 20, 19, 0.06)', dark: 'rgba(250, 249, 245, 0.08)' }, 'ink 6% / on-dark 8%')

  const sap = internal.mapDesignToTokens(internal.parseDesignDoc(fixtures.sap)).tokens
  assert.equal(sap['--dsw-alias-button-elevated-fill'].light, '#ffffff', 'canvas')
  inBand(sap['--dsw-alias-button-elevated-fill'].dark, 10, 16, 'no dark surface key → flip')
  assert.deepEqual(sap['--dsw-alias-button-floating-hover'], { light: 'rgba(0, 0, 0, 0.06)', dark: 'rgba(230, 230, 230, 0.08)' })

  const ps = internal.mapDesignToTokens(internal.parseDesignDoc(fixtures.playstation)).tokens
  assert.deepEqual(ps['--dsw-alias-button-elevated-fill'], { light: '#ffffff', dark: '#121314' }, 'canvas-light / surface-dark-elevated')
  assert.deepEqual(ps['--dsw-alias-button-floating-hover'], { light: 'rgba(0, 0, 0, 0.06)', dark: 'rgba(255, 255, 255, 0.08)' })
})

test('mapper: sap bg-layer-1 / brand-primary darks are flip-derived within their bands', () => {
  const doc = internal.parseDesignDoc(fixtures.sap)
  const { tokens } = internal.mapDesignToTokens(doc)
  assert.equal(tokens['--dsw-alias-bg-layer-1'].light, '#f5f6f7')
  inBand(tokens['--dsw-alias-bg-layer-1'].dark, 10, 16)
  inBand(tokens['--dsw-alias-brand-primary'].dark, 35, 55)
  assert.equal(tokens['--dsw-alias-bg-base'].dark, '#000000', 'ink is the last dark-base candidate')
})

test('mapper: v0.5.0 dual palette — colors.dark wins over flip/legacy dark chains', () => {
  const doc = internal.BUILTIN_DESIGNS.find((d) => d.id === 'claude')
  const { tokens, skipped } = internal.mapDesignToTokens(doc)
  assert.deepEqual(skipped, [])
  assert.deepEqual(tokens['--dsw-alias-bg-base'], { light: '#faf9f5', dark: '#181715' }, 'dark.surface-dark')
  assert.deepEqual(tokens['--dsw-alias-bg-layer-1'], { light: '#efe9de', dark: '#252320' }, 'dark.surface-dark-elevated')
  assert.equal(tokens['--dsw-alias-border-l1'].dark, 'rgba(250, 249, 245, 0.16)', 'dark.hairline replaces flip')
  assert.equal(tokens['--dsw-alias-border-l2'].dark, 'rgba(250, 249, 245, 0.10)', 'dark.hairline-soft replaces flip')
  assert.equal(tokens['--dsw-alias-label-primary'].dark, '#faf9f5', 'dark.on-dark')
  assert.equal(tokens['--dsw-alias-state-error-primary'].dark, '#c64545', 'dark.error overrides the old low-lum flip')
  assert.equal(tokens['--dsw-alias-state-warn-primary'].dark, '#d4a017', 'dark.warning')
  assert.equal(tokens['--dsw-alias-button-primary-hover'].dark, '#a9583e', 'dark.primary-active replaces flip')
})

test('mapper: v0.5.0 partial dark palette falls back to flip for missing keys', () => {
  const doc = {
    colors: { primary: '#cc785c', canvas: '#faf9f5', hairline: '#e6dfd8', ink: '#141413' },
    darkColors: { canvas: '#181715' }
  }
  const { tokens } = internal.mapDesignToTokens(doc)
  assert.equal(tokens['--dsw-alias-bg-base'].dark, '#181715', 'dark.canvas via the parallel semantic key')
  assert.ok(/^hsl\(/.test(tokens['--dsw-alias-border-l1'].dark), 'missing dark.hairline → flip derivation')
})

test('components: design.md rounded/typography → host CSS variables (v0.3.0)', () => {
  const claude = internal.BUILTIN_DESIGNS.find((d) => d.id === 'claude')
  const vars = internal.buildComponentOverrides(claude)
  assert.deepEqual(vars, {
    '--dsw-radius-xs': '4px',
    '--dsw-radius-sm': '6px',
    '--dsw-radius-md': '8px',
    '--dsw-radius-lg': '12px',
    '--dsw-radius-xl': '16px',
    '--dsw-radius-panel': '16px',
    '--dsw-font-family': 'StyreneB, Inter, sans-serif',
    '--dsw-font-family-brand': 'Copernicus, "Tiempos Headline", serif',
    '--dsh-content-font-size': '16px'
  })
  const css = internal.componentCss(vars)
  assert.ok(css.startsWith('body{') && css.endsWith('}'))
  assert.ok(css.includes('--dsh-content-font-size:16px !important'), 'content size must beat the presenter inline value')
  assert.ok(!css.includes('!important;--dsw-radius'), 'radius/family stay normal declarations')

  const sap = internal.buildComponentOverrides(internal.parseDesignDoc(fixtures.sap))
  assert.equal(sap['--dsw-font-family'], '"72 Brand Variable"', 'multi-word family is quoted')
  assert.equal(sap['--dsw-radius-md'], '8px')
  assert.equal(sap['--dsh-content-font-size'], '18px')
})

test('components: untrusted/invalid values are rejected (CSS injection, out-of-range)', () => {
  const bad = {
    unused: {
      rounded: { md: '8px;}body{color:red', lg: '999px' },
      typography: { body: { fontFamily: 'x;}body{color:red', fontSize: '64px' }, 'display-xl': { fontFamily: 'a{b}' } }
    }
  }
  assert.deepEqual(internal.buildComponentOverrides(bad), {})
  assert.equal(internal.normalizeFontSize('9px'), null, 'below host range')
  assert.equal(internal.normalizeFontSize('22px'), 22)
  assert.equal(internal.normalizeFontSize('16'), null, 'unitless rejected')
  const ok = { unused: { rounded: { md: '8px' }, typography: { body: { fontFamily: 'Inter, sans-serif', fontSize: '15px' } } } }
  assert.deepEqual(internal.buildComponentOverrides(ok), {
    '--dsw-radius-sm': '8px', '--dsw-radius-md': '8px',
    '--dsw-radius-lg': '8px', '--dsw-radius-xl': '8px',
    '--dsw-font-family': 'Inter, sans-serif',
    '--dsw-font-family-brand': 'Inter, sans-serif', '--dsh-content-font-size': '15px'
  })
})

test('components: design.md new-session hover → button hover CSS (v0.3.1)', () => {
  const claude = internal.BUILTIN_DESIGNS.find((d) => d.id === 'claude')
  const css = internal.buildHoverCss(claude)
  assert.ok(css.includes('button[class*="_newSession"]{transition:transform 120ms ease,box-shadow 120ms ease}'), 'base transition')
  assert.ok(css.includes('button[class*="_newSession"]:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgb(20 20 19 / 0.12)}'), 'hover lift + shadow')
  assert.ok(css.includes(':active{transform:translateY(0)}'), 'press returns to the plane')
  assert.ok(css.includes('prefers-reduced-motion'), 'reduced motion turns the lift off')
  assert.equal(internal.buildHoverCss(internal.parseDesignDoc(fixtures.sap)), '', 'other built-ins opt out')
  assert.equal(internal.buildHoverCss(null), '')

  const doc = internal.parseDesignDoc(fixtures.claude, 'claude')
  assert.equal(doc.unused.components['button-new-session'].hover.lift, '1px', 'nested hover map is parsed from design.md')
  assert.equal(doc.unused.components['button-new-session'].hover.duration, '120ms')
})

test('components: hover spec rejects CSS injection and out-of-range values', () => {
  const hostile = {
    unused: { components: { 'button-new-session': { hover: {
      lift: '1px;}body{color:red',
      shadow: '0 1px red;}body{color:red',
      duration: '120ms;}'
    } } } }
  }
  assert.equal(internal.buildHoverCss(hostile), '', 'any unsafe field drops the whole spec')
  const onlyShadow = { unused: { components: { 'button-new-session': { hover: { shadow: '0 2px 8px rgba(0,0,0,.12)' } } } } }
  const css = internal.buildHoverCss(onlyShadow)
  assert.ok(css.includes('box-shadow:0 2px 8px rgba(0,0,0,.12)'), 'shadow alone still applies')
  assert.ok(!css.includes(':active'), 'no lift → no active rule')
})

test('mapper: flip band boundaries clamp both ends (B.1)', () => {
  assert.equal(internal.flipColor('#ffffff', [0.14, 0.20]), 'hsl(0, 0%, 14%)', '1−1=0 clamped up to lo')
  assert.equal(internal.flipColor('#000000', [0.88, 0.96]), 'hsl(0, 0%, 96%)', '1−0=1 clamped down to hi')
  assert.equal(internal.flipColor('#808080', [0.40, 0.60]), 'hsl(0, 0%, 50%)', 'mid value falls inside the band')
  assert.equal(internal.flipColor('not-a-color', [0, 1]), null, 'unparseable → null')
})

test('mapper: unparseable light + empty dark chain → whole token omitted + skipped (B.1)', () => {
  const doc = { id: 't', name: 'T', version: 'v', colors: { ink: 'rebeccapurple' } }
  const { tokens, skipped } = internal.mapDesignToTokens(doc)
  assert.deepEqual(Object.keys(tokens), internal.LITERAL_TOKENS.map((pair) => pair[0]), 'only the reference layer survives a dead palette')
  assert.ok(skipped.includes('--dsw-alias-label-primary'))
  assert.ok(skipped.includes('--dsw-alias-bg-base'))
})

test('mapper: dark keys pass through arbitrary CSS color strings verbatim (B.1 直通例外)', () => {
  const doc = { id: 't', name: 'T', version: 'v', colors: { ink: '#141413', 'on-dark': 'rgba(255,255,255,0.85)' } }
  const { tokens } = internal.mapDesignToTokens(doc)
  assert.deepEqual(tokens['--dsw-alias-label-primary'], { light: '#141413', dark: 'rgba(255,255,255,0.85)' })
})

test('mapper: color primitives (B.1)', () => {
  assert.deepEqual(internal.parseColor('#cc785c'), { r: 204, g: 120, b: 92, a: 1 })
  assert.deepEqual(internal.parseColor('#abc'), { r: 170, g: 187, b: 204, a: 1 })
  assert.equal(internal.parseColor('rgba(0,0,0,0.6)').a, 0.6)
  assert.deepEqual(internal.parseColor('hsl(0, 0%, 90%)'), { r: 230, g: 230, b: 230, a: 1 }, 'hsl() 是 flip 的产物，tint 派生要能吃回去')
  assert.equal(internal.parseColor('red'), null)
  assert.equal(internal.parseColor('#12345'), null)
  assert.equal(internal.luminance(internal.parseColor('#000000')), 0)
  assert.ok(internal.luminance(internal.parseColor('#ffffff')) > 0.99)
  assert.equal(internal.normalizeId('PlayStation'), 'playstation')
})

/* ── PaletteDoc 构建/导入导出（契约 IC-4/IC-3） ── */

test('palette: buildPalette shape for claude mapping (IC-4)', () => {
  const doc = internal.BUILTIN_DESIGNS.find((d) => d.id === 'claude')
  const mapping = internal.mapDesignToTokens(doc)
  const palette = internal.buildPalette(doc, mapping)
  assert.equal(palette.schema, 'design-md-switcher.palette/v1')
  assert.equal(palette.id, 'claude')
  assert.deepEqual(palette.origin, { kind: 'design-md', designName: 'Claude', designVersion: 'alpha' })
  assert.ok(Object.keys(palette.tokens).length <= T.length)
  assert.deepEqual(palette.skipped, [])
  assert.deepEqual(palette.tokens['--dsw-alias-brand-primary'], { light: '#cc785c', dark: '#cc785c' })
})

test('palette: import validation order (IC-4): schema → per-key shape → ≥1 key → vocabulary/size', () => {
  const good = {
    schema: internal.PALETTE_SCHEMA,
    id: 'x',
    name: 'X',
    tokens: { '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' } },
    skipped: []
  }
  assert.equal(internal.validatePalette(good).ok, true)
  assert.equal(internal.validatePalette({ ...good, schema: 'other/v1' }).ok, false)
  assert.ok(/schema/.test(internal.validatePalette({ ...good, schema: 'other/v1' }).error))
  assert.ok(/at least 1/.test(internal.validatePalette({ ...good, tokens: {} }).error))
  assert.ok(/unknown token/.test(internal.validatePalette({ ...good, tokens: { '--dsw-alias-not-real': { light: '#fff', dark: '#000' } } }).error))
  assert.ok(/pair/.test(internal.validatePalette({ ...good, tokens: { '--dsw-alias-bg-base': '#ffffff' } }).error))
  assert.ok(/strings/.test(internal.validatePalette({ ...good, tokens: { '--dsw-alias-bg-base': { light: 1, dark: '#000' } } }).error))
  const tooMany = {}
  for (let i = 0; i <= T.length; i += 1) tooMany['k' + i] = { light: '#fff', dark: '#000' }
  assert.ok(/exceed/.test(internal.validatePalette({ ...good, tokens: tooMany }).error))
  assert.ok(/skipped/.test(internal.validatePalette({ ...good, skipped: 'nope' }).error))
})

test('palette: 64KB single-design limit (IC-3)', () => {
  assert.equal(internal.checkSize('x'.repeat(65536)), true)
  assert.equal(internal.checkSize('x'.repeat(65537)), false)
  assert.equal(internal.LIMITS.single, 64 * 1024)
})

test('palette: broken customDesigns JSON → broken flag + raw preserved (契约 F)', () => {
  const broken = internal.deserializeCustoms('{not json')
  assert.equal(broken.broken, true)
  assert.equal(broken.raw, '{not json')
  assert.deepEqual(broken.list, [])
  const nonArray = internal.deserializeCustoms('"str"')
  assert.equal(nonArray.broken, true)
  const mixed = internal.deserializeCustoms('[{"id":"bad"},{"id":"good","tokens":{"--dsw-alias-bg-base":{"light":"#fff","dark":"#000"}}}]')
  assert.equal(mixed.list.length, 1)
  assert.equal(mixed.broken, true)
  assert.equal(internal.deserializeCustoms('[]').broken, false)
})

test('palette: uniqueId suffixing keeps imported ids unique (IC-4 rename)', () => {
  const taken = { claude: true, sap: true, playstation: true }
  assert.equal(internal.uniqueId('Claude', taken), 'claude-2')
  assert.equal(internal.uniqueId('Brand New', taken), 'brand-new')
})

test('settings row: delete removes an imported design, builtins are refused (v0.3.0)', () => {
  const palettes = [
    { id: 'x', name: 'X', tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } }, skipped: [] },
    { id: 'y', name: 'Y', tokens: { '--dsw-alias-label-primary': { light: '#111', dark: '#eee' } }, skipped: [] }
  ]
  const writes = []
  const scope = {
    getSnapshot: () => ({ value: { activeDesign: 'x', customDesigns: JSON.stringify(palettes) }, status: 'ready', writable: true }),
    subscribe: () => () => {},
    set: (key, value) => { writes.push([key, value]) }
  }
  const ctx = { theme: { overrideTokens: () => () => {} } }
  const api = internal.makeApi(ctx, scope)

  assert.equal(api.removeCustom('claude').ok, false, 'builtin 不可删除')
  assert.equal(api.removeCustom('missing').ok, false, '不存在的 id 不写入')
  assert.equal(writes.length, 0)

  assert.equal(api.removeCustom('x').ok, true)
  assert.deepEqual(writes.map((w) => w[0]), ['activeDesign', 'customDesigns'], '先清 activeDesign 再移除，避免悬空')
  assert.equal(writes[0][1], '')
  assert.deepEqual(JSON.parse(writes[1][1]).map((p) => p.id), ['y'])
})

test('settings row: delete is refused when the stored JSON is corrupted', () => {
  const scope = {
    getSnapshot: () => ({ value: { activeDesign: '', customDesigns: '{not json' }, status: 'ready', writable: true }),
    subscribe: () => () => {},
    set: () => { throw new Error('must not write') }
  }
  const api = internal.makeApi({ theme: { overrideTokens: () => () => {} } }, scope)
  const result = api.removeCustom('x')
  assert.equal(result.ok, false)
  assert.equal(result.errorKey, 'deleteUnavailable')
})

/* ── 内置一致性：BUILTIN_DESIGNS ≡ parse(fixtures)（单一真相源防漂移） ── */

test('builtins: 17 designs, unique ids, every builtin has a fixture (v0.8.0)', () => {
  assert.equal(internal.BUILTIN_DESIGNS.length, 17)
  const ids = internal.BUILTIN_DESIGNS.map((d) => d.id)
  assert.equal(new Set(ids).size, ids.length, 'ids unique')
  for (const id of ids) assert.ok(builtinFixtures[id], 'fixture for ' + id)
})

for (const [stem, text] of Object.entries(builtinFixtures)) {
  test(`builtin consistency: ${stem} — BUILTIN_DESIGNS ≡ parse(tests/fixtures/builtin/${stem}.md)`, () => {
    const parsed = internal.parseDesignDoc(text, stem)
    const builtin = internal.BUILTIN_DESIGNS.find((d) => d.id === stem)
    assert.ok(builtin, `builtin ${stem} exists`)
    assert.equal(builtin.id, parsed.id)
    assert.equal(builtin.name, parsed.name)
    assert.equal(builtin.version, parsed.version)
    assert.deepEqual(builtin.colors, parsed.colors)
    assert.deepEqual(internal.buildComponentOverrides(builtin), internal.buildComponentOverrides(parsed), '组件面派生结果与 fixture 一致')
    assert.deepEqual(builtin.darkColors || {}, parsed.darkColors || {}, 'v0.5.0 暗色表与 fixture 一致')
    assert.equal(internal.buildHoverCss(builtin), internal.buildHoverCss(parsed), 'hover 派生结果与 fixture 一致（v0.3.1）')
  })
}

/* ── 宿主半侧与 manifest 结构（契约 IC-2/IC-3/E.2） ── */

test('host: lib/index.js exports real-Schema Config (vendored) + empty apply', () => {
  assert.ok(mod.Config, 'Config exported')
  assert.equal(typeof mod.apply, 'function')
  // vendored schemastery 下必为真 Schema（Standard Schema 接口，KB config.md:48）。
  const std = mod.Config['~standard']
  assert.ok(std && typeof std.validate === 'function', 'Config implements ~standard')
  const result = std.validate({})
  assert.ok(result && !result.issues, 'validate({}) passes with defaults')
  const dict = mod.Config.dict || {}
  assert.ok(dict.activeDesign && dict.activeDesign.meta?.volatile === true, 'activeDesign marked volatile')
  assert.equal(dict.activeDesign?.meta?.default, '')
  assert.ok(dict.customDesigns && dict.customDesigns.meta?.volatile === true, 'customDesigns marked volatile')
  assert.equal(dict.customDesigns?.meta?.default, '[]')
  // volatile 字段解析为 .get() 引用（schemastery 语义）；客户端经 configForms
  // 拿到的是解包裸值（ui-theme 先例 asar:L698340 直接当字符串用）。
  const ref = result.value.activeDesign
  assert.ok(ref && typeof ref.get === 'function', 'volatile field resolves to a .get() reference')
  assert.equal(ref.get(), '', 'default reference unwraps to \'\'')
})

test('manifest: package.json matches IC-2 verbatim', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(pkg.name, 'design-md-switcher')
  assert.equal(pkg.version, '0.8.9')
  assert.equal(pkg.type, 'module')
  assert.equal(pkg.main, 'lib/index.js')
  assert.equal(pkg.exports['.'], './lib/index.js')
  assert.equal(pkg.exports['./client'], './lib/client.js')
  assert.deepEqual(pkg.files, ['lib', 'cordis.patch.yml', 'README.md', 'CHANGELOG.md'])
  assert.equal(pkg.repository.directory, undefined, '包根即仓库根：github spec 下不再有子目录偏移')
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(pkg.dsh.client.platform, 'web')
  assert.equal(pkg.dsh.client.immediately, true)
  assert.equal(pkg.engines.dsh, '>=0.2.0-rc.2 <0.3.0')
  assert.equal(pkg.peerDependencies['@deepseek-ai/dsh'], '>=0.2.0-rc.2 <0.3.0')
  assert.equal(pkg.dependencies, undefined, 'zero runtime deps: schemastery is vendored under lib/vendor')
})

test('manifest: cordis.patch.yml inserts one bare-name row (IC-2 + KB §5)', async () => {
  const yml = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
  assert.ok(yml.includes('- insert:'))
  assert.ok(yml.includes('id: design-md-switcher'))
  assert.ok(yml.includes('name: design-md-switcher'), 'name must be the bare package name')
  assert.ok(!/name:\s*['"]@/.test(yml), 'name must not be scoped')
})

test('host source: IC-1 boundaries — no fs access, vendored schema, volatile defaults in place', async () => {
  const src = await readFile(new URL('../lib/index.js', import.meta.url), 'utf8')
  assert.ok(src.includes('.volatile()'), 'volatile fields carry the settings projection (IC-3)')
  assert.ok(src.includes("stringField('')") && src.includes("stringField('[]')"), 'field defaults: activeDesign=\'\', customDesigns=\'[]\' (IC-3)')
  assert.ok(src.includes('.default('), 'defaults chain on the string fields')
  assert.ok(src.includes("import('./vendor/node_modules/@deepseek-ai/schemastery/lib/index.mjs')"), 'schemastery imported from vendored relative path')
  assert.ok(!/import\('@deepseek-ai\/schemastery'\)/.test(src), 'no bare schemastery specifier (junction/ESM 解析在本机不可靠)')
  assert.ok(!/node:fs|readFileSync|require\(/.test(src), 'host half reads no filesystem (IC-1)')
})

test('client source: lazy-CJS factory shape + slot row + forbidden-API gates', async () => {
  const src = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.ok(src.includes('window.__ModuleLoader__.load'), 'registers via window.__ModuleLoader__.load (asar:292647)')
  assert.ok(src.includes("id: SOURCE"), 'factory id = bare package name')
  assert.ok(src.includes("'settings.general.item'") && src.includes('order: 12'), 'settings row slot (E.1)')
  // v0.8.4：选中态用品牌色框（不依赖可能与卡片同色的 border-l1/bg-layer-1）；
  // 列表默认折叠到前 6 个；行标题改为「UI设计方案选择」。
  assert.ok(src.includes('.dmds-item[data-active="true"]{border-color:transparent;background:color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent)'), 'selected item frame uses brand color')
  assert.ok(src.includes('view.items.slice(0, 6)') && src.includes('t(\'expandMore\')'), 'design list collapses to the first 6 entries')
  assert.ok(src.includes("title: 'UI设计方案选择'"), 'row title is UI设计方案选择')
  assert.ok(src.includes("overrideTokens(SOURCE"), 'applies through ctx.theme.overrideTokens (E.2)')
  assert.ok(!/^import\s/m.test(src) && !/^export\s/m.test(src), 'classic-script safe: no ESM syntax')
  assert.ok(!src.includes('setTheme(') && !src.includes('setFontSize('), 'B.4: never touches setTheme/setFontSize')
  assert.ok(!src.includes('localStorage'), 'E.2: persistence through configForms only')
  // v0.1.2 闸门：CSS 走官方 bundle 范式（data-plugin-css 手动 <style>），
  // styles builtin 是动态包专属、bundle 作用域不存在。
  assert.ok(src.includes('data-plugin-css'), 'row CSS uses the official data-plugin-css pattern')
  assert.ok(!src.includes('JSON.stringify(CSS_TAG_ID)'), 'attribute selector must not wrap the id in JSON.stringify (v0.1.3 boot regression)')
  assert.ok(!src.includes('styles.insert'), 'no styles builtin usage (dynamic-package only)')
  // v0.1.2 闸门：host-backed 判定用官方快照语义（status==='ready' && writable），
  // ConfigFormController 快照没有 mode 字段（误查恒报非回环）。
  assert.ok(src.includes("snap.status === 'ready'") && src.includes('snap.writable !== false'), 'hostBacked uses official snapshot semantics')
  assert.ok(!src.includes("snap.mode"), 'no nonexistent snapshot.mode field')
})

test('client runtime: inject list and token inventory (IC-1/B.3)', () => {
  assert.deepEqual(api.inject, ['theme', 'slots', 'locale', 'configForms'])
  assert.equal(typeof api.apply, 'function')
  assert.equal(T.length, 25 + internal.LITERAL_TOKENS.length)
  assert.equal(T[0], '--dsw-alias-bg-base')
  assert.equal(T[13], '--dsw-specific-sidebar-fill')
  assert.deepEqual(T.slice(14, 25), [
    '--dsw-alias-label-tertiary', '--dsw-alias-interactive-bg-hover',
    '--dsw-alias-button-primary-hover', '--dsw-alias-button-contrast-fill',
    '--dsw-alias-button-elevated-fill', '--dsw-alias-button-floating-hover',
    '--dsw-alias-menu-icon', '--dsw-menu-surface-fill', '--dsw-focus-ring-color',
    '--dsw-alias-switch-thumb', '--dsw-alias-tooltip-bg'
  ])
  assert.deepEqual(T.slice(25), internal.LITERAL_TOKENS.map((pair) => pair[0]), 'v0.7.0 reference layer appended in order')
  assert.ok(internal.LITERAL_TOKENS.every((pair) => pair[1].includes('var(--dsw-') || pair[1].includes('color-mix(')), 'every reference targets a dsw variable or color-mix')
  assert.deepEqual(internal.SUMMARY_TOKENS, [
    '--dsw-alias-bg-base', '--dsw-alias-brand-primary', '--dsw-alias-label-primary',
    '--dsw-alias-state-success-primary', '--dsw-alias-state-warn-primary'
  ])
})

test('client runtime: data-plugin-css dedupe selector is a valid CSS attribute selector (v0.1.3 boot regression)', () => {
  // 旧实现拼的是 'style[data-plugin-css="' + JSON.stringify(id) + '"]'，JSON 自带
  // 引号 → 选择器变成 `""id""`，querySelector 在 import 期抛 SyntaxError，
  // 整个 web boot 失败（真机日志已复现）。这里锁住合法形态与转义行为。
  const selector = internal.cssTagIdSelector('design-md-switcher/row.css')
  assert.equal(selector, 'style[data-plugin-css="design-md-switcher/row.css"]')
  assert.ok(!selector.includes('""'), 'no JSON.stringify quote collision')
  assert.equal(internal.cssTagIdSelector('a"b'), 'style[data-plugin-css="a\\"b"]', 'embedded quote is escaped')
  assert.equal(internal.cssTagIdSelector('a\\b'), 'style[data-plugin-css="a\\\\b"]', 'backslash is escaped')
})

test('client apply: active design → one override layer covering every token (B.3)', () => {
  const calls = []
  const scope = {
    getSnapshot: () => ({ value: { activeDesign: 'claude', customDesigns: '[]' }, status: 'ready', writable: true }),
    subscribe: () => () => {}
  }
  const ctx = {
    effect: (fn) => { const dispose = fn(); return () => { if (dispose) dispose() } },
    locale: { register: () => () => {}, bind: () => (key) => key },
    slots: { inject: () => {}, register: () => () => {} },
    configForms: { get: () => scope },
    theme: { overrideTokens: (source, tokens) => { calls.push({ source, tokens }); return () => {} } }
  }
  api.apply(ctx)
  assert.equal(calls.length, 1, 'exactly one layer per apply')
  assert.equal(calls[0].source, 'design-md-switcher')
  const tokens = calls[0].tokens
  assert.deepEqual(Object.keys(tokens).sort(), [...T].sort(), 'every token reaches overrideTokens')
  for (const name of T) {
    assert.equal(typeof tokens[name].light, 'string', name + '.light')
    assert.equal(typeof tokens[name].dark, 'string', name + '.dark')
  }
  assert.equal(tokens['--dsw-alias-button-primary-hover'].light, '#a9583e', 'button hover follows the design')
})

test('client apply: component layer written to its own <style>, cleared on restore (v0.3.0)', () => {
  const created = []
  globalThis.document = {
    createElement: () => ({ dataset: {}, textContent: '' }),
    head: { appendChild: (node) => created.push(node) }
  }
  try {
    const scope = {
      getSnapshot: () => ({ value: { activeDesign: 'claude', customDesigns: '[]' }, status: 'ready', writable: true }),
      subscribe: () => () => {}
    }
    const ctx = {
      effect: (fn) => { const dispose = fn(); return () => { if (dispose) dispose() } },
      locale: { register: () => () => {}, bind: () => (key) => key },
      slots: { inject: () => {}, register: () => () => {} },
      configForms: { get: () => scope },
      theme: { overrideTokens: () => () => {} }
    }
    api.apply(ctx)
    const tag = created.find((node) => node.dataset.pluginCss === 'design-md-switcher/component.css')
    assert.ok(tag, 'component <style> is created')
    assert.ok(tag.textContent.includes('--dsw-radius-md:8px'), 'radius follows design.md')
    assert.ok(tag.textContent.includes('--dsh-content-font-size:16px !important'), 'content size wins over the presenter inline value')
    assert.ok(tag.textContent.includes('--dsw-font-family:StyreneB, Inter, sans-serif'))
    assert.ok(tag.textContent.includes('[data-windows-titlebar] [class*="_centerCol"]'), 'Windows titlebar divider rule rides the component layer')
  } finally {
    delete globalThis.document
  }
})

/* ── runner ── */

let passed = 0
let failed = 0
for (const { name, fn } of tests) {
  try {
    await fn()
    passed += 1
    console.log('ok   ' + name)
  } catch (err) {
    failed += 1
    console.log('FAIL ' + name)
    console.log('     ' + String(err && err.stack ? err.stack.split('\n').slice(0, 4).join('\n     ') : err))
  }
}
console.log(`\n${passed} passed, ${failed} failed, ${tests.length} total`)
process.exit(failed > 0 ? 1 : 0)
