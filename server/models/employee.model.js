const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('employee', {
            employeeId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            last_name: {type: DataTypes.STRING},
            first_name: {type: DataTypes.STRING},
            fathers_name: {type: DataTypes.STRING}
        },
        {
            tableName: 'employees'
        })
}