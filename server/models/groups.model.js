const db = require('./index.js')
const {DataTypes, Sequelize, literal, INTEGER} = require("sequelize");


const Groups = db.define('group', {

    groupId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    type: {type: DataTypes.INTEGER},
    name: {type: DataTypes.STRING(45)},
    course: {type: DataTypes.INTEGER.UNSIGNED},
    active: {type: DataTypes.INTEGER},
    year: {type: DataTypes.INTEGER}
})



module.exports = Groups

