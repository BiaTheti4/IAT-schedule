const sequelize = require("../models");
const { models } = require("../models/index");
const { Op } = require("sequelize");


class EmployeesService {
    async getEmployees() {
        console.log('abobus')
        return await sequelize.query(
            'select e.employeeId, e.last_name, e.first_name, e.fathers_name from employees e ' +
            'inner join employee_contracts ec on e.employeeId = ec.employeeId '+
            'inner join posts p on p.postId = ec.contractPostId '+
            'where p.isTeacher = 1 and ec.status = 3 '+
            'GROUP BY e.employeeId'
        )

        // return await sequelize.query('SELECT e.employeeId, e.last_name, e.first_name, e.fathers_name FROM employees AS e ' +
        //     'WHERE (e.status = 2) and ' +
        //     'EXISTS(SELECT id from employee_contracts as ec where ec.employeeId = e.employeeId AND ec.status = 3)' +
        //     'GROUP BY e.employeeId ' +
        //     'ORDER BY last_name ASC, first_name ASC, fathers_name ASC')
    }

    async getBusynessEmployees(dateStart, dateEnd) {

        return await sequelize.query(
            `select schedule.employee_id,
                    concat(e.last_name, ' ', left(e.first_name, 1), '.', ' ', left(e.fathers_name, 1),'.') as fio
             from schedule
                      inner join employees e on schedule.employee_id = e.employeeId
             where date >= :dateStart
               and date <= :dateEnd
             union
            select schedule.optional_employee_id,
                   concat(e.last_name, ' ', left(e.first_name, 1), '.', ' ', left(e.fathers_name, 1),'.') as fio
            from schedule
                     inner join employees e on schedule.optional_employee_id = e.employeeId
            where date >= :dateStart
              and date <= :dateEnd
            group by fio
            order by fio`, {
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