// Renderiza a saída real de um terminal como PNG (para CLIs, que não têm UI web).
// Uso: node scripts/print-terminal.mjs <saida.txt> <imagem.png> "<titulo da janela>"
// Linhas que começam com "$ " são comandos. Capture a saída rodando a ferramenta no commit certo
// (git worktree add --detach) num diretório de teste; nunca edite a saída à mão.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'

const [entrada, saida, titulo = ''] = process.argv.slice(2)
if (!entrada || !saida) {
  console.error('uso: node scripts/print-terminal.mjs <saida.txt> <imagem.png> "<titulo>"')
  process.exit(1)
}
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
const linhas = readFileSync(entrada, 'utf8').replace(/\n+$/, '').split('\n')
  .map((l) => (l.startsWith('$ ') ? `<div><b>$</b> <span class="cmd">${esc(l.slice(2))}</span></div>` : `<div>${esc(l) || '&nbsp;'}</div>`))
  .join('')

const html = `<!doctype html><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
body{background:transparent;padding:0;display:inline-block}
.jan{width:900px;background:#0d1117;border:1px solid #30363d;border-radius:12px;overflow:hidden;font:20px/1.55 ui-monospace,"JetBrains Mono","DejaVu Sans Mono",monospace;color:#c9d1d9}
.barra{display:flex;align-items:center;gap:8px;padding:12px 16px;background:#161b22;border-bottom:1px solid #30363d;color:#8b949e;font-size:16px}
.barra i{width:12px;height:12px;border-radius:50%;display:inline-block}
.barra span{margin-left:10px}
.conteudo{padding:18px 22px;white-space:pre-wrap;word-break:break-word}
b{color:#f2a33a;font-weight:700}.cmd{color:#fff}
</style><div class="jan"><div class="barra"><i style="background:#ff5f56"></i><i style="background:#ffbd2e"></i><i style="background:#27c93f"></i><span>${esc(titulo)}</span></div><div class="conteudo">${linhas}</div></div>`

const carregar = (de) => createRequire(de)('playwright')
let pw
try { pw = carregar(import.meta.url) } catch { pw = carregar(`${execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()}/`) }
const browser = await pw.chromium.launch()
const page = await browser.newPage({ viewport: { width: 900, height: 200 }, deviceScaleFactor: 2 })
await page.setContent(html)
mkdirSync(dirname(saida), { recursive: true })
writeFileSync(saida, await page.locator('.jan').screenshot({ type: 'png', omitBackground: true }))
await browser.close()
console.log(`✓ ${saida}`)
