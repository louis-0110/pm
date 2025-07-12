<template>
    <div class="pl-box">
        <div class="logo-wrap">
            <n-input v-model:value="search" placeholder="搜索" @change="searchProject">
                <template #prefix>
                    <n-icon :component="Search20Regular" />
                </template>
            </n-input>
            <n-button style="margin-left: 10px;" @click="showModal = true">
                <template #icon>
                    <n-icon :size="18" :component="Add16Filled" />
                </template>
            </n-button>
        </div>
        <n-scrollbar class="pm-name-wrap">
            <div :class="['p-name', { active: item.id + '' == $route.params.id }]" v-for="item in pList"
                @click="openProject(item)">
                {{ item.name }}
            </div>
        </n-scrollbar>
    </div>

    <n-modal v-model:show="showModal">
        <n-card style="width: 600px" title="新增项目" :bordered="false" size="small" role="dialog" aria-modal="true">
            <template #header-extra>
                <n-icon style="cursor: pointer;" :component="Close" @click="showModal = false" />
            </template>
            <n-form ref="formRef" :model="model" :rules="rules" label-placement="left" label-width="90px"
                @submit.prevent="onCreateNewProject">
                <n-form-item label="项目名称" required path="projectName">
                    <n-input v-model:value="model.projectName" placeholder="" />
                </n-form-item>
                <n-form-item label="描述" path="description">
                    <n-input type="textarea" v-model:value="model.description" placeholder="" />
                </n-form-item>
                <n-form-item>
                    <n-button style="margin-left: auto;" type="info" attr-type="submit">创建</n-button>
                </n-form-item>
            </n-form>
            <template #footer>

            </template>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { Search20Regular, Add16Filled } from '@vicons/fluent'
import { Close } from '@vicons/ionicons5'
import dbFn from '@/db'
import { onMounted, ref, useTemplateRef } from 'vue'
import { useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import type { FormInst } from 'naive-ui'
const db = await dbFn
const formRef = useTemplateRef<FormInst | null>('formRef')

const showModal = ref(false)
type ProjectList = { id: number; name: string; updated_at: string; created_at: string; description: string }[]
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
    projectName: '',
    description: '',
})

const rules = {
    projectName: {
        required: true,
        message: '请输入名称',
        trigger: 'change',
    }
}
const message = useMessage()
const onCreateNewProject = () => {
    formRef.value?.validate(async (error) => {
        console.log(error)
        if (error) return;

        const res = await db.execute('INSERT OR IGNORE INTO projects (name, description) VALUES ($1, $2) ', [model.value.projectName, model.value.description])
        console.log(res)
        if (res.rowsAffected < 1) {
            return message.error('创建失败')
        }
        message.success('创建成功')
        model.value.description = ''
        model.value.projectName = ''
        showModal.value = false
        getProjectList()
    })
}

const router = useRouter()

const openProject = (item: ProjectList[number]) => {
    router.push({ path: '/pd/' + item.id })
}


const search = ref('')

const searchProject = () => {
    console.log(search.value)
    db.select<ProjectList>('SELECT * FROM projects where name like $1', ['%' + search.value + '%']).then((res) => {
        pList.value = res
    })
}
</script>

<style scoped>
.pl-box {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 10px;
    padding-right: 0px;
    background-color: transparent;
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
    padding: 6px 10px;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
}

.pm-name-wrap .p-name+.p-name {
    margin-top: 4px;
}

.pm-name-wrap .p-name:hover,
.pm-name-wrap .p-name.active {
    background-color: #edf7fe;
}
</style>
