import { createContentLoader } from 'vitepress'

export interface Post {
  titulo: string
  url: string
  data: string
  categoria: string
  resumo: string
  capa?: string
  tags: string[]
}

// YAML transforma 2026-11-17 em Date; a lista trabalha com a string AAAA-MM-DD.
export const dia = (d: unknown) => (d ? new Date(d as string).toISOString().slice(0, 10) : '')

declare const data: Post[]
export { data }

// Lista todos os posts publicados, do mais novo para o mais antigo.
export default createContentLoader(['noticias/*.md', 'artigos/*.md', 'opinioes/*.md', 'ideias/*.md'], {
  transform(pages) {
    return pages
      .filter((p) => !p.url.endsWith('/') && p.frontmatter.status !== 'rascunho')
      .map((p) => ({
        titulo: p.frontmatter.title,
        url: p.url,
        data: dia(p.frontmatter.date),
        categoria: p.frontmatter.categoria,
        resumo: p.frontmatter.description ?? '',
        capa: p.frontmatter.capa,
        tags: p.frontmatter.tags ?? [],
      }))
      .sort((a, b) => b.data.localeCompare(a.data))
  },
})
