const { DataTypes } = require('sequelize');
const sequelize = require('../path/to/sequelize/instance'); 

const Post = sequelize.define('Post', {
    postId: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    name_r: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    name_v: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    name_t: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    name_d: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    isTeacher: {
        type: DataTypes.TINYINT(3),
        allowNull: false,
        defaultValue: 0
    },
    educationExperience: {
        type: DataTypes.TINYINT(1),
        allowNull: false
    },
    postGroupId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    workTime: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    active: {
        type: DataTypes.TINYINT(3).UNSIGNED,
        allowNull: true
    },
    contract_template: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'posts',
    timestamps: false
});

module.exports = Post;
