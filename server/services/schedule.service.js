const sequelize = require("../models");
const moment = require('moment');
const {models} = require("../models/index");
const _ = require('lodash');
const ktpService = require('./ktp.service');

class ScheduleService {

    const
    mainQuery = `select sch.id                                                                                    as id,
                        sch.date,
                        sch.ktp_id,
                        sch.cabinet_id,
                        sch.status,
                        sch.optional_cabinet_id,
                        sch.lesson_number,
                        sch.pair_number,
                        sch.employee_id,
                        sch.optional_employee_id,
                        sch.list_id,

                        g.groupId,
                        g.name,
                        s.nameShort,
                        k.semester,
                        CEIL(k.semester / 2)                                                                      as course,
                        c.number,
                        cab.number                                                                                as optional_cabinet,
                        concat(e.last_name, ' ', left(e.first_name,1),".", ' ', left(e.fathers_name,1),".")       as main_emp,
                        concat(emp.last_name, ' ', left(emp.first_name,1),".", ' ', left(emp.fathers_name,1),".") as group_emp
                 from schedule as sch
                          left join employees e on sch.employee_id = e.employeeId
                          left join employees emp on sch.optional_employee_id = emp.employeeId
                          left join cabinets c on sch.cabinet_id = c.id
                          left join cabinets cab on sch.optional_cabinet_id = cab.id
                          inner join ktp k on sch.ktp_id = k.ktpId
                          inner join \`groups\` g on k.groupId = g.groupId
                          inner join subjects s on s.subjectId = k.subjectId
                          inner join ktp_list as kl ON kl.listId = sch.list_id
                          inner join ktp_types as kt on kt.typeId = kl.typeId
                 where #WHERE#
                 order by sch.ktp_id, sch.hour
    `;

    async getCurrentSchedule(date) {
        return this.getScheduleOnPeriod(date, date);
    }

    async getScheduleOnPeriod(dateStart, dateEnd) {
        let query = this.mainQuery;
        query = query.replace('#WHERE#', `date >=:dateStart AND date <=:dateEnd`)
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

    async getScheduleFeature(hoursLimit) {
        hoursLimit = hoursLimit || 15;
        let query = `select id,
                            ktp_id,
                            status,
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
                                LIMIT 1) AS cabinet_need
                     from (SELECT sch.id AS id,
                         sch.ktp_id,
                         sch.status,
                         sch.list_id,
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
                         WHERE date IS NULL
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


    async getWeekSchedule(date) {
        let dateEnd = moment(date).add(7, 'days').format('YYYY-MM-DD');

        return this.getScheduleOnPeriod(date, dateEnd);
    }

    async getStudyWeekSchedule(date) {
        let dates = this.getStudyWeek(date);
        // console.log(dates)
        return this.getScheduleOnPeriod(dates[0], dates[1]);
    }

    getStudyWeek(date) {
        // console.log(date.date)
        let dt = moment(date.date);
        console.log(dt)
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

    async getPrintSchedule(date) {
        return await sequelize.query(
            `select date,
                 schedule.status,
                 lesson_number,
                 concat(e.last_name, ' ', left (e.first_name, 1), ".", ' ', left (e.fathers_name, 1), ".") as main_emp,
                 concat(emp.last_name, ' ', left (emp.first_name, 1), ".", ' ', left (emp.fathers_name, 1), ".") as group_emp,
                 s.nameShort,
                 g.name,
                 c.number,
                 cab.number as optionalCabinet,
                 g.course
             from schedule
                 inner join employees e
             on schedule.employee_id = e.employeeId
                 left join employees emp on schedule.optional_employee_id = emp.employeeId
                 inner join ktp k on schedule.ktp_id=k.ktpId
                 inner join subjects s on k.subjectId = s.subjectId
                 inner join \`groups\` g on schedule.group_id = g.groupId
                 inner join cabinets c on schedule.cabinet_id = c.id
                 left join cabinets cab on schedule.optional_cabinet_id=cab.id
             where date =: date`, {
                replacements: {date: String(date)},
                type: sequelize.QueryTypes.SELECT
            }
        )
    }

    async getEmployeeSchedule(dateStart, dateEnd) {
        return await sequelize.query(
            `select date,
                 lesson_number,
                 concat(e.last_name, ' ', left (e.first_name, 1), '.', ' ', left (e.fathers_name, 1), '.') as employee,
                 e.employeeId as emp_id,
                 if(cab.number is null, c.number, concat(c.number, ' ', cab.number)) as cab_numbers,
                 s.nameShort,
                 g.name
             from schedule
                 inner join employees e
             on schedule.employee_id = e.employeeId
                 inner join cabinets c on schedule.cabinet_id = c.id
                 left join cabinets cab on schedule.optional_cabinet_id = cab.id
                 inner join ktp k on schedule.ktp_id = k.ktpId
                 inner join subjects s on k.subjectId = s.subjectId
                 inner join \`groups\` g on k.groupId = g.groupId
             where date >= :dateStart
               and date <= :dateEnd
             union
            select date,
                lesson_number,
                concat(emp.last_name, ' ', left (emp.first_name, 1), '.', ' ', left (emp.fathers_name, 1), '.') as employee,
                emp.employeeId as emp_id,
                if(cab.number is null, c.number, concat(c.number, ' ', cab.number)) as cab_numbers,
                s.nameShort,
                g.name
            from schedule
                inner join employees emp
            on schedule.optional_employee_id = emp.employeeId
                inner join cabinets c on schedule.cabinet_id = c.id
                left join cabinets cab on schedule.optional_cabinet_id = cab.id
                inner join ktp k on schedule.ktp_id = k.ktpId
                inner join subjects s on k.subjectId = s.subjectId
                inner join \`groups\` g on k.groupId = g.groupId
            where date >= :dateStart
              and date <= :dateEnd`, {
                replacements: {
                    dateStart: String(dateStart),
                    dateEnd: String(dateEnd)
                },
                type: sequelize.QueryTypes.SELECT
            }
        )
    }

    async getCabinetSchedule(dateStart, dateEnd) {
        return await sequelize.query(
            `select date,
                 lesson_number,
                 c.number as cabinet,
                 s.nameShort,
                 g.name,
                 concat(e.last_name, ' ', left (e.first_name, 1), '.', ' ', left (e.fathers_name, 1), '.') as main,
                 if(emp.employeeId is null, null,
                 concat(emp.last_name, ' ', left (emp.first_name, 1), '.', ' ', left (emp.fathers_name, 1), '.')) as group_emp
             from schedule
                 inner join cabinets c
             on schedule.cabinet_id = c.id
                 inner join ktp k on schedule.ktp_id = k.ktpId
                 inner join subjects s on k.subjectId = s.subjectId
                 inner join \`groups\` g on k.groupId = g.groupId
                 inner join employees e on schedule.employee_id = e.employeeId
                 left join employees emp on schedule.optional_employee_id = emp.employeeId
             where date >= :dateStart
               and date <= :dateEnd
             union
            select date,
                lesson_number,
                cab.number as cabinet,
                s.nameShort,
                g.name,
                concat(e.last_name, ' ', left (e.first_name, 1), '.', ' ', left (e.fathers_name, 1), '.') as main,
                if(emp.employeeId is null, null,
                concat(emp.last_name, ' ', left (emp.first_name, 1), '.', ' ', left (emp.fathers_name, 1), '.')) as group_emp
            from schedule
                inner join cabinets cab
            on schedule.optional_cabinet_id = cab.id
                inner join ktp k on schedule.ktp_id = k.ktpId
                inner join subjects s on k.subjectId = s.subjectId
                inner join \`groups\` g on k.groupId = g.groupId
                inner join employees e on schedule.employee_id = e.employeeId
                left join employees emp on schedule.optional_employee_id = emp.employeeId
            where date >= :dateStart
              and date <= :dateEnd
            group by cabinet`, {
                replacements: {
                    dateStart: String(dateStart),
                    dateEnd: String(dateEnd)
                },
                type: sequelize.QueryTypes.SELECT
            }
        )
    }

    async createNewLesson(lesson) {
        return await models.schedule.create({
            date: lesson.date,
            status: lesson.status,
            lesson_number: parseInt(lesson.lessonNumber),
            employee_id: lesson.teacher,
            optional_employee_id: lesson.optionalTeacher !== '' ? lesson.optionalTeacher : null,
            group_id: lesson.groupId,
            cabinet_id: lesson.cabinet,
            optional_cabinet_id: lesson.optionalCabinet !== '' ? lesson.optionalCabinet : null,
            ktp_id: lesson.ktp,
        });
    }

    async getWeekHours(date) {
        let data = await this.getStudyWeekSchedule(date);
        let result = {};

        data.forEach((row) => {

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
            result[row.groupId].hours[row.date] += 2;
        });
        return result;
    }

    async getLessonId() {
        return await sequelize.query(
            'select max(id) as id from schedule', {
                type: sequelize.QueryTypes.select
            }
        )
    }

    async updateSchedule(lessons) {


        let errors = [];
        for (const lesson of lessons) {
            for (let scheduleId of lesson.ids) {
                // update schedule
                if (scheduleId > 0) {
                    let scheduleRow = models.schedule.findByPk(scheduleId);
                    if (!scheduleRow) {
                        errors.push('Не найдено занятий в расписании для ID ' + scheduleId);
                    } else {

                        let isNeedSecondEmployee = await ktpService.isNeedSecondEmployee(lesson.list_id)
                        let updateData = {};
                        if (lesson.ktpId > 0) {
                            updateData = {
                                date: lesson.date,
                                lesson_number: lesson.lesson_number,
                                employee_id: lesson.teacherId,
                                cabinet_id: lesson.cabinetId,
                                optional_employee_id: isNeedSecondEmployee ? lesson.optionalCabinetId : null,
                                optional_cabinet_id: isNeedSecondEmployee ? lesson.optionalTeacherId : null,
                            };
                        } else {
                            updateData = {
                                date: null,
                                lesson_number: null,
                                employee_id: null,
                                cabinet_id: null,
                                optional_employee_id: null,
                                optional_cabinet_id: null,
                            };
                        }

                        const result = await models.schedule.update(updateData,
                            {
                                where: {
                                    id: scheduleId
                                }
                            });
                        if (!result) {
                            errors.push('Can not save schedule data')
                        }
                    }
                } else {
                    // remove schedule info

                }
            }
        }
        return errors.length > 0 ? errors : true;
        // return await models.schedule.update({
        //         status: lesson.status,
        //         lesson_number: lesson.lessonNumber,
        //         employee_id: lesson.teacher,
        //         optional_employee_id: lesson.optionalTeacher !== null ? lesson.optionalTeacher : null,
        //         group_id: lesson.groupId,
        //         cabinet_id: lesson.cabinet,
        //         optional_cabinet_id: lesson.optionalCabinet !== null ? lesson.optionalCabinet : null,
        //         ktp_id: lesson.ktp,
        //     },
        //     {
        //         where: {id: lesson.id}
        //     });
    }

    async deleteSchedule(lessonId) {
        return await sequelize.query(
            'delete from schedule where id=:id', {
                replacements: {id: lessonId},
            }
        )
    }
}

module.exports = new ScheduleService()