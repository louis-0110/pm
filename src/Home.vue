<template>
  <main class="main-container">
    <WindowBar></WindowBar>
    <n-split direction="horizontal" style="height: 100%" :default-size="0.25" :max="0.5" :min="0"
      :resize-trigger-size="1">
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
      <template #resize-trigger>
        <div class="resize-trigger">
        </div>
      </template>
    </n-split>
  </main>
</template>

<script setup lang="ts">
import PL from './components/PL.vue'
import db from './db/index'
import ToolBar from '@/components/ToolBar.vue'
import WindowBar from './components/WindowBar.vue'
import { MoreVertical24Filled } from '@vicons/fluent'

db.execute(`CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, url TEXT, created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')), updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')))`)

console.log('db', db)
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.n-split__resize-trigger-wrapper) {
  position: relative;
}

:deep(.n-split__resize-trigger-wrapper:hover) {
  background-color: rgb(51, 96, 242);
}

.resize-trigger {
  background-color: transparent;
  position: absolute;
  transform: translateX(-50%);
  height: 100%;
  width: 3px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
