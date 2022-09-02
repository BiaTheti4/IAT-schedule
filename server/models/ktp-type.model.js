const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('ktp_type', {
            typeId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            name: {type: DataTypes.STRING},
            category: {type: DataTypes.ENUM('t', 'l', 'p', 'k', 's', 'c', 'z', 'e', 'i')},
            nameShort: {type: DataTypes.STRING},
        }, {
            tableName: 'ktp_types'
        }
    )
}


