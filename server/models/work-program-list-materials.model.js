const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const {CabinetMaterial, WorkProgramList} = sequelize.models

    sequelize.define('work_program_list_materials', {
        cabinet_material_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: CabinetMaterial,
                key: 'id',
            }
        },
        list_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: WorkProgramList,
                key: 'listId',
            }
        },

    })
}
