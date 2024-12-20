import {createRouter, createWebHistory} from "vue-router";
import scheduleMain from "@/pages/scheduleMain";
import scheduleView from "../pages/scheduleView";
import print from "../pages/print";
import teacherBusyness from "@/pages/teacherBusyness";
import cabinetBusyness from "@/pages/cabinetBusyness";
import scheduleCorrect from "@/pages/scheduleCorrect";
import scheduleCompare from "@/pages/scheduleCompare";
import login from "@/pages/Login";
import {globalStore} from "@/store/global";
import cabinetTimeBusyness from "@/pages/cabinetTimeBusyness.vue";


const routes = [
    {
        path: '/login',
        component: login,
        name: 'login',
        meta:{isPublic:  true} 
    },
    {
        path: '/',
        component: scheduleView, 
        name: scheduleView.name,
        meta: { isPublic: true } 
    },
    {
        path: '/schedule', 
        component: scheduleMain,
        name: scheduleMain.name,
        meta: { isPublic: false }
    },
    {
        path: '/schedule-correct',
        component: scheduleCorrect,
        name: scheduleCorrect.name,
        meta:{isPublic:  false} 
    },
    {
        path: '/schedule-compare',
        component: scheduleCompare,
        name: scheduleCompare.name,
        meta:{isPublic:  false} 
    },
    {
        path: '/print',
        component: print,
        name: print.name,
        meta:{isPublic:  false} 
    },
    {
        path: '/teachers',
        component: teacherBusyness,
        name: teacherBusyness.name,
        meta:{isPublic:  true} 
    },
    {
        path: '/cabinets',
        component: cabinetBusyness,
        name: cabinetBusyness.name,
        meta:{isPublic:  true} 
    },
    {
        path: '/cabinetTime',
        component: cabinetTimeBusyness,
        name: cabinetTimeBusyness.name,
        meta:{isPublic:  false}
    },
];
const basePath = "/";
const router = createRouter({
    routes,
    history: createWebHistory(basePath)
});
router.beforeEach((to, from, next) => {
    const store = globalStore(); 
    const routeIsPublic = to.matched.some(record => record.meta.isPublic === true);

    if (!routeIsPublic && store.auth === false && to.name !== 'login') {
        next({ name: 'forbidden' });
    } else {
        next();
    }
});

export default router;