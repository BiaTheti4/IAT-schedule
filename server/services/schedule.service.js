const sequelize = require("../models");

class ScheduleService {
    async getCurrentSchedule(date) {
        return await sequelize.query(
            'select schedule_new.id,' +
            'schedule_new.date,' +
            'schedule_new.subject_id,' +
            's.name as subject,' +
            'g.groupId,' +
            'g.name,' +
            'g.course,' +
            'schedule_new.status,' +
            'schedule_new.event,' +
            'schedule_new.cabinet_id,' +
            'c.number,' +
            'schedule_new.lesson_number,' +
            'concat(e.last_name, \' \', left(e.first_name,1),".", \' \', left(e.fathers_name,1),".") as main_emp, ' +
            'schedule_new.teacher_id,' +
            'concat(emp.last_name, \' \', left(emp.first_name,1),".", \' \', left(emp.fathers_name,1),".") as group_emp, ' +
            'schedule_new.optional_teacher_id from schedule_new ' +
            '    inner join employees e on schedule_new.teacher_id = e.employeeId ' +
            '    left join employees emp on schedule_new.optional_teacher_id=emp.employeeId ' +
            '    inner join cabinets c on schedule_new.cabinet_id = c.id ' +
            '    inner join `groups` g on schedule_new.group_id = g.groupId ' +
            '    inner join subjects s on schedule_new.subject_id = s.subjectId ' +
            ' where date=:date', {
                replacements: {date: String(date)},
                type: sequelize.QueryTypes.SELECT
            }
        )
    }

    async getWeekSchedule(date) {
        return await sequelize.query(
            'select s.nameShort as subject_name,' +
            'c.number,' +
            'g.name,' +
            'date,' +
            'schedule_new.event,' +
            'schedule_new.lesson_number,' +
            'concat(e.last_name, \' \', e.first_name, \' \', e.fathers_name) as main_emp,' +
            ' concat(emp.last_name, \' \', emp.first_name, \' \', emp.fathers_name) as group_emp' +
            ' from schedule_new' +
            '    inner join employees e on schedule_new.teacher_id = e.employeeId ' +
            '    left join employees emp on schedule_new.optional_teacher_id=emp.employeeId ' +
            '    inner join cabinets c on schedule_new.cabinet_id = c.id ' +
            '    inner join `groups` g on schedule_new.group_id = g.groupId ' +
            '    inner join subjects s on schedule_new.subject_id = s.subjectId ' +
            ' where date>=:date', {
                replacements: {date: String(date)},
                type: sequelize.QueryTypes.SELECT
            }
        )
    }

    async getPrintSchedule(date) {
        return await sequelize.query(
            ' select date, ' +
            ' schedule_new.status, ' +
            ' schedule_new.event, ' +
            ' lesson_number, ' +
            'concat(e.last_name, \' \', left(e.first_name,1),".", \' \', left(e.fathers_name,1),".") as main_emp, ' +
            'concat(emp.last_name, \' \', left(emp.first_name,1),".", \' \', left(emp.fathers_name,1),".") as group_emp, ' +
            ' s.nameShort, ' +
            ' g.name, ' +
            ' c.number, ' +
            ' g.course ' +
            ' from schedule_new ' +
            ' inner join employees e on schedule_new.teacher_id = e.employeeId ' +
            ' inner join employees emp on schedule_new.optional_teacher_id = emp.employeeId ' +
            ' inner join subjects s on schedule_new.subject_id = s.subjectId ' +
            ' inner join `groups` g on schedule_new.group_id = g.groupId ' +
            ' inner join cabinets c on schedule_new.cabinet_id = c.id ' +
            ' where date=:date', {
                replacements: {date: String(date)},
                type: sequelize.QueryTypes.SELECT
            }
        )
    }

    async createNewLesson(lesson) {
        return await sequelize.query(
            'insert into schedule_new(date, status,lesson_number,teacher_id,optional_teacher_id,subject_id,group_id,cabinet_id)' +
            `values (:date,:status,:lesson,:teacher,:optional_teacher,:subject,:group,:cabinet)`,
            {
                replacements: {
                    date: lesson.date,
                    status: lesson.status,
                    // event: lesson.event,
                    lesson: lesson.lessonNumber,
                    teacher: lesson.teacher,
                    optional_teacher: lesson.optionalTeacher,
                    subject: lesson.subject,
                    group: lesson.groupId,
                    cabinet: lesson.cabinet
                },
                type: sequelize.QueryTypes.insert
            }
        )
    }

    async getWeekHours(currentDate, startWeek, endWeek, groupId) {
        console.log(currentDate, startWeek, endWeek, groupId);
        return await sequelize.query(
            'select count(id) ' +
            'from schedule_new ' +
            'where group_id=:group and ' +
            'schedule_new.date between( :start and :end ) and '+
            'schedule_new.date <> :currentDate '


            , {
                replacements: {
                    currentDate: String(currentDate),
                    start: String(startWeek),
                    end: String(endWeek),
                    group: groupId,

                },
                type: sequelize.QueryTypes.update

            }
        )
    }

    async updateSchedule(lesson) {
        console.log(lesson)
        return await sequelize.query(
            'update schedule_new set ' +
            'status=:status,' +
            'lesson_number=:lesson,' +
            'teacher_id=:teacher,' +
            'optional_teacher_id=:optional_teacher,' +
            'subject_id=:subject,' +
            'group_id=:group,' +
            'cabinet_id=:cabinet ' +
            'where id=:id', {
                replacements: {
                    id: lesson.id,
                    date: lesson.date,
                    status: lesson.status,
                    // event: lesson.event,
                    lesson: lesson.lessonNumber,
                    teacher: lesson.teacher,
                    optional_teacher: lesson.optionalTeacher,
                    subject: lesson.subject,
                    group: lesson.groupId,
                    cabinet: lesson.cabinet
                },
                type: sequelize.QueryTypes.update

            }
        )
    }

    async deleteSchedule(id) {
        return await sequelize.query(
            'delete from schedule_new where id=:id', {
                replacements: {id: id},
            }
        )
    }
}

module.exports = new ScheduleService()