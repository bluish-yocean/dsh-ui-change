# design-md-switcher

在 DSH（DeepSeek Harness ≥ 0.2.0-rc.2）设置页切换不同公司的 `design.md` 设计规范，
并把配色实时应用到界面主题；重启后自动恢复；支持 JSON 配色的导入/导出。

> 按照DSH设计规范，在通用-通用设置-设计规范里内置了17套配色方案可供选择；也可以上传自定义配色MarkDown文件。

- 解析对象：YAML frontmatter 形式的 design.md（颜色 + 组件面摘要；spacing/components
  里没有对应变量的字段解析但不应用——见下文「范围天花板」）。v0.5.0 起 `colors`
  下可带 `dark:` 子表：与 `colors` 同词表的独立暗色配色；缺失时暗色仍按旧规则
  （dark 候选键 / 亮度翻转）推导。
- 应用方式：客户端经 `ctx.theme.overrideTokens('design-md-switcher', tokens)` 以
  单层覆盖叠加在活动主题之上，产出 **106 个 `--dsw-*` Token**：25 个设计基座
  （14 基础 + 4 个按钮/交互别名 + 2 个「新会话」按钮面 + 5 个菜单/焦点/tooltip/开关面）
  + 81 个**别名引用层**（`var(--基座)` / `color-mix(...)`，见下文）。light 取
  `colors`；dark 优先取 `colors.dark`（同词表），缺失时回退旧候选链 / HSL 亮度翻转推导。
- 组件面：`rounded` → `--dsw-radius-*`；`typography.body` 字体族 → 全局字体；
  `typography.body.fontSize` → 正文字号（10–22px，激活期间优先于用户字号偏好）；
  由独立 `<style>` 层应用，恢复默认即还原。
- 组件面行为：`components.button-new-session.hover`（`lift` / `shadow` / `duration`）
  → 侧栏「新会话」按钮的上浮 + 阴影 + 过渡；减动效开启时只保留阴影，不位移。
  只在内置设计上有来源（导入的 PaletteDoc 仍只有颜色）。
- 内置 17 份设计规范（v0.8.0）：Claude / Airbnb / Apple / BMW / Cursor / Ferrari / HP /
  IBM / Meta / NVidia / Oracle / PlayStation / SAP / Spotify / Tesla / Webflow / Zapier。
  全部在构建期预解析为常量内嵌，且都已整理成 **DSH 消费子集**：frontmatter-only，
  只保留宿主真正读取的颜色（含可用的 `colors.dark`）/字体/圆角/新会话 hover；
  原始营销稿保留在 `design/` 的备份与测试 fixture 里。
- 持久化：Host 配置系统（命名空间 `design-md-switcher`，volatile 字段），随
  profile 补丁存活，跨重启自动恢复；不使用 localStorage。

## 安装

- 图形界面：**Settings → Plugins（Plugin Manager）** 安装本包目录。
- 命令行：`dsh plugin --profile desktop add <本包目录路径>`。

本包**零外部运行时依赖**：schemastery 3.18.4（MIT，含 cosmokit、
@standard-schema/spec）已 vendor 进 `lib/vendor/`，安装不做任何依赖下载。

安装后**重启 DSH**（desktop 需重启应用补丁；web 模板改动能热生效，见下文差异）。
设置页 **General** 区会出现「设计规范（design.md）」一行（排在 appearance /
font-size 之后）。

> 排障：若重启后没有这一行，先查 profile 的 `dsh.profile.bundles` 是否含
> `design-md-switcher`。bundle 自带的 `insert` 补丁只对 bundles 成员生效；只在
> `cordis.patch.yml` 里留下 `- id: design-md-switcher` 配置覆盖并不会插入条目。
> 缺了就在 Plugin Manager 重新启用（或对 profile 执行 `set_bundle`），再重启。

## 使用

- **切换**：设计列表点选即应用（内置 17 套 + 已导入的自定义设计）。
- **恢复默认**：清空本插件的覆盖层并清空 `activeDesign`；只影响本插件这一层，
  其他插件的 override 层不动。
- **导入 design.md**：点「导入 design.md」选文件；解析失败会行内报错且不应用、
  不写入。
- **导入 JSON**：把本插件导出的配色 JSON 粘进文本框后点「添加粘贴的 JSON」；
  校验顺序为 schema → 逐键形状 → 至少 1 键；单份上限 64 KB、总量 256 KB。
- **导出 JSON**：把当前激活设计的映射产物写入剪贴板；剪贴板不可用时降级为
  行内文本框供手动复制。
- **删除导入设计**：导入条目右侧「删除」需点两次（第二下变「确认删除」）。
  删除激活中的设计会先回退默认主题；内置设计不可删；存储 JSON 损坏时不提供删除。
- **诊断**：解析失败、被跳过的 Token 数（颜色无法推导时该 Token 回退基座）、
  设计集缺失回退、非回环连接提示都在行内展示。

## 设置项（命名空间 `design-md-switcher`）

| 字段 | 默认值 | 说明 |
|---|---|---|
| `activeDesign` | `''` | 激活设计 id；`''` = 无覆盖层 |
| `customDesigns` | `'[]'` | 导入的设计集数组（PaletteDoc v1 的 JSON 文本） |

两个字段都是 volatile：改动由 Loader 就地提交，不重挂插件。设置行的操作会写
这两个字段；写失败（非回环页面）只影响持久化，不影响本次会话的样式。

## 升级

1. 提高包版本（package.json `version`）。
2. Plugin Manager 重新安装（或 `dsh plugin add --force`），desktop 随后**重启**。

## 回退

- 临时：设置行点「恢复默认」——覆盖层立即移除，基座主题无损。
- 彻底：Plugin Manager 停用/卸载本插件；补丁行消失 → 客户端 entry 卸载 →
  effect disposer 移除 override 层。
- 配置残留：`customDesigns` 中的 JSON 即使损坏也会被视同未激活（不发层），
  并提供「导出自定义设计原文」按钮抢救数据。

## desktop 与 web 的差异

加载代码路径相同（desktop 的 Electron 壳加载同一回环 GUI 与 `/plugins` 路由）；
差异只在**更新时机**：web 模板启用 HMR 实时重载，desktop 的补丁改动需重启
（或刷新页面取新 boot graph）。非回环 web 页面不创建 Host-backed scope，
选择仅本页有效（行内会提示）。

## 范围天花板（v0.5）

- **颜色**：106 个 Token。25 个设计基座是 CSS 颜色/半透明叠色（14 基础 + v0.2 的
  4 个按钮/交互别名 + v0.4 的 2 个按钮面 + v0.6 的 5 个菜单/焦点/tooltip/开关面）；
  另 81 个是**别名引用层**（v0.7）：值写成 `var(--基座)` 或 `color-mix(...)`，
  与 DSH 自己的「别名引用别名」同构，自动跟随基座的两套配色。
- **别名引用层不覆盖**：`--dsw-static-*` 静态色阶、遮罩/选区/骨架等中性常量
  （`bg-mask-*`、`bg-document-selection`、`bg-skeleton`、`border-inverted*`）、
  遗留别名 `brand-primary-new-color*`，以及几何/阴影/字体变量。
- **双配色（v0.5）**：`colors.dark` 与 `colors` 同词表，目前只有 Claude 提供；
  Sap/PlayStation 没有暗色表，暗色仍按候选链/亮度翻转推导。
- **组件面（已应用）**：圆角（`--dsw-radius-*`）、正文/展示字体族
  （`--dsw-font-family` / `--dsw-font-family-brand`）、正文字号
  （`--dsh-content-font-size`，10–22px）。字号在激活设计期间会覆盖用户字号偏好，
  恢复默认或删除该设计后归还。
- **仍未应用**：按钮/输入的高度、padding、组件内字号——宿主是各组件 CSS 里的
  字面量，没有可覆盖变量；要改只能按组件类名注入，宿主 class 是哈希名，不可靠。
- **已应用但依赖哈希选择器**：「新会话」按钮 hover 用
  `button[class*="_newSession"]`（宿主 CSS Module 本地名 `newSession` 保留、
  哈希前缀会变）。宿主升级改了本地名时这条规则静默失效（不报错），换版本时
  以侧栏按钮 CSS 复核一次。
- `setFontSize` 属用户偏好写入，本插件永不调用。
- 磁盘目录自动扫描不做：静态组合包没有面向自己客户端半侧的任意路径读取通道；
  设计文件经浏览器文件选择器导入（desktop 与 web 同样可用）。
