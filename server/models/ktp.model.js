const db = require('./index.js')
const {DataTypes, Sequelize} = require("sequelize");


const Ktp = db.define('ktp', {
    ktpId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    groupId: {type: DataTypes.STRING,foreignKey:true},
    employeeId: {type: DataTypes.STRING,foreignKey:true},
    subjectId: {type: DataTypes.STRING,foreignKey:true},
    group_employee:{type:DataTypes.INTEGER.UNSIGNED},
    year:{type:DataTypes.INTEGER.UNSIGNED},



})


module.exports = Ktp

