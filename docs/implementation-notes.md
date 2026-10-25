# design-md-switcher 实现备注（v0.1.1，2026-10-17）

实现依据：`docs/design-contract.md`（权威规格）+ 父会话实证事实。本文记录关键
取舍、factory 格式的核证锚点、契约内部矛盾的裁定与测试未覆盖项。

## 0. v0.1.1 修复记录：宿主激活失败与 vendor 收敛（父会话验收时发现并修复）

**现象**：首次 Plugin Manager 安装后 entry 激活失败——
`TypeError: Cannot read properties of undefined (reading 'validate')`，栈在
cordis `resolveConfig`（asar:L275635-275641：宿主调用
`runtime.Config["~standard"].validate(config)`，无 `~standard` 的导出即崩）。

**根因链**（逐环实证）：
1. lib/index.js 用 `await import('@deepseek-ai/schemastery')`；插件经 pnpm
   `link:` 挂进 profile，Node ESM 从**真实路径**（工作区）解析 bare specifier
   → `ERR_MODULE_NOT_FOUND`（profile node_modules 不在解析链上）。
2. 落到降级形状对象（普通对象）→ KB config.md:48 明文："不要导出普通对象作为
   Config，它不满足 Cordis 要求的 Standard Schema 接口" → 宿主激活即崩。

**修复**：schemastery 3.18.4 + cosmokit 1.8.5 + @standard-schema/spec 1.1.0
（三包均 MIT，<1MB）**vendor 进 `lib/vendor/node_modules/`**，lib/index.js 改
相对路径静态导入，插件零外部运行时依赖。不走的弯路（均已实测留档）：
- 给插件声明 dependencies + pnpm install：pnpm 隔离式布局下 schemastery 是
  junction，本机 Node 的 ESM 解析沿 junction 原路径走、不落 realpath，
  `schemastery → cosmokit` 失联（CJS require.resolve 却正常）。
- `node-linker=hoisted`：pnpm 强制 auto-install-peers，把声明性的 peer
  `@deepseek-ai/dsh` 整树（500+ 包）拉下来。
**结论**：第三方本机插件要自包含——client 半本来就单文件，host 半 vendor 收敛。

**volatile 字段语义（实证后锁进测试）**：volatile 字段在宿主侧
`~standard.validate` 的产物是 `.get()` 引用（`createVolatile`，schemastery
README:393）；客户端经 configForms scope 拿到的是**解包裸值**——ui-theme 自己
直接把 `section.preference` 当字符串比较（asar:L698340），session-log 行直接
`upload.value?.enabled === true`（asar:L485449）。官方链式写法是
`.default(...).volatile()`（asar 81 处先例）；本包 `.volatile().default(...)`
终态 meta 相同（`{volatile:true, default:...}`），已由测试锁死。

## 1. 客户端 bundle 的 factory 格式（核证）

- 格式：`window.__ModuleLoader__.load({ id: <裸包名>, factory(require) { … return module.exports } })`。
  - 官方装饰模板原文：asar:292647-292668（`factory(require)` 方法简写，`return { inject, apply }`）。
  - 内置产物同形：ui-theme client 产物 asar:696910-696914（`id` + `factory: (require) =>`，体内
    `var module = { exports: {} }`、`Object.defineProperty(exports, Symbol.toStringTag, …)`，尾部
    `exports.apply/exports.inject` 后 `return module.exports`，asar:698537-698541）。本包 `lib/client.js`
    采用与内置产物一致的 CJS module 形状。
  - 登记语义：执行 bundle 只登记 factory，模块体副作用（含 CSS 注入）在物化时运行
    （asar:377075）；未按 `__ModuleLoader__.load` 登记会报错（asar:377920/378034）。
  - `dsh.client` 合法字段 platform(string)/inject/external(string[])/immediately(boolean)：
    asar:377356-377370；manifest 模板（bundle.patch + client）asar:292680-292688。
- React：factory 体内 `require('react')`（浏览器模块表 PLATFORM_MODULES 提供，
  asar:1071588 附近可见 'react' 在 seed 表）。本实现把 require 懒化到组件首次渲染，
  使 Node 自测分支物化 factory 时不触网（stub require 永不被调用）。
- CSS：`styles.insert(ROW_CSS)` 置于 factory 闭包内（模块体副作用教义，asar:377075），
  仅引用 `--dsw-alias-*`（含 `--dsw-alias-interactive-bg-hover`，ui-theme 自身样式在用，
  asar:696935）。色板小方块的填充色是**设计数据**而非主题样式，按 asar:292610
  "literal colors are for artwork only" 的口径用字面色。

## 2. 契约内部矛盾的裁定（唯一一处）

**Token 14（`--dsw-specific-sidebar-fill`）的 dark 推导**：契约 B.3 表（docs/design-contract.md:100）
写 `pick(surface-dark-soft, surface-dark, canvas-dark)；否则 flip(light, 0.07, 0.13)`，但同节
抽验（:102）写「Sap sidebar … dark=#000000(**ink 兜底**) ✓」。Sap 无任何 dark surface 键，
两条规则给出不同结果（flip(#f5f6f7,0.07,0.13) 是近黑灰蓝 hsl(210,11%,7%)，不是 #000000）。
裁定：按抽验的「ink 兜底」实现——dark 链 = `surface-dark-soft, surface-dark, canvas-dark, ink`，
链全空才 flip。理由：抽验是该表自己的worked example，且父会话的测试清单明确要求
断言 `Sap sidebar=#f5f6f7/#000000`；对 Claude（surface-dark-soft 命中）与 PlayStation
（canvas-dark 命中）两条规则结果一致，此裁定只影响"无暗色面"的设计（Sap 一类）。
这是对矛盾点的最小收敛，未改任何其他表项；如父会话判定应严格按表执行，把
TOKEN_TABLE 第 14 行 dark 数组末位的 `'ink'` 删去即可（tests/run.js 中对应断言需同步）。

## 3. 其他关键取舍

- **light/dark 候选语义**：light 列 = B.3「按序取首个**存在**者」（值原样使用，不要求
  parse 可解析——parseable 的要求只约束推导输入）；dark 列 = 首个存在的字符串直通
  （B.1 直通例外："dark 直接来自文件的 dark 键，可原样使用 rgba() 等任意 CSS 颜色串"）。
  parse 不可解析的键在**解析期**已按 A.3"值不是字符串颜色→该键按缺失处理+诊断"过滤
  （`looksLikeColor`：parse 可解析 / hsl()/color()/currentColor / 3-32 位字母的命名色）。
  因此映射期的"不可推导→整键省略"只发生在 flip 兜底路径（light 是命名色等 parse
  不可解析的值）。17 份样例语料下两种读法结果完全一致，测试逐条锁定。
- **unknownKeys 词表**：colors 键的"已知集合"= B.2 候选键 ∪ B.3 light 链用键
  （37 键，client.js 内 KNOWN_COLOR_KEYS）。词表外的键（如 Sap `navy`、
  PlayStation `marathon-yellow`）按 A.3 记入诊断、不参与映射、但仍保留在
  `DesignDoc.colors` 里（导出 JSON 时不携带，只有 106 Token 产物）。Claude 样例
  v0.3.2 起收敛为宿主消费子集，解析零诊断。
- **双配色（v0.5.0）**：`colors.dark` 解析为 `DesignDoc.darkColors`（同词表、同一套
  key 校验）。暗色取值优先级：① dark 表的暗色系候选键（surface-dark/on-dark…）
  ② dark 表里与 light 链同名的语义键 ③ 未提供 dark 表时走旧单表 dark 链
  ④ 场景规则/flip。因此带 dark 表的文件不再产生「算出来的」边框/状态色；
  未带 dark 表的文件（Sap/PlayStation）行为完全不变。
- **UI 面 Token（v0.6.0）**：菜单图标/材质、焦点环、tooltip 键帽、开关滑块直接进
  TOKEN_TABLE；全是纯颜色（菜单材质用 92%/90% 叠色，与 6%/8% 的 hover 同一 tint
  路径），不涉及组件几何/图标线宽——那些仍是宿主写死，见 README 范围天花板。
- **别名引用层（v0.7.0）**：剩余 81 个有设计语义的别名写成 `var(--基座)` /
  `color-mix(...)`，light/dark 同一表达式，由浏览器解析、随基座两套配色自动跟随
  （与 DSH 自己的别名结构一致）。不覆盖 `--dsw-static-*` 色阶、遮罩/选区/骨架
  等中性常量、遗留别名与几何/阴影/字体变量；引用层永不跳过（Sap/PS 也全量产出）。
- **Token 14 兜底键之外，B.2 的"暗色底"链含 `ink-deep, ink`**：bg-base 的 dark 链
  用全量暗色底链（PlayStation bg-base=canvas-dark、Sap bg-base=ink#000000，均与
  抽验一致）。
- **非回环检测**：`scope.getSnapshot().mode !== 'host'`（ConfigFormController 构造时
  mode=persistence，asar:489288-489296；developer-tools 同款判定 asar:489214），
  未注入 `remote`（契约 C.2：不需要）。
- **导入写序**：先 `set('customDesigns', …)` 再 `set('activeDesign', id)`——adopt 顺序
  保证第二次订阅回调时设计已存在；两次写各自 best-effort（try/catch + promise.catch，
  契约 F：写失败不影响本次会话样式）。v1 非原子（两次 mutate），竞态窗口内
  可能出现一次按旧值 reapply，最终态正确。
- **损坏 JSON 的导入**：customDesigns JSON 解析失败时，新导入以 `[新条目]` **替换**
  损坏列表（旧行为会永久锁死导入功能）；替换前行内提供「导出自定义设计原文」
  抢救（契约 F "保留原 JSON 供导出抢救"）。
- **Host 半侧 schemastery**：`await import('@deepseek-ai/schemastery')` + try/catch
  （本机自测/CI 无此依赖时降级为纯形状对象）；`.volatile()` 特性探测
  （3.18.3 才有，对齐 dsh-experts/lib/settings.js:82-90 的既有实践；本机 profile
  实测 `@deepseek-ai/schemastery` 3.18.4 有该方法，`S.string().volatile().default('')`
  链式可用）。dsh-experts 以同样模式做顶层 await（dsh-experts/lib/index.js:35-41）。
- **测试如何跑生产代码**：client.js 在非浏览器分支以 stub require 物化一次 factory，
  经 `exports.__internal` 暴露纯逻辑；测试 `import` 该文件后读 globalThis 钩子——
  解析器/映射器/校验测试跑的就是浏览器将执行的同一份代码，内置一致性测试把
  BUILTIN_DESIGNS 与 tests/fixtures/builtin/*.md 的解析产物 deepStrictEqual 对表防漂移。
- **fixtures**（v0.8.0）：`design/*/design.md` 与 `tests/fixtures/builtin/<id>.md`
  保持字节级一致（逐份同步维护；17 份全部是 DSH 消费子集）。
  `tests/fixtures/{sap,playstation}.md` 仍保留**原始营销稿**，专供解析健壮性测试
  （未闭合 frontmatter / 未知键 / rgba / commerce 等），不与内置常量对表。
- 契约 C.1 的 `assets/designs/` 未建：D.1 允许内置设计以"构建期预解析 JSON 常量"
  内嵌（每份 ~1–3KB），本实现取该选项，无 assets 目录；IC-2 files 白名单与实际交付一致。

## 4. 测试

命令：在仓库根 `node tests/run.js`（Node v24.19.0 实跑通过：
38 passed, 0 failed, 38 total）。覆盖：解析器正常/负例/引用/重复键/块标量/未引号
标量；映射器 14 Token 形状、契约 B.3 四个心算抽验、flip 区间两端、整键省略、
直通例外、颜色原语；PaletteDoc 校验顺序/64KB/坏 JSON 容错/uniqueId；内置一致性
×3；package.json/cordis.patch.yml/lib 源码结构断言（含禁止 setTheme/setFontSize、
禁止 ESM 顶层语法的闸门）。

**未覆盖项（如实标注）**：
1. 浏览器/React 设置行未在真实 DOM 验证（Node 无 DOM）；行注册与 props 组合
   （`locale` 选项 → 组合 `t`，asar:478278 owner 传 `{}`、478597-478612 先例）是按
   官方样例写的，需上真机看一次行渲染与点选。
2. `ctx.theme.overrideTokens` 真实校验路径、scope 订阅/adopt 时序、HMR 卸载清理
   未在宿主实跑——安装后首验点：装包重启 → General 行出现 → 点 Sap → 换深浅
   主题 → 重启恢复 Sap → 恢复默认。
3. 非回环页面 `scope.set()` 的确切行为（契约 Open Question 2）未实测，实现以
   try/catch + promise.catch 兜底。
4. volatile 字段 64KB/256KB 上限的宿主侧容忍度（Open Question 3）未实测，实现为
   客户端侧工程自限。
