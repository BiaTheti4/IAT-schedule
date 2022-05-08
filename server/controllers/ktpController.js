const KtpService = require('../services/ktp.service')

class KtpController {
    async getSubjects(req, res) {
        return res.json(
            await KtpService.getSubjectsByGroup()
        )
    }

    async getTeachers(req, res) {
        return res.json(
            await KtpService.getTeachersByKtp()
        )
    }
}

module.exports = new KtpController()