/**
 * 可安装性冒烟（0.9.0 收口新增）：只回答一个问题——「别人 clone 下来装得上吗」。
 *
 * 为什么单独存在：0.8.9 之前 github spec 装不上（package.json 在子目录），
 * 且 lib/vendor 被 .gitignore 吞掉（clone 后缺 schemastery）。当时 73 项测试
 * 全绿，因为断言对象全是我磁盘上的文件；零依赖 + 自带 vendor 的设计让本地
 * 根本没有「从别处取包」这一步，于是「包在哪、包里有什么」永远碰不到。
 * 这三条闸门因此不看工作区，只看 git archive HEAD 出来的纯净树。
 *
 * 语义提醒：git archive HEAD 取的是**已提交**状态。改了 vendor 却没 git add
 * 的文件不会进纯净树——这正是想要的：发布物 = 提交物。
 *
 * 子进程一律 stdio:'ignore'（+ 需要读的输出直写文件描述符）：受限环境里
 * 无法打开命名管道，spawn 带 pipe 会 EPERM，而这与本插件无关，只会制造假红。
 */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { closeSync, existsSync, openSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))

const VENDOR_SCHEMA = 'lib/vendor/node_modules/@deepseek-ai/schemastery/lib/index.mjs'
const VENDOR_COSMOKIT = 'lib/vendor/node_modules/@deepseek-ai/cosmokit/lib/index.js'

/** 包内必需项：少任一项，别人的宿主就起不来。 */
const REQUIRED_IN_PACK = [
  'package.json',
  'cordis.patch.yml',
  'lib/index.js',
  'lib/client.js',
  VENDOR_SCHEMA,
  VENDOR_COSMOKIT
]

async function exists(path) {
  try { await stat(path); return true } catch { return false }
}

/**
 * 跑一条外部命令并返回退出码（0=成功）。stdout 可直写文件描述符，避开 pipe。
 * spawn 自身失败（ENOENT 等）照样 reject——环境问题要冒出来，不能被当成「未命中」。
 */
function run(file, args, { cwd = repoRoot, stdoutFd } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, {
      cwd,
      stdio: ['ignore', stdoutFd === undefined ? 'ignore' : stdoutFd, 'ignore']
    })
    child.on('error', reject)
    child.on('close', (code) => resolve(code))
  })
}

function describe(file, args) {
  return file + ' ' + args.join(' ')
}

/**
 * 把 git 跟踪的 HEAD 展开到临时目录。这就是 `dsh plugin add github:...`
 * 拉到的内容，等价于别人机器上的包根。
 */
async function withCleanTree(fn) {
  const root = await mkdtemp(join(tmpdir(), 'dmds-install-'))
  const tree = join(root, 'tree')
  const tarPath = join(root, 'tree.tar')
  try {
    await mkdir(tree)
    const archiveArgs = ['archive', '--format=tar', '-o', tarPath, 'HEAD']
    const archived = await run('git', archiveArgs, { cwd: repoRoot })
    assert.equal(archived, 0, `${describe('git', archiveArgs)} 失败（退出码 ${archived}）`)
    const untarArgs = ['-x', '-f', tarPath, '-C', tree]
    const untarred = await run('tar', untarArgs, { cwd: repoRoot })
    assert.equal(untarred, 0, `${describe('tar', untarArgs)} 失败（退出码 ${untarred}）`)
    return await fn(tree)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

/** 直接跑 node 自带的 npm-cli.js，免掉 Windows 上 .cmd/.ps1 的 shell 依赖；探不到再回退 npm 命令名。 */
function npmInvocation(args) {
  const candidate = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')
  return existsSync(candidate)
    ? { file: process.execPath, args: [candidate, ...args] }
    : { file: 'npm', args }
}

async function packedFileList(cacheDir) {
  // --cache 必须指到可写处：默认 cache 在 %LOCALAPPDATA%\npm-cache，
  // 受限环境下 npm 写 _cacache/tmp 会 EPERM，与本插件无关。
  const invocation = npmInvocation(['pack', '--dry-run', '--json', '--ignore-scripts', '--cache', cacheDir])
  const outPath = join(cacheDir, 'pack.json')
  const fd = openSync(outPath, 'w')
  let code
  try {
    code = await run(invocation.file, invocation.args, { cwd: repoRoot, stdoutFd: fd })
  } finally {
    closeSync(fd)
  }
  assert.equal(code, 0, `${describe(invocation.file, invocation.args)} 失败（退出码 ${code}）`)

  const stdout = (await readFile(outPath, 'utf8')).replace(/^\uFEFF/, '')
  const parsed = JSON.parse(stdout)
  assert.ok(Array.isArray(parsed) && parsed[0] && Array.isArray(parsed[0].files),
    'npm pack --json 的输出形状变了，先修本闸门再信它的结论')
  return { meta: parsed[0], files: parsed[0].files.map((f) => f.path.replace(/\\/g, '/')) }
}

export function installSmokeTests(test) {
  test('install: 纯净树里 Config 是真 Schema，vendor 随仓库分发（github spec 路径）', async () => {
    await withCleanTree(async (tree) => {
      assert.ok(await exists(join(tree, 'package.json')),
        '包根必须等于仓库根：github spec 从仓库根读清单，package.json 放子目录会「取不到包清单」装不上')
      const pkg = JSON.parse(await readFile(join(tree, 'package.json'), 'utf8'))
      assert.equal(pkg.name, 'design-md-switcher')

      for (const rel of [VENDOR_SCHEMA, VENDOR_COSMOKIT]) {
        assert.ok(await exists(join(tree, rel)),
          `纯净树缺 ${rel}——vendor 没入库或被 .gitignore 吞了，别人 clone 后没有这一坨`)
      }

      const mod = await import(pathToFileURL(join(tree, 'lib/index.js')).href)
      const std = mod.Config && mod.Config['~standard']
      assert.ok(std && typeof std.validate === 'function',
        "Config 退化成普通对象 = schemastery 静态导入失败（vendor 缺失）。宿主随后会抛 Cannot read properties of undefined (reading 'validate')，报错里一个字都不提 vendor")
      assert.ok(!std.validate({}).issues, 'validate({}) 在纯净树里也要通过')
    })
  })

  test('install: lib/vendor 不被 .gitignore 吞掉（check-ignore 必须未命中）', async () => {
    // .gitignore 曾经写裸 node_modules/，匹配任意层级，把 lib/vendor/node_modules
    // 一并吞掉；规则收窄成 /node_modules/ 只锚定仓库根。这条专盯那次回归。
    const args = ['check-ignore', '-q', VENDOR_SCHEMA]
    const code = await run('git', args, { cwd: repoRoot })
    assert.equal(code, 1,
      '.gitignore 又把 lib/vendor/node_modules 吞了（退出码 0 = 被忽略）。规则要写 /node_modules/，只锚定仓库根')
  })

  test('install: npm pack 清单含全部运行时必需项（files 白名单不漏）', async () => {
    const cache = await mkdtemp(join(tmpdir(), 'dmds-npm-cache-'))
    try {
      const { meta, files } = await packedFileList(cache)
      assert.equal(meta.name, 'design-md-switcher')

      const devOnly = files.filter((p) => /^(tests|design|docs|research)\//.test(p))
      assert.deepEqual(devOnly, [], '开发物混进包体：files 白名单要守住 lib + 清单 + 文档')

      const missing = REQUIRED_IN_PACK.filter((p) => !files.includes(p))
      assert.deepEqual(missing, [],
        `包内缺 ${missing.join(', ')}——files 白名单漏项，别人装上的插件会缺文件`)
    } finally {
      await rm(cache, { recursive: true, force: true })
    }
  })
}
