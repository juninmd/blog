# Podcast: Canto, o widget de canto de tela que virou quase um sistema operacional

Formato curto, um apresentador (Antonio). Duração estimada: 5 minutos.

## Abertura (0:00–0:30)

[Vinheta curta]

Eu tinha cinco apps abertos só para não perder reunião e PR. Em setembro comecei um widget pequeno, preso no canto da tela. Dois meses e 474 commits depois, ele tem aba de Steam, previsão do tempo e um servidor MCP. Hoje eu conto o que deu certo e o que eu ainda não sei se deu.

## Bloco 1: leve e cifrado (0:30–1:45)

Escolhi Tauri em vez de Electron. Instalador de 3,5 megas, e o processo Rust usa uns 6 megas de memória; o resto é a webview do sistema.

Tudo é cifrado desde o primeiro commit: Argon2id para a chave, AES-256-GCM para os dados, chave só na RAM. Sincronizar foi mais difícil: tive que lidar até com máquina de relógio adiantado.

## Bloco 2: a senha de quatro dígitos (1:45–2:45)

No segundo PR eu baixei a senha mínima de oito para quatro caracteres. Conveniência. Mas escrevi o custo na documentação: o arquivo cifrado sai da máquina em todo backup, então a senha é atacável offline. Dez mil combinações. Você pode escolher o lado fraco de um trade-off, desde que escreva qual é.

## Bloco 3: a webview dormiu (2:45–3:45)

No macOS, o aviso de reunião não chegava. O timer rodava dentro da webview, e o sistema suspende a webview quando a janela está escondida. Passei o alerta para uma thread em Rust. Lição: a webview é para desenhar, não para cuidar do tempo.

## Bloco 4: o widget cresceu (3:45–4:40)

Mais de 300 commits têm o Claude como autor ou coautor. Com um agente, "e se tivesse também..." custa quase nada. Manter continua custando. Minha defesa: toda aba nova nasce desligada. E o servidor MCP fechou o ciclo: agora meus agentes leem minha agenda.

## Fechamento (4:40–5:00)

Três frases: escreva o trade-off ruim; o que depende do relógio mora no nativo; feature nova nasce desligada. Quando parar? Ainda não sei. O texto completo está no blog.
