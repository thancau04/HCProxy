import { createApp } from 'vue'
// import { createPinia } from 'pinia' // Nếu chưa dùng Pinia thì cứ để đóng
import App from './App.vue'
import router from './router' // <-- Mở dòng này

import './assets/main.css' 

const app = createApp(App)

// app.use(createPinia())
app.use(router) // <-- Mở dòng này

app.mount('#app')