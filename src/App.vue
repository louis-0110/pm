<script setup lang="ts">
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { GlobalThemeOverrides } from 'naive-ui'

const greetMsg = ref('')

async function greet() {
  greetMsg.value = await invoke('greet', { name: name.value })
}

const name = ref('')
const theme: GlobalThemeOverrides = {
  common: { fontWeightStrong: '600', fontFamily: 'v-mono' },
}
</script>

<template>
  <n-config-provider :theme-overrides="theme">
    <n-global-style />
  </n-config-provider>
</template>

<style scoped></style>
<style>
:root {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

.row {
  display: flex;
  justify-content: center;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #535bf2;
}

h1 {
  text-align: center;
}

input,
button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  color: #0f0f0f;
  background-color: #ffffff;
  transition: border-color 0.25s;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
}
</style>
