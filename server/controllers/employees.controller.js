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
    async getBusynessEmployees(req, res) {
        const dateStart = req.body.dateStart
        const dateEnd = req.body.dateEnd

        return res.json(
            await EmployeesService.getBusynessEmployees(dateStart,dateEnd)
        )
    }
}

module.exports = new EmployeesController()