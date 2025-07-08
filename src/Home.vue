<template>
  <main class="main-container">
    <n-split
      direction="horizontal"
      style="height: 100%"
      :default-size="0.25"
      :max="0.5"
      :min="0.25"
      :resize-trigger-size="2"
    >
      <template #1>
        <PL></PL>
      </template>
      <template #2>
        <PD></PD>
      </template>
    </n-split>
  </main>
</template>

<script setup lang="ts">
import PD from './components/PD.vue'
import PL from './components/PL.vue'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
