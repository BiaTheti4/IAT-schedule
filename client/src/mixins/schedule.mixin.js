import _ from "lodash";
import {scheduleStore} from "@/store/schedule"
import {CustomLesson} from "@/enums/CustomLesson";

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
                let res = await this.$axios.get('schedule/period',
                    {params: {start: dateStart, end: dateEnd}});

                const store = this.store;
                store.groupSchedule = {};
                store.cabinetSchedule = {};
                store.employeeSchedule = {};
                for (let lesson of res.data.main) {
                    let scheduleRow = {
                        subject: (lesson['subject_code'] ? this.getPracticePrefix(lesson['practice_type']) + lesson['subject_code'] + ' ' : '') + lesson.subject,
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
                for (let lesson of res.data.custom) {
                    const name = _.get(_.find(CustomLesson, {'ktpId': lesson.name}), 'name', 'Событие');
                    let scheduleRow = {
                        subject: name,
                        mainTeacher: lesson.employee,
                        cabinet: lesson.cabinet,
                    };

                    _.setWith(store.groupSchedule, [lesson.group_id, lesson.date, lesson.lesson_number], scheduleRow, Object);
                    // cabinetSchedule
                    _.setWith(store.cabinetSchedule, [lesson.cabinet_id, lesson.date, lesson.lesson_number], scheduleRow, Object);
                    // employeeSchedule
                    _.setWith(store.employeeSchedule, [lesson['employee_id'], lesson.date, lesson.lesson_number], scheduleRow, Object);
                }
            } catch (e) {
                console.log(e)
            }
            this.hideLoading();
        },
        getPracticePrefix(type) {
            if (+type === 1) {
                return 'УП.';
            } else if (+type == 2) {
                return 'ПП.';
            } else if (+type == 3) {
                return "ПДП "
            }
            return '';
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

        },
        subjectCabinetCorrect(name) {
            let replaceCabinet = {
                'спортивный зал': 'с/з'
            }
            return replaceCabinet[name.toLowerCase().trim()] || name
        }
    }
}

export default ScheduleMixin;