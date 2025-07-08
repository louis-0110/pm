<template>
  <div class="tool-bar">
    <n-input style="width: 400px;" placeholder="搜索">
      <template #prefix>
        <n-icon :component="FlashOutline" />
      </template>
    </n-input>

    <n-button circle style="margin-left: auto" @click="showModal = true">
      <n-icon-wrapper :size="24" border-radius="50%">
        <n-icon :size="18" :component="Add16Filled" />
      </n-icon-wrapper>
    </n-button>

    <div class="more">
      <n-icon :size="18" :component="MoreHorizontal20Regular" />
    </div>
    <n-modal v-model:show="showModal">
      <n-card style="width: 600px" title="模态框" :bordered="false" size="huge" role="dialog" aria-modal="true">
        <template #header-extra>
          噢！
        </template>
        内容
        <template #footer>
          尾部
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup>
import { Add16Filled, MoreHorizontal20Regular } from '@vicons/fluent'
import {ref} from 'vue'

const showModal = ref(false)
</script>

<style scoped>
.tool-bar {
  height: 50px;
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