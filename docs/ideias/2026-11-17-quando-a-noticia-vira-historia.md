---
title: Quando a notícia vira história, o fast-news pode fazer muito mais
description: O fast-news já agrupa a mesma notícia de vários veículos numa história. Cinco ideias de produto e automação que saem disso, quase todas sem chamar um LLM.
date: 2026-11-17
categoria: ideias
tags: [fast-news, produto, automacao, noticias, ideias]
status: publicado
ia: true
autor: Antonio
fontes:
  - https://github.com/juninmd/fast-news
  - https://github.com/juninmd/fast-news/blob/main/README.md
  - https://github.com/juninmd/fast-news/commit/38008e5
  - https://github.com/juninmd/fast-news/blob/main/backend/src/database/schema.sql
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-17-quando-a-noticia-vira-historia/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-17-quando-a-noticia-vira-historia/roteiro.md
---

Tem uma mudança no **fast-news** que eu acho que ainda não explorei direito. Durante muito tempo, a ingestão descartava notícia parecida: se o embedding de um texto ficava perto demais de outro que já estava no banco, ele era cortado como duplicata. Hoje não é mais assim. Nenhuma notícia é descartada por semelhança. Só sai o que é duplicata **exata** (mesmo `guid`, mesma URL ou mesma URL canônica). O resto é guardado e agrupado numa **história**.

Na prática, quando cinco portais dão o mesmo fato, eu não tenho mais um card e quatro notícias jogadas fora. Tenho uma história com cinco membros, o selo "5 fontes" e o link de cada veículo.

É assim que aparece no feed, no print de evidência que o próprio PR do agrupamento ([#261](https://github.com/juninmd/fast-news/commit/38008e5), 18/10/2026) deixou no repositório, com dados de exemplo:

![Print do feed do fast-news salvo em docs/evidence/news-grouping no commit 38008e5: card "Bitcoin supera US$ 100 mil e bate novo recorde histórico" com o selo "3 fontes" aberto, mostrando as manchetes de Valor Econômico e Reuters lado a lado, e abaixo um card do G1 sobre o Copom com o selo "5 fontes"](/imagens/2026-11-17-quando-a-noticia-vira-historia/ui-38008e5.png)

Eu fiz isso para o leitor não ver a mesma manchete cinco vezes. Mas, relendo o código, percebi que a história é um dado muito mais rico do que um jeito de esconder repetição. Este post é uma lista de ideias do que dá para construir em cima dela. Nenhuma está pronta. É para eu pensar em voz alta e decidir por onde começar.

## O que já existe

Antes das ideias, o inventário, para não prometer o que o sistema não tem:

- **Agrupamento por embedding.** O vizinho mais próximo, com cosseno a partir de 0,82 numa janela de 72 horas, define a história. Perto do limiar, a sobreposição de manchete desempata. Sem embedding, cai para comparação lexical.
- **A tabela `news_stories`.** Cada história tem título, editoria, `status` (ativa, resolvida, arquivada), `first_seen_at`, `last_updated_at` e `article_count`.
- **Ranking e tendência.** `GET /api/news/top` ordena histórias pelo número de fontes, com decaimento de 12 horas. `GET /api/news/trends` devolve termos em alta comparando duas janelas iguais e exigindo pelo menos duas fontes.
- **Canais de saída.** Telegram, Discord, Slack, ntfy, Apprise, webhook genérico, RSS, JSON Feed, podcast e um servidor MCP com `get_digest` e `get_source_health`.

Ou seja: eu já sei quantos veículos deram cada fato, desde quando, e tenho meia dúzia de jeitos de avisar alguém. Falta ligar uma coisa na outra.

## Ideia 1: alerta de história que acelera

O ranking atual responde "o que é grande agora". A pergunta que eu mais queria responder no celular é outra: **"o que está crescendo rápido agora?"**.

Uma história que passa de uma para seis fontes em quarenta minutos é diferente de uma que tem seis fontes acumuladas ao longo de três dias. A primeira é notícia quebrando. A segunda é assunto morno.

O cálculo é barato: a cada rodada de ingestão, olhar quantos membros cada história ganhou desde a rodada anterior. Passou de um limite? Manda um push pelo ntfy com a manchete e o número de veículos. Sem LLM, sem custo por token, só uma consulta no Postgres.

O cuidado é o de sempre com alerta: dedupe por história (avisar uma vez, não a cada novo membro) e um limite por dia, senão eu desligo a notificação na primeira semana.

## Ideia 2: quem não deu a notícia

Essa é a que eu acho mais interessante, e é quase o inverso do que a interface mostra hoje.

O card diz "deram essa notícia: Folha, G1, Estadão". Mas eu sei quais veículos costumam cobrir cada editoria, porque isso está no histórico das fontes. Então dá para perguntar: **numa história de política com muitas fontes, quais veículos que sempre cobrem política ficaram calados?**

Silêncio não prova nada sozinho. Pode ser feed atrasado, fonte em quarentena (e o fast-news já sabe quando uma fonte está em quarentena) ou só uma pauta que o veículo não quis. Mas, como sinal para eu ir olhar, é muito bom. E, de novo, é uma consulta, não um prompt.

## Ideia 3: as manchetes lado a lado

Toda história já carrega a manchete de cada veículo. Hoje eu mostro uma e escondo as outras atrás de "N fontes".

Uma visão que coloque todas lado a lado vira uma aula de enquadramento de graça. O mesmo fato com "governo anuncia", "governo recua" e "governo é criticado por" diz muito sobre cada veículo. Eu não preciso de modelo para julgar quem está certo. Só preciso mostrar.

Se um dia eu quiser um passo a mais, aí sim cabe um LLM barato para marcar a diferença principal entre as manchetes. Mas a versão sem IA já entrega quase todo o valor, e não corre o risco de inventar nada, que foi exatamente o problema que eu achei no [meu outro agente de notícias](/artigos/2026-11-17-o-slop-do-meu-agente-de-noticias).

## Ideia 4: a página permanente da história

Hoje a história vive no feed e some quando sai da janela de 72 horas. Mas a tabela já tem `first_seen_at`, `last_updated_at` e `status`.

Dá para gerar uma página por história com a linha do tempo dos membros: quem deu primeiro, quem chegou depois, quando a última atualização apareceu. E, quando ela muda de `active` para `resolved`, essa página vira arquivo.

O jornal **O Fio** já publica edições imutáveis no GitHub Pages via VitePress. Uma página por história grande seria o mesmo mecanismo com outro recorte: em vez de "o que aconteceu entre 6h e 11h", "tudo o que aconteceu com este assunto".

## Ideia 5: seguir uma história

A última junta as anteriores. Um botão **"seguir"** no card, e eu passo a receber só as atualizações daquela história: novo veículo entrou, a história ganhou fôlego de novo, foi marcada como resolvida.

No Telegram isso é um comando. No app, um item em "Salvos". E no MCP seria uma ferramenta nova, algo como `follow_story`, para qualquer agente meu poder perguntar "o que mudou na história X desde ontem?" sem eu abrir o app. Essa última parte me anima, porque transforma o fast-news numa fonte para os outros agentes, e não só numa tela.

## Por onde eu começaria

Se eu tiver que escolher, a ordem é esta:

1. **Alerta de história que acelera.** Tem o melhor retorno por linha de código e eu uso todo dia.
2. **Manchetes lado a lado.** Os dados já estão na API, é quase só front.
3. **Quem não deu.** Precisa de um perfil de cobertura por fonte, que ainda não existe, mas sai do histórico.
4. **Seguir uma história.** Depende de estado por usuário, que hoje o fast-news não tem.
5. **Página permanente.** A mais bonita, e a que menos muda a minha rotina.

Repare que só uma das cinco precisa de LLM, e mesmo essa é opcional. Isso não é acaso. O fast-news já tem uma seção inteira de controle de custo: limite diário de relevância, de tradução e de TTS, e categorias de alto volume que pulam o modelo. A lição que eu venho tirando é que o modelo é bom para escrever e péssimo para contar. Contar fontes, medir velocidade e notar ausência são problemas de banco de dados.

Se alguma dessas ideias sair do papel, ela volta aqui como artigo, com o código e o que deu errado.

## Fontes

- [Repositório do fast-news](https://github.com/juninmd/fast-news)
- [README do fast-news: ingestão, histórias, temas em alta, canais de saída e controle de custo](https://github.com/juninmd/fast-news/blob/main/README.md)
- [Esquema do banco, tabela `news_stories`](https://github.com/juninmd/fast-news/blob/main/backend/src/database/schema.sql)
