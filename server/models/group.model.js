const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('group', {

        groupId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        type: {type: DataTypes.INTEGER},
        name: {type: DataTypes.STRING(45)},
        course: {type: DataTypes.INTEGER.UNSIGNED},
        active: {type: DataTypes.INTEGER},
        year: {type: DataTypes.INTEGER}
    })
}
