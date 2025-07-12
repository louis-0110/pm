<template>
    <div class="pd-container">
        <div class="pj-header">
            <h1>
                {{ projectInfo?.name }}
            </h1>

            <n-button @click="addRepository">添加仓库</n-button>
        </div>
        <p>{{ projectInfo?.description }}</p>



        <section class="repository-list-wrap">
            <div :class="['repository-item', {
                git: item.vcs === 'git',
                svn: item.vcs === 'svn'
            }]" v-for="item in repositoryList" :key="item.id">
                <div class="repository-item-name">
                    <span> {{ item.name }} </span>

                    <n-popover trigger="hover" raw :show-arrow="false"
                        :content-style="{ borderRadius: '10px', overflow: 'hidden' }" placement="bottom">
                        <template #trigger>
                            <n-button class="more-btn" size="tiny">
                                <n-icon :size="12" :component="MoreHorizontal20Regular" />
                            </n-button>
                        </template>
                        <div class="more-btn-wrap">
                            <div class="more-btn-item" @click="editPjName(item)">
                                <span>修改名称</span>
                            </div>
                            <div class="more-btn-item" @click="openPjWithVscode(item.path)">
                                <span>在vscode中打开</span>
                            </div>

                            <div class="more-btn-item" @click="openPjWithFolder(item.path)">
                                <span>在文件系统中打开</span>
                            </div>
                            <div class="divider"></div>
                            <div class="more-btn-item delete" @click="deleteRepository(item)">
                                <span>删除</span>
                            </div>
                        </div>
                    </n-popover>


                </div>
                <!-- <div class="tool-bar">
                    <span v-html="icon_vscode" @click="openPjWithVscode(item.path)"></span>
                    <span v-html="icon_powershell" @click="openPjWithFolder(item.path)"></span>
                </div> -->
            </div>
        </section>
    </div>

    <n-modal v-model:show="isShowRepository" :on-after-leave="onAfterLeave">
        <n-card style="width: 600px" title="仓库信息" :bordered="false" size="small" role="dialog" aria-modal="true">
            <n-form ref="formRef" :model="newRepository" label-placement="left" :rules="rules"
                @submit.prevent="onCreateNewRepository">
                <n-form-item label="仓库名称" path="name">
                    <n-input v-model:value="newRepository.name" placeholder="" />
                </n-form-item>
                <n-form-item label="文件地址" path="url">
                    <n-input v-model:value="newRepository.path" readonly placeholder="">
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

    <n-modal v-model:show="isShowRePjName" :on-after-leave="onAfterLeaveRePjName">
        <n-card style="width: 600px" title="仓库信息" :bordered="false" size="small" role="dialog" aria-modal="true">
            <n-form ref="formRenameRef" :model="pjInfo" :rules="rePjNameRules" label-placement="left"
                @submit.prevent="onUpdatePjName">
                <n-form-item required label="仓库名称" path="name">
                    <n-input v-model:value="pjInfo.name" placeholder="" />
                </n-form-item>
                <n-form-item>
                    <n-button style="margin-left: auto;" @click="isShowRePjName = false">取消</n-button>
                    <n-button style="margin-left: 20px;" type="info" attr-type="submit">确定</n-button>
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
// import icon_vscode from '@/assets/vscode.svg?raw'
// import icon_powershell from '@/assets/powershell.svg?raw'

import { ref, useTemplateRef, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { MoreHorizontal20Regular } from '@vicons/fluent'
import type { FormInst } from 'naive-ui'
import { Command } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';

const db = await dbFn

async function openPjWithVscode(path: string) {
    let result = await Command.create('exec-sh', ['-Command', 'code', `'${path}'`]).execute();
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

const formRef = useTemplateRef<FormInst | null>('formRef')

const newRepository = ref({
    name: '',
    path: '',
    vcs: '',
    project_id: route.params.id,
})

const rules = {
    name: {
        required: true,
        message: '请输入名称',
        trigger: 'change',
    },
    path: {
        required: true,
        message: '请输入路径',
        trigger: 'change',
    }
}

watchEffect(() => {
    if (route.params.id) {
        getProjectInfo(route.params.id as string)
        getRepositories(route.params.id as string)
        newRepository.value.project_id = route.params.id
    }
})

async function onCreateNewRepository() {
    await formRef.value?.validate()
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


const pjInfo = ref({
    name: '',
    id: ''
})

const rePjNameRules = {
    name: {
        required: true,
        message: '请输入名称',
        trigger: 'change',
    }
}

const formRenameRef = useTemplateRef<FormInst | null>('formRenameRef')

const isShowRePjName = ref(false)

function editPjName(item: any) {
    isShowRePjName.value = true
    pjInfo.value.name = item.name
    pjInfo.value.id = item.id
}

async function onUpdatePjName() {
    await formRenameRef.value?.validate()
    await db.execute('UPDATE repositories SET name = $1 where id = $2', [pjInfo.value.name, pjInfo.value.id])
    isShowRePjName.value = false
    getRepositories(route.params.id as string)
}


function onAfterLeave() {
    console.log('111')
    newRepository.value.name = ''
    newRepository.value.path = ''
    newRepository.value.vcs = ''
}

function onAfterLeaveRePjName() {
    pjInfo.value.name = ''
    pjInfo.value.id = ''
}
</script>

<style scoped>
.pd-container {
    margin: 10px 10px 10px 0;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 6px;
    background-color: #f9fcfe;
    height: 100%;
}

.pj-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.pj-header h1 {
    margin: 0;
    width: 80%;
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


.more-btn-wrap {
    padding: 10px;
    background-color: #fff;
}

.more-btn-wrap .more-btn-item {
    padding: 4px 10px;
    font-size: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all .2s;
}

.more-btn-wrap .more-btn-item:hover {
    background-color: #f9fcfe;
}

.more-btn-wrap .more-btn-item.delete:hover {
    background-color: rgb(255, 246, 246);
    color: #f40;
}

.more-btn-wrap .divider {
    height: 1px;
    background-color: #eaeaea;
    margin: 3px 0;
}

:global(.n-popover) {
    border-radius: 10px;
    overflow: hidden;
}
</style>
