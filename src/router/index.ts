import { createMemoryHistory, createRouter, RouteRecordRaw } from 'vue-router'

import Pd from '@/components/PD.vue'
import Dashboard from '@/Dashboard.vue'
const routes: RouteRecordRaw[] = [{ path: '/', component: Dashboard },{ path: '/pd/:id', component: Pd }]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router
