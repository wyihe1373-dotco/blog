import COS from 'cos-nodejs-sdk-v5'
import fs from 'fs'
import path from 'path'

// ---- 配置 ----
// 建议设为环境变量，也可以直接填写
const SECRET_ID = process.env.COS_SECRET_ID || ''
const SECRET_KEY = process.env.COS_SECRET_KEY || ''
const BUCKET = process.env.COS_BUCKET || 'wagnyihe-blog-1310265669'
const REGION = process.env.COS_REGION || 'ap-guangzhou'
const OUT_DIR = path.join(process.cwd(), 'out')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map':  'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain; charset=utf-8',
  '.xml':  'application/xml',
}

if (!SECRET_ID || !SECRET_KEY) {
  console.error('请设置环境变量 COS_SECRET_ID 和 COS_SECRET_KEY')
  process.exit(1)
}

const cos = new COS({ SecretId: SECRET_ID, SecretKey: SECRET_KEY })

/** 递归收集 out/ 目录下所有文件 */
function collectFiles(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap(e => {
    const full = path.join(dir, e.name)
    return e.isDirectory() ? collectFiles(full, base) : [full]
  })
}

/** 上传单个文件 */
function uploadFile(localPath) {
  const key = localPath.replace(OUT_DIR, '').replace(/\\/g, '/').replace(/^\//, '')
  const ext = path.extname(localPath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: BUCKET,
      Region: REGION,
      Key: key,
      Body: fs.createReadStream(localPath),
      ContentType: contentType,
      Headers: {
        'Cache-Control': key.startsWith('_next/static/')
          ? 'public, max-age=31536000, immutable'  // 带 hash 的静态资源永久缓存
          : 'public, max-age=0, must-revalidate',  // HTML 等不缓存
      },
    }, (err) => {
      if (err) { console.error(`✗ ${key}`, err.message); reject(err) }
      else { console.log(`✓ ${key} [${contentType}]`); resolve() }
    })
  })
}

async function deploy() {
  if (!fs.existsSync(OUT_DIR)) {
    console.error('out/ 目录不存在，请先运行 npm run build')
    process.exit(1)
  }

  const files = collectFiles(OUT_DIR)
  console.log(`开始上传 ${files.length} 个文件 → ${BUCKET} (${REGION})\n`)

  // 并发上传，限制 10 个并发
  const CONCURRENCY = 10
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    await Promise.all(files.slice(i, i + CONCURRENCY).map(uploadFile))
  }

  console.log(`\n✅ 部署完成！访问：https://${BUCKET}.cos-website.${REGION}.myqcloud.com`)
}

deploy().catch(err => { console.error(err); process.exit(1) })
