const db = require('./index.js')
const {DataTypes} = require("sequelize");


const Subjects = db.define('subject', {

    subjectId: {type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true},
    name:{type:DataTypes.STRING(200)},
    nameShort:{type:DataTypes.STRING(80)},
})



module.exports = Subjects

