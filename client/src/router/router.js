import {createRouter, createWebHistory} from "vue-router";
import scheduleMain from "@/pages/scheduleMain";
import scheduleView from "../pages/scheduleView";
import print from "../pages/print";
import teacherBusyness from "@/pages/teacherBusyness";
import cabinetBusyness from "@/pages/cabinetBusyness";

const routes = [
    {
        path: '/',
        component: scheduleMain,
        name: scheduleMain.name
    },
    {
        path: '/schedule',
        component: scheduleView,
        name: scheduleView.name
    },
    {
        path: '/print',
        component: print,
        name: print.name
    },
    {
        path: '/teachers',
        component: teacherBusyness,
        name: teacherBusyness.name
    },
    {
        path: '/cabinets',
        component: cabinetBusyness,
        name: cabinetBusyness.name
    },

];

const router = createRouter({
    routes,
    history: createWebHistory()
});

export default router;