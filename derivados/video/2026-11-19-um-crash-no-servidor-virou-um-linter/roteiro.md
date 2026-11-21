# Vídeo: Um crash no meu servidor de CS 1.6 virou um linter

> **Aviso de IA (texto na tela na abertura e na descrição do vídeo):** "Roteirizado por IA a partir das experiências reais do Antonio com os projetos dele. Revisado por outro agente de IA."

Formato YouTube com motion graphics, narração do Antonio. Duração estimada: 6 minutos. Cenas descritas em storyboard.md.

**[Cena 1]** Meu servidor de CS 1.6 caiu. Três vezes. Pelo mesmo erro.

**[Cena 2]** É um servidor de Zombie Plague, com plugins escritos em Pawn, uma linguagem de script dos anos 2000.

**[Cena 3]** O culpado: get_tr2 sem o terceiro parâmetro. O compilador aceita. O plugin carrega.

**[Cena 4]** Em jogo, ela escreve num endereço qualquer da memória. SIGSEGV. Todo mundo desconectado.

**[Cena 5]** Três modos de jogo com o mesmo bug. Corrigi os três. Mas quantos outros existiam?

**[Cena 6]** Então o crash virou regra no zplint, meu linter em Rust: tr2_missing_byref, marcada como erro.

**[Cena 7]** O zplint começou com 27 detectores. Hoje são 165 regras, formatter, LSP e até compilador.

**[Cena 8]** Regra só entra com fonte primária: include oficial, documentação ou código do AMX Mod X.

**[Cena 9]** E passa por dois corpora: plugins oficiais com zero erros, e mais de mil plugins da comunidade.

**[Cena 10]** Num repositório real, quatro falsos positivos. O código se protegia de jeitos que a regra não conhecia.

**[Cena 11]** O compilador zpc nasceu de um teste diferencial contra o amxxpc oficial. Toda divergência registrada.

**[Cena 12]** O que fica: crash é especificação, regra sem fonte é palpite, código real derruba linter arrogante.
