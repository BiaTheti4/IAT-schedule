const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('schedule', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        date: {type: DataTypes.DATE},
        status: {type: DataTypes.INTEGER},
        // event: {type: DataTypes.TEXT},
        lesson_number: {type: DataTypes.INTEGER},
        employee_id: {type: DataTypes.INTEGER},
        optional_employee_id: {type: DataTypes.INTEGER},
        // group_id: {type: DataTypes.INTEGER},
        cabinet_id: {type: DataTypes.INTEGER},
        optional_cabinet_id: {type: DataTypes.INTEGER},
        ktp_id: {type: DataTypes.INTEGER},


    }, {
        tableName: 'schedule',
        createdAt: true,
        updatedAt: true
    });
}