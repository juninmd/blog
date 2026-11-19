# Podcast: Um crash no meu servidor de CS 1.6 virou um linter

> **Aviso de IA (ler na abertura):** "Este episódio foi roteirizado por IA, a partir das minhas experiências reais com meus projetos, e eu revisei antes de ir ao ar."

Formato curto, um apresentador (Antonio). Duração estimada: 5 minutos.

## Abertura (0:00–0:30)

[Vinheta curta]

Meu servidor de Counter-Strike 1.6 caiu. Três vezes, em três modos de jogo diferentes, pelo mesmo erro bobo. Corrigi. E depois fiz uma coisa a mais: transformei o crash numa regra que nunca mais deixa ele voltar.

## Bloco 1: o crash (0:30–1:30)

Eu mantenho um servidor de Zombie Plague. Os plugins são escritos em Pawn, uma linguagem de script dos anos 2000. Uma função chamada get_tr2 precisa de um terceiro parâmetro para escrever o resultado. Se você esquece, o compilador não reclama, o plugin carrega, e em jogo ela escreve num endereço aleatório. Servidor no chão, todo mundo desconectado.

## Bloco 2: corrigir não basta (1:30–2:20)

Consertei os três plugins. Mas a pergunta era: quantos outros estão escondidos? Então escrevi a regra no zplint, meu linter em Rust. Erro, não aviso, porque não existe uso certo daquela forma. Crash em produção virou especificação.

## Bloco 3: regra precisa de fonte (2:20–3:20)

Linter que inventa regra grita em código certo e você aprende a ignorar. Então toda regra sai de fonte primária: o include oficial, a documentação ou o código do AMX Mod X. E passa por dois corpora: os plugins oficiais, onde a meta é zero erros, e mais de mil plugins da comunidade.

## Bloco 4: os falsos positivos (3:20–4:20)

Rodei num repositório real e tomei quatro falsos positivos. O código se protegia de um jeito que a regra não conhecia: flag feita à mão, função auxiliar de validação. Aprendi mais com esses erros do que com os acertos.

## Fechamento (4:20–5:00)

Três ideias: crash em produção é especificação, regra sem fonte é palpite, e código dos outros derruba linter arrogante. Hoje são 165 regras. O link do projeto está na descrição. Valeu!
