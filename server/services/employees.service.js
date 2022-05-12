const sequelize = require("../models");



class EmployeesService {
    async getEmployees() {
        return await sequelize.query('SELECT e.employeeId, e.last_name, e.first_name, e.fathers_name FROM journal_schedule.employees AS e ' +
            'WHERE (e.status = 2) and ' +
            'EXISTS(SELECT id from employee_contracts as ec where ec.employeeId = e.employeeId AND ec.status = 3)' +
            'GROUP BY e.employeeId ' +
            'ORDER BY last_name ASC, first_name ASC, fathers_name ASC')
    }
}

module.exports = new EmployeesService()