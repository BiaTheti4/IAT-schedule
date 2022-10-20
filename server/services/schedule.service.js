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
                        kt.category,
                        k.employeeId                                                             as main_employee,
                        k.grouped                                                                as practice_grouped,
                        k.grouped_k                                                              as course_grouped,
                        k.group_employee                                                         as practice_employee,
                        k.group_k_employee                                                       as course_employee,
                        cp.type                                                                  as practice_type,
                        IF(cs.id > 0, cs.code, sm.code)                                          AS subject_code
                 FROM schedule AS sch
                          INNER JOIN ktp k ON sch.ktp_id = k.ktpId
                          INNER JOIN ktp_list AS kl ON kl.listId = sch.list_id
                          INNER JOIN ktp_types AS kt ON kt.typeId = kl.typeId
                          INNER JOIN subjects AS s ON s.subjectId = k.subjectId
                          INNER JOIN employees AS e1 ON e1.employeeId = sch.employee_id
                          INNER JOIN cabinets AS c1 ON c1.id = sch.cabinet_id
                          LEFT JOIN employees AS e2 ON e2.employeeId = sch.optional_employee_id
                          LEFT JOIN cabinets AS c2 ON c2.id = sch.optional_employee_id
                          LEFT JOIN curriculum_subjects cs ON k.curriculumSubjectId = cs.id
                          LEFT JOIN curriculum_module_practice cp ON k.curriculumPracticeId = cp.id
                          LEFT JOIN standard_modules sm ON cp.moduleId = sm.id
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
                type: sequelize.QueryTypes.SELECT,
            }
        );
    }

    async getStudyWeekSchedule(date) {
        let dates = this.getStudyWeek(date);
        return this.getScheduleOnPeriod(dates[0], dates[1]);
    }

    getActiveYear(date) {
        const dt = moment(date);
        let year = dt.year();
        if (dt.month() < 8) {
            year--;
        }
        return year;
    }

    getStudyWeek(date) {
        let dt = moment(date);
        let year = this.getActiveYear(date);
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

    isTheory(type) {
        return type === 't' || type === 'c' || type === 's';
    }

    isPractice(type) {
        return type === 'l' || type === 'p';
    }

    isCourse(type) {
        return type === 'k';
    }

    parseSchedule(data) {
        let result = {};
        for (let row of data) {
            let key = `${row.date}_${row.groupId}_${row.lesson_number}`;
            let needSubgroup = false;
            if (this.isPractice(row.category) && row['practice_grouped'] > 0) {
                needSubgroup = row['main_employee'] !== row['practice_employee'];
            }
            if (this.isCourse(row.category) && row['course_grouped'] > 0) {
                needSubgroup = row['main_employee'] !== row['course_employee'];
            }
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
                    needSubgroup: needSubgroup,
                }
            } else {
                result[key].ids.push(row.id);
                result[key].lastHour = row.hour;
                result[key].needSubgroup = result[key].needSubgroup || needSubgroup;
                result[key].categories.push(row.category)
                result[key].categories = _.uniq(result[key].categories);
            }
        }
        return Object.values(result);
    }


    async updateSchedule(lessons) {


        let errors = [];
        for (const lesson of lessons) {
            for (let scheduleIndex in lesson.ids) {
                let scheduleId = lesson.ids[scheduleIndex];
                // update schedule
                if (scheduleId > 0) {
                    let scheduleRow = await models.schedule.findByPk(scheduleId);
                    if (!scheduleRow.id > 0) {
                        errors.push('Не найдено занятий в расписании для ID ' + scheduleId);
                    } else {
                        if (lesson.ktpId > 0) {
                            let ktp = await models.ktp.findByPk(lesson.ktpId);
                            if (scheduleIndex === 0) { // check only on first pair
                                let hasLessons = await this.checkIsBusy(ktp.groupId, lesson.date, lesson.lesson_number);
                                if (hasLessons) {
                                    let group = await ktp.getGroup();
                                    errors.push(`для группы ${group.name} урок №${lesson.lesson_number} уже содержит занятие`);
                                    continue;
                                }
                            }

                            let isNeedSecondEmployee = await ktpService.isNeedSecondEmployee(lesson.list_id)
                            scheduleRow.date = lesson.date;
                            scheduleRow.lesson_number = lesson.lesson_number;
                            scheduleRow.employee_id = lesson.teacherId;
                            scheduleRow.cabinet_id = lesson.cabinetId;
                            scheduleRow.optional_cabinet_id = isNeedSecondEmployee && lesson.optionalCabinetId ? lesson.optionalCabinetId : null;
                            scheduleRow.optional_employee_id = isNeedSecondEmployee && lesson.optionalTeacherId ? lesson.optionalTeacherId : null;
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
                            errors.push('Error on save schedule data:' + e.message)
                        }
                    }
                } else {
                    // remove schedule info

                }
            }
        }
        return errors.length > 0 ? _.uniq(errors) : true;
    }

    async checkIsBusy(groupId, date, lesson_number) {
        let result = await models.schedule.findAll({
            include: [{
                model: models.ktp,
                as: 'ktp',
            }],
            where: {
                date: date,
                '$ktp.groupId$': groupId,
                lesson_number: lesson_number
            },
            // logging: console.log,
        })
        return result.length !== 0;
    }

    async correctScheduleOrder(ktpId, correct) {
        // get defect ktp ids
        let ktpIds = await sequelize.query(
            `select distinct ktp_id
             from (select ktp_id,
                       hour,
                       row_number() over (partition by ktp_id order by date, lesson_number) as schedule_hour
                   from schedule as s
                   where date >= 0
                     and lesson_number
                       > 0
                   order by ktp_id, date, lesson_number) as schedule
             where hour != schedule_hour` +
            (ktpId > 0 ? ` AND ktp_id=${+ktpId}` : '')
            , {
                type: sequelize.QueryTypes.SELECT
            }
        );
        if (ktpIds.length === 0) {
            // all is good
            return false;
        }
        ktpIds = ktpIds.map((row) => row.ktp_id);
        let log = {};
        for (let ktpId of ktpIds) {
            let errors = await this.correctByKtpId(ktpId, false);
            if (errors.length) {
                log[ktpId] = {
                    name: await ktpService.geSubjectNameByKtp(ktpId),
                    errors: errors
                }
            }
        }
        if (correct) {
            if (ktpId) {
                await this.correctByKtpId(ktpId, true)
            }
        }

        return log;
    }

    async getScheduleOverlay() {
        let year = this.getActiveYear();
        let rows = await sequelize.query(
            `select count(id)            as cnt,
                    groupId,
                    group_concat(s.id)   as ids,
                    group_concat(ktp_id) as ktp_list,
                 date,
                 lesson_number
             from schedule as s
                 inner join ktp k
             on s.ktp_id = k.ktpId
             where date
                 >= :date
               and lesson_number
                 > 0
             group by groupId, date, lesson_number
             having cnt > 2
             order by date, lesson_number, ktp_id`
            , {
                replacements: {
                    date: year + '-09-01'
                },
                type: sequelize.QueryTypes.SELECT
            }
        );

        let errors = {};
        for (let row of rows) {
            if (!errors[row.date]) {
                errors[row.date] = {}
            }
            if (!errors[row.date][row.groupId]) {
                errors[row.date][row.groupId] = [];
            }
            let ktps = {};
            let scheduleIds = row.ids.split(',');
            let ktpIds = row.ktp_list.split(',');
            for (let index in ktpIds) {
                const ktpId = ktpIds[index];
                if (!ktps[ktpId]) {
                    ktps[ktpId] = {
                        name: await ktpService.geSubjectNameByKtp(ktpIds[index]),
                        ids: []
                    };
                }
                ktps[ktpId].ids.push(scheduleIds[index]);
            }

            errors[row.date][row.groupId].push({
                lesson_number: row.lesson_number,
                ktps: ktps
            })

        }
        return errors;
    }

    async correctScheduleOverlay(ids) {
        if (!ids || ids.length === 0) {
            return false;
        }
        await sequelize.query(
            `UPDATE schedule
             SET date=null,
                 lesson_number=0
             where id IN (:ids)`
            , {
                replacements: {
                    ids: ids,
                },
                type: sequelize.QueryTypes.UPDATE
            }
        )


        return true;
    }

    async correctByKtpId(ktpId, correct) {
        let errors = [];
        let rows = await sequelize.query(
            `select *
             from schedule as s
             where ktp_id = :ktpId
             order by ktp_id, hour`
            , {
                replacements: {
                    ktpId: ktpId
                },
                type: sequelize.QueryTypes.SELECT
            }
        );

        let dates = rows.reduce((acc, row) => {
            if (row.date && row.lesson_number > 0)
                acc[row.date] = [...acc[row.date] || [], row.lesson_number]
            return acc;
        }, {});
        // order dates
        dates = Object.keys(dates).sort().reduce((obj, key) => {
            obj[key] = dates[key];
            return obj
        }, {})

        let rowIndex = 0;
        let lastHour = 0;
        for (let date in dates) {
            let lessonNumbers = dates[date].sort();
            for (let lessonNumber of lessonNumbers) {
                let row = rows[rowIndex++];//
                lastHour = row.hour;

                // correct
                if (row.date === date && +row.lesson_number === +lessonNumber) {
                    continue;
                }
                if (correct) {

                    let scheduleRow = await models.schedule.findByPk(row.id);
                    row.date = date;
                    row.lesson_number = lessonNumber;
                    scheduleRow.set({...row});
                    let result = false;
                    try {
                        result = await scheduleRow.save(['date', 'lesson_number', 'employee_id', 'cabinet_id', 'optional_employee_id', 'optional_cabinet_id'])
                        if (!result) {
                            errors.push({list_id: row['list_id'], message: 'Can not save schedule data'})
                        }
                    } catch (e) {
                        errors.push({list_id: row['list_id'], message: 'Error on save schedule data:' + e.message});
                    }
                } else {
                    errors.push({
                        list_id: row['list_id'],
                        message: `Нарушен порядок. должен быть ${date} (${lessonNumber} пара), стоит ${row.date} (${row.lesson_number} пара)`
                    })
                }
            }
        }
        if (correct) {
            await sequelize.query(
                `UPDATE schedule
                 SET date=null,
                     lesson_number=0
                 where ktp_id = :ktpId AND hour > :hour`
                , {
                    replacements: {
                        ktpId: ktpId,
                        hour: lastHour
                    },
                    type: sequelize.QueryTypes.UPDATE
                }
            )
        }
        return errors;
    }

    async compareJournal() {
        let scheduleRows = await sequelize.query(
            `select *
             from schedule as s
             where date >= 0
               and lesson_number
                 > 0
               and ktp_id=13906
             order by ktp_id, date, lesson_number, hour`
            , {
                type: sequelize.QueryTypes.SELECT
            }
        );
        let schedule = {};
        for (let row of scheduleRows) {
            if (!schedule[row.ktp_id]) {
                schedule[row.ktp_id] = {
                    name: await ktpService.geSubjectNameByKtp(row.ktp_id),
                    dates: {}
                };
            }
            if (!schedule[row.ktp_id]['dates'][row.date]) {
                schedule[row.ktp_id]['dates'][row.date] = [];
            }
            schedule[row.ktp_id]['dates'][row.date].push({
                ...row,
                journal: null,
                journal2: null,
                problem: false
            });
        }
        // get journals
        let activeYear = this.getActiveYear();
        let journalRows = await sequelize.query(
            `select *
             from journal as j
             where date >= '${activeYear}-09-01'
               and type in (0
                 , 2)
               and ktpId=13906

             order by ktpId, date, journalId`
            , {
                type: sequelize.QueryTypes.SELECT
            }
        );
        let scheduleDateIndex = {};
        for (let row of journalRows) {
            if (!schedule[row.ktpId]) {
                schedule[row.ktpId] = {
                    name: await ktpService.geSubjectNameByKtp(row.ktpId),
                    dates: {}
                };
            }
            if (!schedule[row.ktpId]['dates'][row.date]) {
                schedule[row.ktpId]['dates'][row.date] = [];
            }
            let key = row.ktpId + '_' + row.subgroup;
            if (!scheduleDateIndex[key]) {
                scheduleDateIndex[key] = 0;
            }
            if (!schedule[row.ktpId]['dates'][row.date][scheduleDateIndex[key]]) {
                schedule[row.ktpId]['dates'][row.date].push({
                    lesson_number: 0,
                    list_id: row.listId,
                    employee_id: +row.subgroup < 2 ? row.employeeId : null,
                    optional_employee_id: +row.subgroup == 2 ? row.employeeId : null,
                    problem: true
                });
            } else {
                let curRow = schedule[row.ktpId]['dates'][row.date][scheduleDateIndex[key]];
                if (row.subgroup < 2) {
                    curRow['journal'] = row;
                } else {
                    curRow['journal2'] = row;
                }
                curRow['problem'] = curRow['problem'] || curRow['list_id'] != row.listId;
            }
            scheduleDateIndex[key]++;
        }

        return schedule;
    }

}

module.exports = new ScheduleService()