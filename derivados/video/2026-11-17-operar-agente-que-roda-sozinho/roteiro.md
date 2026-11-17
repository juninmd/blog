# Roteiro do vídeo: Cinco lições de operação que meu agente de notícias me ensinou

Duração estimada: 4 minutos. Narração em off sobre motion. Números entre colchetes remetem às cenas do storyboard.

[1] Meu agente de notícias publica sozinho, de hora em hora. Escrever é a parte fácil. Hoje é sobre o que acontece quando algo quebra às três da manhã.

[2] Lição um. Cada edição vai para dois lugares: GitHub e banco. Sem transação entre eles. Eu commito primeiro. Se o processo morre no meio, sobra uma página órfã, e a próxima publicação adota essa página sem mandar notificação de novo.

[3] Lição dois. Notificação é fila. Tenta de novo de cinco minutos até seis horas. Cinco falhas, vai para a fila de mortos.

[4] Lição três. O agente melhora o próprio prompt, mas só com nota. Candidata que regride é rejeitada, tudo fica salvo, e tem rollback.

[5] Lição quatro. O crawl do Reddit levava mais que o job de uma hora. Nunca terminava, e recomeçava do zero. Agora tem teto de 20 minutos e um cursor que faz a fila girar.

[6] Lição cinco. Corrigir e retratar também são publicação. Toda versão fica guardada. A retratação tira do ar, mas preserva o que estava escrito.

[7] E um comando de saúde que diz, em JSON, se está tudo bem.

[8] O difícil não era o prompt. Era operação, como sempre. O texto completo está no blog.
