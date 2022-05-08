const groups = require('../groups.model');
const specs = require('../specs.model');
const {DataTypes} = require("sequelize");


groups.belongsTo(specs, {
    foreignKey: {
        name: 'specId'
    }
});
specs.hasMany(groups,{
    foreignKey: {
        name: 'specId'
    }
});

