# Podcast: Silêncio não é saúde

> **Aviso de IA (ler na abertura):** "Este episódio foi roteirizado por IA, a partir das minhas experiências reais com meus projetos, e revisado por outro agente de IA antes de ir ao ar."

Formato curto, um apresentador (Antonio). Duração estimada: 5 minutos.

## Abertura (0:00–0:30)

[Vinheta curta, bip de monitor cardíaco estável.]

O pior resultado que uma ferramenta de diagnóstico pode dar não é o erro. É o verde falso. E eu descobri isso no meu próprio código.

## O projeto (0:30–1:15)

Eu tenho uma CLI chamada why-is-my-pod-sad. Ela junta o describe, os logs, os eventos e as probes de um pod do Kubernetes e devolve um veredito com o próximo passo. Quando está tudo bem, aparece: "Este pod não está triste".

O problema é que essa frase aparecia quando a ferramenta nem tinha conseguido olhar.

## O bug (1:15–2:15)

Os eventos e logs eram buscados por uma função que engolia qualquer falha e devolvia nada. Faz sentido para o log anterior de um container que nunca reiniciou. Mas ela engolia também "sem permissão para listar eventos" e timeout.

Então, com uma ServiceAccount sem permissão, a ferramenta lia nada e concluía: nenhum evento problemático. Check verde.

A correção foi guardar o motivo da falha e emitir um aviso próprio: diagnóstico incompleto, o kubectl não leu eventos ou logs.

## A família de bugs (2:15–3:30)

E não era um bug sozinho. Eventos herdados de um pod antigo com o mesmo nome. Probe de um sidecar acusando todos os containers. Evidência de image pull que mostrava qualquer evento com "Failed". Pontuação que ignorava um crash loop porque outro container ainda estava subindo. Endpoint contado duas vezes.

Nenhum travava. Todos davam uma resposta bonita, colorida e errada.

## Por que importa (3:30–4:30)

Ferramenta de diagnóstico decide para onde você não vai olhar. Se ela diz que o pod está bem, eu vou procurar no Service, no Ingress. E tem o exit code: um zero falso é um alerta que não dispara. Por isso o aviso de dados indisponíveis entrou como warn e muda o código de saída.

## Fechamento (4:30–5:00)

Três regras que ficaram: ausência de dado precisa ter motivo, evidência tem dono, e o teste que importa é o do caso que parece saudável.

Médico que não pediu o exame não deveria dizer que você está saudável. Ferramenta também não.

[Bip estável, corta.]
