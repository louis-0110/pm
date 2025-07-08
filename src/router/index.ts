import { createMemoryHistory, createRouter, RouteRecordRaw } from 'vue-router'

import Pd from '@/components/PD.vue'

const routes: RouteRecordRaw[] = [{ path: '/pd/:id', component: Pd }]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router
