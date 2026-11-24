// Tira um print da UI de um app web estático (por exemplo, o build de um repositório num commit antigo).
// Uso: node scripts/print-ui.mjs <pasta-do-build> <saida.png> [--base /prefixo] [--clicar "Texto"] [--altura 844] [--largura 390]
// Serve a pasta num servidor local, abre no Chromium do Playwright, espera a UI carregar e salva o PNG.
// --base remove um prefixo de caminho (ex.: o baseUrl do GitHub Pages). --clicar fecha um modal ou abre uma tela antes do print.
import { createServer } from 'node:http'
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, extname, join } from 'node:path'

const args = process.argv.slice(2)
const opcao = (nome, padrao) => {
  const i = args.indexOf(nome)
  if (i < 0) return padrao
  const [valor] = args.splice(i, 2).slice(1)
  return valor
}
const base = opcao('--base', '')
const clicar = opcao('--clicar', '')
const altura = Number(opcao('--altura', 844))
const largura = Number(opcao('--largura', 390))
const [pasta, saida] = args
if (!pasta || !saida) {
  console.error('uso: node scripts/print-ui.mjs <pasta-do-build> <saida.png> [--base /prefixo] [--clicar "Texto"] [--altura N] [--largura N]')
  process.exit(1)
}

const tipos = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2' }
const servidor = createServer((req, res) => {
  let caminho = decodeURIComponent(req.url.split('?')[0])
  if (base && caminho.startsWith(base)) caminho = caminho.slice(base.length) || '/'
  let arquivo = join(pasta, caminho)
  if (!existsSync(arquivo) || statSync(arquivo).isDirectory()) arquivo = join(pasta, 'index.html')
  res.writeHead(200, { 'content-type': tipos[extname(arquivo)] ?? 'application/octet-stream' })
  createReadStream(arquivo).pipe(res)
}).listen(0)
const porta = servidor.address().port

const carregar = (de) => createRequire(de)('playwright')
let pw
try { pw = carregar(import.meta.url) } catch { pw = carregar(`${execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()}/`) }

const browser = await pw.chromium.launch()
const page = await browser.newPage({ viewport: { width: largura, height: altura }, deviceScaleFactor: 2 })
const erros = []
page.on('pageerror', (e) => erros.push(e.message))
await page.goto(`http://localhost:${porta}${base}/`, { waitUntil: 'networkidle' })
// networkidle não basta: apps React Native Web e modais terminam de renderizar e animar depois da rede.
await page.waitForTimeout(4000)
if (clicar) {
  await page.getByText(clicar, { exact: true }).first().click()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
}
mkdirSync(dirname(saida), { recursive: true })
await page.screenshot({ path: saida })
await browser.close()
servidor.close()
if (erros.length) console.warn(`⚠ erros na página: ${erros.slice(0, 3).join(' | ')}`)
console.log(`✓ ${saida}`)
