# Roteiro do podcast: Cinco lições de operação que meu agente de notícias me ensinou

> **Aviso de IA (ler na abertura):** "Este episódio foi roteirizado por IA, a partir das minhas experiências reais com meus projetos, e revisado por outro agente de IA antes de ir ao ar."

Duração estimada: 5 a 6 minutos. Tom de conversa, uma voz.

**Abertura (30 s)**
No último episódio eu falei do texto ruim que meu agente de notícias escrevia. Hoje é o outro lado: o que acontece quando um agente roda sozinho, de hora em hora, e algo quebra às três da manhã. Cinco lições que viraram código no evo-agent.

**Bloco 1: commit antes do banco (1 min)**
O agente publica em dois lugares: um commit no GitHub e uma linha no banco. Não tem transação entre os dois. Eu escolhi commitar primeiro. Se o processo morre no meio, sobra uma página que o banco não conhece. Aí a próxima publicação começa adotando essas órfãs, com um status que devolve a página para a home mas não manda notificação de novo. A lição: escolha quem pode ficar órfão e escreva o código que adota.

**Bloco 2: notificação é fila (45 s)**
Mandar mensagem no Telegram era uma linha. Se falhava, sumia. Hoje é um outbox: tenta de novo com espera de cinco minutos até seis horas, e depois de cinco falhas vai para uma fila de mortos. Um agente de IA é um sistema distribuído pequeno. O LLM é só mais uma seta que pode falhar.

**Bloco 3: prompt só muda com nota (1 min)**
O agente propõe melhorias no próprio prompt. Na primeira versão, a proposta entrava direto. Uma proposta pior estragava tudo em silêncio. Agora toda candidata leva nota, só é promovida se não regredir, fica guardada, e tem rollback automático e manual. Fica mais lento, mas eu sempre sei qual prompt escreveu qual edição.

**Bloco 4: crawl com prazo (1 min)**
O bug mais didático. A varredura do Reddit levava mais de uma hora, o job tinha uma hora. Nunca terminava, nunca marcava que terminou, e recomeçava do zero. Um loop perfeito de trabalho jogado fora. A correção: teto de 20 minutos e um cursor salvo, para a parte que ficou de fora ir primeiro na próxima.

**Bloco 5: corrigir e retratar (45 s)**
Toda versão de uma edição fica guardada. Se o texto está errado demais, tem um comando de retratação: a página vira um aviso e sai da home, do feed e do sitemap, mas o texto anterior continua registrado. Você quer tirar do ar rápido e provar o que estava escrito.

**Fechamento (30 s)**
Eu achava que o difícil era o prompt. Não é. O difícil é o mesmo de sempre: escrita em dois sistemas, fila que falha, job que estoura prazo. O LLM só deixa o erro mais convincente. O texto completo, com os links, está no blog.
