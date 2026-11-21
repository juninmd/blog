---
title: Li 31 edições do meu agente de notícias e achei slop
description: O que aprendi auditando um mês de textos gerados pelo evo-agent, e as travas que coloquei para a IA não inventar título nem repetir pauta.
date: 2026-11-17
categoria: artigos
tags: [ia, agentes, jornalismo-automatizado, evo-agent]
status: publicado
ia: true
autoria: ia
autor: Antonio
fontes:
  - https://github.com/juninmd/evo-agent/blob/main/docs/EDITORIAL-REVIEW.md
  - https://github.com/juninmd/evo-agent/pull/58
  - https://github.com/juninmd/evo-agent/pull/51
  - https://github.com/juninmd/evo-agent/pull/53
  - https://github.com/juninmd/evo-agent/pull/55
  - https://github.com/juninmd/fast-news
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-17-o-slop-do-meu-agente-de-noticias/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-17-o-slop-do-meu-agente-de-noticias/roteiro.md
---

Desde maio que eu tenho um agente escrevendo sobre IA e desenvolvimento por mim. Ele se chama **evo-agent**: coleta RSS, Google News, Hacker News, TabNews, GitHub Trending, release notes de coding agents e sinais do Reddit, escolhe as pautas, escreve em português e publica no GitHub Pages. São três edições longas por dia, sem eu encostar em nada.

Durante um tempo eu achei isso ótimo. Até que parei para ler de verdade.

## A auditoria

Peguei 31 edições diárias, de 5 de outubro a 3 de novembro de 2026, e fiz duas coisas: li a edição de 3/11 com calma e rodei checagens automáticas em todas. As checagens eram simples: o título e o resumo batem com o corpo? As mesmas URLs e temas aparecem em dias seguidos? O bloco de ranking muda?

O veredito que escrevi no relatório foi este: **útil em parte, com slop recorrente**. O núcleo tinha valor, principalmente as release notes primárias e os relatos de usuários sobre regressões e custos. O que derrubava a qualidade não era a coleta. Era o enquadramento e o enchimento.

Vale contar os achados, porque acho que eles valem para qualquer pessoa que esteja colocando um LLM para escrever sozinho.

### 1. Título que promete o que o texto não diz

Este foi o pior. Na edição de 3/11, o título falava em "900 bilhões de dólares" e o resumo em senhas vazando no processo do zsh. Nenhuma das duas coisas aparecia no corpo do texto. Em 4 das 31 edições, mais de 45% das palavras do título e do resumo não tinham lastro no corpo.

Isso não é estilo ruim. É desinformação com a minha assinatura.

### 2. Fonte e texto desencontrados

Na mesma edição, uma pauta dizia que "Claude Code pede confirmação…", mas a fonte citada era a release do Copilot CLI. E o parágrafo ainda saiu truncado. O modelo misturou duas histórias e ninguém conferiu.

### 3. Enchimento que se repete

A tabela de ranking estava idêntica nas 31 edições: "Sem alterações no ranking", com as mesmas dez linhas. Trinta e uma vezes.

### 4. A mesma história, seis vezes

A troca da chave de assinatura cosign do LiteLLM saiu em seis edições diferentes, uma para cada versão nova. Do ponto de vista do agente, cada patch era uma história nova. Do ponto de vista de quem lê, era a mesma notícia requentada.

### 5. Pauta para cumprir cota

O prompt exigia no mínimo cinco pautas, um terço vindo do Reddit, metade de fontes primárias e uma de cada comunidade em foco. Resultado: game jam, aumento de bounty e um relato isolado entravam só para fechar a conta.

### 6 e 7. Frases que servem para qualquer coisa

O "por que importa" virou um molde: "empresas devem revisar o manuseio de credenciais", "devem atualizar seus canais". Serve para qualquer notícia, logo não serve para nenhuma. E o fechamento da edição só enumerava as pautas, sem defender uma ideia.

## O que eu mudei

A parte que mais me ensinou foi perceber que pedir "seja mais rigoroso" no prompt não resolve. O que resolve é **checar depois, em código**, e devolver o texto quando falha.

Então o pipeline ganhou travas:

- **Título fundamentado.** Depois que o texto expande, título e resumo são comparados com o corpo publicado. Se tiver número que não aparece no corpo, ou mais de 45% de palavras sem lastro, os dois são refeitos a partir das pautas que de fato foram publicadas. Calibrei isso nas 198 edições que já existiam, e ele flagrou exatamente as de 3/11 e 26/10.
- **Número sem lastro bloqueia.** A validação final rejeita título ou resumo com número ausente do corpo. Essa é dura de propósito.
- **Headline sem nome inventado.** A manchete de cada pauta não pode citar número nem nome próprio que não esteja no título, no resumo ou no nome da fonte.
- **Ranking só quando muda.** Se nada mudou, a tabela não entra.
- **Promoção não é notícia.** Game jams, hackathons, webinars, sorteios e chamadas de inscrição são descartados na curadoria.
- **Utilidade de 1 a 5.** O modelo dá uma nota de utilidade para cada pauta. As abaixo de 3 saem, mas só se o que sobrar ainda cumprir todas as cotas.
- **"Por que importa" genérico é rejeitado.** Frase do tipo "devem revisar" sem número nem detalhe concreto volta para o modelo com feedback.
- **O fechamento abre com uma tese.** E ignora as pautas que não a sustentam.

## O problema da repetição é mais difícil do que parece

O achado 4 me fez voltar a um trabalho que eu tinha feito semanas antes. Eu já tinha colocado deduplicação semântica com embeddings: títulos que não dividem nenhuma palavra, mas contam a mesma história, passaram a ser agrupados, e histórias publicadas recentemente eram rejeitadas como repetição.

Só que aí apareceu o problema inverso. "Visual Studio Code 1.131" e "Visual Studio Code 1.132" têm embeddings quase iguais, mas são lançamentos diferentes. O mesmo vale para `langchain-anthropic` 1.5.2 e 1.5.3. Pior: mesmo sem embeddings, os dois títulos do VS Code dividiam 6 de 8 palavras e eram fundidos pela comparação léxica. Coloquei então uma guarda de versão: títulos que citam versões diferentes nunca são fundidos.

E a guarda que salvou o VS Code é a mesma que deixou o cosign do LiteLLM aparecer seis vezes. Não dá para separar "patch repetido" de "release nova" só olhando o vetor. Minha saída foi não afrouxar a deduplicação, e sim mudar a pergunta: o prompt editorial agora recebe as fontes parecidas (cosseno de 0,80 ou mais) com pautas dos últimos dias e só aceita a pauta se a evidência trouxer fato novo.

Admito no próprio relatório que isso depende de o modelo obedecer. É uma trava mais fraca que as outras, e eu ainda preciso medir a taxa de repetição depois de alguns dias.

## O que levo disso

Tenho outro projeto parecido, o **fast-news**, que publica o boletim "O Fio" quatro vezes por dia: manhã, meio-dia, tarde e noite. Ver os commits de publicação passando sozinhos é satisfatório. Mas a auditoria do evo-agent me lembrou que volume publicado não é qualidade publicada.

Três ideias que eu levo para qualquer agente que escreve:

1. **Leia a saída como leitor, não como dono do código.** Os bugs mais graves não estavam nos logs. Estavam no texto.
2. **Cota gera enchimento.** Toda regra de "no mínimo N" vira incentivo para o modelo inventar relevância. Se a cota existe, precisa de um filtro de utilidade junto.
3. **Valide em código o que pode ser validado em código.** Número no título que não está no corpo é uma checagem de poucas linhas. Não precisa de outro LLM para isso.

E tem uma ironia que não dá para ignorar: este texto também foi escrito com IA. A diferença é que aqui nada vai ao ar sem passar por revisão: outro agente de IA lê e aprova o Pull Request antes do merge. Depois de ver o que um agente faz sem revisão nenhuma, eu prefiro assim.

## Fontes

- [Revisão editorial do evo-agent (05/10 a 03/11/2026)](https://github.com/juninmd/evo-agent/blob/main/docs/EDITORIAL-REVIEW.md)
- [evo-agent #58: corte de slop, título fundamentado, poda por utilidade](https://github.com/juninmd/evo-agent/pull/58)
- [evo-agent #51: deduplicação semântica com embeddings](https://github.com/juninmd/evo-agent/pull/51)
- [evo-agent #53 e #55: guarda de versão na deduplicação](https://github.com/juninmd/evo-agent/pull/53)
- [fast-news e o boletim O Fio](https://github.com/juninmd/fast-news)
