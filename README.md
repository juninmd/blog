# Blog do Antonio

Blog pessoal com **notícias**, **artigos**, **opiniões** e **ideias**. Cada post é um arquivo Markdown; o site é gerado com [VitePress](https://vitepress.dev/) e publicado no **GitHub Pages**.

🔗 **https://juninmd.github.io/blog/**

A arquitetura e o tema (paleta "Sódio": asfalto escuro com uma luz quente) vêm de [Ecos de Baía Cinzenta](https://github.com/juninmd/ecos-de-baia-cinzenta).

## 🤖 Como os posts nascem

Os textos são gerados por IA, mas **só vão ao ar com o meu aprovo**:

1. Um agente de IA cria `docs/<categoria>/AAAA-MM-DD-slug.md` numa branch e abre um **Pull Request** (regras em [AGENTS.md](AGENTS.md)).
2. O CI valida o frontmatter e faz o build do site.
3. Eu reviso, peço ajustes ou aprovo.
4. **Merge na `main` = publicação.** O GitHub Actions faz o deploy no Pages.

Quer guardar um post na `main` sem publicar? Use `status: rascunho` no frontmatter: ele fica no repositório e fora do site.

## 📁 Estrutura

```
docs/
├── index.md                 # home com os últimos posts
├── noticias/  artigos/  opinioes/  ideias/
│   ├── index.md             # lista da categoria
│   └── AAAA-MM-DD-slug.md   # posts
├── sobre.md
├── public/                  # imagens e arquivos estáticos
└── .vitepress/
    ├── config.ts            # site, menu, exclusão de rascunhos
    ├── categorias.ts        # fonte única das categorias
    └── theme/               # tema, lista de posts, cabeçalho do post
derivados/                   # roteiros de podcast e vídeo (não publicados)
templates/post.md            # modelo de post
scripts/                     # novo-post e validar-posts
AGENTS.md                    # instruções para a IA que escreve
```

## ✍️ Frontmatter do post

```yaml
---
title: Título do post
description: Uma frase de resumo.
date: 2026-11-17
categoria: artigos        # noticias | artigos | opinioes | ideias
tags: [tecnologia]
status: publicado         # ou rascunho
ia: true                  # mostra o selo "IA + revisão humana"
autor: Antonio
fontes: []                # obrigatório em notícias
derivados:
  podcast: { status: nao-planejado }
  video:   { status: nao-planejado }
---
```

## 🎧 Podcast e 🎬 YouTube

Todo post pode virar episódio de podcast ou vídeo com motion. A estrutura está pronta, a geração ainda não:

- O progresso fica em `derivados.podcast` e `derivados.video` no frontmatter.
- Roteiros e storyboards vão em `derivados/podcast/<slug>/` e `derivados/video/<slug>/`.
- Com `url` preenchida, o post mostra o link para ouvir ou assistir.

Detalhes em [derivados/README.md](derivados/README.md).

## 🚀 Rodando localmente

Requer Node.js 22+.

```bash
npm install
npm run dev                                   # http://localhost:5173
npm run novo -- opinioes "Meu novo texto"     # cria post a partir do modelo
npm run validar                               # confere o frontmatter
npm run build                                 # gera docs/.vitepress/dist
```

## ⚙️ Primeira publicação

Em **Settings → Pages**, escolha **Source: GitHub Actions**. Depois disso, cada merge na `main` publica sozinho.
