# dsh-ui-change — DSH 设计规范切换插件

在 DeepSeek Harness（DSH）的设置里切换 `design.md` 设计规范，并把配色、字体、圆角与交互实时套用到界面；内置 17 套设计规范，也支持导入自己的设计 Markdown。

> 按照DSH设计规范，在通用-通用设置-UI设计方案选择里内置了17套配色方案可供选择；也可以上传自定义配色MarkDown文件。

## 特性

- **17 套内置设计**：Claude、Airbnb、Apple、BMW、Cursor、Ferrari、HP、IBM、Meta、NVidia、
  Oracle、PlayStation、SAP、Spotify、Tesla、Webflow、Zapier。每套都由原始 design.md 整理为
  DSH 消费子集，浅/深两套配色（能拿到原稿暗色表的用原稿，拿不到的按候选链/亮度翻转推导）。
- **106 个 `--dsw-*` Token**：25 个设计基座（颜色、按钮面、菜单/焦点/tooltip/开关）
  + 81 个别名引用（`var()` / `color-mix()`，随基座自动跟随）。
- **组件面**：圆角（`--dsw-radius-xs..xl/panel`）、正文字体与字号（10–22px）、展示字体族，
  以及侧栏「新会话」按钮的 hover 位移/阴影/过渡（尊重 `prefers-reduced-motion`）。
- **自定义**：浏览器文件选择器导入 `design.md`；导入/导出 PaletteDoc JSON（可分享配色）。
- **实时与持久**：经 `ctx.theme.overrideTokens` 单层覆盖，选中即生效；选择存于 DSH 配置，
  重启/刷新自动恢复。

## 安装

### 前置条件

- DSH（DeepSeek Harness）**≥ 0.2.0-rc.2**，桌面版或 Web 版均可；
- 插件以「组合包（bundle）」形式安装到当前 profile（默认 `desktop`）。

### 方式 A：从 GitHub 安装（推荐）

```bash
dsh plugin --profile desktop add github:bluish-yocean/dsh-ui-change
```

插件包根就是仓库根（单一 `package.json`），github spec 直接可装。
也可用图形界面：**设置 → 插件市场 → 安装插件 → 输入 github spec**。

安装后**重启 DSH**（desktop 需重启以加载补丁；web 模板改动能热生效）。

### 方式 B：本地目录 link（开发路径）

```bash
git clone https://github.com/bluish-yocean/dsh-ui-change.git
dsh plugin --profile desktop add <仓库路径>
```

本地 link 适合改 `lib/client.js` 时就地验证：改动后刷新页面即可（生产环境）。

### 零依赖与 vendor

本包**零外部运行时依赖**：schemastery 3.18.4（MIT，含 cosmokit、
@standard-schema/spec）已 vendor 进 `lib/vendor/`，安装不做任何依赖下载，
也没有 postinstall / prepare 钩子。`lib/vendor/node_modules/` 必须留在 git 里——
`.gitignore` 的 `/node_modules/` 只锚定仓库根，不会吞掉它。

### 验证安装

打开 **设置 → 通用 → 通用设置 → UI设计方案选择**，应看到 17 套内置设计与「自定义」导入入口；
选中任意一套，界面配色即时变化。

### 排障

- **设置页没有这一行**：先查 profile 的 `dsh.profile.bundles` 是否含
  `design-md-switcher`。bundle 自带的 `insert` 补丁只对 bundles 成员生效；只在
  `cordis.patch.yml` 里留 `- id: design-md-switcher` 配置覆盖不会插入条目。
  缺了就在 Plugin Manager 重新启用（或对 profile 执行 `set_bundle`），再重启。
- **`Cannot read properties of undefined (reading 'validate')`**：说明 `lib/vendor`
  没到位，Host 半侧 Config 降级成纯形状对象，宿主拒建设置命名空间。确认
  `lib/vendor/node_modules/@deepseek-ai/schemastery/lib/index.mjs` 存在；若来自
  git，重新 clone 或 `git checkout -- lib/vendor`。


## 使用

- **切换**：在 UI设计方案选择列表中点选即应用（默认只显示前 6 套，点「展开其余 11 个方案」查看全部）；选「恢复默认」还原宿主主题。
- **导入设计**：把 `design.md`（YAML frontmatter：`colors`、可选 `colors.dark`、`typography`、
  `rounded`、`components.button-new-session.hover`）经文件选择器导入，只在当前会话生效，
  保存后进入自定义列表。
- **分享/备份配色**：导出一套设计为 PaletteDoc JSON；导入 JSON 即恢复（只含颜色 Token）。
- **删除自定义**：在列表里删除；内置设计不可删。

## 内置设计

| id | 名称 | | id | 名称 |
|---|---|---|---|---|
| `claude` | Claude | | `nvidia` | NVidia |
| `airbnb` | Airbnb | | `oracle` | Oracle |
| `apple` | Apple | | `playstation` | PlayStation |
| `bmw` | BMW | | `sap` | SAP |
| `cursor` | Cursor | | `spotify` | Spotify |
| `ferrari` | Ferrari | | `tesla` | Tesla |
| `hp` | HP | | `webflow` | Webflow |
| `ibm` | IBM | | `zapier` | Zapier |
| `meta` | Meta | | | |

## 项目结构

```
package.json                 插件包唯一的版本真源与打包清单（包根 = 仓库根）
lib/index.js                 Host 半侧（空 apply + volatile Config）
lib/client.js                客户端全部逻辑：解析 → Token 映射 → 组件面 → 设置行
lib/vendor/node_modules/     自包含 vendor（schemastery / cosmokit / @standard-schema/spec）
tests/run.js                 零依赖测试（76 项）
tests/fixtures/builtin/      17 套内置设计与 design/*/design.md 的字节级镜像
tests/fixtures/{sap,playstation}.md  原始营销稿（解析健壮性样例）
cordis.patch.yml             组合包插入补丁
CHANGELOG.md                 版本变更记录
design/                      17 份整理后的 DSH 消费子集 design.md
docs/design-contract.md      解析/映射/应用/兼容性的契约（A–F）
docs/implementation-notes.md 实现取舍与证据
research/                    DSH 客户端/主题 API 调研笔记
```

## 开发

```bash
node tests/run.js     # 76 项测试，零依赖，在仓库根运行
```

- 改 `design/*/design.md` 或映射表后，请同步 `tests/fixtures/builtin/<id>.md`（一致性测试会逐项比对）。
- Token 词表与推导规则以 [docs/design-contract.md](docs/design-contract.md) 为准；
  新增 Token 需同时补契约、测试与内置常量。
- 本地目录 link 安装后，改动 `lib/client.js` 刷新页面即可（生产环境）。

## 已知边界

- 组件几何（按钮高度/图标线宽/Tag 尺寸）、阴影层级、`--dsw-static-*` 静态色阶与语法高亮
  都不在 Token 覆盖范围，宿主写死。
- 导入的 PaletteDoc 只携带颜色（组件面/ hover 只在内置设计中生效）。
- 内置设计的浅色/深色以 `design.md` 原稿为准；原稿只有暗色的品牌（如 Spotify）会派生亮色方案。

## 关于DSH版本兼容

- DSH#v0.1.7上并没有做过兼容性测试，不能保证可以完全正常使用。
- 想在v0.1.7上使用，可以在 profile 目录的 compatibility.json 里加精确版本豁免，例如：
```
json
{ "design-md-switcher@0.8.2": ["0.1.7-rc.2"] }
```

## License

插件代码 MIT。`design/` 与 `tests/fixtures/` 中的设计规范文本源自
公开的 design-system 分析稿，仅用于样式研究；相关商标与设计归属其各自所有者。
