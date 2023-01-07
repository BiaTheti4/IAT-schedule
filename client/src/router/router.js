import {createRouter, createWebHistory} from "vue-router";
import scheduleMain from "@/pages/scheduleMain";
import scheduleView from "../pages/scheduleView";
import print from "../pages/print";
import teacherBusyness from "@/pages/teacherBusyness";
import cabinetBusyness from "@/pages/cabinetBusyness";
import scheduleCorrect from "@/pages/scheduleCorrect";
import scheduleCompare from "@/pages/scheduleCompare";
import scheduleViewFull from "@/pages/scheduleViewFull";
import login from "@/pages/Login";
import {globalStore} from "@/store/gloabal";


const routes = [
    {
        path: '/login',
        component: login,
        name: 'login'
    },
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
        path: '/schedule-correct',
        component: scheduleCorrect,
        name: scheduleCorrect.name
    },
    {
        path: '/schedule-compare',
        component: scheduleCompare,
        name: scheduleCompare.name
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
router.beforeEach((to, from, next) => {
    const store = globalStore();
    if (!store.auth && to.name !== 'login') {
        next({name: 'login'})
    } else {
        next();
    }
});

export default router;