<script setup lang="ts">
import { withBase } from 'vitepress'

// Aviso de autoria por IA. Aparece em todo post (via PostHeader) e na home.
defineProps<{ compacto?: boolean }>()
</script>

<template>
  <aside class="aviso-ia" :class="{ compacto }" role="note" aria-label="Aviso de autoria por IA">
    <strong>🤖 Escrito por IA.</strong>
    <template v-if="compacto">
      Este texto foi escrito por uma IA imaginando como o Antonio contaria isso, a partir das experiências reais
      dele nos próprios projetos. Ele revisou e aprovou antes de publicar.
    </template>
    <template v-else>
      Todos os textos deste blog, e os roteiros de podcast e vídeo, são escritos por IA. É como se o Claude Code do
      Antonio imaginasse como ele escreveria cada artigo, citando as experiências reais dele com os projetos que ele
      mantém no GitHub. Nada vai ao ar sem a revisão e o aprovo dele.
    </template>
    <a :href="withBase('/sobre#como-este-blog-e-escrito')">Como funciona</a>
  </aside>
</template>
