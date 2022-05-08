const db = require('./index.js')
const {DataTypes, Sequelize, literal} = require("sequelize");


const Specs = db.define('spec', {

    specId: {type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true},
    nameShort:{type: DataTypes.STRING(10)},
    active:{type: DataTypes.INTEGER},
    learningPeriod:{type: DataTypes.INTEGER.UNSIGNED},

})



module.exports = Specs

