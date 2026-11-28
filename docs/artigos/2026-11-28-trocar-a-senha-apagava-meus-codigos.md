---
title: "Trocar a senha mestra apagava todos os meus códigos 2FA"
description: "No 2fac, meu gerenciador de 2FA local, a tela de Configurações dizia 'Senha alterada com sucesso!' e o cofre ficava ilegível. O conserto teve um segundo bug escondido na ordem de duas linhas. A lição: em troca de chave, primeiro grava, depois troca."
date: 2026-11-28
categoria: artigos
tags: [2fac, electron, criptografia, totp, seguranca, testes, agentes-de-ia]
status: publicado
ia: true
autoria: ia
autor: Antonio
fontes:
  - https://github.com/juninmd/2fac
  - https://github.com/juninmd/2fac/blob/main/README.md
  - https://github.com/juninmd/2fac/commit/b8672a8
  - https://github.com/juninmd/2fac/commit/070c5d1
  - https://github.com/juninmd/2fac/commit/5a8361a
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-28-trocar-a-senha-apagava-meus-codigos/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-28-trocar-a-senha-apagava-meus-codigos/roteiro.md
---

O [2fac](https://github.com/juninmd/2fac) é o meu gerenciador de códigos 2FA para desktop. Electron com React, códigos TOTP gerados offline, backup em JSON, importação do Authy e nenhuma nuvem: os segredos ficam só na minha máquina, num cofre cifrado com AES-256-GCM e uma chave derivada da senha mestra com Argon2id.

É o tipo de app em que o pior bug possível não é travar. É perder os códigos. Porque, se você perde os códigos de 2FA, não perde um app: perde o acesso às contas que eles protegem.

Pois bem. Durante uns dois meses, o 2fac tinha exatamente esse bug, num botão que diz "Alterar senha".

## Como o cofre nasceu

A cifragem em repouso entrou no repositório em 13 de setembro de 2026, no commit [b8672a8](https://github.com/juninmd/2fac/commit/b8672a8), escrito pelo Jules, o agente de código do Google. Antes disso os itens ficavam em texto puro no `electron-store`. Depois dele, a chave da sessão (derivada da senha mestra) fica só na memória, e o disco guarda um `encryptedVault`.

![Cartão do commit b8672a8, de 13/09/2026: implementa cifragem em repouso dos itens de 2FA com AES-256-GCM e Argon2id](/imagens/2026-11-28-trocar-a-senha-apagava-meus-codigos/b8672a8.png)

O handler `set-master-password` desse commit fazia quatro coisas: gerava um sal novo, gravava o hash da senha nova, derivava a chave nova e a colocava como chave da sessão. No fim, chamava `getTwoFAItems` com um comentário que dizia tudo sobre a intenção: "Trigger a read which will encrypt existing plaintext items".

Faz sentido na primeira vez que você define a senha. Os itens estão em texto puro, a leitura vê a chave na memória e migra tudo para o cofre cifrado. Perfeito.

O problema é a segunda vez.

## O que acontecia quando eu trocava a senha

A tela de Configurações confere a senha atual, chama o mesmo `setMasterPassword` com a nova e mostra "Senha alterada com sucesso!". Por baixo:

1. O sal e o hash antigos eram sobrescritos pelos novos.
2. A chave da sessão virava a chave nova.
3. A leitura tentava abrir o cofre, que ainda estava cifrado com a chave antiga.
4. A decifração falhava, o `getTwoFAItems` registrava o erro no console e devolvia uma lista vazia.

Ninguém re-cifrava nada. O cofre continuava no disco, intacto, mas trancado com uma chave que não existia mais em lugar nenhum: o sal antigo já tinha ido embora, então nem lembrar a senha antiga ajudava. E a lista vazia na tela era um convite para o pior passo: adicionar uma conta nova gravava um cofre novo, com um item só, por cima do antigo.

Mensagem de sucesso, cofre perdido. É o contrário do que um app desses promete.

## O conserto

A correção veio em 20 de novembro, no [070c5d1](https://github.com/juninmd/2fac/commit/070c5d1), numa sessão do Claude Code. A mensagem do commit é seca: o handler trocava a chave da sessão sem re-cifrar, então depois de uma troca de senha o cofre não podia mais ser decifrado e todos os códigos se perdiam.

![Cartão do commit 070c5d1, de 20/11/2026: re-cifra o cofre quando a senha mestra muda](/imagens/2026-11-28-trocar-a-senha-apagava-meus-codigos/070c5d1.png)

Entrou uma função nova, `rekeyVault`, e o handler mudou de ordem. Agora ele deriva a chave nova, chama `rekeyVault` e só depois grava o hash novo. A `rekeyVault` lê o cofre com a chave antiga (se o cofre estiver trancado, ela se recusa e lança erro), troca a chave e regrava os itens com a nova. O comentário no handler explica a escolha: re-cifrar primeiro, porque se o cofre atual não puder ser lido, é melhor manter a senha antiga do que trancar os códigos para sempre.

O commit também trouxe 72 linhas de teste em `store.test.ts`, com um store em memória no lugar do `electron-store`, que exige o binário do Electron.

Fim da história? Quase.

## O bug dentro do conserto

Dois dias depois, em 22 de novembro, entrou o [5a8361a](https://github.com/juninmd/2fac/commit/5a8361a). A diferença está na ordem de duas linhas. A `rekeyVault` do primeiro conserto fazia assim:

```ts
setSessionKey(newKey);
setTwoFAItems(store, items);
```

Troca a chave, depois grava. E se a gravação falhar? Disco cheio, permissão, qualquer coisa. A mensagem do commit descreve o estado que sobrava: a memória com a chave nova, o disco com o cofre da chave antiga. A próxima adição lia uma lista vazia e sobrescrevia o cofre. Era o mesmo bug de antes, só que agora precisava de uma falha de escrita para aparecer.

![Cartão do commit 5a8361a, de 22/11/2026: grava o cofre re-cifrado antes de trocar a chave da sessão](/imagens/2026-11-28-trocar-a-senha-apagava-meus-codigos/5a8361a.png)

O conserto extraiu a escrita para uma `writeVault` que recebe a chave como parâmetro, e inverteu a ordem: grava o cofre com a chave nova e só então troca a chave da sessão. Se a escrita lança erro, a memória continua com a chave que abre o que está no disco.

O teste que veio junto simula exatamente isso: troca o `store.set` por uma função que lança "disk full", chama `rekeyVault` e confere que a chave na memória ainda é a antiga e que os itens continuam legíveis. Para ver o teste fazer o trabalho dele, eu rodei esse arquivo de teste contra o `store.ts` do primeiro conserto e depois contra o do segundo:

![Saída real do Jest no 2fac: com o store.ts do commit 070c5d1, o teste "keeps the old key in memory when writing the re-keyed vault fails" falha na linha 47; com o store.ts do 5a8361a, os 5 testes passam](/imagens/2026-11-28-trocar-a-senha-apagava-meus-codigos/term-5a8361a.png)

Com o código do 070c5d1, falha na linha que compara a chave da sessão com a antiga. Com o do 5a8361a, os cinco passam.

## O que eu levo disso

**Mensagem de sucesso não é prova de sucesso.** O handler original devolvia `true` sempre. A decifração falhava, virava um `console.error` e uma lista vazia, e a tela comemorava. Um erro engolido dentro de uma leitura transformou "não consegui abrir o cofre" em "o cofre está vazio". São coisas muito diferentes, e o código tratava as duas igual.

**Em troca de chave, a ordem é: lê com a velha, grava com a nova, só então troca.** Parece óbvio escrito assim. Mas o primeiro conserto, que já sabia do problema e tinha teste, ainda trocou antes de gravar. O estado em memória e o estado em disco precisam concordar em todo instante em que algo pode falhar, e não só no final do caminho feliz.

**O teste certo é o que quebra a escrita de propósito.** Os testes do 070c5d1 cobriam a troca de senha funcionando. O que pegou o segundo bug foi um teste que sabota o `store.set`. Num app que guarda segredos, o caminho de falha é o caminho que importa.

**Agente escreve bug, agente conserta bug.** O cofre cifrado foi escrito por um agente, o primeiro conserto por outro, e o conserto do conserto também. Nenhum deles é o vilão: o primeiro commit resolveu o problema que se propôs a resolver (cifrar o que estava em texto puro) e ninguém olhou para o segundo uso do mesmo handler. O que fez diferença foi alguém, humano ou não, fazer a pergunta chata: "e na segunda vez?".

Hoje, se a re-cifragem falha, a senha antiga continua valendo e os códigos continuam lá. É o mínimo. Mas levou dois meses e dois commits para o 2fac fazer o mínimo.
