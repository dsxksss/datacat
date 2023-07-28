import { createRouter, createWebHistory } from "vue-router"
import NotFound from "./pages/NotFound.vue";
import Home from "./pages/Home.vue";
import CreateConn from "./pages/CreateConn.vue";
import ConnPage from "./pages/ConnWindow.vue";


const routesMap = [
    // 将匹配所有内容并将其放在 `$route.params.pathMatch` 下
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    { path: '/', component: Home },
    { path: '/createConn', component: CreateConn },
    { path: '/connPage/:table', component: ConnPage },
]

const router = createRouter({
    history: createWebHistory(),
    routes: routesMap
})

export default router