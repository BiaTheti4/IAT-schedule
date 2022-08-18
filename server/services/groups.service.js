const {models} = require("../models/index");
const {Op, literal} = require("sequelize");

class GroupsService {
    async getGroups() {
        return await models.group.findAll({
            where: {
                active: 1,
                type: 1,

                specId: {
                    [Op.not]: 18
                },
                year: {
                    [Op.gte]: literal(new Date().getFullYear() + ' - `spec`.`learningPeriod`')
                }
            },
            order: [
                ['name', 'asc']
            ],
            include: [
                {
                    model: models.spec,
                    as: 'spec'
                }
            ]
        });
    }

    async getSpecs() {
        return await models.spec.findAll({
                where: {
                    active: 1,
                    code: {
                        [Op.not]: 0
                    }
                },
                order: [
                    ['nameShort']
                ]
            }
        )
    }
}

module.exports = new GroupsService()