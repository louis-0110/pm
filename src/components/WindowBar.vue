<template>
  <div data-tauri-drag-region class="titlebar">
    <div class="titlebar-button" id="titlebar-minimize" @click="appWindow.minimize">
      <n-icon :size="18" :component="RemoveOutline" />
    </div>
    <div class="titlebar-button" id="titlebar-maximize" @click="appWindow.toggleMaximize">
      <n-icon :size="18" :component="Maximize16Regular" />
    </div>
    <div class="titlebar-button" id="titlebar-close" @click="appWindow.close">
      <n-icon :size="18" :component="Close" />
    </div>
  </div>
</template>

<script setup>
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Close, RemoveOutline } from '@vicons/ionicons5'
import { Maximize16Regular } from '@vicons/fluent'
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

#titlebar-close.titlebar-button:hover {
  background: rgb(228, 31, 31);
  color: #ffffff;
}
</style>