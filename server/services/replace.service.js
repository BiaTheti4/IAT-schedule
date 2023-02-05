const _ = require('lodash')
const sequelize = require("../models");

class ReplaceService {

    async getReplacesOnDate(date) {
        let data = await sequelize.query(
            `SELECT *
             FROM teacher_replace AS tr
                      INNER JOIN teacher_replace_groups trg ON tr.replaceId = trg.replaceId
             WHERE :date BETWEEN dateStart AND dateEnd`, {
                replacements: {
                    date: date,
                },
                // logging: console.log,
                type: sequelize.QueryTypes.SELECT
            });

        let result = {};

        _.each(data, row => {
            if (row.theory) {
                _.setWith(result, [row.groupId, row.subjectId, row.employeeId, 't'], row.replaceEmployeeId,Object);
            }
            if (row.practice) {
                _.setWith(result, [row.groupId, row.subjectId, row.employeeId, 'p'], row.replaceEmployeeId,Object);
            }
            if (row.course) {
                _.setWith(result, [row.groupId, row.subjectId, row.employeeId, 'c'], row.replaceEmployeeId,Object);
            }
        })
        return result;
    }
}

module.exports = new ReplaceService()