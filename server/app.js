const express = require('express'),
    app = express(),
    sequelize = require('./models')
routes = require('./routes/index.js')
cors = require('cors')
require('dotenv').config()
const host = '127.0.0.1'
const port = 7000

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({origin: process.env.SERVER_DOMAIN}))
// init db
app.use('/api', routes)


const start = async () => {
    try {
        await sequelize.authenticate()
        // await sequelize.sync() // remove create table
        app.listen(port, host, () => console.log(`Server started on port : http://${host}:${port}`))
    } catch (e) {
        console.log(e)
    }
}
start()
