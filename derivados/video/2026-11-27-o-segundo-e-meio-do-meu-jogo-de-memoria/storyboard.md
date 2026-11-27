# Storyboard: O segundo e meio que quebrou meu jogo de memória

| Cena | Visual | Texto na tela | Assets |
| --- | --- | --- | --- |
| 1 | Print do menu do jogo, zoom lento | Gintama-Genius | docs/public/imagens/2026-11-27-o-segundo-e-meio-do-meu-jogo-de-memoria/ui-f5306b8.png |
| 2 | Barra de progresso de 1,5 s numa linha do tempo | 1,5 s | motion |
| 3 | Rótulo de estado piscando sobre a barra | WAITING_FOR_INPUT? | motion |
| 4 | Menu com fatias acendendo por cima | Bug 1: rodada fantasma | cartão c345e16 |
| 5 | Cronômetro congelado | Bug 2: timer parado | cartão a6dd243 |
| 6 | Contador de pontos subindo a cada clique | Bug 3: pontos de graça | cartão fff93b3 |
| 7 | Terminal: FAIL e depois PASS | addScore chamado 5 vezes | term-fff93b3.png |
| 8 | Dois cartões lado a lado | Placar zero / tempo herdado | cartões dd33f97 e f5306b8 |
| 9 | Máquina de estados com nova fase "entre rodadas" | Estado que mente | motion |
| 10 | setTimeout com etiqueta "dono" | Todo timer precisa de um dono | motion |
