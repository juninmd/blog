---
title: "Prefiro meu editor de YAML burro, mesmo depois de dois bugs"
description: "No ghcr-forge eu troco a tag da imagem no values.yaml editando uma linha, sem parser, para o diff do GitOps continuar legível. Em novembro essa escolha me custou duas correções. Continuo achando que ela estava certa, com uma condição."
date: 2026-11-26
categoria: opinioes
tags: [ghcr-forge, yaml, gitops, argocd, kubernetes, ci, agentes-de-ia]
status: publicado
ia: true
autoria: ia
autor: Antonio
fontes:
  - https://github.com/juninmd/ghcr-forge
  - https://github.com/juninmd/ghcr-forge/blob/main/README.md
  - https://github.com/juninmd/ghcr-forge/blob/main/src/yaml.ts
  - https://github.com/juninmd/ghcr-forge/commit/dff84df
  - https://github.com/juninmd/ghcr-forge/commit/681a9a8
  - https://github.com/juninmd/ghcr-forge/commit/4ce08ee
  - https://github.com/juninmd/ghcr-forge/commit/4bee117
  - https://github.com/juninmd/ghcr-forge/issues/12
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-26-meu-editor-de-yaml-burro/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-26-meu-editor-de-yaml-burro/roteiro.md
---

O [ghcr-forge](https://github.com/juninmd/ghcr-forge) é a minha CI caseira. Chega um push no GitHub, ele recebe o webhook, faz `docker build`, empurra a imagem para o GHCR e, no fim, abre o `values.yaml` do chart no meu repositório de GitOps e troca a tag da imagem para `sha-<commit>`. O ArgoCD vê o arquivo mudar e sincroniza.

Ele nasceu de dois problemas que estão escritos no README. O primeiro foi o GitHub Actions bloqueado por billing: o push acontecia, o build não, e o deploy virava ritual manual. O segundo foi a armadilha do `:latest`. O ArgoCD dizia `Synced` enquanto o pod rodava código velho, porque a tag mutável não tinha mudado. Com `sha-<commit>` no chart, se o commit muda, o manifesto muda, e o ArgoCD *tem* que sincronizar.

Este post é sobre a última etapa desse caminho, a menor de todas: trocar um valor dentro de um YAML. E sobre por que eu escolhi fazer isso do jeito mais burro possível, quebrei duas vezes, e ainda faria igual.

## A escolha de não usar parser

No primeiro commit, de 21 de agosto, o `src/yaml.ts` já abria com a justificativa. A edição é "cirúrgica": troca *um* valor escalar e preserva comentários, ordem e formatação do resto do arquivo. E o motivo está no comentário do código: parse e dump de YAML reescrevem o arquivo inteiro e produzem um diff impossível de revisar num repositório de GitOps.

Isso, para mim, não é detalhe. O repositório de charts é o registro do que está rodando no cluster. Se cada build gera um commit que reformata o `values.yaml` inteiro, tira os comentários e reordena chaves, eu perdi a única coisa que o GitOps me dá de graça, que é olhar o histórico e entender o que mudou. Eu quero um commit de uma linha: `tag: "sha-antigo"` virou `tag: "sha-novo"`.

Então o forge percorre o arquivo linha por linha, com uma regex de chave, acompanha a indentação para saber em que bloco está, acha `image.tag` e reescreve só aquela linha. O valor sai sempre entre aspas, para uma tag como `1.2` ou `true` não virar número ou booleano. O README é honesto sobre o preço: `setYamlValue` é edição de linha, não parser YAML, e não alcança chave dentro de item de lista.

![Commit dff84df do ghcr-forge, de 21/08/2026: "feat: CI self-hosted, do webhook ao bump de tag no chart", 26 arquivos e mais de 2.200 linhas, com o pipeline push, HMAC, fila SQLite, docker build, GHCR e image.tag no app-charts](/imagens/2026-11-26-meu-editor-de-yaml-burro/dff84df.png)

No mesmo dia, o commit que registrou o primeiro build real deixou uma frase de que eu gosto até hoje: o bump no repositório de charts seguia coberto só por teste, porque o primeiro commit num repositório de GitOps de produção é decisão consciente, não efeito colateral de smoke test. Essa cautela foi o que me salvou do que veio depois.

## Bug 1: a tag do vizinho

Para mostrar o que acontecia, eu montei um `values.yaml` pequeno com dois blocos: um `sidecar` com a imagem do proxy, marcada "não mexer", e logo abaixo o `image.tag` que o forge gerencia. Depois rodei o `setYamlValue` de cada commit do forge pedindo para trocar `backend.image.tag`.

Na versão de agosto, o resultado foi este:

![Terminal rodando o setYamlValue do commit dff84df: pedido para trocar backend.image.tag, ele lê "envoy-1.30" e grava sha-3a4094d na tag do sidecar, deixando a tag do backend intacta](/imagens/2026-11-26-meu-editor-de-yaml-burro/term-dff84df.png)

O código procurava cada pedaço do caminho em *qualquer* profundidade dentro do bloco pai. Dentro de `backend`, a primeira linha `image:` que ele encontrava era a do sidecar, mais funda. Ele trocou a tag do proxy, deixou a tag da aplicação velha e não reclamou de nada.

O que me incomoda nesse bug é a ironia. O forge existe porque o ArgoCD dizia `Synced` com o código velho rodando. Esse bug produziria exatamente o mesmo sintoma, por outro caminho: um commit bonito, de uma linha, no repositório de GitOps, sincronizado com sucesso, trocando a imagem errada. Pior que o `:latest`, porque agora o histórico mentiria com cara de verdade.

A correção entrou em 20 de novembro, no PR #24: em cada nível, só vale filho direto do ancestral, e na raiz só valem chaves de nível zero.

![Commit 4ce08ee do ghcr-forge, de 20/11/2026: "fix(yaml): match only direct children when locating a values key (#24)", explicando que backend.image.tag podia reescrever backend.sidecar.image.tag](/imagens/2026-11-26-meu-editor-de-yaml-burro/4ce08ee.png)

## Bug 2: o `#` que não era comentário

Dois dias depois veio o segundo. Para preservar o comentário no fim da linha, o código cortava tudo a partir de espaço seguido de `#`. Só que ele não olhava aspas. Um valor como `"sha-0 #rc"` tem um `#` que é parte do texto.

Rodando o mesmo teste no commit da primeira correção, o sidecar já fica em paz, mas a linha da tag sai assim:

![Terminal rodando o setYamlValue do commit 4ce08ee: o sidecar fica intacto, mas a leitura anterior devolve "sha-0" em vez de "sha-0 #rc" e a linha gravada vira tag: "sha-3a4094d" #rc" com uma aspa sobrando](/imagens/2026-11-26-meu-editor-de-yaml-burro/term-4ce08ee.png)

Duas coisas erradas. A leitura do valor atual devolve `sha-0`, não `sha-0 #rc`. E essa leitura não é decorativa: o forge usa o valor atual para decidir se precisa commitar ou não. E a escrita deixa `#rc"` pendurado depois do valor novo. O commit da correção fala em YAML inválido indo para o repositório de GitOps. No meu caso de teste o PyYAML ainda leu a tag certa, porque tratou `#rc"` como começo de comentário, mas eu não quero depender da tolerância do parser de outra pessoa para o meu diff fazer sentido.

A correção, no PR #27, troca a regex por um separador que conhece aspas: `#` só abre comentário fora de aspas e depois de espaço.

![Commit 4bee117 do ghcr-forge, de 22/11/2026: "fix(yaml): '#' dentro de aspas não é tratado como comentário (#27)", com um separador de valor e comentário que respeita aspas](/imagens/2026-11-26-meu-editor-de-yaml-burro/4bee117.png)

E o mesmo teste, agora sem surpresa: lê `sha-0 #rc` inteiro, grava a tag nova, mantém o comentário "gerenciado pelo ghcr-forge" e não encosta no sidecar.

![Terminal rodando o setYamlValue do commit 4bee117: lê "sha-0 #rc" inteiro, grava tag: "sha-3a4094d" mantendo o comentário, e a tag do sidecar continua envoy-1.30](/imagens/2026-11-26-meu-editor-de-yaml-burro/term-4bee117.png)

Os dois commits de correção têm a sessão do Claude no rodapé. Eu não achei esses bugs olhando produção. Eles foram achados lendo o código com o caso certo na cabeça, e foram corrigidos com teste antes de o forge fazer o primeiro commit de verdade num chart.

## Por que eu ainda faria igual

Dá para ler essa história como "devia ter usado uma biblioteca". Eu não leio assim.

Um parser resolveria aspas e profundidade, claro. Mas o dump me daria de volta o problema que eu queria evitar: um commit por build reformatando o arquivo inteiro. E existem bibliotecas que preservam comentários e formatação, mas aí eu troco um arquivo de umas noventa linhas que eu entendo por uma dependência cujo comportamento de serialização eu teria que aprender e testar do mesmo jeito. Para editar *um* escalar, num formato de arquivo que eu mesmo controlo, a edição de linha continua sendo a ferramenta do tamanho do problema.

A condição é outra, e é ela que eu tiro desses dois bugs: **um editor burro precisa errar alto, nunca baixo.** O pior resultado possível não é o forge falhar. É o forge editar a linha errada com sucesso. Falhar eu vejo no Telegram, com o link do log. Sucesso errado eu só vejo quando alguém perguntar por que o proxy mudou de versão.

O primeiro bug era o caso perigoso: erro silencioso. O segundo era meio a meio: leitura errada, escrita esquisita. Por isso a parte do código de que eu mais gosto hoje é a que lança `chave "image.tag" não encontrada no values.yaml` em vez de gravar qualquer coisa.

E ainda tem coisa aberta. A issue #12, de 25 de outubro, descreve um `values.yaml` com fim de linha CRLF: em JavaScript o `.` não casa `\r`, nenhuma chave é encontrada e o bump quebra depois de a imagem já ter sido publicada. Rodei o caso na versão de hoje e o erro continua lá. Mas repare no tipo de erro: alto, com mensagem, sem tocar no arquivo. É enganoso, porque a chave existe, mas está do lado certo da linha. A própria issue pede o próximo passo nessa direção: recusar com erro específico quando o valor não for um escalar simples e quando a chave aparecer duas vezes no mesmo nível, em vez de editar a primeira em silêncio.

Ferramenta simples é ótima enquanto ela sabe o que não sabe. O trabalho de manter o meu editor de YAML burro não é deixá-lo esperto. É garantir que, quando ele não tiver certeza, ele pare.
