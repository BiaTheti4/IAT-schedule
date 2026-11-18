const {models} = require("../models/index");

class CabinetsService {
    async getCurriculumCabinets(year) {
        const sequelize = require('../models');
        const rows = await sequelize.query(`SELECT DISTINCTROW k.ktpId, cc.cabinetId
                                            FROM ktp k
                                                     JOIN curriculum_cabinets cc
                                                          ON (cc.curriculumSubjectId = k.curriculumSubjectId)
                                                     JOIN cabinets c ON c.id = cc.cabinetId
                                            where k.year = :year
                                            union
                                            SELECT DISTINCTROW k.ktpId, cc.cabinetId
                                            FROM ktp k
                                                     JOIN curriculum_cabinets cc
                                                          ON cc.curriculumPracticeId = k.curriculumPracticeId
                                                     JOIN cabinets c
                                                          ON c.id = cc.cabinetId
                                            where k.year = :year
        `, {replacements: {year}, type: sequelize.QueryTypes.SELECT});
        return rows.reduce((result, row) => {
            (result[row.ktpId] || []).push(Number(row.cabinetId));
            return result;
        }, {});
    }
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
