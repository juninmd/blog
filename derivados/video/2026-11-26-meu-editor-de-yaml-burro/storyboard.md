# Storyboard: Prefiro meu editor de YAML burro, mesmo depois de dois bugs

| Cena | Visual | Texto na tela | Motion |
| --- | --- | --- | --- |
| 1 | Pipeline push → build → GHCR → chart | `image.tag` | Setas acendendo em sequência |
| 2 | Painel do ArgoCD verde, pod com código velho | `Synced` · `:latest` | Selo verde rachando |
| 3 | Cartão do commit dff84df | `sha-<commit>` | Tag trocando de `latest` para `sha` |
| 4 | Diff gigante vs. diff de uma linha | `1 linha` | Diff gigante encolhe |
| 5 | Print real `term-dff84df.png` | `sidecar ← sha-3a4094d` | Zoom na linha do sidecar |
| 6 | ArgoCD verde de novo | `imagem errada` | Pisca vermelho por trás do verde |
| 7 | Cartão do commit 4ce08ee | `#24 · filho direto` | Árvore de chaves com galho destacado |
| 8 | Print real `term-4ce08ee.png` | `#rc"` | Aspa órfã treme |
| 9 | Cartão 4bee117 e print `term-4bee117.png` | `#27` | Comentário volta ao lugar |
| 10 | Mensagem de erro em vermelho | `erre alto` | Corte seco para logo |

Assets: prints e cartões gerados para o post em docs/public/imagens/2026-11-26-meu-editor-de-yaml-burro/.
