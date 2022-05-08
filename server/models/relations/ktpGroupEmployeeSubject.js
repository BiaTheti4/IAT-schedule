const groups = require('../groups.model');
const employees = require('../employees.model');
const subjects = require('../subjects.model')
const ktp = require('../ktp.model')
const {DataTypes} = require("sequelize");


groups.belongsTo(groups, {
    foreignKey: {
        name: 'groupId'
    }
});

ktp.hasMany(groups,{
    foreignKey: {
        name: 'groupId'
    }
});

