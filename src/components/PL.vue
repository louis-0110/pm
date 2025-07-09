<template>
    <div class="pl-box">
        <div class="logo-wrap">
            <!-- <img src="@/assets/logo.png" alt="" width="66" height="66" style="margin-right: 10px;border-radius: 10px;" /> -->
            <n-input placeholder="搜索">
                <template #prefix>
                    <n-icon :component="Search20Regular" />
                </template>
            </n-input>
            <n-button style="margin-left: 10px;" @click="showModal = true">
                <template #icon> + </template>
            </n-button>
        </div>
        <n-scrollbar class="pm-name-wrap">
            <div class="p-name" v-for="item in pList">
                {{ item.name }}
            </div>
        </n-scrollbar>
    </div>

    <n-modal v-model:show="showModal">
        <n-card style="width: 600px" title="新增项目" :bordered="false" size="huge" role="dialog" aria-modal="true">
            <template #header-extra>
                <n-icon style="cursor: pointer;" :component="Close" @click="showModal = false" />
            </template>
            <n-form ref="formRef" :model="model" label-placement="left">
                <n-form-item label="项目名称" path="projectName">
                    <n-input v-model:value="model.projectName" placeholder="" />
                </n-form-item>
                <n-form-item>
                    <n-button @click="onCreateNewProject">创建</n-button>
                </n-form-item>
            </n-form>
            <template #footer>

            </template>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { Search20Regular, } from '@vicons/fluent'
import { Close } from '@vicons/ionicons5'
import db from '@/db/index'
import { onMounted, ref, useTemplateRef } from 'vue'
import { useMessage } from 'naive-ui'

const formRef = useTemplateRef('formRef')

const showModal = ref(false)
type ProjectList = { id: number; name: string; updated_at: string; created_at: string; }[]
const pList = ref<ProjectList>([])

getProjectList()

onMounted(() => {
    console.log(formRef.value)
})
async function getProjectList() {
    return await db.select<ProjectList>('SELECT * FROM projects').then((res) => {
        console.log(res)
        pList.value = res
    })
}

const model = ref({
    projectName: null,
})

const message = useMessage()
const onCreateNewProject = async () => {
    console.log(model.value.projectName)

    await db.execute('INSERT INTO projects (name) VALUES ($1)', [model.value.projectName])
    message.success('创建成功')
    showModal.value = false
    getProjectList()
}
</script>

<style scoped>
.pl-box {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 10px;
    padding-right: 0px;
    background-color: #f9fcfe;
    box-sizing: border-box;
}

.logo-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    padding-right: 10px;
}

.pm-name-wrap {
    flex: 1;
    overflow-y: auto;
}

.pm-name-wrap .p-name {
    margin-right: 10px;
    border-radius: 8px;
    padding: 8px 10px;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
}

.pm-name-wrap .p-name:hover {
    background-color: #edf7fe;
}
</style>
