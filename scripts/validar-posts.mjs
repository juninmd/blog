// Confere o frontmatter de todos os posts. Roda no CI de cada PR.
import { readdirSync, readFileSync } from 'node:fs'
import matter from 'gray-matter'

const categorias = ['noticias', 'artigos', 'opinioes', 'ideias']
const statusPost = ['rascunho', 'publicado']
const statusDerivado = ['nao-planejado', 'planejado', 'roteiro', 'gravado', 'renderizado', 'publicado']
const nomeValido = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/

const erros = []
let total = 0

for (const categoria of categorias) {
  for (const arquivo of readdirSync(`docs/${categoria}`)) {
    if (arquivo === 'index.md' || !arquivo.endsWith('.md')) continue
    total++
    const caminho = `docs/${categoria}/${arquivo}`
    const erro = (msg) => erros.push(`${caminho}: ${msg}`)
    const { data: fm, content } = matter(readFileSync(caminho, 'utf8'))
    const data = fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : String(fm.date ?? '')

    if (!nomeValido.test(arquivo)) erro('nome deve ser AAAA-MM-DD-slug.md')
    if (!fm.title) erro('falta "title"')
    if (!fm.description) erro('falta "description"')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) erro('"date" deve ser AAAA-MM-DD')
    else if (!arquivo.startsWith(data)) erro('a data do nome do arquivo difere de "date"')
    if (fm.categoria !== categoria) erro(`"categoria" deve ser "${categoria}" (pasta do arquivo)`)
    if (!statusPost.includes(fm.status)) erro(`"status" deve ser ${statusPost.join(' | ')}`)
    if (typeof fm.ia !== 'boolean') erro('"ia" deve ser true ou false')
    if (categoria === 'noticias' && !(fm.fontes?.length)) erro('notícia precisa de "fontes"')
    if (!content.trim()) erro('post sem conteúdo')
    for (const tipo of ['podcast', 'video']) {
      const d = fm.derivados?.[tipo]
      if (d && !statusDerivado.includes(d.status)) erro(`derivados.${tipo}.status inválido`)
      if (d?.status === 'publicado' && !d.url) erro(`derivados.${tipo} publicado sem "url"`)
    }
  }
}

if (erros.length) {
  console.error(erros.map((e) => `✗ ${e}`).join('\n'))
  process.exit(1)
}
console.log(`✓ ${total} post(s) válidos`)
