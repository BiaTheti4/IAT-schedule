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
                const res = await this.$axios.get('schedule/period',
                    {
                        headers: {
                            'is-public': 'true'
                        },
                        params: {start: dateStart, end: dateEnd},
                    },
                );

                const pushToPath = (obj, p1, p2, p3, p4, value) => {
                    // Создаем вложенность на лету, если её нет
                    if (!obj[p1]) obj[p1] = {};
                    if (!obj[p1][p2]) obj[p1][p2] = {};
                    if (!obj[p1][p2][p3]) obj[p1][p2][p3] = {};
                    obj[p1][p2][p3][p4] = value
                };


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

                    let gRow = _.get(store.groupSchedule, [lesson.groupId, lesson.date, lesson.lesson_number, lesson.ktp_id], scheduleRow);
                    let cRow = _.get(store.cabinetSchedule, [lesson.cabinet_id, lesson.date, lesson.lesson_number, lesson.ktp_id], scheduleRow);
                    let eRow = _.get(store.employeeSchedule, [lesson.employee_id, lesson.date, lesson.lesson_number, lesson.ktp_id], scheduleRow);

                    gRow = this.correctData(gRow, lesson)
                    cRow = this.correctData(cRow, lesson)
                    eRow = this.correctData(eRow, lesson)


                    pushToPath(store.groupSchedule, lesson.groupId, lesson.date, lesson.lesson_number, lesson.ktp_id, gRow);

                    pushToPath(store.cabinetSchedule, lesson.cabinet_id, lesson.date, lesson.lesson_number, lesson.ktp_id, cRow);
                    if (lesson.optional_cabinet_id > 0 && lesson.cabinet_id !== lesson.optional_cabinet_id) {
                        pushToPath(store.cabinetSchedule, lesson.optional_cabinet_id, lesson.date, lesson.lesson_number, lesson.ktp_id, cRow);
                    }

                    pushToPath(store.employeeSchedule, lesson.employee_id, lesson.date, lesson.lesson_number, lesson.ktp_id, eRow);
                    if (lesson.optional_employee_id > 0 && lesson.employee_id !== lesson.optional_employee_id) {
                        pushToPath(store.employeeSchedule, lesson.optional_employee_id, lesson.date, lesson.lesson_number, lesson.ktp_id, eRow);
                    }
                }
                for (let lesson of res.data.custom) {
                    const name = _.get(_.find(CustomLesson, {'ktpId': lesson.name}), 'name', 'Событие');
                    let scheduleRow = {
                        subject: name,
                        mainTeacher: lesson.employee,
                        cabinet: lesson.cabinet,
                        lessonNumber: lesson['lesson_number'],
                        lessonType: [],
                        custom: true,
                        isLessonProgress: false
                    };

                    pushToPath(store.groupSchedule, lesson.group_id, lesson.date, lesson.lesson_number, lesson.name, scheduleRow);
                    pushToPath(store.cabinetSchedule, lesson.group_id, lesson.date, lesson.lesson_number, lesson.name, scheduleRow);
                    pushToPath(store.employeeSchedule, lesson.group_id, lesson.date, lesson.lesson_number, lesson.name, scheduleRow);
                    // let gRow = _.get(store.groupSchedule, [lesson.group_id, lesson.date, lesson.lesson_number], false);
                    // let cRow = _.get(store.cabinetSchedule, [lesson.cabinet_id, lesson.date, lesson.lesson_number], false);
                    // let eRow = _.get(store.employeeSchedule, [lesson['employee_id'], lesson.date, lesson.lesson_number], false);
                    // if (!gRow) {
                    // } else {
                    //     if (!gRow.custom) gRow.custom = [];
                    //     if (!gRow.custom.some(l => _.isEqual(l, scheduleRow))) {
                    //         gRow.custom.push(scheduleRow);
                    //     }
                    // }
                    // cabinetSchedule
                    // if (!cRow) {
                    // } else {
                    //     if (!cRow.custom) {
                    //         cRow.custom = [];
                    //     }
                    //     cRow.custom.push(scheduleRow);
                    // }
                    // employeeSchedule
                    // if (!eRow) {
                    // } else {
                    //     if (!eRow.custom) {
                    //         eRow.custom = [];
                    //     }
                    //     pushToPath(store.employeeSchedule, lesson.groupId, lesson.date, lesson.lesson_number, scheduleRow);
                    // }
                }
            } catch (e) {
                console.error(e);
            } finally {
                this.hideLoading();
            }
        },

        correctData(row, data) {
            if (row.lessonType && !row.lessonType.includes(data.category)) {
                row.lessonType.push(data.category);
            }
            return row;
        },
        getPracticePrefix(type) {
            if (+type === 1) {
                return 'УП.';
            } else if (+type === 2) {
                return 'ПП.';
            } else if (+type === 3) {
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

            const lesson = _.get(schedule, [id, date, lessonNumber], false);

            if (lesson.custom && lesson.custom.some(item => item.date === date && item.lessonNumber === lessonNumber)) {
                return {};
            }

            return lesson;
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