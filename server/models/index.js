const dbConfig = require("../config/db.config.js");
const {applyExtraSetup} = require('./relation');
const {Sequelize} = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD,
    {
        define: {
            timestamps: false
        },
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        pool: {
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle
        },
        logging: false,
        sync: {force: false}, // disable table create check
    });

const modelDefiners = [
    require('./cabinet-material.model.js'),
    require('./cabinet.model.js'),
    require('./employee-contract.model.js'),
    require('./employee.model.js'),
    require('./group.model.js'),
    require('./ktp.model.js'),
    require('./ktp-block.model.js'),
    require('./ktp-list.model.js'),
    require('./ktp-type.model.js'),
    require('./ktp-theme.model.js'),
    require('./schedule.model.js'),
    require('./spec.model.js'),
    require('./subject.model.js'),
    require('./work-program-list.model.js'),
    require('./work-program-list-materials.model.js'),
    require('./work-program-pracitce-list-materials.model.js'),
    require('./work-program-practice-list.model.js'),
];

for (const modelDefiner of modelDefiners) {
    modelDefiner(sequelize);
}

applyExtraSetup(sequelize);

module.exports = sequelize;
