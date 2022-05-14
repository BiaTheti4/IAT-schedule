const KtpService = require('../services/ktp.service')

class KtpController {
    async getSubjects(req, res) {
        const group = req.body.group
        return res.json(
            await KtpService.getSubjectsByGroup(group)
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