const CabinetService = require('../services/cabinets.service')

class CabinetsController {
    async getCabinets(req, res) {
        return res.json(
            await CabinetService.getCabinets()
        )
    }
}

module.exports = new CabinetsController()