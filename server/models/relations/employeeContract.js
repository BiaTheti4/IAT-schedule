const employees = require('../employees.model');
const contracts = require('../contracts.model');
const {DataTypes} = require("sequelize");


employees.hasMany(contracts, {
    foreignKey: {
        name: 'employeeId'
    }
});
contracts.belongsTo(employees,{
    foreignKey: {
        name: 'employeeId'
    }
});

