<template>
    <div class="pd-container">
        <div>
            {{ projectInfo?.name }}
        </div>
        <div>{{ projectInfo?.description }}</div>

        <n-button @click="addRepository">添加仓库</n-button>

        <section class="repository-list-wrap">
            <div :class="['repository-item', {
                git: item.vcs === 'git',
                svn: item.vcs === 'svn'
            }]" v-for="item in repositoryList" :key="item.id">
                <div class="repository-item-name">
                    <span> {{ item.name }} </span>
                    <n-popconfirm negative-text="取消" positive-text="确定" @positive-click="deleteRepository(item)">
                        <span>是否删除该仓库?</span>
                        <template #trigger>
                            <n-button class="more-btn" size="tiny">
                                <n-icon :size="12" :component="MoreHorizontal20Regular" />
                            </n-button>

                        </template>
                    </n-popconfirm>
                </div>
                <div class="tool-bar">
                    <span v-html="icon_vscode" @click="openPjWithVscode(item.path)"></span>
                    <span v-html="icon_powershell" @click="openPjWithFolder(item.path)"></span>
                </div>
            </div>
        </section>
    </div>

    <n-modal v-model:show="isShowRepository">
        <n-card style="width: 600px" title="仓库信息" :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-form ref="formRef" :model="newRepository" label-placement="left" @submit.prevent="onCreateNewRepository">
                <n-form-item label="仓库名称" path="name">
                    <n-input v-model:value="newRepository.name" placeholder="" />
                </n-form-item>
                <n-form-item label="文件地址" path="url">
                    <n-input v-model:value="newRepository.path" placeholder="">
                        <template #suffix>
                            <span v-if="newRepository.vcs" style="color: #f40; width: 20px; display: inline-grid;"
                                v-html="newRepository.vcs === 'svn' ? icon_svn : icon_git"></span>
                        </template>
                    </n-input>
                </n-form-item>
                <n-form-item>
                    <n-button style="margin-left: auto;" type="info" attr-type="submit">创建</n-button>
                </n-form-item>
            </n-form>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import dbFn from '@/db'
import { open } from '@tauri-apps/plugin-dialog'
import { readDir } from '@tauri-apps/plugin-fs'
import icon_git from '@/assets/git.svg?raw'
import icon_svn from '@/assets/svn.svg?raw'
import icon_vscode from '@/assets/vscode.svg?raw'
import icon_powershell from '@/assets/powershell.svg?raw'

import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { MoreHorizontal20Regular } from '@vicons/fluent'

import { Command } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';

const db = await dbFn

async function openPjWithVscode(path: string) {
    let result = await Command.create('exec-sh', ['-Command', 'code', path]).execute();
    console.log(result);
}

async function openPjWithFolder(path: string) {
    await invoke('open_folder', { path });
}

const route = useRoute()
const projectInfo = ref<any>()

const message = useMessage()
const getProjectInfo = async (id: string) => {
    const res: any = await db.select('SELECT * FROM projects where id = $1', [id])
    projectInfo.value = res[0]
}

const repositoryList = ref<any>()
const getRepositories = async (id: string) => {
    const res = await db.select('SELECT * FROM repositories where project_id = $1', [id])
    repositoryList.value = res
}

const newRepository = ref({
    name: '',
    path: '',
    vcs: '',
    project_id: route.params.id,
})

watchEffect(() => {
    if (route.params.id) {
        getProjectInfo(route.params.id as string)
        getRepositories(route.params.id as string)
        newRepository.value.project_id = route.params.id
    }
})

async function onCreateNewRepository() {
    const res = await db.execute(
        'INSERT OR IGNORE INTO repositories (name, path, project_id, vcs) VALUES ($1, $2, $3, $4) ',
        [
            newRepository.value.name,
            newRepository.value.path,
            newRepository.value.project_id,
            newRepository.value.vcs,
        ]
    )
    if (res.rowsAffected < 1) {
        return message.error('创建失败')
    }
    newRepository.value.name = ''
    newRepository.value.path = ''
    newRepository.value.vcs = ''
    isShowRepository.value = false
    getRepositories(projectInfo.value.id)
}

const isShowRepository = ref(false)
// 获取项目路径
async function addRepository() {
    const result = await open({
        multiple: false,
        directory: true,
    })
    console.log(result)
    if (result) {
        //版本管理工具
        let vcs = ''
        const entries = await readDir(result)
        for (const entry of entries) {
            if (entry.name == '.git') {
                vcs = 'git'
                break
            } else if (entry.name == '.svn') {
                vcs = 'svn'
                break
            }
        }

        newRepository.value.path = result
        newRepository.value.vcs = vcs
        isShowRepository.value = true
    }
}

const deleteRepository = async (item: any) => {
    const res = await db.execute('DELETE FROM repositories where id = $1', [item.id])
    console.log(res)

    getRepositories(projectInfo.value.id)
}
</script>

<style scoped>
.pd-container {
    margin: 10px;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 6px;
    background-color: #f9fcfe;
    height: 100%;
}

.repository-item {
    width: 200px;
    height: 80px;
    border-radius: 8px;
    border: 1px solid #eaeaea;
    transition: all 0.3s;
}

.repository-item .more-btn {
    opacity: 0;
    transition: all 0.3s;
}

.repository-item:hover .more-btn {
    opacity: 1;
}

.repository-item.git {
    background: url('@/assets/git.svg') no-repeat 80% center / 50px auto;
}

.repository-item.svn {
    background: url('@/assets/svn.svg') no-repeat 80% center / 50px auto;
}

.repository-item:hover {
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

.repository-list-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px 0;
}

.repository-list-wrap .repository-item {
    padding: 10px;
}

.repository-item-name {
    display: flex;
    justify-content: space-between;
}

.repository-item img {
    width: 22px;
}

.tool-bar {
    display: flex;
    gap: 10px
}

.tool-bar span {
    width: 20px;
    height: 20px;
    padding: 4px;
    cursor: pointer;
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all .2s;
}

.tool-bar span:hover {
    background-color: rgb(234, 242, 249);
}
</style>
