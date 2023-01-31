const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('schedule', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        date: {type: DataTypes.DATEONLY, allowNull: true},
        status: {type: DataTypes.INTEGER},
        // event: {type: DataTypes.TEXT},
        lesson_number: {type: DataTypes.INTEGER, allowNull: true},
        employee_id: {type: DataTypes.INTEGER, allowNull: true},
        optional_employee_id: {type: DataTypes.INTEGER, allowNull: true},
        // group_id: {type: DataTypes.INTEGER},
        cabinet_id: {type: DataTypes.INTEGER, allowNull: true},
        optional_cabinet_id: {type: DataTypes.INTEGER, allowNull: true},
        ktp_id: {type: DataTypes.INTEGER},
        list_id: {type: DataTypes.INTEGER},


    }, {
        tableName: 'schedule',
        createdAt: true,
        updatedAt: true
    });
}