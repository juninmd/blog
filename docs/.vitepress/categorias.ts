// Fonte única das categorias: menu, listas e validação leem daqui.
export const categorias = {
  noticias: { titulo: 'Notícias', descricao: 'O que aconteceu e por que importa.' },
  artigos: { titulo: 'Artigos', descricao: 'Textos longos, com pesquisa e contexto.' },
  opinioes: { titulo: 'Opiniões', descricao: 'O que eu penso, assinado e sem rodeio.' },
  ideias: { titulo: 'Ideias', descricao: 'Rascunhos de pensamento, projetos e hipóteses.' },
} as const

export type Categoria = keyof typeof categorias
