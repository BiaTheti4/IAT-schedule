const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('ktp', {
        ktpId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        groupId: {type: DataTypes.INTEGER},
        employeeId: {type: DataTypes.INTEGER},
        subjectId: {type: DataTypes.INTEGER},
        group_employee: {type: DataTypes.INTEGER},
        group_k_employee: {type: DataTypes.INTEGER},
        year: {type: DataTypes.INTEGER},
        semester: {type: DataTypes.INTEGER},
    }, {
        tableName: 'ktp'
    })
}