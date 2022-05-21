const Cabinets = require("../models/cabinets.model");

class CabinetsService {
//получение списка кабинетов
    async getCabinets() {
        return await Cabinets.findAll({
            attributes: ['id', 'number'],
            order: [
                ['number', 'asc']
            ]
        });
    }
}

module.exports = new CabinetsService()