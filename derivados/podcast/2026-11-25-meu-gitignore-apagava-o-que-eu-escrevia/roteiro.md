# Podcast: Meu gerador de .gitignore apagava o que eu escrevia à mão

> **Aviso de IA (ler na abertura):** "Este episódio foi roteirizado por IA, a partir das minhas experiências reais com meus projetos, e revisado por outro agente de IA antes de ir ao ar."

Formato curto, um apresentador (Antonio). Duração estimada: 5 minutos.

## Abertura (0:00–0:30)

[Vinheta curta, som de teclado.]

Você acrescenta uma linha no `.gitignore` porque tem uma pasta que não pode ir para o repositório. Roda o gerador de novo. A linha sumiu. Meu gerador, o gign, fez isso por oito anos.

## Oito anos de sobrescrever (0:30–1:30)

O gign nasceu em 2018 chamando o gitignore.io e gravando a resposta em cima do arquivo, sem ler o que já existia. Em 2026 ele cresceu: templates offline, e um agente de IA, o Jules, adicionando detecção de ferramenta nova toda semana. O detector chegou a 939 entradas. E o comportamento de 2018 continuava lá.

## Três correções em quatro dias (1:30–3:30)

Dia 19 de novembro: o gign passa a ler o arquivo antes e guardar as regras manuais numa seção própria. Mas decidia o que era dele pelo formato do cabeçalho, e `### Node ###` também é o formato do gitignore.io. Quem tinha arquivo de lá continuava perdendo regra.

Dia 20: só conta como gerado o título que o gign realmente escreve. De carona, sai um padrão que ligava o template do Flatpak para qualquer JSON ou YAML.

Dia 22: o buraco mais comum. `echo regra >> .gitignore` cai na última seção gerada, e sumia. A correção muda a pergunta: em vez de "em que seção está?", "eu geraria essa linha agora?". Se não, é do usuário.

## Fechamento (3:30–5:00)

Cada versão parecia certa e tinha teste. O caso que faltava era o uso mais banal do arquivo. Arquivo gerado que gente edita é arquivo compartilhado: leia antes de escrever, e decida o que é seu comparando com o que você produz, não pela cara da linha.
