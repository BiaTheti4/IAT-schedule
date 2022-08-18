const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
sequelize.define('cabinet', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        number: {type: DataTypes.STRING(15)},
        created_at: {type: DataTypes.DATE, defaultValue: sequelize.fn('NOW')},
        updated_at: {type: DataTypes.DATE, defaultValue: sequelize.fn('NOW')}
    })

}
