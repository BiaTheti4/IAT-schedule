import {createRouter, createWebHistory} from "vue-router";
import scheduleMain from "@/pages/scheduleMain";
import teachers from "@/pages/teachers";
import ktp from "@/pages/ktp";
import cabinets from "@/pages/cabinets";
import groups from "@/pages/groups";
import scheduleView from "../pages/scheduleView";
import print from "../pages/print";

const routes=[
    {
        path:'/',
        component:scheduleMain,
    },
    {
        path:'/teachers',
        component:teachers,
    },
    {
        path:'/ktp',
        component:ktp,
    },
    {
        path:'/cabinets',
        component:cabinets,
    },
    {
        path:'/groups',
        component:groups,
    },
    {
        path:'/schedule',
        component:scheduleView,
    },
    {
        path:'/print',
        component:print,
    },

]

const router = createRouter({
    routes,
    history: createWebHistory(process.env.BASE_URL)
})

export default router;