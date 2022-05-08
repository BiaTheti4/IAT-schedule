const db = require('./index.js')
const {DataTypes, Sequelize, literal} = require("sequelize");


const Contracts = db.define('employee_contract', {
    id: {type: DataTypes.INTEGER.UNSIGNED,primaryKey:true, autoIncrement: true},
    status: {type: DataTypes.INTEGER.UNSIGNED},
    employeeId:{type: DataTypes.INTEGER}
})


module.exports = Contracts

