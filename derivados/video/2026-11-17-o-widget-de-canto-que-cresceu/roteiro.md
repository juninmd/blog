# Vídeo: Canto, o widget que virou quase um sistema operacional

Formato YouTube com motion graphics, narração do Antonio. Duração estimada: 6 minutos. Cenas descritas em storyboard.md.

**[Cena 1]** Cinco apps abertos e uma reunião começando. Eu descobria sempre um minuto atrasado.

**[Cena 2]** Então, em 9 de setembro, comecei o Canto: uma janelinha no canto da tela, com tarefas, notas, agenda e PRs. Tudo cifrado, sem conta, sem servidor.

**[Cena 3]** Tauri em vez de Electron. Instalador de 3,5 megas. O processo Rust usa 6,6 megas; o resto é a webview do sistema.

**[Cena 4]** O cofre: Argon2id deriva a chave da senha, AES-256-GCM cifra, e a chave só existe na memória enquanto o cofre está aberto.

**[Cena 5]** E aí a decisão polêmica: senha mínima de quatro caracteres. Por conveniência. Com o custo escrito: dez mil combinações, atacáveis offline.

**[Cena 6]** O bug do macOS: o aviso de reunião rodava dentro da webview, e a webview escondida dorme. O alerta nunca chegava.

**[Cena 7]** A correção: uma thread em Rust olha a agenda a cada 20 segundos. O que depende do relógio mora no nativo.

**[Cena 8]** A regra da janela: nenhuma origem remota. Avatar, capa de jogo, miniatura, tudo baixado em Rust e entregue como data URL.

**[Cena 9]** E o widget cresceu. Steam, clima, trânsito, RSS, Gmail, 42 idiomas. 474 commits, mais de 300 com o Claude.

**[Cena 10]** A defesa: toda aba nova nasce desligada.

**[Cena 11]** Por último, um servidor MCP: meus agentes agora leem minha agenda, só pelo localhost, com token.

**[Cena 12]** Três lições. E uma pergunta aberta: quando parar? Por enquanto, o canto da tela continua me avisando da reunião.
