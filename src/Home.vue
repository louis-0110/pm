<template>
  <main class="main-container">
    <n-split direction="horizontal" style="height: 100%" :default-size="0.25" :max="0.5" :min="0.25"
      :resize-trigger-size="2">
      <template #1>
        <PL></PL>
      </template>
      <template #2>
        <section class="right-container">
          <ToolBar></ToolBar>
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
        </section>
      </template>
    </n-split>
  </main>
</template>

<script setup lang="ts">
import PL from './components/PL.vue'
import db from './db/index'
import ToolBar from '@/components/ToolBar.vue'

db.execute('CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, url TEXT, created_at TEXT, updated_at TEXT)')

console.log('db', db)
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
