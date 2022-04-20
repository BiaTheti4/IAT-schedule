const db = require('./index.js')
const {DataTypes,Sequelize, literal} = require("sequelize");


const Cabinets = db.define('cabinet', {

    id: {type: DataTypes.INTEGER, primaryKey: true,autoIncrement:true},
    number:{type: DataTypes.STRING(15)},
    created_at:{type: DataTypes.DATE,defaultValue: Sequelize.fn('NOW')},
    updated_at:{type: DataTypes.DATE,defaultValue: Sequelize.fn('NOW')}
})

module.exports = Cabinets

