# Podcast: Apaguei os minigames do meu app de etanol ou gasolina

> **Aviso de IA (ler na abertura):** "Este episódio foi roteirizado por IA, a partir das minhas experiências reais com meus projetos, e revisado por outro agente de IA antes de ir ao ar."

Formato curto, um apresentador (Antonio). Duração estimada: 5 minutos.

## Abertura (0:00–0:30)

[Vinheta curta, som de bomba de combustível.]

Etanol dividido por gasolina. Deu menos de 0,7, vai de etanol. É uma pergunta de cinco segundos. Meu app para isso passou meses sem conseguir respondê-la, porque estava ocupado sendo um simulador de frentista.

## Como chegou lá (0:30–1:45)

De janeiro a outubro de 2026, um agente de IA, o Jules, fez 33 commits no app. Toda semana, uma ideia: conquistas, assistente de voz, Fuel Wrapped, preços "em tempo real" que eram mock. E minigames: Caragotchi, Roleta da Sorte, Frentista Simulator, Posto Tycoon, Detector de Cilada. Cada PR fazia sentido sozinho. Ninguém olhava o app inteiro.

## O build (1:45–2:45)

Quando fui gerar um build Android, o app fechava na abertura. Componente raiz não registrado, ícone que não existia, mapa que caía sem chave do Google. Consertei, vi rodando e decidi refazer do zero: saíram jogos, mocks, MobX, UI Kitten, navegação e mapas. Foram quase 58 mil linhas removidas.

## O que ficou (2:45–3:45)

Uma tela, com a média semanal da ANP para as 5.571 cidades. Sem pesquisa na sua cidade, usa a vizinha até 150 km e avisa. Sem preço válido, não inventa. E os bugs viraram outros: 4,9 dividido por 7 dá 0,7000000000000001, e um empate virava gasolina. A lista de postos e o cartão discordavam no mesmo caso.

## Fechamento (3:45–5:00)

App de utilidade não precisa me surpreender. Precisa responder rápido e não mentir. O agente fez o que agente sem objetivo faz: adicionou coisas. Dizer o que o app não é, isso é trabalho de dono. O histórico agora é chato de ler, e é o primeiro em que o app abre.
