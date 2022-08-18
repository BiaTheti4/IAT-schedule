const CabinetService = require('../services/cabinets.service')
const {models} = require('../models/index')

class CabinetsController {
    async getCabinets(req, res) {
        return res.json(
            await CabinetService.getCabinets()
        )
    }

    async test(req, res) {
        let model = await models.ktp_theme.findByPk(6031);
        return res.json({
            result: true,
            data: model,
            materials: await model.getLists()
        });
    }
}

module.exports = new CabinetsController()