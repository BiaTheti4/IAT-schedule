import {createRouter, createWebHistory} from "vue-router";
import scheduleMain from "@/pages/scheduleMain";
import scheduleView from "../pages/scheduleView";
import print from "../pages/print";

const routes = [
    {
        path: '/',
        component: scheduleMain,
        name:scheduleMain.name
    },
    {
        path: '/schedule',
        component: scheduleView,
        name:scheduleView.name
    },
    {
        path: '/print',
        component: print,
        name:print.name
    },

]

const router = createRouter({
    routes,
    history: createWebHistory(process.env.BASE_URL)
})

export default router;