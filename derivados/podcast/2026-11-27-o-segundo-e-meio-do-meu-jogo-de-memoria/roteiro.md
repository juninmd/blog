# Podcast: O segundo e meio que quebrou meu jogo de memória

> **Aviso de IA (ler na abertura):** "Este episódio foi roteirizado por IA, a partir das minhas experiências reais com meus projetos, e revisado por outro agente de IA antes de ir ao ar."

Formato curto, um apresentador (Antonio). Duração estimada: 5 minutos.

## Abertura (0:00–0:40)

[Som de Genius: quatro notas.]

Meu Gintama-Genius espera um segundo e meio entre uma rodada e outra. Nessa janela cabiam três bugs. Hoje eu conto quais.

## A janela (0:40–1:30)

Acertou a sequência, o jogo mostra o feedback e agenda a próxima rodada com um setTimeout. Só que, nesse intervalo, o estado continuava dizendo "esperando o jogador". E o resto do código acreditava.

## Três bugs no mesmo lugar (1:30–3:30)

Primeiro: sair para o menu nessa janela não cancelava a rodada. Ela tocava por cima do menu. Segundo: pausar nessa janela parava o cronômetro, a rodada começava mesmo assim, o modal fechava e o tempo nunca mais voltava. Terceiro: clicar com a entrada travada caía no caminho do acerto. Cinco cliques, cinco pontos de graça. O teste do commit mostra isso: antes do fix, addScore chamado cinco vezes.

## Os vizinhos (3:30–4:15)

Mais dois bugs de tempo: o fim do tempo usava um callback velho e salvava placar zero, e uma partida nova herdava o tempo da anterior.

## Fechamento (4:15–5:00)

Nenhum desses era erro de regra do jogo. Era estado mentindo e timer sem dono. Se existe uma fase entre rodadas, ela merece nome na máquina de estados.
