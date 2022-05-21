const sequelize = require("../models");



class EmployeesService {
    async getEmployees() {
        return await sequelize.query('SELECT e.employeeId, e.last_name, e.first_name, e.fathers_name FROM journal_schedule.employees AS e ' +
            'WHERE (e.status = 2) and ' +
            'EXISTS(SELECT id from employee_contracts as ec where ec.employeeId = e.employeeId AND ec.status = 3)' +
            'GROUP BY e.employeeId ' +
            'ORDER BY last_name ASC, first_name ASC, fathers_name ASC')
    }
    async getTeacherName(teacherId) {
        return await sequelize.query('select concat(last_name, \' \',first_name, \' \',fathers_name) from journal_schedule.employees where employeeId=:id',{
                replacements: {
                    id: teacherId,
                },
                type: sequelize.QueryTypes.SELECT
            }
            )
    }
}

module.exports = new EmployeesService()