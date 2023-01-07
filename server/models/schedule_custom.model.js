const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('schedule_custom', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {type: DataTypes.TEXT, allowNull: false},
        date: {type: DataTypes.DATEONLY, allowNull: false},
        lesson_number: {type: DataTypes.INTEGER, allowNull: true},
        group_id: {type: DataTypes.INTEGER},
        employee_id: {type: DataTypes.INTEGER, allowNull: true},
        cabinet_id: {type: DataTypes.INTEGER, allowNull: true},


    }, {
        tableName: 'schedule_custom',
        createdAt: true,
        updatedAt: true
    });
}