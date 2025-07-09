<template>
  <div data-tauri-drag-region class="titlebar">
    <div class="titlebar-button" id="titlebar-minimize" @click="appWindow.minimize">
      <img src="https://api.iconify.design/mdi:window-minimize.svg" alt="minimize" />
    </div>
    <div class="titlebar-button" id="titlebar-maximize" @click="appWindow.toggleMaximize">
      <img src="https://api.iconify.design/mdi:window-maximize.svg" alt="maximize" />
    </div>
    <div class="titlebar-button" id="titlebar-close" @click="appWindow.close">
      <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
    </div>
  </div>
</template>

<script setup>
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();
</script>

<style scoped>
.titlebar {
  height: 30px;
  background: #ffffff;
  user-select: none;
  display: flex;
  justify-content: flex-end;
}

.titlebar-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  user-select: none;
  -webkit-user-select: none;
}

.titlebar-button:hover {
  background: #e6ebea;
}
</style>