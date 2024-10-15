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
                    {
                        headers: {
                            'is-public': 'true'
                        },
                        params: {start: dateStart, end: dateEnd},
                    },
                );

                const store = this.store;
                store.groupSchedule = {};
                store.cabinetSchedule = {};
                store.employeeSchedule = {};
                for (let lesson of res.data.main) {
                    let scheduleRow = {
                        subject: (lesson['subject_code'] ? this.getPracticePrefix(lesson['practice_type']) + lesson['subject_code'] + ' ' : '') + lesson.subject,
                        lessonType: [lesson['category']],
                        groupName: lesson['groupName'],
                        mainTeacher: lesson['employee'],
                        optionalTeacher: lesson['second_employee'],
                        cabinet: lesson.cabinet,
                        optionalCabinet: lesson['second_cabinet'],
                        lessonNumber: lesson['lesson_number'],
                        date: lesson['date'],
                        isLessonProgress: false,
                    };

                    let gRow = _.get(store.groupSchedule, [lesson.groupId, lesson.date, lesson.lesson_number], scheduleRow);
                    let cRow = _.get(store.groupSchedule, [lesson.groupId, lesson.date, lesson.lesson_number], scheduleRow);
                    let eRow = _.get(store.groupSchedule, [lesson.groupId, lesson.date, lesson.lesson_number], scheduleRow);

                    gRow = this.correctData(gRow, lesson)
                    cRow = this.correctData(cRow, lesson)
                    eRow = this.correctData(eRow, lesson)

                    _.setWith(store.groupSchedule, [lesson.groupId, lesson.date, lesson.lesson_number], gRow, Object);
                    // cabinetSchedule
                    _.setWith(store.cabinetSchedule, [lesson.cabinet_id, lesson.date, lesson.lesson_number], cRow, Object);
                    if (lesson['optional_cabinet_id'] > 0 && lesson.cabinet_id !== lesson['optional_cabinet_id']) {
                        _.setWith(store.cabinetSchedule, [lesson['optional_cabinet_id'], lesson.date, lesson.lesson_number], cRow, Object);
                    }
                    // employeeSchedule
                    _.setWith(store.employeeSchedule, [lesson['employee_id'], lesson.date, lesson.lesson_number], eRow, Object);
                    if (lesson['optional_employee_id'] > 0 && lesson['employee_id'] !== lesson['optional_employee_id']) {
                        _.setWith(store.employeeSchedule, [lesson['optional_employee_id'], lesson.date, lesson.lesson_number], eRow, Object);
                    }
                }
                for (let lesson of res.data.custom) {
                    const name = _.get(_.find(CustomLesson, {'ktpId': lesson.name}), 'name', 'Событие');
                    let scheduleRow = {
                        subject: name,
                        mainTeacher: lesson.employee,
                        cabinet: lesson.cabinet,
                        isLessonProgress: false
                    };

                    let gRow = _.get(store.groupSchedule, [lesson.group_id, lesson.date, lesson.lesson_number], false);
                    let cRow = _.get(store.cabinetSchedule, [lesson.cabinet_id, lesson.date, lesson.lesson_number], false);
                    let eRow = _.get(store.employeeSchedule, [lesson['employee_id'], lesson.date, lesson.lesson_number], false);
                    if (!gRow) {
                        _.setWith(store.groupSchedule, [lesson.group_id, lesson.date, lesson.lesson_number],
                            scheduleRow, Object);
                    } else {
                        if (!gRow.custom) {
                            gRow.custom = [];
                        }
                        gRow.custom.push(scheduleRow);
                    }
                    // cabinetSchedule
                    if (!cRow) {
                        _.setWith(store.cabinetSchedule, [lesson.cabinet_id, lesson.date, lesson.lesson_number],
                            scheduleRow, Object);
                    } else {
                        if (!cRow.custom) {
                            cRow.custom = [];
                        }
                        cRow.custom.push(scheduleRow);
                    }
                    // employeeSchedule
                    if (!eRow) {
                        _.setWith(store.employeeSchedule, [lesson['employee_id'], lesson.date, lesson.lesson_number],
                            scheduleRow, Object);
                    } else {
                        if (!eRow.custom) {
                            eRow.custom = [];
                        }
                        eRow.custom.push(scheduleRow);
                    }
                }
            } catch (e) {
                console.log(e)
            }
            this.hideLoading();
        },

        correctData(row, data) {
            if (row.lessonType.indexOf(data.category) === -1) {
                row.lessonType.push(data.category);
            }
            return row;
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
                'дистанционно': 'дист',
                'спортивный зал': 'с/з',
                'малый спорт зал': 'с/з-м'
            }
            return replaceCabinet[name.toLowerCase().trim()] || name
        },

    },
    mounted() {

    }
}

export default ScheduleMixin;