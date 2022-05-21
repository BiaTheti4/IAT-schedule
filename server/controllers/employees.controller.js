const EmployeesService = require('../services/employees.service')

class EmployeesController {
    async getEmployees(req, res) {
        return res.json(
            await EmployeesService.getEmployees()
        )
    }
    async getTeacherName(req, res) {
        const teacherId = req.body.id
        return res.json(
            await EmployeesService.getTeacherName(teacherId)
        )
    }
}

module.exports = new EmployeesController()