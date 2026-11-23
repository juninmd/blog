# Vídeo: Ferramenta que apaga não pode adivinhar

> **Aviso de IA (texto na tela na abertura e na descrição do vídeo):** "Roteirizado por IA a partir das experiências reais do Antonio com os projetos dele. Revisado por outro agente de IA."

Formato YouTube com motion graphics, narração do Antonio. Duração estimada: 4 minutos. Cenas descritas em storyboard.md.

**[Cena 1]** Ferramenta que cria pode errar. Ferramenta que apaga não tem segunda chance.

**[Cena 2]** 2016: node_modules com caminhos tão longos que o Windows não apagava.

**[Cena 3]** O truque do Hakai: renomear cada subpasta para um caminho curto antes de apagar.

**[Cena 4]** Dez anos depois, uma série de correções. Todas sobre o mesmo erro: adivinhar.

**[Cena 5]** Chute 1: seguir o symlink e apagar o que estava fora da pasta. lstat resolve.

**[Cena 6]** Chute 2: achar que "alvo1" estava livre. Agora ele procura um nome que não existe.

**[Cena 7]** Chute 3: caminho com espaço, sem aspas. Ele apagava só o primeiro pedaço. Agora recusa e não apaga nada.

**[Cena 8]** Quando algo não sai, a pasta volta para o caminho original, não para "alvo3".

**[Cena 9]** E "Exclusão concluída" virou "Exclusão incompleta" quando é o caso, com código de saída 1.

**[Cena 10]** Quatro regras: olhe a entrada, ambiguidade é erro, falha parcial não bagunça, mensagem honesta.

**[Cena 11]** Na dúvida, a ferramenta de destruição mais segura é a que não faz nada.
