const {models} = require("../models/index");

class CabinetsService {
//получение списка кабинетов
    async getCabinets() {
        return await models.cabinet.findAll({
            attributes: ['id', 'number'],
            order: [
                ['number', 'asc']
            ]
        });
    }
}

module.exports = new CabinetsService()