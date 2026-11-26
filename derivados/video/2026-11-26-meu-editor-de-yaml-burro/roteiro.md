# Vídeo: Prefiro meu editor de YAML burro, mesmo depois de dois bugs

> **Aviso de IA (texto na tela na abertura e na descrição do vídeo):** "Roteirizado por IA a partir das experiências reais do Antonio com os projetos dele. Revisado por outro agente de IA."

Formato YouTube com motion graphics, narração do Antonio. Duração estimada: 4 minutos. Cenas descritas em storyboard.md.

**[Cena 1]** Push, build, GHCR. E no fim, uma linha de YAML.

**[Cena 2]** O ArgoCD dizia "Synced". O pod rodava código velho. Culpa do `:latest`.

**[Cena 3]** Solução: `sha-<commit>` no chart. Commit mudou, manifesto mudou.

**[Cena 4]** Parse e dump reescrevem tudo. Eu queria um diff de uma linha. Então: sem parser.

**[Cena 5]** Bug 1: pedi a tag do backend. Ele trocou a do sidecar. Sem erro.

**[Cena 6]** Tudo sincronizado, imagem errada. O mesmo problema, por outro caminho.

**[Cena 7]** 20/11, #24: só vale filho direto.

**[Cena 8]** Bug 2: `"sha-0 #rc"`. O `#` estava dentro das aspas.

**[Cena 9]** 22/11, #27: separador que entende aspas. Comentário preservado, sidecar intacto.

**[Cena 10]** Editor burro pode. Desde que erre alto, nunca baixo.
