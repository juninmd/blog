import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { defineConfig } from 'vitepress'
import { categorias } from './categorias'

// No GitHub Pages o site vive em /<repo>/; o workflow informa o prefixo.
const base = process.env.VITEPRESS_BASE || '/'
const srcDir = fileURLToPath(new URL('..', import.meta.url))

// Post com `status: rascunho` não vira página, mesmo estando em docs/.
function rascunhos(dir = srcDir): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome)
    if (nome.startsWith('.') || nome === 'public') return []
    if (statSync(caminho).isDirectory()) return rascunhos(caminho)
    if (!nome.endsWith('.md')) return []
    const { data } = matter(readFileSync(caminho, 'utf8'))
    return data.status === 'rascunho' ? [relative(srcDir, caminho)] : []
  })
}

export default defineConfig({
  base,
  lang: 'pt-BR',
  title: 'Blog do Antonio',
  description: 'Notícias, artigos, opiniões e ideias.',
  appearance: 'dark',
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: rascunhos(),
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@500;800;900&family=JetBrains+Mono:wght@400;600&family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..600&display=swap' }],
    ['meta', { name: 'theme-color', content: '#06080c' }],
  ],
  markdown: { image: { lazyLoading: true } },
  themeConfig: {
    nav: [
      { text: 'Início', link: '/' },
      ...Object.entries(categorias).map(([slug, c]) => ({ text: c.titulo, link: `/${slug}/` })),
      { text: 'Sobre', link: '/sobre' },
    ],
    search: { provider: 'local' },
    outline: { label: 'Nesta página' },
    docFooter: { prev: 'Anterior', next: 'Próximo' },
    lastUpdated: { text: 'Atualizado em' },
    returnToTopLabel: 'Voltar ao topo',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Tema',
    socialLinks: [{ icon: 'github', link: 'https://github.com/juninmd' }],
  },
})
