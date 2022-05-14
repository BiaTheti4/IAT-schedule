const sequelize = require("../models");

class ScheduleService {
    async getCurrentSchedule(date) {
        return await sequelize.query(
            'select schedule_new.id,schedule_new.date,schedule_new.status,schedule_new.event,schedule_new.lesson_number,schedule_new.teacher_id,schedule_new.optional_teacher_id from schedule_new' +
            ' where date=:date', {
                replacements:{date:String(date)},
                type: sequelize.QueryTypes.SELECT
            }
        )
    }

    async getWeekSchedule(date) {
        return await sequelize.query(
            'select s.name,c.number,status,event,lesson_number,concat(e.last_name, \' \', e.first_name, \' \', e.fathers_name) as main_emp, concat(emp.last_name, \' \', emp.first_name, \' \', emp.fathers_name) as group_emp from schedule_new' +
            '    inner join employees e on schedule_new.teacher_id = e.employeeId' +
            '    inner join employees emp on schedule_new.optional_teacher_id=emp.employeeId' +
            '    inner join cabinets c on schedule_new.cabinet_id = c.id' +
            '    inner join `groups` g on schedule_new.group_id = g.groupId' +
            '    inner join subjects s on schedule_new.subject_id = s.subjectId' +
            'where date>=:date', {
                replacements:{date:String(date)},
                type: sequelize.QueryTypes.SELECT
            }
        )
    }

    async createNewLesson({
                              date,
                              status,
                              event,
                              lesson_number,
                              teacher_id,
                              optional_teacher_id,
                              subject_id,
                              group_id,
                              cabinet_id
                          }) {
        return await sequelize.query(
            'insert into schedule_new(date, status,event,lesson_number,teacher_id,optional_teacher_id,subject_id,group_id,cabinet_id)' +
            `values (:date,:status,:event,:lesson,:teacher,:optional_teacher,:subject,:group,:cabinet)`,
            {
                replacements: {
                    date: date,
                    status: status,
                    event: event,
                    lesson: lesson_number,
                    teacher: teacher_id,
                    optional_teacher: optional_teacher_id,
                    subject: subject_id,
                    group: group_id,
                    cabinet: cabinet_id
                }
            }
        )
    }

    async updateSchedule({
                             status,
                             event,
                             lesson_number,
                             teacher_id,
                             optional_teacher_id,
                             subject_id,
                             group_id,
                             cabinet_id,
                             id
                         }) {
        return await sequelize.query(
            'update schedule_new set status=:status,event=:event,lesson_number=:lesson,teacher_id=:teacher,optional_teacher_id=:optional_teacher,subject_id=:subject,group_id=:group,cabinet_id=:cabinet ' +
            'where id=:id', {
                replacements: {
                    status: status,
                    event: event,
                    lesson: lesson_number,
                    teacher: teacher_id,
                    optional_teacher: optional_teacher_id,
                    subject: subject_id,
                    group: group_id,
                    cabinet: cabinet_id,
                    id: id
                }
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