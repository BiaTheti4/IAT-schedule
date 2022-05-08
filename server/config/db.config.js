module.exports = {
    HOST: "10.100.3.80",
    USER: "theti",
    PASSWORD: "5800281020",
    DB: "journal_schedule",
    dialect: "mysql",
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};