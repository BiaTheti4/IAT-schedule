import {defineStore} from "pinia";

export const scheduleStore = defineStore('schedule', {
    state: () => {
        return {
            groupSchedule: {},
            cabinetSchedule: {},
            employeeSchedule: {},
        }
    }
})