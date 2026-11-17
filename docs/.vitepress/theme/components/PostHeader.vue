<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { categorias } from '../../categorias'

const { frontmatter } = useData()
const ehPost = computed(() => Boolean(frontmatter.value.categoria && frontmatter.value.date))
const cat = computed(() => categorias[frontmatter.value.categoria as keyof typeof categorias])
const dia = computed(() => new Date(frontmatter.value.date).toISOString().slice(0, 10))
const dataFmt = computed(() =>
  new Date(dia.value + 'T12:00:00').toLocaleDateString('pt-BR', { dateStyle: 'long' }),
)
// Derivados só aparecem quando já existe link publicado.
const podcast = computed(() => frontmatter.value.derivados?.podcast?.url)
const video = computed(() => frontmatter.value.derivados?.video?.url)
</script>

<template>
  <header v-if="ehPost" class="post-header">
    <span class="ph-meta">
      <a v-if="cat" :href="withBase(`/${frontmatter.categoria}/`)">{{ cat.titulo }}</a>
      <time :datetime="dia">{{ dataFmt }}</time>
      <span v-if="frontmatter.ia" class="ph-ia" title="Texto gerado com IA e revisado pelo autor">IA + revisão humana</span>
    </span>
    <span v-if="podcast || video" class="ph-derivados">
      <a v-if="podcast" :href="podcast" target="_blank" rel="noopener">🎧 Ouvir no podcast</a>
      <a v-if="video" :href="video" target="_blank" rel="noopener">▶ Assistir no YouTube</a>
    </span>
    <h1 class="ph-titulo">{{ frontmatter.title }}</h1>
    <p v-if="frontmatter.description" class="ph-resumo">{{ frontmatter.description }}</p>
  </header>
</template>
