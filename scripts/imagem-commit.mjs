// Gera um cartão PNG de um commit (mensagem, autor, data, arquivos e diff) para ilustrar posts.
// Uso: node scripts/imagem-commit.mjs <clone-local> <sha> <saida.png> [nome-do-repo] [--sem-corpo]
// --sem-corpo omite o corpo da mensagem (útil em squash com lista de commits).
// Ex.:  node scripts/imagem-commit.mjs ../etanol-gasolina 4080052 docs/public/imagens/2026-11-24-slug/4080052.png juninmd/etanol-gasolina
// Precisa do Playwright com Chromium instalado na máquina (não é dependência do site).
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, basename, resolve } from 'node:path'

const semCorpo = process.argv.includes('--sem-corpo')
const [repo, sha, saida, nomeRepo] = process.argv.slice(2).filter((a) => a !== '--sem-corpo')
if (!repo || !sha || !saida) {
  console.error('uso: node scripts/imagem-commit.mjs <clone-local> <sha> <saida.png> [nome-do-repo]')
  process.exit(1)
}

const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' })
// Só o nome do autor: e-mail nunca vai para a imagem.
const [hash, assunto, corpo, autor, data] = git('show', '-s', '--date=short', '--format=%h%x00%s%x00%b%x00%an%x00%ad', sha).split('\0')
const ruido = /^(co-authored-by|claude-session|signed-off-by|reviewed-by):/i
const linhasCorpo = corpo.split('\n').map((l) => l.trimEnd()).filter((l) => l && !ruido.test(l.trim())).slice(0, semCorpo ? 0 : 5)

const arquivos = git('show', '--numstat', '--format=', sha).trim().split('\n').filter(Boolean).map((l) => {
  const [mais, menos, ...nome] = l.split('\t')
  return { nome: nome.join('\t'), mais: Number(mais) || 0, menos: Number(menos) || 0 }
})
const totalMais = arquivos.reduce((s, a) => s + a.mais, 0)
const totalMenos = arquivos.reduce((s, a) => s + a.menos, 0)
const top = [...arquivos].sort((a, b) => b.mais + b.menos - (a.mais + a.menos)).slice(0, 7)
const maior = Math.max(1, ...top.map((a) => a.mais + a.menos))

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const num = (n) => n.toLocaleString('pt-BR')
const repoNome = nomeRepo || basename(resolve(repo))

const html = `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#06080c;color:#e9e4d8;font:22px ui-monospace,"JetBrains Mono","DejaVu Sans Mono",monospace;padding:48px 56px;display:flex;flex-direction:column;gap:22px;border-top:8px solid #f2a33a}
.topo{display:flex;justify-content:space-between;color:#8d98a9;font-size:20px;letter-spacing:.06em;text-transform:uppercase}
.sha{color:#f2a33a}
h1{flex-shrink:0;font:700 40px/1.25 "Arial Narrow","DejaVu Sans Condensed",sans-serif;color:#fff;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.corpo{flex-shrink:1;min-height:0;color:#b7bfcc;font-size:18px;line-height:1.45;white-space:pre-wrap;max-height:130px;overflow:hidden}
.arqs{display:grid;grid-template-columns:1fr 150px 240px;gap:6px 18px;font-size:17px;margin-top:auto}
.n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#d6d0c2}
.c{text-align:right}.mais{color:#5bd38a}.menos{color:#ff6b6b}
.barra{display:flex;height:12px;align-self:center;border-radius:3px;overflow:hidden;background:#151b24}
.barra i{display:block;height:100%}
.rodape{display:flex;justify-content:space-between;color:#8d98a9;font-size:19px;border-top:1px solid #232c39;padding-top:16px}
</style>
<div class="topo"><span>${esc(repoNome)}</span><span><span class="sha">${esc(hash)}</span> · ${esc(data)}</span></div>
<h1>${esc(assunto)}</h1>
${linhasCorpo.length ? `<div class="corpo">${esc(linhasCorpo.join('\n'))}</div>` : ''}
<div class="arqs">${top.map((a) => `<span class="n">${esc(a.nome)}</span><span class="c"><span class="mais">+${num(a.mais)}</span> <span class="menos">−${num(a.menos)}</span></span><span class="barra"><i style="width:${(a.mais / maior) * 100}%;background:#5bd38a"></i><i style="width:${(a.menos / maior) * 100}%;background:#ff6b6b"></i></span>`).join('')}</div>
<div class="rodape"><span>${esc(autor)}</span><span>${num(arquivos.length)} arquivo(s) · <span class="mais">+${num(totalMais)}</span> <span class="menos">−${num(totalMenos)}</span></span></div>`

// Usa o Playwright do projeto ou, se não houver, o instalado globalmente.
const carregar = (base) => createRequire(base)('playwright')
let pw
try { pw = carregar(import.meta.url) } catch { pw = carregar(`${execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()}/`) }
const { chromium } = pw
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html)
mkdirSync(dirname(saida), { recursive: true })
writeFileSync(saida, await page.screenshot({ type: 'png' }))
await browser.close()
console.log(`✓ ${saida}`)
