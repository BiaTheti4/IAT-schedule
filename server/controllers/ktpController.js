const KtpService = require('../services/ktp.service')

class KtpController {
    async getSubjects(req, res) {
        const{groupId}=req.params
        return res.json(
            await KtpService.getSubjectsByGroup(groupId)
        )
    }

    async getTeachers(req, res) {
        const {ktpId} = req.params
        // return ktp_id
        return res.json(
            await KtpService.getTeachersByKtp(ktpId)
        )
    }
}

module.exports = new KtpController()