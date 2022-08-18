const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('subject', {

        subjectId: {type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true},
        name: {type: DataTypes.STRING(200)},
        nameShort: {type: DataTypes.STRING(80)},
    })
}