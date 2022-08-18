const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('employee_contract', {
        id: {type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true},
        status: {type: DataTypes.INTEGER.UNSIGNED},
        employeeId: {
            type: DataTypes.INTEGER,
        }
    })
}
