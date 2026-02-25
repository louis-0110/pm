import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'

// 引入全局样式
import './styles/global.css'

// 自定义主题：使用蓝色作为 primary 颜色
const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    }
})

createApp(App)
    .use(router)
    .use(PrimeVue, {
        theme: {
            preset: MyPreset,
            options: {
                prefix: 'p',
                darkModeSelector: false,
                cssLayer: false
            }
        }
    })
    .use(ToastService)
    .mount('#app')
