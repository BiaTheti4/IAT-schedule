const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('ktp_theme', {
            themeId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            blockId: {type: DataTypes.INTEGER},
            name: {type: DataTypes.STRING},
            order: {type: DataTypes.INTEGER},
        },
        {
            tableName: 'ktp_themes'
        })
}