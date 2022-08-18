const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('work_program_list', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    })
}
