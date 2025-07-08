<template>
    <div>
        {{ $route.params.id }}

        <n-button @click="getProjectPath">按钮</n-button>
    </div>
</template>

<script setup lang="ts">
import { open } from '@tauri-apps/plugin-dialog'
import { readDir } from '@tauri-apps/plugin-fs'
import { ref } from 'vue'

//版本管理工具
const vcs = ref('')
// 获取项目路径
async function getProjectPath() {
    const result = await open({
        multiple: false,
        directory: true,
    })
    console.log(result)
    if (result) {
        const entries = await readDir(result)
        for (const entry of entries) {
            if (entry.name == '.git') {
                vcs.value = 'git'
                break
            } else if (entry.name == '.svn') {
                vcs.value = 'svn'
                break
            }
        }
    }
}
</script>

<style scoped></style>
