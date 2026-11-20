---
title: "Dublei uma linha de 5.208. Essa foi a parte fácil"
description: "Clonei a voz do Poirot e fiz ele falar português numa prova de conceito para Murder on the Orient Express. Funcionou de primeira. Aí fui fazer as contas do resto e descobri que o problema nunca foi a voz."
date: 2026-11-20
categoria: artigos
tags: [motoe-ptbr-mod, dublagem, tts, clonagem-de-voz, unity, side-project]
status: publicado
ia: true
autoria: ia
autor: Antonio
fontes:
  - https://github.com/juninmd/motoe-ptbr-mod
  - https://github.com/juninmd/motoe-ptbr-mod/blob/main/README.md
  - https://github.com/juninmd/motoe-ptbr-mod/blob/main/PLANO-DUBLAGEM-PTBR.md
  - https://github.com/juninmd/motoe-ptbr-mod/commit/ad94b6c
  - https://github.com/juninmd/motoe-ptbr-mod/tree/main/staging/poc-line-01/take-01
  - https://github.com/juninmd/soul-reaver-ptbr-mod
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-20-dublei-uma-linha-de-5208/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-20-dublei-uma-linha-de-5208/roteiro.md
---

> _Come to Poirot, my exquisitely sculpted friend._

Essa é a linha `SND_VOI_COMMON_CoinComment_Poirot_2_EN` de **Agatha Christie: Murder on the Orient Express**, o jogo da Microids. Quatro segundos e meio de Hercule Poirot falando com uma moeda. Hoje, no meu computador, ela também existe assim:

> _Venha para o Poirot, meu amigo lindamente esculpido._

Com a voz do ator original. Em português. Gerada por um modelo de voz rodando na minha placa de vídeo.

Eu ouvi a comparação lado a lado, aprovei a voz, e por uns cinco minutos achei que o projeto estava praticamente pronto. Depois fiz as contas. Essa linha é **uma de 5.208**. E, olhando o plano inteiro, ela foi de longe a parte mais fácil.

## Por que esse jogo

O jogo é feito em Unity e já vem com o texto em português do Brasil. Legenda, menus, tudo traduzido. Mas a voz só existe em inglês, francês e alemão. Para quem quer jogar um jogo de detetive, que é basicamente gente conversando por horas, ler legenda o tempo todo cansa.

Eu já vinha brincando com dublagem por IA no [soul-reaver-ptbr-mod](https://github.com/juninmd/soul-reaver-ptbr-mod), meu projeto de dublagem brasileira para Legacy of Kain: Soul Reaver. Lá eu montei um ambiente com CUDA e o Qwen3-TTS que funcionava. A ideia do [motoe-ptbr-mod](https://github.com/juninmd/motoe-ptbr-mod) foi simples: reaproveitar esse ambiente, sem mexer em nada, e ver se ele aguentava um jogo muito maior.

E uma regra que eu deixei escrita desde o começo: **uso pessoal, sem redistribuição**. Clonar a voz de um ator para eu jogar em casa é uma coisa. Publicar um pacote com a voz dele é outra, e não vou fazer. O plano lista "direitos de voz" na tabela de riscos com exatamente essa mitigação. Outra regra: o jogo original nunca é modificado. Tudo é leitura, e qualquer teste de integração vai acontecer numa cópia.

## O reconhecimento

Antes de gerar qualquer áudio, passei um bom tempo só olhando. Com UnityPy, abri os bundles do jogo e fiz um inventário.

A primeira boa notícia: voz, música e efeitos estão em bundles separados. O bundle de voz em inglês tem 294 MB, a trilha fica em outro de 224 MB e os efeitos em outro de 124 MB. Isso quer dizer que a voz está isolada. Dublar significa trocar os clipes de voz, não remixar o áudio do jogo.

Os números que saíram dali:

- **5.208** clipes de voz, somando cerca de **5,5 horas** em inglês;
- duração mediana de 3,4 segundos, indo de 0,29 s a 23 s;
- **4.466** perfis de lip-sync amarrados a esses áudios;
- 43 bundles de personagem.

A segunda boa notícia foi a cadeia de mapeamento. O nome do clipe, tipo `SND_VOI_C07_DIAL02_2_EN`, tem um sufixo (`C07_DIAL02_2`) que leva à chave do texto (`STR_C07_DIAL02_2`), que leva às tabelas de string em inglês e em português. Juntando tudo, cheguei num catálogo que liga clipe, texto em inglês, texto oficial em pt-BR e duração para **5.206 dos 5.208 clipes**. A tradução já estava lá. Eu só precisava achar.

## A prova de conceito

Escolhi a linha do Poirot porque o nome dele estava na chave, então eu sabia com certeza quem falava. Extraí o WAV original, passei como referência para o modelo junto com a transcrição em inglês, e pedi para ele falar o texto oficial em português.

O resultado saiu com 3,52 segundos, contra 4,47 do original. Isso foi um alívio, porque o maior medo em dublagem é o português ficar mais comprido que o slot. Nessa linha sobrou folga (o plano avisa que isso precisa ser conferido linha por linha).

Para não depender só do meu ouvido, rodei o faster-whisper em português no áudio gerado. A transcrição bateu **idêntica** ao texto oficial, com probabilidade de idioma 1,0. Também registrei tudo que precisaria para repetir o take: hash da referência, hash da saída, seed `20261014`, temperatura 0,75, top-p 0,95. Se eu precisar refazer daqui a um ano, sei exatamente de onde veio.

Depois medi a vazão com doze linhas e o modelo carregado uma vez: **cerca de 10,8 segundos por linha** numa RTX 4060 Ti, com pico de pouco mais de 4 GB de VRAM. Multiplicando, a passada inteira daria umas 15,6 horas de GPU, ou umas 20 horas contando 25% de retrabalho.

Vinte horas. Uma noite e pouco de máquina ligada. Parecia que o projeto estava resolvido.

## Onde mora o problema de verdade

Aí fui montar o plano das fases seguintes e o desenho mudou.

O nome do Poirot estar na chave era sorte. Das 5.208 linhas, só umas **96** dizem quem fala no próprio nome: 48 do Poirot, 48 da Joanna e uma de um policial. As outras, cerca de 5.100, se chamam coisas como `C07_DIAL02_2`. Capítulo 7, diálogo 2, fala 2. De quem? Não diz.

E sem saber quem fala, não tem como escolher a voz de referência. Clonar a voz é um comando. Saber **qual** voz usar em cada linha é o projeto inteiro.

No plano isso virou a fase 3, marcada como gargalo, com estimativa de **2 a 10 dias**. A geração em GPU, a parte que eu achava que seria difícil, ficou com "cerca de 1 dia, automático". A ordem de ataque que eu registrei é:

1. procurar dados de cena e cutscene nos bundles de level, que podem dizer qual personagem toca qual áudio;
2. olhar os perfis de lip-sync, que estão ligados a GameObjects e talvez apontem o personagem;
3. só por último, diarização por similaridade de voz, com nomeação assistida.

E isso nem é tudo que vem depois da POC. Tem a escolha de uma referência limpa por personagem do elenco principal (umas 20 a 25 vozes). Tem os 4.466 perfis de lip-sync, que foram feitos para o áudio em inglês, e eu ainda preciso decidir entre regenerar ou aceitar boca parada nas falas afetadas. Tem reconstruir os bundles Addressables e testar numa cópia do jogo. Tem uma revisão de pronúncia de nomes como Ratchett, Bouc, Andrenyi e Dragomiroff, que modelo de voz adora estragar.

A estimativa total ficou em 2 a 4 semanas de trabalho focado, ou 2 a 3 meses no modo fim de semana. A GPU é o item mais barato da lista.

## O que eu levo disso

Eu já tinha visto esse padrão em outros projetos, mas aqui ele ficou bem nítido.

**A demo mais impressionante costuma ser o pedaço mais fácil.** Ouvir o Poirot falando português é o tipo de coisa que dá vontade de mostrar para todo mundo. Mas a parte que vai decidir se isso vira dublagem de verdade é um problema de dados sem graça nenhuma: descobrir quem fala o quê.

**Medir antes de prometer.** Se eu não tivesse rodado o benchmark e montado o catálogo, ia achar que o gargalo era GPU. Os números mostraram que a máquina resolve em uma noite. O que não se resolve sozinho é o mapeamento.

**Escrever o estado real.** O README diz com todas as letras que a POC cobre 1 linha de 5.208 e que não existe versão jogável dublada. Prefiro assim. Um repositório que promete um mod pronto e entrega uma linha é pior do que um que entrega uma linha e diz que é uma linha.

A próxima decisão do plano é se a primeira onda começa pelas 96 linhas que já têm dono. Provavelmente sim. É pouco, mas é o tipo de pouco que dá para terminar.

## Fontes

- [Repositório do motoe-ptbr-mod](https://github.com/juninmd/motoe-ptbr-mod) e [README](https://github.com/juninmd/motoe-ptbr-mod/blob/main/README.md) (estado atual, números do reconhecimento, POC e vazão)
- [PLANO-DUBLAGEM-PTBR.md](https://github.com/juninmd/motoe-ptbr-mod/blob/main/PLANO-DUBLAGEM-PTBR.md) (fases, estimativas, riscos e decisões pendentes)
- [Commit da POC: recon, scripts, catálogo e take-01](https://github.com/juninmd/motoe-ptbr-mod/commit/ad94b6c)
- [Take-01: metadados e verificação ASR](https://github.com/juninmd/motoe-ptbr-mod/tree/main/staging/poc-line-01/take-01)
- [soul-reaver-ptbr-mod](https://github.com/juninmd/soul-reaver-ptbr-mod) (de onde veio o ambiente de voz reaproveitado)
