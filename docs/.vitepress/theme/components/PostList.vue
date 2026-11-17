<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../posts.data'
import { categorias } from '../../categorias'

const props = defineProps<{ categoria?: string; limite?: number }>()

const lista = computed(() => {
  const filtrados = props.categoria ? posts.filter((p) => p.categoria === props.categoria) : posts
  return props.limite ? filtrados.slice(0, props.limite) : filtrados
})

const formatar = (d: string) =>
  d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
</script>

<template>
  <div class="post-list">
    <p v-if="!lista.length" class="pl-vazio">Nada publicado aqui ainda.</p>
    <a v-for="p in lista" :key="p.url" :href="withBase(p.url)" class="pl-card">
      <span class="pl-meta">
        <span class="pl-cat">{{ categorias[p.categoria as keyof typeof categorias]?.titulo ?? p.categoria }}</span>
        <time :datetime="p.data">{{ formatar(p.data) }}</time>
      </span>
      <strong class="pl-titulo">{{ p.titulo }}</strong>
      <span v-if="p.resumo" class="pl-resumo">{{ p.resumo }}</span>
    </a>
  </div>
</template>
