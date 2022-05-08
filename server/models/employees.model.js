const db = require('./index.js')
const {DataTypes, Sequelize, literal} = require("sequelize");


const Employees = db.define('employee', {
    employeeId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    last_name: {type: DataTypes.STRING},
    first_name: {type: DataTypes.STRING},
    fathers_name: {type: DataTypes.STRING}
})


module.exports = Employees

