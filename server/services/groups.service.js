const groups = require("../models/groups.model.js");
const groupSpecs = require("../models/relations/groupsSpecs");
const specs = require("../models/specs.model");
const {Op, literal} = require("sequelize");
const sequelize = require("../models");

class GroupsService {
    async getGroups(req, res) {
        return await groups.findAll({
            where: {
                [Op.and]: [
                    {active: 1},
                    {type: 1},
                    {
                        specId: {
                            [Op.not]: 18
                        }
                    },
                    {
                        year: {
                            [Op.gte]: literal(new Date().getFullYear() + ' - `spec`.`learningPeriod`')
                        },
                    }
                ]
            },
            include: [
                {
                    model: specs,
                }
            ]
        });
    }
}

module.exports = new GroupsService()