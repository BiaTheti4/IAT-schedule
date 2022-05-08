const EmployeesService = require('../services/employees.service')

class EmployeesController {
    async getEmployees(req, res) {
        return res.json(
            await EmployeesService.getEmployees()
        )
    }
}

module.exports = new EmployeesController()