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

Quando `url` existe, o post mostra o link "Ouvir no podcast" ou "Assistir no YouTube" no topo. A geração de áudio e vídeo ainda não está implementada.
