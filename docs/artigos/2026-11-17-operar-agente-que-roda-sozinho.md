---
title: Cinco lições de operação que meu agente de notícias me ensinou
description: Commit antes do banco, outbox com dead-letter, prompt que só muda com nota, crawl com prazo e retratação auditável. O lado chato de deixar um agente rodando sozinho.
date: 2026-11-17
categoria: artigos
tags: [ia, agentes, operacao, evo-agent, engenharia]
status: publicado
ia: true
autor: Antonio
fontes:
  - https://github.com/juninmd/evo-agent/blob/main/docs/OPERATIONS.md
  - https://github.com/juninmd/evo-agent/blob/main/docs/adr/0001-guarded-self-improvement.md
  - https://github.com/juninmd/evo-agent/pull/28
  - https://github.com/juninmd/evo-agent/pull/52
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-17-operar-agente-que-roda-sozinho/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-17-operar-agente-que-roda-sozinho/roteiro.md
---

No último artigo eu contei como li um mês de edições do **evo-agent** e achei slop: título sem lastro, pauta repetida, frase genérica. Aquilo era o problema que dá para ver. Este texto é sobre o outro lado, o que não aparece na página: o que acontece quando um agente roda de hora em hora, sozinho, num cluster, e algo dá errado às três da manhã.

Escrever com LLM é a parte divertida. Manter isso de pé por meses é engenharia de operação comum, só que com um componente que não é determinístico no meio. Separei cinco lições que viraram código no projeto.

## 1. Commit primeiro, banco depois, e um jeito de reconciliar

O evo-agent publica no GitHub Pages: cada edição é um arquivo Markdown commitado numa branch. Ele também guarda a edição no banco, para montar a home, o feed Atom, o orçamento diário e a notificação no Telegram.

São duas escritas em dois sistemas diferentes, sem transação entre eles. A ordem que escolhi foi esta: **o commit no GitHub acontece antes da escrita no banco**. Se o processo morrer no meio, sobra uma página publicada que o banco não conhece. O contrário seria pior: um registro apontando para uma página que não existe.

Mas "sobra uma página órfã" ainda é um bug. Ela some da home, do feed e da contagem do dia. Então a publicação seguinte começa reconciliando a branch: toda página em `articles/` ou `reports/` sem linha no banco é registrada como `suppressed`. Esse status existe para um motivo só: a página volta para a home e para o feed, mas **não dispara o Telegram de novo**. Ninguém recebe notificação de algo que saiu há duas horas. O reconcile tem teto de 50 páginas por execução e também roda à mão com `npm run edition -- reconcile`.

A lição que tiro: quando não dá para ter transação, escolha qual lado pode ficar órfão e escreva o código que adota o órfão. Não confie que "o processo raramente morre".

## 2. Notificação é uma fila, não uma chamada

No começo, mandar a mensagem no Telegram era só mais uma linha depois da publicação. Se a API falhasse, a mensagem se perdia.

Hoje a tabela de publicações funciona como **outbox**. A entrega tenta de novo com backoff exponencial, de cinco minutos até seis horas. Depois de cinco falhas, o item vai para `dead_letter`. O erro da API fica salvo em `notification_error`, e o token do bot nunca vai para o log. Para reenviar, existe `npm run edition -- requeue <slug>`.

Isso é padrão velho de mensageria. O que mudou para mim foi perceber que um agente de IA é, antes de tudo, um sistema distribuído pequeno: crawler, LLM, GitHub, banco, Telegram. Cada seta entre eles pode falhar, e o LLM é só mais uma seta.

## 3. O agente pode melhorar o próprio prompt, mas só com nota

O evo-agent tem um ciclo de autoaperfeiçoamento: ele olha a qualidade das últimas edições e propõe um prompt de sistema melhor. Na primeira versão, o candidato gerado pelo LLM **substituía o prompt ativo direto**. Um candidato malformado ou mais fraco degradava todas as publicações seguintes, em silêncio.

Escrevi um ADR para mudar isso, e a regra ficou assim:

- todo candidato é pontuado contra controles editoriais obrigatórios e contra prompt injection;
- só é promovido se atingir a nota mínima **e** não regredir em relação ao prompt ativo;
- promovidos e rejeitados ficam salvos em `prompt_versions`;
- se o portão de qualidade da publicação rejeitar o texto gerado, há rollback automático;
- e sempre existe `npm run prompt:rollback` para eu voltar à mão.

O próprio ADR admite a consequência: o prompt evolui mais devagar. Mas fica auditável e reversível. Eu troco velocidade por poder responder "qual prompt escreveu a edição de terça?" a qualquer momento.

Para alimentar esse ciclo, cada edição ganha uma nota de qualidade que pesa a fatia de fontes primárias, a evidência por destaque, a amplitude e os sinais de comunidade. A média das últimas dez edições e a faceta mais fraca entram no ciclo de melhoria. A publicação é bloqueada quando a validação falha ou quando a nota fica abaixo de 70.

## 4. Todo crawl precisa de prazo, e de cursor

Este bug foi o mais didático. A varredura de comunidades do Reddit passava por cerca de 40 subreddits, a 1,1 segundo por requisição, mais a busca de comentários. Ela nunca terminava dentro do job de crawl de uma hora. Como não terminava, o marcador de última execução nunca era gravado. Como o marcador não existia, o crawl seguinte recomeçava do zero, e batia no `DeadlineExceeded` de novo. Um loop perfeito de trabalho jogado fora.

A correção tem duas partes. Primeiro, um teto: depois de 20 minutos, nenhum subreddit novo começa. Segundo, um **cursor persistido**: as comunidades fora do foco giram entre as varreduras, então a cauda que ficou de fora hoje vai na frente da próxima. As comunidades em foco sempre vão primeiro.

O resto do crawler ganhou limites parecidos: corpo HTTP de no máximo 5 MB e no máximo 3 redirecionamentos. Nenhum desses números é sofisticado. O ponto é que eles existem. Um coletor sem limite é um coletor que um dia vai travar o job inteiro por causa de uma fonte só.

## 5. Corrigir e retratar também são publicação

Uma edição é identificada por `AAAA-MM-DD-titulo`, o mesmo nome do arquivo. Toda versão commitada vai para `edition_revisions`. Republicar conteúdo idêntico não adiciona nada; conteúdo diferente adiciona uma revisão e marca a edição como `corrected`. Nenhum dos dois reenvia notificação.

E quando o texto está errado demais para corrigir, existe `npm run edition -- retract <slug> "<motivo>"`. A retratação segue a mesma ordem da publicação: commit antes do banco. A página vira um aviso, sai do sitemap, da home, do feed e do calendário, e o corpo anterior continua guardado nas revisões. Uma página retratada nunca é readotada pelo reconcile.

Isso parece burocracia até o dia em que um agente publica algo errado com o seu nome. Aí você quer duas coisas: tirar do ar rápido e conseguir provar o que estava escrito antes.

## Bônus: saúde em um comando

Tudo isso converge num contrato de saúde. `npm run health` emite um JSON e sai com código diferente de zero quando o sistema está degradado ou crítico. Crítico é nenhum ciclo bem-sucedido em 24 horas, qualquer notificação em dead-letter ou um ciclo marcado como rodando há mais de seis horas. Ao subir, o processo marca esses ciclos abandonados como falhos, para um restart de pod não esconder trabalho velho como "ainda em andamento".

## O que fica

Quando comecei, eu achava que o difícil de um agente de notícias era o prompt. Não é. O prompt é a parte que mais muda e a que mais tem ferramenta pronta. O difícil é o mesmo de sempre: escrita em dois sistemas, fila que falha, job que estoura prazo, dado que precisa ser corrigido sem apagar a história.

A diferença é que o LLM aumenta a superfície de erro e torna o erro mais convincente. Por isso eu prefiro gastar código em reversibilidade, e por isso este texto, também escrito com IA, só vai ao ar depois que eu aprovar o Pull Request.

## Fontes

- [evo-agent: OPERATIONS.md (saúde, outbox, ciclo de vida das edições)](https://github.com/juninmd/evo-agent/blob/main/docs/OPERATIONS.md)
- [ADR 0001: autoaperfeiçoamento com guarda](https://github.com/juninmd/evo-agent/blob/main/docs/adr/0001-guarded-self-improvement.md)
- [evo-agent #28: reconciliação, crawls limitados, retratação](https://github.com/juninmd/evo-agent/pull/28)
- [evo-agent #52: teto de 20 min e cursor na varredura do Reddit](https://github.com/juninmd/evo-agent/pull/52)
