const fs = require('fs')
const Cabinets = require("../models/cabinets.model");

class CabinetsService {
    async getCabinets() {
        return await Cabinets.findAll({
            order: [
                ['number', 'asc']
            ]
        });
    }
}

module.exports = new CabinetsService()