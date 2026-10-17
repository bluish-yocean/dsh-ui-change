/**
 * design-md-switcher —— Host 半侧（Cordis entry）。
 *
 * 职责（契约 IC-1）：只占一条 Loader 行 + 供设置服务投影命名空间
 * `design-md-switcher`。设置表单只投影 volatile 字段（0.2.0-rc.2：
 * 无 volatile 字段的命名空间会被拒），所以两个字段都标 volatile；
 * volatile-only 变更由 Loader 就地提交（loader/volatile-update），不重挂插件。
 *
 * 本文件不读文件系统、不感知 design.md——解析/映射/应用全在客户端半侧
 * lib/client.js（浏览器经 /plugins 路由加载）。
 *
 * schemastery 解析：**vendor 进插件**（lib/vendor/node_modules/，相对路径静态导入，
 * 零外部依赖——实测 Windows 上 pnpm 隔离式 node_modules 的 junction 在本机 Node 的
 * ESM 解析下不落 realpath，bare specifier 会失联；hoisted 又强制安装 peer 整树，
 * 故以自包含 vendor 收敛）。取不到（文件缺失等异常）时降级为纯形状对象，
 * 结构断言不依赖其运行时——但降级态下宿主会拒建设置命名空间（KB config.md:48：
 * 普通对象不满足 Standard Schema 接口），真宿主一定走 vendor 路径。
 */

let Schema = null
try {
  Schema = (await import('./vendor/node_modules/@deepseek-ai/schemastery/lib/index.mjs')).default
} catch {
  Schema = null
}

/**
 * `.volatile()` 是 schemastery 3.18.3 才引入的方法：按特性探测标注，
 * 旧版本下原样返回（字段不进设置表单投影，但插件仍可加载）。
 */
function withVolatile(field) {
  return field && typeof field.volatile === 'function' ? field.volatile() : field
}

function stringField(fallback) {
  return withVolatile(Schema.string()).default(fallback)
}

export const Config = Schema
  ? Schema.object({
      // 激活设计 id；'' = 无（恢复默认后的持久态）。
      activeDesign: stringField(''),
      // 导入的设计集数组（PaletteDoc v1 的 JSON 文本，见契约 IC-3/IC-4）。
      customDesigns: stringField('[]'),
    })
  : {
      // 降级形状（仅本机自测/CI；真宿主一定解析得到 schemastery）。
      type: 'object',
      fields: {
        activeDesign: { type: 'string', default: '' },
        customDesigns: { type: 'string', default: '[]' },
      },
    }

/** Host 半侧空体：本插件的一切行为都在客户端半侧（契约 E.2/D.1）。 */
export function apply() {}
