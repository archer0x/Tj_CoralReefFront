import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './components/HomePage.vue';
import OtherPage from './components/OtherPage.vue';
import DisplayPage from './components/DisplayPage.vue';
import test from './components/test.vue';
import LoginView from './views/LoginView.vue';
import MainLayout from './views/MainLayout.vue';

const routes = [
    { path: '/', component: LoginView },
    { 
        path: '/app', 
        component: MainLayout, // 用 MainLayout 作为主布局
        children: [
            { path: 'home', component: HomePage },
            { path: 'other', component: OtherPage },
            { path: 'display', component: DisplayPage },
            { path: 'test', component: test }
        ]
    }
];


const router = createRouter({
    history: createWebHistory(),
    routes
});


createApp(App)
    .use(ElementPlus)
    .use(router)
    .mount('#app');
