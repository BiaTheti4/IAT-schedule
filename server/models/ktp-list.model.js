const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('ktp_list', {
            listId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            themeId: {type: DataTypes.INTEGER},
            name: {type: DataTypes.STRING},
            typeId: {type: DataTypes.STRING},
            hours: {type: DataTypes.INTEGER},
            order: {type: DataTypes.INTEGER},
            workProgramListId: {type: DataTypes.INTEGER},
            workProgramPracticeListId: {type: DataTypes.INTEGER},

        }, {
            tableName: 'ktp_list'
        }
    )
}


