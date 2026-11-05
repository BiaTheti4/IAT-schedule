const {models} = require("../models/index");

class CabinetsService {
    async getCurriculumCabinets() {
        const sequelize = require('../models');
        const rows = await sequelize.query(`SELECT DISTINCT k.ktpId, cc.cabinetId
            FROM ktp k JOIN curriculum_cabinets cc ON
            (k.curriculumSubjectId > 0 AND cc.curriculumSubjectId = k.curriculumSubjectId)
            OR (k.curriculumPracticeId > 0 AND cc.curriculumPracticeId = k.curriculumPracticeId)
            JOIN cabinets c ON c.id = cc.cabinetId
            ORDER BY cc.cabinetId`, {type: sequelize.QueryTypes.SELECT});
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
