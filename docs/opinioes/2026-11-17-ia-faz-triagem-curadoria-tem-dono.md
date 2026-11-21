---
title: IA faz triagem. Curadoria tem dono.
description: Meus agentes chamam o que fazem de "curadoria com IA". Acho que o nome está errado, e o nome errado muda o que a gente espera deles.
date: 2026-11-17
categoria: opinioes
tags: [ia, curadoria, jornalismo-automatizado, fast-news, evo-agent]
status: publicado
ia: true
autor: Antonio
fontes:
  - https://github.com/juninmd/fast-news
  - https://github.com/juninmd/fast-news/blob/main/AGENTS.md
  - https://github.com/juninmd/evo-agent
  - https://github.com/juninmd/blog/blob/main/AGENTS.md
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-17-ia-faz-triagem-curadoria-tem-dono/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-17-ia-faz-triagem-curadoria-tem-dono/roteiro.md
---

> **Errata (21/11/2026):** a versão original deste texto dizia que o Antonio lê e aprova cada Pull Request antes do merge. Não é assim: a revisão dos posts é feita por outro agente de IA, especializado em revisar Pull Requests. O blog é 100% IA, inclusive na revisão. O argumento sobre triagem e curadoria continua, mas leia os trechos sobre "o meu aprovo" com essa correção em mente.

A primeira linha do README do fast-news diz: "Plataforma de curadoria de notícias com inteligência artificial". Fui eu que escrevi. E hoje eu acho que ela está errada.

Não porque o sistema funcione mal. Ele funciona. O que está errado é a palavra **curadoria**. O que meus agentes fazem é **triagem**. E essa diferença, que parece frescura de vocabulário, mudou a forma como eu monto os projetos e a forma como este blog funciona.

## O que os agentes fazem de verdade

O fast-news publica o boletim **O Fio** quatro vezes por dia: manhã, meio-dia, tarde e noite. Cada edição cobre uma janela de horas, junta as notícias de vários feeds, agrupa a mesma história publicada por veículos diferentes, traduz títulos em inglês e manda um resumo pelo Telegram com o link para o jornal completo. Desde 3 de outubro, o repositório já acumulou 152 edições.

O evo-agent vai além. Ele coleta de RSS, Google News, Hacker News, TabNews, GitHub Trending, Reddit e das release notes dos coding agents. Dá nota para cada item por recência, engajamento, autoridade da fonte, diversidade e evidência entre fontes. Escolhe as pautas, escreve três edições longas por dia e ainda reescreve o próprio prompt a partir do que leu, com versionamento e rollback.

Tudo isso é útil. Mas olha a lista de verbos: coletar, agrupar, pontuar, filtrar, traduzir, resumir, publicar. É uma esteira. Nenhum desses verbos é "decidir o que importa para alguém" nem "responder pelo que foi dito".

## Curadoria é escolha com assinatura

Para mim, curadoria tem duas partes que não dá para separar.

A primeira é **escolher com critério que dá para defender**. Não é o critério "recência vezes engajamento vezes autoridade". É o critério "eu acho que você precisa saber disso, e eu sei explicar por quê". Uma nota de 1 a 5 dada por um modelo é um sinal. Não é um critério.

A segunda é **ter dono**. Quando um curador erra, alguém responde. Pede desculpa, corrige, explica. Um pipeline não faz nada disso. Ele só roda de novo às 15h05.

O próprio fast-news deixa isso claro sem querer. O README admite, numa linha lá no fim, que "a priorização editorial auditada" ainda está pendente. E as regras do repositório dizem que as edições publicadas são imutáveis: o backend commita, ninguém altera. Do ponto de vista de engenharia, faz todo sentido. É um snapshot, é reprodutível, é auditável. Do ponto de vista editorial, significa que um erro publicado às 6h fica lá, e que a única "correção" possível é a próxima edição.

Isso não é curadoria. É um registro.

## O problema de chamar triagem de curadoria

Se fosse só nome, tudo bem. O problema é que o nome cria expectativa. Quando eu digo "curadoria com IA", eu prometo para o leitor (e para mim mesmo) que alguém olhou aquilo com cuidado. E eu passo a cobrar do modelo uma coisa que ele não tem como entregar: julgamento com responsabilidade.

Aí acontece um ciclo que eu conheço bem. O texto sai ruim, eu coloco mais uma regra no prompt. O texto sai ruim de outro jeito, eu coloco uma validação em código. Cada trava resolve um sintoma. Nenhuma resolve a causa, que é: **não tem ninguém no fim da linha dizendo "isso eu assino"**.

Não estou dizendo que as travas são inúteis. Validar número no título contra o corpo do texto é obrigatório, e eu faria de novo. Estou dizendo que travas melhoram a triagem. Elas não transformam triagem em curadoria.

## Onde eu coloco o humano

Minha posição é simples: **a IA pode fazer quase todo o trabalho, mas a última decisão tem que ter um nome**.

Quase todo mundo que discute isso cai em um de dois extremos. Um diz que IA não deveria escrever nada. O outro diz que revisão humana é gargalo e que o certo é automatizar até o fim. Eu acho os dois preguiçosos.

O primeiro ignora que a parte chata (ler duzentos feeds, achar a release note certa, juntar cinco links da mesma notícia) é exatamente onde a IA é melhor do que eu. O segundo confunde volume com valor. Quatro boletins por dia sem ninguém lendo não é um jornal. É um feed bonito.

O meio-termo que eu escolhi está no próprio fluxo deste blog:

1. Um agente escreve o post e os roteiros de podcast e vídeo.
2. Abre um Pull Request. O CI valida o frontmatter e faz o build.
3. **Eu leio.** Peço ajuste, recuso ou aprovo.
4. O merge na `main` é a publicação.

O merge é o meu nome. É ali que a triagem vira curadoria. E isso tem um custo real: o blog nunca vai publicar quatro vezes por dia, porque eu não leio quatro textos por dia com o cuidado que quero. Acho um preço justo. Escala sem assinatura é só ruído com boa formatação.

## O que eu vou mudar

Escrever isto me fez querer mexer em três coisas.

Primeiro, **o nome**. O fast-news vai continuar fazendo o que faz, mas a descrição deveria dizer "resumo e triagem de notícias com IA". É mais honesto e não promete o que o sistema não faz.

Segundo, **um lugar para corrigir**. Edição imutável é ótima para auditoria, mas o leitor precisa ver quando algo estava errado. Uma seção de erratas na edição seguinte já resolve boa parte, sem quebrar o snapshot.

Terceiro, **um ponto de revisão onde importa**. Não dá para eu ler quatro boletins por dia. Mas dá para eu revisar o que é opinião, análise ou tese, e deixar a esteira cuidando do que é só agregação. Saber separar uma coisa da outra já é um ato de curadoria.

## O selo no topo deste post

Todo texto daqui tem um selo dizendo "IA + revisão humana". Durante um tempo achei que era só transparência. Hoje acho que é mais do que isso: é a definição do produto. A IA faz a triagem, escreve o rascunho, sugere o roteiro. A curadoria é o meu aprovo.

E se um dia eu começar a dar merge sem ler, o selo vira mentira. A responsabilidade continua sendo minha.

## Fontes

- [fast-news: README, O Fio e as quatro janelas editoriais](https://github.com/juninmd/fast-news)
- [fast-news: regras do repositório (edições publicadas são imutáveis)](https://github.com/juninmd/fast-news/blob/main/AGENTS.md)
- [evo-agent: coleta, pontuação editorial e auto-aprimoramento do prompt](https://github.com/juninmd/evo-agent)
- [Instruções para os agentes que escrevem este blog](https://github.com/juninmd/blog/blob/main/AGENTS.md)
