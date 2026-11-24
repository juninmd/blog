---
title: "Canto: o widget de canto de tela que virou quase um sistema operacional"
description: "474 commits em pouco mais de dois meses, um cofre cifrado em Rust, alertas que a webview dormia e perdia, e a pergunta que ainda não respondi: quando parar de adicionar abas."
date: 2026-11-17
categoria: artigos
tags: [canto-widget, tauri, rust, seguranca, produtividade, side-project]
status: publicado
ia: true
autor: Antonio
fontes:
  - https://github.com/juninmd/canto-widget
  - https://github.com/juninmd/canto-widget/commit/2d749392
  - https://github.com/juninmd/canto-widget/commit/2d749392
  - https://github.com/juninmd/canto-widget/commit/39450758
  - https://github.com/juninmd/canto-widget/commit/ac80725f
  - https://github.com/juninmd/canto-widget/commit/80f63a79
  - https://github.com/juninmd/canto-widget/commit/69a48855
  - https://github.com/juninmd/canto-widget/commit/a0350c43
  - https://github.com/juninmd/canto-widget/commit/5ccbe7a7
  - https://github.com/juninmd/canto-widget/blob/main/docs/seguranca.md
  - https://github.com/juninmd/canto-widget/blob/main/docs/benchmark.md
  - https://github.com/juninmd/canto-widget/blob/main/CHANGELOG.md
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-17-o-widget-de-canto-que-cresceu/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-17-o-widget-de-canto-que-cresceu/roteiro.md
---

O problema era simples. Eu vivo entre reuniões, pull requests e pendências pequenas, e para dar conta disso eu tinha cinco apps abertos: o to-do, as notas, a agenda, o GitHub numa aba e algum gerenciador de clipboard. Toda vez que uma reunião começava eu descobria um minuto atrasado, porque a aba da agenda estava enterrada atrás de outras vinte.

Em 9 de setembro de 2026 eu fiz o primeiro commit do **Canto**: uma janelinha presa no canto da tela, que aparece com `Ctrl+Alt+Space` e some quando não preciso dela. Tarefas com lembrete, notas, clipboard, agenda com aviso de reunião e meus PRs. Tudo cifrado, na minha máquina, sem conta e sem servidor.

Hoje, 17 de novembro, o repositório tem 474 commits. E o "widget pequeno" tem aba de Steam, previsão do tempo com chuva desenhada em canvas, mapa de trânsito, leitor de RSS, Gmail, Drive, contatos e um servidor MCP. Este texto é sobre as decisões que deram certo e sobre essa outra coisa, que eu ainda não sei se deu.

## Tauri, não Electron

A primeira decisão foi a base. Um widget que fica aberto o dia inteiro não pode pesar como um navegador inteiro. Fui de **Tauri v2**: o núcleo em Rust, a interface em React usando a webview do próprio sistema.

Eu medi, e os números estão no [benchmark do repositório](https://github.com/juninmd/canto-widget/blob/main/docs/benchmark.md): o instalador NSIS tem **3,5 MB** e, com o widget aberto e parado, a árvore de processos soma uns 185 MB de memória privada. Desses, só 6,6 MB são do processo Rust. O resto é o WebView2 do Windows. Para comparar, o fórum do Joplin, que é Electron, relata de 250 a 800 MB. Não é uma comparação de laboratório, e o documento diz isso, mas dá a ordem de grandeza.

## O cofre

A segunda decisão foi que tudo seria cifrado desde o primeiro commit, não "depois". O cofre usa **Argon2id** para derivar a chave da senha mestra e **AES-256-GCM** para cifrar, com nonce novo a cada gravação. A chave só existe em RAM enquanto o cofre está destrancado e é zerada ao trancar. A gravação vai para um arquivo temporário com `fsync` antes do `rename`, então uma queda de energia não deixa o cofre pela metade.

O primeiro commit já se chamava "cofre cifrado e sync zero-knowledge no Drive". Onze dias depois veio a [pasta sincronizada com merge automático](https://github.com/juninmd/canto-widget/commit/a0350c43): o Canto grava um arquivo cifrado numa pasta, e Dropbox, OneDrive ou Syncthing fazem o resto. Os commits dos dias seguintes mostram que sincronizar é sempre mais difícil do que parece: "convergir em empates e sobreviver a um relógio adiantado", "manter um item apagado quando o carimbo veio de um relógio adiantado". Relógio errado em uma das máquinas é o tipo de bug que você só descobre usando.

## A senha de quatro caracteres

Aqui está a decisão de que mais gosto, justamente porque é questionável. No [segundo PR](https://github.com/juninmd/canto-widget/commit/ac80725f) eu baixei o mínimo da senha mestra de 8 para **4 caracteres**. Por conveniência: eu destranco esse cofre muitas vezes por dia.

O que eu não quis foi esconder o custo. O commit e a [documentação de segurança](https://github.com/juninmd/canto-widget/blob/main/docs/seguranca.md) dizem com todas as letras: o envelope cifrado fica em disco e sai da máquina em todo backup, então a senha é atacável offline. Nenhum limite de tentativas ajuda, e o Argon2id encarece cada palpite, não o total deles. Com quatro dígitos são dez mil combinações. É uma troca consciente de resistência por conveniência, registrada no lugar onde quem usa vai ler.

Acho que essa é a postura certa para um projeto pessoal: você pode escolher o lado fraco de um trade-off, desde que escreva qual é.

## O dia em que a webview dormiu

O bug mais instrutivo foi no macOS. O aviso de "reunião começando" simplesmente não chegava. O alerta rodava num `setInterval` dentro da webview, e o WKWebView suspende timers quando a janela está escondida na bandeja. O App Nap ainda atrasa o que sobra. Ou seja: o recurso principal do app, me avisar da reunião, não funcionava justamente quando o app estava fazendo o que deveria, ficar escondido.

A [correção](https://github.com/juninmd/canto-widget/commit/80f63a79) foi tirar a responsabilidade da interface. Uma thread em Rust confere a agenda a cada 20 segundos e abre o alerta, compartilhando com a UI o conjunto de ids já avisados para nunca tocar duas vezes. No mesmo dia, [os lembretes de tarefas](https://github.com/juninmd/canto-widget/commit/69a48855) passaram pelo mesmo caminho.

A lição vale para qualquer app Tauri ou Electron: a webview é para desenhar, não para cuidar do tempo. Qualquer coisa que precisa acontecer numa hora certa mora no processo nativo.

## Nenhuma origem remota

Outra regra que segurei até o fim: a CSP da janela não permite nenhuma origem remota. Mas o app mostra avatar do GitHub, capa de jogo da Steam, miniatura de RSS, ícone de repositório. A saída foi baixar tudo em Rust e entregar para a janela como `data:` URL. Dá mais trabalho, e cada aba nova tem que seguir a regra, mas significa que a interface nunca fala com um servidor de fora por conta própria.

## E aí o widget cresceu

Agora a parte honesta. Olhando o [CHANGELOG](https://github.com/juninmd/canto-widget/blob/main/CHANGELOG.md), o Canto tem hoje: tarefas com timer de foco e lembrete por contexto ("quando eu abrir o Slack"), notas com editor WYSIWYG, clipboard, agenda com detecção de conflito, GitHub e GitLab, Steam com sete sub-abas, clima, trânsito pela TomTom, RSS, Gmail, Drive, contatos, Google Tasks, uma lista de CLIs de agentes de código, um mini-dashboard na borda da tela e interface em 42 idiomas. São mais de cem mil linhas entre TypeScript e Rust.

Parte disso veio de um jeito específico de trabalhar: mais de 300 dos 474 commits citam o Claude, como autor ou coautor. Com um agente que implementa rápido, o custo de "e se tivesse também..." cai quase a zero. O custo de manter não cai.

Eu tomei duas providências para isso não virar bagunça. A primeira: quase toda aba nova nasce **desligada**, a um checkbox de distância nos Ajustes. Steam, clima, trânsito, RSS, contatos, agentes. Quem instala o Canto vê o widget de tarefas e agenda que eu tinha imaginado em setembro. A segunda: cada feature vive na sua pasta, e o CI roda lint, testes, e2e, clippy e `cargo test` em três sistemas operacionais em todo PR. O repositório tem um `AGENTS.md` dizendo exatamente isso para qualquer agente que for mexer nele.

Dá para ver as duas coisas rodando a interface de cada commit no Chromium, com o mock do Tauri que o próprio repositório usa nos testes e2e (sem nenhum dado meu). No primeiro commit ([2d749392](https://github.com/juninmd/canto-widget/commit/2d749392), 09/09/2026), as seis abas ficavam todas à vista:

![Print da interface do Canto no primeiro commit, 2d749392: janela escura com as abas Tarefas, Notas, Clipboard, Reunioes, Agenda e Sync, campo "nova tarefa de hoje" e o texto "nada para hoje ainda"](/imagens/2026-11-17-o-widget-de-canto-que-cresceu/ui-2d749392.png)

Hoje (commit 39450758, 24/11/2026), quem abre pela primeira vez vê cinco abas e um menu "mais". O resto fica desligado até alguém ligar nos Ajustes:

![Print da interface atual do Canto, commit 39450758: abas Tarefas, Notas, Clipboard, Agenda e GitHub, menu "mais" aberto com Modelos IA e Ajustes, campo de nova tarefa com atalhos de hora e prioridade e filtros Todas, Alta, Média e Baixa](/imagens/2026-11-17-o-widget-de-canto-que-cresceu/ui-39450758.png)

Ainda assim, uma aba de Steam num app de produtividade é difícil de defender. Eu uso? Uso. Ela devia estar ali? Não sei.

## O servidor MCP

A adição mais recente diz muito sobre para onde isso foi. Em 15 de novembro o Canto ganhou um [servidor MCP local](https://github.com/juninmd/canto-widget/commit/5ccbe7a7): agentes como Claude Code, Codex ou Gemini CLI podem ler minhas tarefas, minha agenda e meus PRs. Só aceita conexão de `127.0.0.1`, exige token gerado no app, só responde com o cofre destrancado e cada recurso tem sua chave. Notas, clipboard, Gmail e qualquer escrita começam desligados.

O widget que nasceu para eu não perder reunião virou um contexto que meus agentes consultam. Faz sentido: se os agentes ajudaram a escrever o Canto, que pelo menos saibam o que eu tenho para fazer hoje.

## O que fica

Se eu tivesse que resumir dois meses de Canto em três frases:

1. **Escreva o trade-off ruim junto da escolha.** A senha de quatro dígitos é aceitável porque está documentada.
2. **O que depende do relógio mora no nativo.** Webview escondida dorme.
3. **Feature nova nasce desligada.** É a única defesa que encontrei contra o próprio entusiasmo.

A pergunta que fica aberta é a de quando parar. Ainda não tenho a resposta. Por enquanto, o canto da tela continua me avisando da reunião um minuto antes, e isso era tudo o que eu queria em setembro.
