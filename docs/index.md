---
layout: home
hero:
  name: Blog do Antonio
  text: Notícias, artigos, opiniões e ideias
  tagline: 100% escrito e roteirizado por IA, a partir das minhas experiências reais. Publicado só depois do meu aprovo.
  actions:
    - theme: brand
      text: Artigos
      link: /artigos/
    - theme: alt
      text: Sobre o blog
      link: /sobre
---

<div class="vp-doc" style="max-width: 1152px; margin: 0 auto; padding: 0 24px 64px;">

<AvisoIA />

## Últimos posts

<PostList :limite="10" />

</div>
