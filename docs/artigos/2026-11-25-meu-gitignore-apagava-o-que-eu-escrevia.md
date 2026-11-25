---
title: "Meu gerador de .gitignore apagava o que eu escrevia à mão"
description: "Desde 2018 o gign reescrevia o .gitignore inteiro e jogava fora as regras que eu tinha acrescentado. Em quatro dias de novembro, três correções mostraram que arquivo gerado que gente edita precisa de fronteira, não de boa intenção."
date: 2026-11-25
categoria: artigos
tags: [gign, gitignore, cli, typescript, agentes-de-ia, arquivos-gerados]
status: publicado
ia: true
autoria: ia
autor: Antonio
fontes:
  - https://github.com/juninmd/gign
  - https://github.com/juninmd/gign/blob/master/README.md
  - https://github.com/juninmd/gign/commit/9de9835
  - https://github.com/juninmd/gign/commit/96567a9
  - https://github.com/juninmd/gign/commit/ac3c2ad
  - https://github.com/juninmd/gign/commit/bade232
  - https://github.com/juninmd/gign/commit/554ef8a
  - https://github.com/juninmd/gign/commit/128103b
  - https://github.com/juninmd/gign/commit/04d89a2
  - https://github.com/juninmd/gign/blob/master/src/util/preserve.ts
  - https://github.com/github/gitignore
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-25-meu-gitignore-apagava-o-que-eu-escrevia/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-25-meu-gitignore-apagava-o-que-eu-escrevia/roteiro.md
---

O [gign](https://github.com/juninmd/gign) é uma das ferramentas mais velhas que eu ainda mantenho. Você roda `gign .`, ele olha o projeto, descobre que tem Node, Docker, VS Code, o sistema operacional, e escreve um `.gitignore` sob medida. É o tipo de utilitário que a gente usa uma vez por projeto e esquece.

O problema é o "uma vez". Projeto muda. Entra uma ferramenta nova, sai outra, e o natural é rodar o gerador de novo. E foi aí que, durante anos, o gign fazia uma coisa que eu nunca tinha parado para olhar: ele apagava tudo o que eu tinha escrito à mão.

## Oito anos de `writeFileSync`

O primeiro commit do gign é de março de 2018. Naquela época ele nem gerava nada sozinho: montava a lista de tags, chamava a API do gitignore.io e gravava a resposta com um `fs.writeFileSync` em cima do `.gitignore` do projeto. Sem ler o que já existia. O arquivo era dele.

Em 2026 o projeto acordou. Em outubro os templates oficiais do [github/gitignore](https://github.com/github/gitignore) passaram a vir embutidos no pacote, e o gign ficou 100% offline. Ao longo do ano, o Jules, o agente de IA que eu deixo cuidando de vários repositórios, fez a maior parte do crescimento: dos 145 commits dele no gign, a grande maioria adiciona detecção de ferramenta nova no `pattern.json`. Biome, OpenTofu, vcluster, Kysely, trpc. O detector ficou enorme.

E o comportamento básico continuava o de 2018. O `pattern.json` já tinha 939 entradas de detecção, mas não sabia que a linha `notas-pessoais/` no fim do meu `.gitignore` era minha.

Para escrever este texto, montei os builds de quatro commits do gign e rodei o mesmo cenário em cada um. Esse é o antes, no commit `33ea8aa`: um `.gitignore` com duas regras escritas à mão, um `gign .`, e o `grep` contando quantas sobreviveram.

![Terminal rodando o gign no commit 33ea8aa: o .gitignore começa com notas-pessoais/ e *.rascunho, o gign regenera o arquivo e o grep encontra 0 das duas regras](/imagens/2026-11-25-meu-gitignore-apagava-o-que-eu-escrevia/term-33ea8aa.png)

Zero. E repare no que isso significa na prática: a regra que some do `.gitignore` é exatamente a que você acrescentou porque havia algo que não podia ir para o repositório. Um rascunho, uma pasta de dados, um arquivo de configuração local. Na próxima vez que alguém roda `git add .`, aquilo entra no commit.

## Primeira correção: o que não é meu, eu guardo

No dia 19 de novembro saiu o [#277](https://github.com/juninmd/gign/commit/bade232). A ideia é simples: antes de escrever, o gign lê o arquivo que já existe, separa o que ele mesmo gerou do que é do usuário, e reescreve com as regras manuais numa seção própria, `Custom rules (preserved)`. Sem duplicar o que ele já gera e de forma idempotente, para que rodar duas vezes dê o mesmo arquivo.

![Commit bade232 do gign, de 19/11/2026: "fix(generate): preservar regras manuais ao regenerar o .gitignore (#277)", com o novo src/util/preserve.ts e testes de integração, 6 arquivos e +105 linhas](/imagens/2026-11-25-meu-gitignore-apagava-o-que-eu-escrevia/bade232.png)

A pergunta difícil é a do meio: como saber o que o gign gerou? A primeira resposta foi pelo formato. O gign escreve cada seção com um cabeçalho `### Nome ###`. Se o arquivo tem cabeçalhos assim, então é saída do gign, e o que está debaixo deles é gerado.

Funciona para o arquivo escrito do zero. Só que `### Node ###` também é exatamente o formato que o gitignore.io usa. E muita gente, inclusive eu, já tem `.gitignore` antigo baixado de lá.

![Terminal rodando o gign no commit bade232: o .gitignore escrito à mão agora mantém as 2 regras, mas um .gitignore com cabeçalho "### Node ###" no estilo do gitignore.io ainda perde a regra notas-pessoais/](/imagens/2026-11-25-meu-gitignore-apagava-o-que-eu-escrevia/term-bade232.png)

No primeiro cenário, as duas regras ficam. No segundo, o arquivo começa com `### Node ###`, o gign conclui que tudo ali é dele, e `notas-pessoais/` some de novo.

## Segunda correção: só é meu o que eu escrevi

No dia seguinte veio o [#280](https://github.com/juninmd/gign/commit/128103b). Em vez de "qualquer cabeçalho no formato", só conta como seção gerada o título que o próprio gign emite: os nomes dos templates embutidos, as seções `(project)` e a de segredos. Um `### Node ###` do gitignore.io, ou um cabeçalho que eu inventei, deixa de ser prova de nada.

![Commit 128103b do gign, de 20/11/2026: "fix(preserve): keep rules under headers gign never writes (#280)", que passa a reconhecer como gerados só os títulos que o gign emite](/imagens/2026-11-25-meu-gitignore-apagava-o-que-eu-escrevia/128103b.png)

Na mesma noite saiu outro conserto que aparece de carona nos prints: o [#278](https://github.com/juninmd/gign/commit/554ef8a). Desde julho, um commit do Jules tinha ensinado o detector a ligar o template do Flatpak para qualquer `*.json`, `*.yaml` ou `*.yml`. Ou seja, praticamente todo projeto. E esse template ignora pastas chamadas `repo` e `builddir`, que podem ser código de verdade. Nos terminais de `33ea8aa` e `bade232` dá para ver `flatpak` nas tags de um projeto que só tem um `package.json`. A partir de `128103b` ele some.

Mas sobrava um buraco, e era o mais comum de todos.

![Terminal rodando o gign no commit 128103b: o arquivo com "### Node ###" agora mantém notas-pessoais/, mas uma regra acrescentada com echo no fim de um .gitignore gerado pelo gign some na regeneração seguinte](/imagens/2026-11-25-meu-gitignore-apagava-o-que-eu-escrevia/term-128103b.png)

Qual é o jeito mais natural de acrescentar uma regra a um `.gitignore`? `echo 'meu-rascunho/' >> .gitignore`. A linha vai para o fim do arquivo, e o fim do arquivo é a última seção que o gign gerou. Pela regra do #280, tudo dentro de uma seção gerada é gerado. Então a linha que eu acabei de acrescentar some na próxima execução, sem aviso.

## Terceira correção: comparar com o que eu geraria de novo

O [#282](https://github.com/juninmd/gign/commit/04d89a2), de 22 de novembro, muda a pergunta. Em vez de perguntar "em que seção esta linha está?", o gign pergunta "eu geraria esta linha de novo agora?". Ele já sabe o que vai escrever nesta execução. Se uma regra está dentro de uma seção gerada mas não faz parte do que aquela seção produz, ela é do usuário e vai para `Custom rules (preserved)`. Seções que não são mais geradas, porque a ferramenta saiu do projeto, continuam sendo descartadas inteiras.

![Commit 04d89a2 do gign, de 22/11/2026: "fix(preserve): keep rules appended inside a generated section (#282)", explicando que um echo >> .gitignore era perdido em silêncio e podia deixar um arquivo sensível entrar no próximo commit](/imagens/2026-11-25-meu-gitignore-apagava-o-que-eu-escrevia/04d89a2.png)

A mensagem do commit diz com todas as letras o risco: a regra perdida podia deixar um arquivo sensível entrar no próximo commit.

![Terminal rodando o gign no commit 04d89a2: a regra meu-rascunho/ acrescentada com echo no fim do arquivo continua lá depois de regenerar, e o grep conta 1](/imagens/2026-11-25-meu-gitignore-apagava-o-que-eu-escrevia/term-04d89a2.png)

## O que eu tiro disso

Olhando os três commits em sequência, o que mais me incomoda é que cada versão parecia certa. A de 2018 fazia o que prometia: gerava um `.gitignore`. A do #277 preservava regras manuais, com teste. A do #280 respeitava arquivos do gitignore.io, com teste. Cada uma resolvia o caso que alguém tinha imaginado. O caso que ninguém imaginou era o uso mais banal do arquivo.

Algumas coisas que ficaram para mim:

**Arquivo gerado que gente edita é arquivo compartilhado.** No momento em que a ferramenta escreve um arquivo que o usuário também vai abrir e mudar, ela deixou de ser dona dele. `.gitignore`, `.editorconfig`, `docker-compose.yml`, qualquer coisa que vive na raiz do repositório. O padrão seguro é ler antes de escrever, sempre.

**Adivinhar pelo formato é frágil.** O #277 decidia "isso é meu" olhando a cara da linha, e a cara da linha é compartilhada com o mundo inteiro. O #282 decide comparando com o que a ferramenta produziria de fato. Uma regra que eu não geraria agora não pode ser minha.

**Testar o caminho de quem usa, não o de quem escreveu o código.** O teste que faltava não era sofisticado. Era `echo regra >> .gitignore` seguido de `gign .`. Foi exatamente o cenário que eu rodei nos quatro commits para fazer estes prints, e foi o que pegou a diferença.

**Crescer o detector não é o mesmo que melhorar a ferramenta.** Um agente adicionando dezenas de padrões por mês deixa o gign mais abrangente, e eu gosto disso. Mas mais cobertura também é mais chance de um padrão largo demais, como o do Flatpak, e não resolve o problema de fundo de sobrescrever o trabalho de alguém. Esse tipo de correção ainda precisou de alguém olhando o comportamento, não a lista.

Hoje o README do gign diz em uma frase o que ele faz com o que já existe: regras escritas à mão ficam na seção `Custom rules (preserved)`, inclusive as acrescentadas no meio de uma seção gerada. Levou oito anos e três PRs para essa frase ser verdade.
