// Cria um post a partir do modelo: npm run novo -- <categoria> "Título do post"
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const categorias = ['noticias', 'artigos', 'opinioes', 'ideias']
const [categoria, ...resto] = process.argv.slice(2)
const titulo = resto.join(' ').trim()

if (!categorias.includes(categoria) || !titulo) {
  console.error(`Uso: npm run novo -- <${categorias.join('|')}> "Título do post"`)
  process.exit(1)
}

const hoje = new Date().toISOString().slice(0, 10)
const slug = titulo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const destino = `docs/${categoria}/${hoje}-${slug}.md`
if (existsSync(destino)) {
  console.error(`Já existe: ${destino}`)
  process.exit(1)
}

const modelo = readFileSync('templates/post.md', 'utf8')
  .replace('Título do post', titulo.replace(/"/g, '\\"'))
  .replace('date: AAAA-MM-DD', `date: ${hoje}`)
  .replace(/categoria: artigos.*/, `categoria: ${categoria}`)
  .replaceAll('AAAA-MM-DD-slug', `${hoje}-${slug}`)

writeFileSync(destino, modelo)
console.log(destino)
