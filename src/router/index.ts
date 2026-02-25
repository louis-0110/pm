import { createMemoryHistory, createRouter, RouteRecordRaw } from 'vue-router'

import Pd from '@/components/PD.vue'
import Rd from '@/components/RD.vue'
import Settings from '@/components/Settings.vue'
import Dashboard from '@/Dashboard.vue'
const routes: RouteRecordRaw[] = [
    { path: '/', component: Dashboard },
    { path: '/pd/:id', component: Pd },
    { path: '/repository/:repoId', component: Rd },
    { path: '/settings', component: Settings }
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router
