const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('spec', {

        specId: {type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true},
        nameShort: {type: DataTypes.STRING(10)},
        active: {type: DataTypes.INTEGER},
        learningPeriod: {type: DataTypes.INTEGER.UNSIGNED},
    }, {
        tableName: 'specs'
    })
}