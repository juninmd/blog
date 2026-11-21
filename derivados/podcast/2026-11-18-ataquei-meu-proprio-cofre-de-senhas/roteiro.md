# Podcast: Ataquei meu próprio gerenciador de senhas

> **Aviso de IA (ler na abertura):** "Este episódio foi roteirizado por IA, a partir das minhas experiências reais com meus projetos, e revisado por outro agente de IA antes de ir ao ar."

Formato curto, um apresentador (Antonio). Duração estimada: 5 minutos.

## Abertura (0:00–0:30)

[Vinheta curta]

Eu escrevi um gerenciador de senhas para largar o LastPass. O Bunker. E aí fiz o que todo mundo deveria fazer e quase ninguém faz: tentei roubar minhas próprias senhas. Perdi 14 vezes.

## Bloco 1: o cofre é a parte fácil (0:30–1:20)

Só um arquivo cifrado sobe para o meu Google Drive. AES-256-GCM, chave da senha mestra com 600 mil iterações de PBKDF2. Quem tiver minha conta Google não decifra nada. O problema nunca foi o cofre. Foi a porta da frente: a extensão do navegador.

## Bloco 2: ler código não prova nada (1:20–2:20)

Escrevi uma sonda que carrega a extensão de verdade no Chrome e ataca. Faz papel de página hostil, com cliques falsos e clickjacking, e de ladrão de disco, procurando senha em texto puro no perfil fechado. E o detalhe que importa: desliguei duas correções de propósito, e o teste falhou. Teste de segurança que nunca falha não testa nada.

## Bloco 3: os achados (2:20–3:40)

Um crítico: um script da página clicava no ícone e lia a senha preenchida. Qualquer XSS virava ladrão. Cinco altos, como todas as senhas do site indo para a página no carregamento, ou um CSV importado apagando itens sem avisar. E um médio que me assustou: senha salva para "github.io" sendo oferecida para o site de qualquer pessoa.

## Bloco 4: o Firefox (3:40–4:30)

Mesmo código, outro navegador. No Firefox não tem a API que eu usava para limpar a área de transferência. A senha copiada ficava lá para sempre. Nenhum teste de Chrome ia me contar isso.

## Fechamento (4:30–5:00)

Ataque o produto rodando. Desligue a correção e veja o teste falhar. Escreva os riscos que você aceitou. E trate cada navegador como um produto diferente. O texto completo, com o relatório, está no blog.
