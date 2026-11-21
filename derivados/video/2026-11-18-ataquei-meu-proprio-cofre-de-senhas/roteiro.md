# Vídeo: Ataquei meu próprio gerenciador de senhas

> **Aviso de IA (texto na tela na abertura e na descrição do vídeo):** "Roteirizado por IA a partir das experiências reais do Antonio com os projetos dele. Revisado por outro agente de IA."

Formato YouTube com motion graphics, narração do Antonio. Duração estimada: 6 minutos. Cenas descritas em storyboard.md.

**[Cena 1]** Eu escrevi um gerenciador de senhas para largar o LastPass. Depois tentei roubar minhas próprias senhas.

**[Cena 2]** O Bunker: um cofre cifrado que sincroniza só pelo meu Google Drive. Sem servidor meu, sem conta nova.

**[Cena 3]** O cofre: AES-256-GCM, chave da senha mestra com 600 mil iterações de PBKDF2. Só o vault.enc sobe.

**[Cena 4]** Mas um cofre bem trancado não adianta se a porta da frente é a extensão do navegador.

**[Cena 5]** Ler código não prova que uma defesa aguenta. Então escrevi uma sonda que ataca a extensão rodando.

**[Cena 6]** Primeiro inimigo: uma página hostil. Cliques falsos, ícone invisível, mensagens diretas.

**[Cena 7]** Segundo inimigo: um ladrão de disco, procurando senha em texto puro no perfil fechado.

**[Cena 8]** E o teste do teste: desliguei duas correções. A sonda falhou. Agora sim eu confio nela.

**[Cena 9]** Resultado: 14 achados. Um crítico: a página clicava no ícone e lia a senha preenchida.

**[Cena 10]** Senha salva para github.io oferecida para o site de qualquer pessoa. Corrigido.

**[Cena 11]** No Firefox, a senha copiada nunca saía da área de transferência. Corrigido, 12 de 12 ataques barrados.

**[Cena 12]** O que fica: ataque o produto rodando, veja o teste falhar, escreva os riscos que aceitou.
