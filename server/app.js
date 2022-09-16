const express = require('express')
const sequelize = require('./models')
const path = require('path')
const history = require('connect-history-api-fallback');
const routes = require('./routes/index.js')
cors = require('cors')
require('dotenv').config()
const host = '0.0.0.0'
const port = 7000

const app = express()


app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, '../client/dist/')));
app.use(cors({origin: process.env.SERVER_DOMAIN}))
app.use(history())

//init prod
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
// init route
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
