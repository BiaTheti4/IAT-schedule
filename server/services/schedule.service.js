const sequelize = require("../models");
const moment = require('moment');
const {models} = require("../models/index");
const _ = require('lodash');
const ktpService = require('./ktp.service');

class ScheduleService {

    const
    mainQuery = `SELECT sch.id,
                        sch.date,
                        sch.ktp_id,
                        sch.cabinet_id,
                        sch.status,
                        sch.hour,
                        sch.optional_cabinet_id,
                        sch.lesson_number,
                        sch.pair_number,
                        sch.employee_id,
                        sch.optional_employee_id,
                        sch.list_id,
                        k.groupId,
                        s.name                                                                   as subject,
                        c1.number                                                                AS cabinet,
                        c2.number                                                                AS second_cabinet,
                        CONCAT(e1.last_name, ' ', SUBSTRING(e1.first_name, 1, 1), '.',
                               SUBSTRING(e1.fathers_name, 1, 1), '.')                            AS employee,
                        IF(e2.employeeId > 0, CONCAT(e2.last_name, ' ', SUBSTRING(e2.first_name, 1, 1), '.',
                                                     SUBSTRING(e2.fathers_name, 1, 1), '.'), '') AS second_employee,

                        k.groupId,
                        k.semester,
                        CEIL(k.semester / 2)                                                     AS course,
                        kt.category
                 FROM schedule AS sch
                          INNER JOIN ktp k ON sch.ktp_id = k.ktpId
                          INNER JOIN ktp_list AS kl ON kl.listId = sch.list_id
                          INNER JOIN ktp_types AS kt ON kt.typeId = kl.typeId
                          INNER JOIN subjects AS s ON s.subjectId = k.subjectId
                          INNER JOIN employees AS e1 ON e1.employeeId = sch.employee_id
                          INNER JOIN cabinets AS c1 ON c1.id = sch.cabinet_id
                          LEFT JOIN employees AS e2 ON e1.employeeId = sch.optional_employee_id
                          LEFT JOIN cabinets AS c2 ON c2.id = sch.optional_employee_id
                 WHERE #WHERE#
                 ORDER BY sch.ktp_id, sch.hour
    `;

    async getCurrentSchedule(date) {
        return this.getScheduleOnPeriod(date, date);
    }

    async getScheduleOnPeriod(dateStart, dateEnd) {
        let query = this.mainQuery;
        query = query.replace('#WHERE#', `sch.date >=:dateStart AND sch.date <=:dateEnd`)
        return await sequelize.query(
            query, {
                replacements: {
                    dateStart: String(dateStart),
                    dateEnd: String(dateEnd)
                },
                type: sequelize.QueryTypes.SELECT
            }
        );
    }

    async getStudyWeekSchedule(date) {
        let dates = this.getStudyWeek(date);
        console.log(dates)
        return this.getScheduleOnPeriod(dates[0], dates[1]);
    }

    getStudyWeek(date) {
        let dt = moment(date);
        let year = dt.year();
        if (dt.month() < 8) {
            year--;
        }
        let startDate = moment(year + '-09-01');// start week
        let diffWeeks = dt.diff(startDate, 'weeks');
        let startWeekDate = startDate.add(diffWeeks, 'w');
        let endWeekDate = startWeekDate.clone().add(6, 'd');
        return [startWeekDate.format('YYYY-MM-DD'), endWeekDate.format('YYYY-MM-DD')]
    }

    async getWeekHours(date) {
        let data = await this.getStudyWeekSchedule(date);
        if (!data) {
            return {};
        }
        let result = {};

        for (let row of data) {
            if (row.date == date) {
                continue;
            }
            if (!result[row.groupId]) {
                result[row.groupId] = {
                    groupId: row.groupId,
                    course: row.course,
                    hours: {},
                };
            }
            if (!result[row.groupId].hours[row.date]) {
                result[row.groupId].hours[row.date] = 0;
            }
            result[row.groupId].hours[row.date]++;
        }
        return result;
    }

    async getScheduleFeature(hoursLimit) {
        hoursLimit = hoursLimit || 15;
        let query = `select id,
                            ktp_id,
                            status,
                            s.hour,
                            list_id,
                            semester,
                            main_employee,
                            practice_employee,
                            course_employee,
                            category,
                            course,
                            (SELECT cabinet_id
                             FROM schedule AS s2
                                      INNER JOIN ktp_list l ON s2.list_id = l.listId
                                      INNER JOIN ktp_types t ON l.typeId = t.typeId
                             WHERE s.ktp_id = s2.ktp_id
                               AND s.category = t.category
                               and s2.cabinet_id > 0
                             GROUP BY cabinet_id
                             ORDER BY COUNT(s2.id) DESC
                                LIMIT 1) AS cabinet_need,
                            (SELECT cabinet_id
                             FROM schedule AS s3
                                      INNER JOIN ktp_list l ON s3.list_id = l.listId
                                      INNER JOIN ktp_types t ON l.typeId = t.typeId
                             WHERE s.ktp_id = s3.ktp_id
                               AND s.category = t.category
                               and s3.optional_cabinet_id > 0
                             GROUP BY optional_cabinet_id
                             ORDER BY COUNT(s3.id) DESC
                                LIMIT 1) AS cabinet_optional_need
                     from (SELECT sch.id AS id,
                         sch.ktp_id,
                         sch.status,
                         sch.list_id,
                         sch.hour,
                         k.semester,
                         k.employeeId as main_employee,
                         IF(k.grouped, k.group_employee, null) as practice_employee,
                         IF(k.grouped_k, k.group_k_employee, null) as course_employee,
                         kt.category,
                         CEIL(k.semester / 2) AS course,
                         ROW_NUMBER() OVER (PARTITION BY sch.ktp_id ORDER BY sch.hour) AS row_num
                         FROM schedule AS sch
                         INNER JOIN ktp k ON sch.ktp_id = k.ktpId
                         INNER JOIN ktp_list AS kl ON kl.listId = sch.list_id
                         INNER JOIN ktp_types AS kt ON kt.typeId = kl.typeId
                         WHERE date IS NULL and kt.category!='i'
                         ORDER BY sch.ktp_id, sch.hour) as s
                     WHERE s.row_num < :hoursLimit`;

        let result = await sequelize.query(
            query, {
                replacements: {
                    hoursLimit: String(hoursLimit),
                },
                type: sequelize.QueryTypes.SELECT
            }
        );

        return _.groupBy(result, 'ktp_id');
    }

    parseSchedule(data) {
        let result = {};
        for (let row of data) {
            let key = `${row.date}_${row.groupId}_${row.lesson_number}`;
            if (!result[key]) {
                result[key] = {
                    id: row.id,
                    ids: [row.id],
                    groupId: row.groupId,
                    course: row.course,
                    semester: row.semester,
                    ktpId: row.ktp_id,
                    listId: row.list_id,
                    lesson_number: row.lesson_number,
                    categories: [row.category],
                    teacherId: row.employee_id,
                    optionalTeacherId: row.optional_employee_id,
                    cabinetId: row.cabinet_id,
                    optionalCabinetId: row.optional_cabinet_id,
                    lastHour: row.hour,
                }
            } else {
                result[key].ids.push(row.id);
                result[key].lastHour = row.hour;
                result[key].categories.push(row.category)
                result[key].categories = _.uniq(result[key].categories);
            }
        }
        return Object.values(result);
    }


    async updateSchedule(lessons) {


        let errors = [];
        for (const lesson of lessons) {
            for (let scheduleId of lesson.ids) {
                // update schedule
                if (scheduleId > 0) {
                    let scheduleRow = await models.schedule.findByPk(scheduleId);
                    if (!scheduleRow.id > 0) {
                        errors.push('Не найдено занятий в расписании для ID ' + scheduleId);
                    } else {
                        let updateData = {};
                        if (lesson.ktpId > 0) {
                            let isNeedSecondEmployee = await ktpService.isNeedSecondEmployee(lesson.list_id)
                            scheduleRow.date = lesson.date;
                            scheduleRow.lesson_number = lesson.lesson_number;
                            scheduleRow.employee_id = lesson.teacherId;
                            scheduleRow.cabinet_id = lesson.cabinetId;
                            scheduleRow.optional_cabinet_id = isNeedSecondEmployee ? lesson.optionalCabinetId : null;
                            scheduleRow.optional_employee_id = isNeedSecondEmployee ? lesson.optionalTeacherId : null;
                        } else {
                            scheduleRow.date = null;
                            scheduleRow.lesson_number = null;
                            // scheduleRow.employee_id = null;
                            scheduleRow.cabinet_id = null;
                            scheduleRow.optional_employee_id = null;
                            scheduleRow.optional_cabinet_id = null;
                        }

                        let result = false;
                        try {
                            result = await scheduleRow.save(['date', 'lesson_number', 'employee_id', 'cabinet_id', 'optional_employee_id', 'optional_cabinet_id'])
                            if (!result) {
                                errors.push('Can not save schedule data')
                            }
                        } catch (e) {
                            errors.push('Error on save schedule data')
                        }
                    }
                } else {
                    // remove schedule info

                }
            }
        }
        return errors.length > 0 ? errors : true;
    }

}

module.exports = new ScheduleService()