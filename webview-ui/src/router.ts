import { createRouter, createWebHashHistory } from "vue-router"
import NotFound from "./pages/ConnWindow.vue";
import Home from "./pages/Home.vue";
import CreateConn from "./pages/CreateConn.vue";
import ConnPage from "./pages/ConnWindow.vue";


const routesMap = [
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    { path: '/', component: Home },
    { path: '/createConn', component: CreateConn },
    { path: '/connPage/:table', component: ConnPage },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes: routesMap
})

export default router