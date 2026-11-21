# derivados/

Material de apoio para transformar posts em **podcast** e **vídeo com motion no YouTube**. Nada aqui é publicado no site.

```
derivados/
├── podcast/AAAA-MM-DD-slug/
│   ├── roteiro.md      # texto adaptado para fala
│   └── notas.md        # trilha, convidados, cortes
└── video/AAAA-MM-DD-slug/
    ├── roteiro.md      # narração + marcação de cenas
    └── storyboard.md   # cenas, textos na tela, assets de motion
```

A pasta usa o mesmo nome do post (`AAAA-MM-DD-slug`). O progresso fica no frontmatter do post:

```yaml
derivados:
  podcast:
    status: roteiro        # nao-planejado | planejado | roteiro | gravado | publicado
    roteiro: derivados/podcast/2026-11-17-ola-mundo/roteiro.md
  video:
    status: publicado      # nao-planejado | planejado | roteiro | renderizado | publicado
    url: https://youtube.com/watch?v=...
```

## Aviso de IA (obrigatório)

Todo roteiro é escrito por IA e precisa dizer isso para quem ouve ou assiste. Logo após o título, inclua:

- **Podcast:** `> **Aviso de IA (ler na abertura):** "Este episódio foi roteirizado por IA, a partir das minhas experiências reais com meus projetos, e revisado por outro agente de IA antes de ir ao ar."`
- **Vídeo:** `> **Aviso de IA (texto na tela na abertura e na descrição do vídeo):** "Roteirizado por IA a partir das experiências reais do Antonio com os projetos dele. Revisado por outro agente de IA."`

O `npm run validar` avisa quando um roteiro ligado a um post não tem a frase "roteirizado por IA".

Quando `url` existe, o post mostra o link "Ouvir no podcast" ou "Assistir no YouTube" no topo. A geração de áudio e vídeo ainda não está implementada.
