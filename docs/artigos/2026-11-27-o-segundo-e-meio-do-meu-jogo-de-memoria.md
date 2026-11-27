---
title: "O segundo e meio que quebrou meu jogo de memória"
description: "No Gintama-Genius, a próxima rodada começa 1,5 segundo depois de você acertar a sequência. Nessa janela cabiam três bugs: rodada fantasma em cima do menu, timer parado para sempre e pontos de graça. O problema não era o tempo, era o estado mentindo."
date: 2026-11-27
categoria: artigos
tags: [gintama-genius, react, jogos, maquina-de-estados, timers, testes, agentes-de-ia]
status: publicado
ia: true
autoria: ia
autor: Antonio
fontes:
  - https://github.com/juninmd/Gintama-Genius
  - https://github.com/juninmd/Gintama-Genius/blob/master/README.md
  - https://github.com/juninmd/Gintama-Genius/commit/dd33f97
  - https://github.com/juninmd/Gintama-Genius/commit/c345e16
  - https://github.com/juninmd/Gintama-Genius/commit/a6dd243
  - https://github.com/juninmd/Gintama-Genius/commit/fff93b3
  - https://github.com/juninmd/Gintama-Genius/commit/f5306b8
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-27-o-segundo-e-meio-do-meu-jogo-de-memoria/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-27-o-segundo-e-meio-do-meu-jogo-de-memoria/roteiro.md
---

O [Gintama-Genius](https://github.com/juninmd/Gintama-Genius) é o meu Genius com cara de Gintama. Um tabuleiro circular com quatro fatias neon, o kanji 銀 girando no meio, e a regra de sempre: o jogo toca uma sequência de cores, você repete. Acertou, a sequência cresce. Tem combo, modo Fever depois de 10 acertos seguidos, conquistas e um cronômetro de 60 segundos no modo com tempo.

![Menu do Gintama-Genius no commit f5306b8, de 27/11/2026: título, seletores de nível e de tempo e o botão Iniciar Missão](/imagens/2026-11-27-o-segundo-e-meio-do-meu-jogo-de-memoria/ui-f5306b8.png)

É um projeto pequeno, e por isso mesmo eu achava que conhecia cada canto dele. Aí, entre 19 e 27 de novembro, entraram cinco correções no repositório, todas sobre tempo. Quando eu coloquei uma do lado da outra, três delas tinham o mesmo endereço: um intervalo de um segundo e meio que eu nunca tinha olhado com atenção.

## A janela

Quando você completa a sequência, o jogo não emenda a próxima rodada na hora. Ele mostra o feedback ("INCRÍVEL!", a mensagem do modo hardcore, essas coisas) e agenda a próxima rodada para 1,5 segundo depois, com um `setTimeout`. Nesse meio tempo a entrada fica travada, para ninguém clicar na fatia errada enquanto o jogo respira.

O detalhe que custou caro: durante essa pausa, o estado do jogo continuava sendo `WAITING_FOR_INPUT`. Para o resto do código, o jogo estava esperando o jogador. Na prática, ele estava esperando um timer.

## Bug 1: a rodada fantasma

O primeiro a aparecer foi o mais visível. Se você saísse para o menu, ou se o tempo acabasse, dentro desse segundo e meio, o `setTimeout` disparava mesmo assim. Ele mudava o estado de volta para `PLAYING_SEQUENCE` e tocava uma sequência por cima do menu ou da tela de game over.

A correção, de 20 de novembro, foi guardar o timeout numa ref (`nextRoundRef`), cancelar em `startGame` e, quando ele dispara, conferir se o jogo não está em `GAME_OVER` ou `IDLE` antes de seguir. O comentário que ficou no código resume: quitting or a time-out in that window must cancel it.

![Cartão do commit c345e16, de 20/11/2026: cancela a próxima rodada pendente ao sair ou quando o tempo acaba](/imagens/2026-11-27-o-segundo-e-meio-do-meu-jogo-de-memoria/c345e16.png)

Um `setTimeout` solto é uma promessa que ninguém lembra de desfazer. O jogo mudou de ideia, mas o timer não ficou sabendo.

## Bug 2: o timer que nunca mais voltava

Dois dias depois, a mesma janela, outro sintoma. Se você apertasse `Esc` para pausar naquele segundo e meio, o `togglePause` via `WAITING_FOR_INPUT`, achava legítimo, parava o cronômetro e abria o modal de pausa. Só que a rodada agendada continuava agendada. Ela rodava, trocava o estado para `PLAYING_SEQUENCE`, o que fechava o modal, e ninguém chamava `resumeTimer`. O cronômetro ficava parado pelo resto da partida.

Ou seja: um jogo com tempo virava, sem aviso, um jogo sem tempo. Ninguém ia reclamar disso jogando. É o tipo de bug que só aparece quando você pergunta "e se eu fizer isso exatamente agora?".

A correção expôs um `isNextRoundPending()` do motor do jogo e passou a ignorar a pausa enquanto a próxima rodada está pendente, do mesmo jeito que o jogo já ignorava a pausa durante a reprodução da sequência.

![Cartão do commit a6dd243, de 22/11/2026: ignora a pausa enquanto a próxima rodada começa, para o timer nunca ficar parado](/imagens/2026-11-27-o-segundo-e-meio-do-meu-jogo-de-memoria/a6dd243.png)

## Bug 3: pontos de graça

O terceiro é o meu favorito, porque é quase uma trapaça documentada. A validação da entrada devolve `'locked'` quando a entrada está travada. Só que o `handleColorClick` tocava o som antes de validar e, depois, não tratava o `'locked'`: o fluxo caía no mesmo caminho do acerto e chamava `addScore` e `incrementStreak`. Clicar sem parar durante o segundo e meio de trava rendia pontos e combo.

A correção, de 22 de novembro, são duas linhas: validar primeiro e sair se vier `'locked'`, antes de tocar qualquer som.

![Cartão do commit fff93b3, de 22/11/2026: ignora cliques durante a trava de entrada depois da rodada](/imagens/2026-11-27-o-segundo-e-meio-do-meu-jogo-de-memoria/fff93b3.png)

O commit trouxe um teste que clica cinco vezes com a entrada travada e exige que nada seja chamado. Rodei esse teste no commit anterior ao fix e no próprio fix, e a diferença é bem direta: antes, `addScore` foi chamado cinco vezes, uma por clique.

![Saída real do Vitest no Gintama-Genius: no commit anterior ao fff93b3 o teste falha porque addScore foi chamado 5 vezes; no fff93b3 os 2 testes passam](/imagens/2026-11-27-o-segundo-e-meio-do-meu-jogo-de-memoria/term-fff93b3.png)

## Os vizinhos da janela

As outras duas correções não moram exatamente no segundo e meio, mas são da mesma família: estado e tempo combinados do jeito errado.

Em 19 de novembro, o `useGameTimer` chamava o `onTimeUp` que ele tinha capturado quando o intervalo começou. Quando o tempo acabava, o handler de game over enxergava o placar e o combo do início, que eram zero. Como o histórico ignora placar menor ou igual a zero, partidas com tempo nunca entravam no histórico, e as conquistas eram conferidas contra zero. Clássico closure velho de React. Agora o fim do tempo é detectado num efeito que chama a versão mais recente do callback, uma vez só.

E hoje, 27 de novembro, entrou a última: começar uma partida nova mantinha o tempo que sobrou da anterior. O `startGame` troca o modo de tempo e já entra em `COUNTDOWN` no mesmo lote de atualizações, então o efeito que reseta o timer, que só olhava para `IDLE`, nunca rodava. A correção passou a resetar também em `COUNTDOWN` e fechou a issue #88.

![Cartão do commit f5306b8, de 27/11/2026: reseta o tempo quando uma partida nova começa, fecha a issue #88](/imagens/2026-11-27-o-segundo-e-meio-do-meu-jogo-de-memoria/f5306b8.png)

## O que eu aprendi com um Genius

Olhando os cinco juntos, nenhum deles é um erro de lógica do jogo. A regra do Genius está certa em todos os commits. O que estava errado era a forma como o código descrevia o momento em que estava.

**Estado que mente é pior que estado nenhum.** Três bugs vieram de um `WAITING_FOR_INPUT` que não estava esperando entrada. Cada parte do código que consultava o estado tomava uma decisão razoável com base numa informação falsa. As correções foram remendos honestos, cada um no seu lugar: uma ref para o timeout, um `isNextRoundPending`, um `return` no `'locked'`. Funcionam e têm teste. Mas o desenho que eu levaria para o próximo jogo é outro: se existe uma fase "entre rodadas", ela merece um nome na máquina de estados, e não um booleano escondido do lado.

**Todo timer precisa de um dono.** Quem agenda tem que saber cancelar. `setTimeout` sem referência guardada é dívida: funciona no caminho feliz e assombra todos os outros.

**Os bugs de tempo só aparecem quando alguém pergunta "e se for agora?".** Nenhum desses apareceu jogando normalmente. Eles apareceram quando alguém olhou o código perguntando o que acontece se o evento X chegar no meio do intervalo Y. Todos esses commits saíram de sessões com o Claude Code, e é exatamente esse tipo de pergunta chata e sistemática que funciona bem com um agente: ele não cansa de testar a borda. O resultado ficou registrado do jeito que eu gosto, um commit pequeno por bug, cada um com o teste que reproduz o problema.

Um segundo e meio parece pouco. Num jogo de reflexo, é tempo de sobra para cinco cliques, uma pausa e uma desistência. E, pelo visto, para três bugs.
