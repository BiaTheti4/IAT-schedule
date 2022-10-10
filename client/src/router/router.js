import {createRouter, createWebHistory} from "vue-router";
import scheduleMain from "@/pages/scheduleMain";
import scheduleView from "../pages/scheduleView";
import print from "../pages/print";
import teacherBusyness from "@/pages/teacherBusyness";
import cabinetBusyness from "@/pages/cabinetBusyness";
import scheduleCorrect from "@/pages/scheduleCorrect";
import scheduleViewFull from "@/pages/scheduleViewFull";

const routes = [
    {
        path: '/',
        component: scheduleMain,
        name: scheduleMain.name
    },
    {
        path: '/schedule',
        component: scheduleViewFull,
        name: scheduleView.name
    },
    {
        path: '/schedule-correct',
        component: scheduleCorrect,
        name: scheduleCorrect.name
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