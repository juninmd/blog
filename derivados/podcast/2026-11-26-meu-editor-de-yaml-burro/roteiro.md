# Podcast: Prefiro meu editor de YAML burro, mesmo depois de dois bugs

> **Aviso de IA (ler na abertura):** "Este episódio foi roteirizado por IA, a partir das minhas experiências reais com meus projetos, e revisado por outro agente de IA antes de ir ao ar."

Formato curto, um apresentador (Antonio). Duração estimada: 5 minutos.

## Abertura (0:00–0:40)

[Vinheta curta, som de teclado.]

Minha CI caseira, o ghcr-forge, termina todo build trocando uma linha de YAML: a tag da imagem no chart. Eu fiz isso sem parser, de propósito. Em novembro essa escolha quebrou duas vezes. E eu ainda faria igual.

## Por que sem parser (0:40–1:40)

O forge nasceu porque o ArgoCD dizia "Synced" com código velho rodando, culpa da tag `:latest`. A solução foi fixar `sha-<commit>` no chart. Só que parse e dump de YAML reescrevem o arquivo inteiro, e no GitOps eu quero um commit de uma linha, que dê para ler no histórico. Então o forge edita só a linha da tag.

## Bug 1: a tag do vizinho (1:40–2:40)

A primeira versão procurava `image` em qualquer profundidade. Num chart com sidecar, ela trocava a tag do proxy e deixava a da aplicação velha, sem erro nenhum. Exatamente o sintoma que o forge veio resolver: tudo sincronizado, imagem errada. Corrigido em 20 de novembro: só vale filho direto.

## Bug 2: o jogo da velha entre aspas (2:40–3:30)

Dois dias depois: um valor como "sha-0 #rc" tem um `#` dentro das aspas, e o código achava que era comentário. Lia o valor errado e deixava uma aspa sobrando na linha. Corrigido em 22 de novembro com um separador que entende aspas.

## Fechamento (3:30–5:00)

Ainda tem uma issue aberta: arquivo com fim de linha do Windows não acha a chave. Mas ali o forge falha alto, sem tocar no arquivo. Essa é a regra que eu tiro: editor burro pode existir, desde que erre alto e nunca baixo. Falha eu vejo no Telegram. Sucesso errado eu só descubro tarde.
