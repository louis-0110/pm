<template>
  <div class="tool-bar">
  </div>
</template>

<script setup>
import { Add16Filled, MoreHorizontal20Regular, Search12Regular } from '@vicons/fluent'
import { open } from '@tauri-apps/plugin-fs'
import { ref } from 'vue'
import { Command } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';

const showModal = ref(false)

async function openPjWithVscode() {
  let result = await Command.create('exec-sh', ['-Command', 'code', 'D:\\Projects']).execute();
  console.log(result);
}

async function openPjWithFolder() {
  await invoke('open_folder', { path: 'D:\\Projects' });
}
</script>

<style scoped>
.tool-bar {
  /* height: 50px; */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px
}

.tool-bar .more {
  margin-left: 10px;
  padding: 10px;
  transition: all .3s;
}

.tool-bar .more:hover {
  background-color: aliceblue;
}
</style>