const KtpService = require('../services/ktp.service')

class KtpController {
    async getSubjects(req, res) {
        return res.json(
            await KtpService.getSubjectsByGroup(req.query.group,req.query.date)
        )
    }

    async getEmployees(req, res) {
        return res.json(
            await KtpService.getEmployees()
        )
    }

    async getTeachers(req, res) {
        const subjectId = req.body.subject
        const group = req.body.group
        return res.json(
            await KtpService.getTeachersByKtp(subjectId,group)
        )
    }
}

module.exports = new KtpController()