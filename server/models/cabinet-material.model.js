const {DataTypes} = require("sequelize");
const Cabinet = require('./cabinet.model')

module.exports = (sequelize) => {
    sequelize.define('cabinet_material', {

            id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            cabinet_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: Cabinet,
                    key: 'cabinet_id'
                }
            },
            name: {type: DataTypes.STRING(200)},
            material_type_id: {type: DataTypes.INTEGER},
        },
        {
            tableName: 'cabinet_materials'
        })

}

