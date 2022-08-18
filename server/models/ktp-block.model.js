const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('ktp_block', {
            blockId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            ktpId: {type: DataTypes.INTEGER, foreignKey: true},
            name: {type: DataTypes.STRING, foreignKey: false},
            order: {type: DataTypes.INTEGER, foreignKey: false},
        },
        {
            tableName: 'ktp_blocks'
        })
}
