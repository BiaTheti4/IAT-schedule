const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('work_program_practice_lists', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},

    })
}
