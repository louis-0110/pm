<script setup lang="ts">
import Home from './Home.vue'
import type { GlobalThemeOverrides } from 'naive-ui'

const theme: GlobalThemeOverrides = {
  common: { fontWeightStrong: '600', fontFamily: 'v-mono' },
}
</script>

<template>
  <n-config-provider :theme-overrides="theme">
    <n-global-style />
    <Home />
  </n-config-provider>
</template>
<style>
:root {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: #0f0f0f;
  background-color: transparent;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
  overflow: hidden;
}
:root,
body,
#app,
.n-config-provider {
  height: 100%;
  width: 100%;
  user-select: none;
  -moz-user-select: -moz-none;
  -webkit-user-select: none;
}
</style>
