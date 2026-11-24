---
title: "Apaguei os minigames do meu app de etanol ou gasolina"
description: "Durante nove meses um agente de IA adicionou um minigame por semana ao meu app de combustível. Ele abria e fechava no Android. Apaguei quase 58 mil linhas e ele finalmente passou a responder a única pergunta que importa."
date: 2026-11-24
categoria: opinioes
tags: [etanol-gasolina, react-native, expo, anp, agentes-de-ia, side-project]
status: publicado
ia: true
autoria: ia
autor: Antonio
fontes:
  - https://github.com/juninmd/etanol-gasolina
  - https://github.com/juninmd/etanol-gasolina/blob/master/README.md
  - https://github.com/juninmd/etanol-gasolina/commit/4080052
  - https://github.com/juninmd/etanol-gasolina/commit/a5eccbe
  - https://github.com/juninmd/etanol-gasolina/commit/252c545
  - https://github.com/juninmd/etanol-gasolina/commit/dea41de
  - https://github.com/juninmd/etanol-gasolina/commit/b22d0f3
  - https://github.com/juninmd/etanol-gasolina/commit/31a5574
  - https://github.com/juninmd/etanol-gasolina/commit/c1fc7be
  - https://github.com/juninmd/etanol-gasolina/commit/7c3467d
  - https://github.com/juninmd/etanol-gasolina/commit/2a47ea7
  - https://github.com/juninmd/etanol-gasolina/blob/master/AGENTS.md
  - https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-24-apaguei-os-minigames-do-meu-app/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-24-apaguei-os-minigames-do-meu-app/roteiro.md
---

Quem tem carro flex no Brasil faz a mesma conta de cabeça na frente da bomba: divide o preço do etanol pelo da gasolina e vê se deu menos de 0,7. É uma pergunta de cinco segundos. Eu tenho um app para isso, o [etanol-gasolina](https://github.com/juninmd/etanol-gasolina), e por boa parte de 2026 ele era péssimo em respondê-la.

Não porque a conta estivesse errada. Porque ela estava enterrada embaixo de um simulador de frentista.

## Como um app de uma pergunta ganhou um Tycoon

O histórico do repositório conta a história melhor do que eu. Entre o fim de janeiro e outubro de 2026, a maior parte dos commits veio de um agente de IA, o Jules, do Google: são 33 commits assinados pelo bot nesse intervalo. Eu tinha deixado ele com liberdade para propor melhorias, e ele propôs. Toda semana.

A lista de features que entraram nesse período parece cardápio de parque de diversões: "Market Insights", sistema de conquistas e badges, "Fuel Guru" com tendência de preço, assistente de voz, desafios diários, "Fuel Wrapped", modo bicicleta, scanner de nota fiscal com IA e "preços em tempo real" que eram, como o próprio commit dizia, mock. Depois vieram os minigames: Caragotchi, Churrascômetro, Roleta da Sorte, Batalha de Postos, trivia, Frentista Simulator, Posto Tycoon (com badge para quem passasse de R$ 2.000 de lucro), Bola de Cristal, Pé na Tábua, Calculadora de Rolê e, em outubro, o "Detector de Cilada", um modal que analisava com humor a empurroterapia do frentista.

![Commit 7c3467d do etanol-gasolina, de 23/08/2026: o bot Jules adiciona o minigame Posto Tycoon, com 479 linhas só no componente do modal](/imagens/2026-11-24-apaguei-os-minigames-do-meu-app/7c3467d.png)

Cada um desses PRs, isolado, fazia sentido. Tinha descrição, tinha componente, integrava na home nativa e na home web. Alguns até corrigiam lint de passagem. Se eu avaliasse PR por PR, aprovaria quase todos. Esse é o problema: ninguém estava avaliando o app, só os PRs.

## O dia em que olhei o app inteiro

No fim de outubro sentei para gerar um build Android de verdade. O que eu encontrei está registrado no PR [#83](https://github.com/juninmd/etanol-gasolina/commit/4080052), e não é bonito:

- o app fechava na abertura com `main has not been registered`, porque o componente raiz nunca tinha sido registrado com o nome que o Android esperava;
- um ícone usado na home, `bicycle-outline`, não existia no pacote de ícones;
- o `MapView` derrubava o app quando não havia chave do Google Maps;
- na web, um modal de minigame era usado sem ser importado.

Ou seja: depois de meses de features, o app não abria. E os preços que ele mostrava, na parte que funcionava, não vinham de lugar nenhum de verdade.

Primeiro consertei o que dava para consertar, porque eu queria saber se o caminho era salvar o app. Depois de vê-lo rodando, a resposta ficou óbvia. O último commit do PR se chama "refaz o app do zero, simples e com preços reais da ANP", e a lista do que saiu é curta e brutal: jogos, mocks, MobX, UI Kitten, navegação, mapas e arquivos gerados. O diff do PR fechou com 4.962 linhas adicionadas e 57.793 removidas.

![Commit 4080052, de 27/10/2026: "refaz o app do zero, simples e com preços reais da ANP", 226 arquivos, +4.962 e −57.793 linhas](/imagens/2026-11-24-apaguei-os-minigames-do-meu-app/4080052.png)

## O que ficou

Ficou uma tela. Você escolhe estado e cidade, os campos vêm preenchidos com a média de revenda da semana publicada pela ANP, e o app diz qual combustível compensa. Se você informar o consumo do carro nos dois combustíveis, ele troca a regra dos 70% pelo custo por quilômetro. Embaixo, até dez postos da cidade, ordenados pelo custo efetivo.

O trabalho que importava foi para os dados, não para a tela. Um script baixa as planilhas semanais da ANP, converte estados, regiões, municípios e postos em JSON e grava um histórico semanal em SQLite ([#86](https://github.com/juninmd/etanol-gasolina/commit/c1fc7be)). Um workflow roda todo dia e só commita quando a ANP publicou algo novo. A lista de municípios vem do IBGE, todas as 5.571 cidades, e quando a ANP não pesquisou a sua na semana o app usa a cidade pesquisada mais próxima do mesmo estado, até 150 km, e avisa na tela que aquilo é estimativa.

Esse aviso é a feature de que mais gosto, e ela não tem nada de divertido. O app novo nunca inventa preço. Se não há dois preços válidos, o resultado é nulo e a tela pede os valores. É o oposto exato do mock de "preços em tempo real".

## Os bugs que valiam a pena

Com o app reduzido a uma conta, os bugs que sobraram ficaram interessantes, porque todos eram sobre honestidade da resposta:

- **0,7 não é 0,7.** Em ponto flutuante, `4.9 / 7.0` dá `0.7000000000000001`. Um empate exato nos 70% virava recomendação de gasolina em vez de "tanto faz" ([#82](https://github.com/juninmd/etanol-gasolina/commit/a5eccbe)). A comparação passou a usar uma tolerância de `1e-9`.

![Commit a5eccbe: tolerância de ponto flutuante nos empates da regra dos 70% e do custo por km](/imagens/2026-11-24-apaguei-os-minigames-do-meu-app/a5eccbe.png)
- **Economia de -0,0%.** A própria tolerância fazia o cartão dizer "Abasteça com etanol" com economia negativa no empate. Virou empate de verdade na tela ([#107](https://github.com/juninmd/etanol-gasolina/commit/252c545)).
- **Duas respostas para a mesma conta.** A lista de postos comparava sem a tolerância e o cartão comparava com ela. Num caso como 3,00 e 2,10, a lista dizia gasolina e o cartão dizia etanol. Agora as duas usam a mesma função ([#108](https://github.com/juninmd/etanol-gasolina/commit/dea41de)).
- **O app apagando o que você digitou.** A carga online dos preços tem timeout de 8 segundos; se você digitasse antes dela terminar, o preenchimento automático sobrescrevia seu valor ([#101](https://github.com/juninmd/etanol-gasolina/commit/b22d0f3)).
- **Consumo ignorado em silêncio.** Com só um dos dois km/l preenchidos, o app voltava para a regra dos 70% sem dizer nada, e a pessoa achava que o consumo dela tinha sido usado. Agora a tela explica ([#106](https://github.com/juninmd/etanol-gasolina/commit/31a5574)).

Nenhum desses bugs teria aparecido no app antigo. Não porque ele fosse melhor, mas porque ninguém olharia para a terceira casa decimal de uma razão no meio de um Posto Tycoon.

## A minha opinião

Um app de utilidade não precisa me surpreender. Ele precisa me responder rápido e não mentir. Cada minigame era um pedido de atenção para algo que não era a pergunta, e cada pedido de atenção era código que ninguém testava no aparelho.

Não culpo o agente. Ele fez exatamente o que um agente sem objetivo claro faz: adicionou coisas. Gerar feature é barato, e um bot que abre um PR por semana sempre vai ter mais uma ideia simpática. O que faltou foi alguém dizendo o que o app *não* era. Isso é trabalho de dono, não de quem escreve código, humano ou não.

Hoje o `AGENTS.md` desse repositório diz o contrário de "me surpreenda": o app é uma tela só, sem biblioteca de estado nem de UI; "implemente só o que foi pedido"; preços são médias reais da ANP e nunca podem ser inventados ou simulados; e uma correção de bug começa com um teste que reproduz o bug. As últimas semanas de commits são correções pequenas de empate, rótulo e acessibilidade. É um histórico muito mais chato de ler. E é o primeiro em que o app abre.

O README tem até uma seção de limitações, que diz coisas como "preço médio não é preço de bomba" e "o release Android usa a keystore de debug". Eu prefiro mil vezes um app que lista o que ele não faz a um que tem badge de Tycoon Master.
