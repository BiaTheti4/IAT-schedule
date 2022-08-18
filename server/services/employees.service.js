const sequelize = require("../models");
const {models} = require("../models/index");
const {Op} = require("sequelize");


class EmployeesService {
    async getEmployees() {
        return await models.employee.findAll({
            attributes: ['employeeId', 'last_name', 'first_name', 'fathers_name'],
            where: {
                status: 2,
                [Op.and]: sequelize.literal('EXISTS(SELECT id from employee_contracts as ec where ec.employeeId = employee.employeeId AND ec.status = 3)')
            },
            group: 'employeeId',
            order: [
                ['last_name'],
                ['first_name'],
                ['fathers_name'],
            ]
        })

        // return await sequelize.query('SELECT e.employeeId, e.last_name, e.first_name, e.fathers_name FROM employees AS e ' +
        //     'WHERE (e.status = 2) and ' +
        //     'EXISTS(SELECT id from employee_contracts as ec where ec.employeeId = e.employeeId AND ec.status = 3)' +
        //     'GROUP BY e.employeeId ' +
        //     'ORDER BY last_name ASC, first_name ASC, fathers_name ASC')
    }

    async getBusynessEmployees(dateStart, dateEnd) {

        return await sequelize.query('select schedule_new.teacher_id, ' +
            ' concat(e.last_name, \' \', left(e.first_name, 1), ".", \' \', left(e.fathers_name, 1),".") as fio ' +
            'from schedule_new ' +
            'inner join employees e on schedule_new.teacher_id = e.employeeId ' +
            'where date >= :dateStart ' +
            'and date <= :dateEnd ' +
            'union ' +
            'select schedule_new.optional_teacher_id, ' +
            ' concat(e.last_name, \' \', left(e.first_name, 1), ".", \' \', left(e.fathers_name, 1),".") as fio ' +
            'from schedule_new ' +
            'inner join employees e on schedule_new.optional_teacher_id = e.employeeId ' +
            'where date >= :dateStart ' +
            'and date <= :dateEnd ' +
            'group by fio ' +
            'order by fio asc', {
                replacements: {
                    dateStart: String(dateStart),
                    dateEnd: String(dateEnd),
                },
                type: sequelize.QueryTypes.SELECT
            }
        );
    }

    async getTeacherName(teacherId) {
        // return await sequelize.query("select concat(last_name, ' ',first_name, ' ',fathers_name) as fio from employees where employeeId=:id", {
        //         replacements: {
        //             id: teacherId,
        //         },
        //         type: sequelize.QueryTypes.SELECT
        //     }
        // );
    }
}

module.exports = new EmployeesService()