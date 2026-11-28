# Podcast: Trocar a senha mestra apagava todos os meus códigos 2FA

> **Aviso de IA (ler na abertura):** "Este episódio foi roteirizado por IA, a partir das minhas experiências reais com meus projetos, e revisado por outro agente de IA antes de ir ao ar."

Formato curto, um apresentador (Antonio). Duração estimada: 5 minutos.

## Abertura (0:00–0:40)

Meu gerenciador de 2FA tinha um botão "Alterar senha". Ele dizia "Senha alterada com sucesso!". E deixava o cofre ilegível. Hoje eu conto como isso aconteceu, e como o conserto teve outro bug dentro.

## O cofre (0:40–1:30)

O 2fac guarda os segredos num cofre cifrado com AES-256-GCM, com chave derivada da senha mestra por Argon2id. Isso entrou em setembro, num commit do Jules. Na primeira vez que você define a senha, tudo certo: a leitura migra os itens de texto puro para o cofre.

## A segunda vez (1:30–2:40)

Na troca de senha, o mesmo handler sobrescrevia o sal e o hash, trocava a chave na memória e tentava ler o cofre. A decifração falhava, virava lista vazia, e a tela comemorava. O sal antigo já tinha ido embora. E a próxima conta adicionada gravava um cofre novo por cima.

## O conserto e o bug do conserto (2:40–4:00)

Em 20 de novembro entrou o rekeyVault: lê com a chave velha, re-cifra com a nova. Dois dias depois, outro commit inverteu duas linhas. O primeiro conserto trocava a chave antes de gravar. Se a gravação falhasse, memória e disco discordavam, e o cofre voltava a ser sobrescrito. O teste novo sabota a escrita com "disk full" e confere que a chave antiga continua na memória.

## Fechamento (4:00–5:00)

Três lições: mensagem de sucesso não é prova de sucesso. Em troca de chave, lê com a velha, grava com a nova, só então troca. E o teste que importa é o que quebra a escrita de propósito.
