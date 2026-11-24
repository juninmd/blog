---
title: "Ataquei meu próprio gerenciador de senhas (e ele perdeu 14 vezes)"
description: "Ler o código não prova que uma defesa aguenta. No Bunker, meu substituto do LastPass, eu coloquei a extensão para apanhar de uma página hostil e de um ladrão de disco. Saíram 14 achados, um crítico."
date: 2026-11-18
categoria: artigos
tags: [bunker, seguranca, senhas, extensao, testes, side-project]
status: publicado
ia: true
autoria: ia
autor: Antonio
fontes:
  - https://github.com/juninmd/bunker
  - https://github.com/juninmd/bunker/blob/master/docs/SECURITY.md
  - https://github.com/juninmd/bunker/blob/master/README.md
  - https://github.com/juninmd/bunker/commit/ee8da061
  - https://github.com/juninmd/bunker/commit/988ae25
  - https://github.com/juninmd/bunker/commit/452629d
  - https://github.com/juninmd/bunker/commit/13827a9
  - https://github.com/juninmd/bunker/commit/7d8faa6
  - https://github.com/juninmd/bunker/pull/120
  - https://github.com/juninmd/bunker/pull/121
  - https://github.com/juninmd/bunker/pull/130
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-18-ataquei-meu-proprio-cofre-de-senhas/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-18-ataquei-meu-proprio-cofre-de-senhas/roteiro.md
---

Escrever um gerenciador de senhas é a forma mais rápida de descobrir que você não confia no seu próprio código.

O **Bunker** começou em fevereiro de 2026 com uma ideia de escopo pequeno: guardar, preencher e gerar senhas, e sincronizar tudo pelo **meu** Google Drive. Sem servidor meu, sem conta nova, sem empresa no meio. Era o meu plano para largar o LastPass. O roadmap do repositório tem até uma seção inteira de "paridade com o LastPass", e a importação do CSV exportado por ele mantém pastas, notas seguras e códigos 2FA.

A criptografia é a parte que todo mundo pergunta, e é a parte mais tranquila: o cofre vira um `vault.enc` cifrado com **AES-256-GCM**, a chave vem da senha mestra por **PBKDF2-SHA256 com 600.000 iterações**, e só esse arquivo cifrado sobe para o Drive. Quem tiver minha conta Google consegue ler e trocar o arquivo, mas não consegue decifrar nem forjar um item sem a senha mestra, porque o GCM é autenticado.

Só que um cofre bem trancado não adianta nada se a porta da frente é a extensão do navegador. E foi aí que a história ficou interessante.

## Ler o código não prova nada

Em 19 de setembro eu juntei duas coisas no mesmo dia. Primeiro, um PR de [substituição do LastPass](https://github.com/juninmd/bunker/pull/120), com códigos TOTP, importação fiel do CSV e uma homologação de ponta a ponta: um script que abre a extensão de verdade no Chromium, cria o cofre, importa o CSV, preenche login, testa PIN, bloqueio automático, e tira os prints que hoje estão no README.

Um desses prints, gerado pelo próprio teste no commit [452629d](https://github.com/juninmd/bunker/commit/452629d) com dados de exemplo:

![Print da extensão Bunker no Chromium, tirado pela homologação do commit 452629d (19/09/2026): lista do cofre com busca, filtros por pasta e itens de exemplo como Nubank com código TOTP, Wi-Fi de casa como nota segura, Google, Netflix, X e Acme, e a barra inferior com Cofre, Gerador, Saúde e Ajustes](/imagens/2026-11-18-ataquei-meu-proprio-cofre-de-senhas/ui-452629d.png)

Depois, o PR que é o assunto deste texto: a [homologação de segurança](https://github.com/juninmd/bunker/pull/121). A mensagem do commit que criou o teste resume a ideia melhor do que eu faria agora:

> Reading code cannot prove a defence holds in Chrome.

Ler código não prova que uma defesa aguenta dentro do Chrome. Então eu (com o Claude como coautor desse commit, como de quase tudo nesse repositório) escrevi um [`security-probe`](https://github.com/juninmd/bunker/commit/ee8da061) que carrega a extensão compilada e **ataca**. Ele faz o papel de dois inimigos:

![Commit ee8da06 do Bunker, de 19/09/2026: o security-probe que carrega a extensão compilada e a ataca como página hostil e como ladrão de disco](/imagens/2026-11-18-ataquei-meu-proprio-cofre-de-senhas/ee8da06.png)

- **Uma página hostil**, ou um site legítimo com XSS: dispara cliques sintéticos, tenta clickjacking escondendo o ícone com opacidade, `clip-path` e escala, manda mensagem direto para a extensão, abre outra origem.
- **Um ladrão de disco**: fecha o navegador, copia o perfil do Chrome e procura segredo em texto puro, byte a byte, em UTF-8 e UTF-16.

E tem um detalhe que eu considero a parte mais importante: depois de escrever o teste, eu desliguei duas correções de propósito e rodei de novo. O teste falhou como esperado. Um teste de segurança que nunca falha não está testando nada, só está te deixando dormir.

## Os 14 achados

O relatório ficou em [docs/SECURITY.md](https://github.com/juninmd/bunker/blob/master/docs/SECURITY.md), com tabela de modelo de ameaça, controles verificados e achados. Foram **14**: um crítico, cinco altos, quatro médios e quatro baixos. Todos corrigidos, cada um com a prova de qual teste pega a regressão.

O crítico dói de ler. **Um script da página conseguia clicar no ícone da extensão e no seletor de contas, e depois ler a senha que a extensão preenchia no campo.** Ou seja: qualquer XSS num site onde eu tivesse login virava um ladrão de senha. A correção é chata e detalhista: o clique precisa ser `isTrusted`, o ícone precisa estar visível de verdade (opacidade, `clip-path`, tamanho) e sem nada sobreposto.

Os altos eram do mesmo tipo de descuido que a gente comete quando está pensando na feature, não no atacante:

- **Todas as senhas do site iam para a página no carregamento.** Agora a página recebe só os nomes de usuário; a senha de um item só sai do service worker depois do clique real.
- **O custo do PBKDF2 local não tinha limite.** Um storage adulterado com um número absurdo de iterações travava o desbloqueio. Hoje só aceito entre 250 mil e 5 milhões.
- **Importar CSV sobrescrevia senhas e apagava itens sem avisar.** A importação agora nunca apaga, guarda a senha anterior no histórico e pede confirmação.
- **A exportação CSV deixava passar fórmula de Excel.** Célula de texto começando com `=`, `+`, `-` ou `@` ganha um apóstrofo.
- **Token OAuth revogado nunca era descartado.** Um 401 agora descarta o token e tenta uma vez.

Entre os médios, o que mais me ensinou foi o dos sufixos compartilhados: uma entrada salva para `github.io` ou `com.br` cobria subdomínios de estranhos. Senha minha sendo oferecida para o site de qualquer pessoa no GitHub Pages. Hoje esses sufixos só casam exatamente.

E tem os baixos, que parecem bobos até você pensar neles: o popup bloqueado continuava com senha e lista no DOM, o gerador de senhas tinha viés de módulo (trocado por amostragem por rejeição), e a extensão pedia permissões `scripting`, `activeTab` e `<all_urls>` que nem usava.

## Escrever o que eu não consegui resolver

A seção do relatório de que eu mais gosto não é a dos achados. É a de **riscos residuais aceitos**. Lá está escrito, por exemplo, que uma página ainda pode sobrepor um elemento com `pointer-events: none` ao ícone e induzir o clique, que é o limite conhecido de qualquer ícone injetado. Que uma animação de opacidade no instante exato do clique pode escapar da checagem. Que a senha mestra fica em memória enquanto o cofre está aberto. Que senha e TOTP saem sem neutralização no CSV exportado, então não abra esse arquivo em planilha.

Eu prefiro mil vezes um projeto que me diz onde ele é fraco do que um que me promete que não é. É a mesma lição que eu já tinha aprendido em outro lugar: o trade-off ruim tem que estar escrito junto da escolha.

O README também carrega uma confissão que eu deixei de propósito: **versões anteriores gravavam um `passwords.csv` no Drive.** Se você usou, apague o arquivo e a lixeira do Drive. Não é bonito, mas é verdade, e esconder seria pior.

## O Firefox quebra suas certezas

Oito dias depois, em 27 de setembro, veio o [build do Firefox](https://github.com/juninmd/bunker/pull/130). Mesmo código, e mesmo assim tudo diferente. Sem service worker, o módulo roda como event page. Sem `identity.getAuthToken`, o login no Drive virou authorization code com PKCE e `state` validado.

E o melhor achado do dia: **no Firefox não existe `offscreen`, então a senha copiada nunca era apagada da área de transferência.** No Chrome ela some em 30 segundos. No Firefox ela ficava lá para sempre, e nenhum teste de Chrome ia me contar isso. A [sonda rodando no Firefox real](https://github.com/juninmd/bunker/commit/13827a9) repete os ataques que dependem do navegador, e passou 12 de 12 depois da correção.

O relatório também é honesto sobre o que não foi testado: o login no Drive pelo Firefox só rodou contra um Google simulado, e o login sem senha deve ser tratado como indisponível lá.

## O que eu levo disso

1. **Teste de segurança tem que atacar o produto rodando**, não o código no editor. A extensão compilada, no navegador de verdade, apanhando.
2. **Desligue a correção e veja o teste falhar.** Sem isso, você não sabe se ele protege alguma coisa.
3. **Escreva os riscos que você aceitou.** É o único jeito de alguém, inclusive você daqui a seis meses, decidir se ainda aceita.
4. **Cada navegador é um produto diferente.** O mesmo código pode deixar sua senha no clipboard para sempre.

Hoje o Bunker está mais na fase de manutenção: Dependabot semanal, SAST, baseline do Trivy. Menos emocionante, mais seguro. E eu continuo achando que a melhor coisa que fiz por ele não foi a criptografia. Foi ter tentado roubar minhas próprias senhas antes de qualquer outra pessoa.
