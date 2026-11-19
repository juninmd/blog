// Cria um post a partir do modelo: npm run novo -- <categoria> "Título do post"
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const categorias = ['noticias', 'artigos', 'opinioes', 'ideias']
const [categoria, ...resto] = process.argv.slice(2)
const titulo = resto.join(' ').trim()

if (!categorias.includes(categoria) || !titulo) {
  console.error(`Uso: npm run novo -- <${categorias.join('|')}> "Título do post"`)
  process.exit(1)
}

// Data local: toISOString() é UTC e, à noite no Brasil, já devolveria o dia seguinte.
const agora = new Date()
const hoje = [agora.getFullYear(), agora.getMonth() + 1, agora.getDate()].map((n) => String(n).padStart(2, '0')).join('-')
const slug = titulo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
if (!slug) {
  console.error('O título precisa ter ao menos uma letra ou número para gerar o nome do arquivo.')
  process.exit(1)
}
const destino = `docs/${categoria}/${hoje}-${slug}.md`
if (existsSync(destino)) {
  console.error(`Já existe: ${destino}`)
  process.exit(1)
}

const modelo = readFileSync('templates/post.md', 'utf8')
  // Replacers em função: "$&" ou "$1" no título não podem ser interpretados como padrões.
  // JSON.stringify gera um escalar YAML válido mesmo com aspas, ":" ou "#" no título.
  .replace('title: Título do post', () => `title: ${JSON.stringify(titulo)}`)
  .replace('date: AAAA-MM-DD', () => `date: ${hoje}`)
  .replace(/categoria: artigos.*/, () => `categoria: ${categoria}`)
  .replaceAll('AAAA-MM-DD-slug', `${hoje}-${slug}`)

writeFileSync(destino, modelo)
console.log(destino)
