import _ from "lodash";
import axios from "axios";
import {scheduleStore} from "@/store/schedule"

let ScheduleMixin = {
    computed: {
        store() {
            return scheduleStore();
        }
    },

    methods: {
        async getSchedule(dateStart, dateEnd) {
            this.showLoading();
            try {
                let res = await axios.get(this.serverUrl + '/api/schedule/period',
                    {params: {start: dateStart, end: dateEnd}});

                const store = this.store;
                store.groupSchedule = {};
                store.cabinetSchedule = {};
                store.employeeSchedule = {};
                for (let lesson of res.data) {
                    let scheduleRow = {
                        subject: lesson.subject,
                        mainTeacher: lesson['employee'],
                        optionalTeacher: lesson['second_employee'],
                        cabinet: lesson.cabinet,
                        optionalCabinet: lesson['second_cabinet'],
                    };

                    _.setWith(store.groupSchedule, [lesson.groupId, lesson.date, lesson.lesson_number], scheduleRow, Object);
                    // cabinetSchedule
                    _.setWith(store.cabinetSchedule, [lesson.cabinet_id, lesson.date, lesson.lesson_number], scheduleRow, Object);
                    if (lesson['optional_cabinet_id'] > 0 && lesson.cabinet_id !== lesson['optional_cabinet_id']) {
                        _.setWith(store.cabinetSchedule, [lesson['optional_cabinet_id'], lesson.date, lesson.lesson_number], scheduleRow, Object);
                    }
                    // employeeSchedule
                    _.setWith(store.employeeSchedule, [lesson['employee_id'], lesson.date, lesson.lesson_number], scheduleRow, Object);
                    if (lesson['optional_employee_id'] > 0 && lesson['employee_id'] !== lesson['optional_employee_id']) {
                        _.setWith(store.employeeSchedule, [lesson['optional_employee_id'], lesson.date, lesson.lesson_number], scheduleRow, Object);
                    }
                }
            } catch (e) {
                console.log(e)
            }
            this.hideLoading();
        },
        getLessonByGroup(groupId, date, lessonNumber) {
            if (!this.store.groupSchedule) {
                return {};
            }
            return this._getLesson(this.store.groupSchedule, groupId, date, lessonNumber);

        },
        getLessonByCabinet(cabinetId, date, lessonNumber) {
            if (!this.store.cabinetSchedule) {
                return {};
            }
            return this._getLesson(this.store.cabinetSchedule, cabinetId, date, lessonNumber);

        },
        getLessonByEmployee(employeeId, date, lessonNumber) {
            if (!this.store.employeeSchedule) {
                return {};
            }
            return this._getLesson(this.store.employeeSchedule, employeeId, date, lessonNumber);
        },
        _getLesson(schedule, id, date, lessonNumber) {
            return _.get(schedule, [id, date, lessonNumber], {});

        }
    }
}

export default ScheduleMixin;