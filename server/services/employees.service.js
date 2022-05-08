const employees = require("../models/employees.model");
const employeeContract = require("../models/relations/employeeContract");
const contracts = require("../models/contracts.model");
const sequelize = require("../models");
const {Op, literal} = require("sequelize");


class EmployeesService {
    async getEmployees() {
        return await sequelize.query('SELECT e.employeeId, e.last_name, e.first_name, e.fathers_name FROM employees AS e ' +
            'WHERE (e.status = 2) and ' +
            'EXISTS(SELECT id from employee_contracts as ec where ec.employeeId = e.employeeId AND ec.status = 3)' +
            'GROUP BY e.employeeId ' +
            'ORDER BY last_name ASC, first_name ASC, fathers_name ASC')
            //         where: {
            //             [Op.and]: [
            //                 {status: 3},
            //                 // employees.sequelize.query('SELECT id from employee_contracts as ec where ec.employeeId = e.employeeId AND ec.status = 3')
            //                 {sequelize.literal(`(SELECT id from employee_contracts as ec where ec.employeeId = e.employeeId AND ec.status = 3)`)}
            //             ]
            //         },
            //         group: ['employeeId'],
            //         order: [
            //             ['last_name', 'asc'],
            //             ['first_name', 'asc'],
            //             ['fathers_name', 'asc']
            //         ],
            //         include: [
            //             {
            //                 model: contracts,
            //             }
            //         ],
            //     })
            // }

    }
}

module.exports = new EmployeesService()