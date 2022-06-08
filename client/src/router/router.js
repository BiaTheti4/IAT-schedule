import {createRouter, createWebHistory} from "vue-router";
import scheduleMain from "@/pages/scheduleMain";
import scheduleView from "../pages/scheduleView";
import print from "../pages/print";

const routes = [
    {
        path: '/',
        component: scheduleMain,
    },
    {
        path: '/schedule',
        component: scheduleView,
    },
    {
        path: '/print',
        component: print,
    },

]

const router = createRouter({
    routes,
    history: createWebHistory(process.env.BASE_URL)
})

export default router;