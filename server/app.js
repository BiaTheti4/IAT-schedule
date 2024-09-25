const express = require('express')
const sequelize = require('./models')
const path = require('path')
const history = require('connect-history-api-fallback');
const routes = require('./routes/index.js')
cors = require('cors')
require('dotenv').config()
const middleware = require('./middleware');

const host = '10.100.3.235'
const port = 7000

const app = express()

const root = path.join(__dirname, '../client/dist/')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(root));
app.use(cors({origin: process.env.SERVER_DOMAIN.split(' ')}))
app.use(history())

//init prod
app.get('/', middleware.checkToken, (req, res) => {
    res.sendFile(path.join(root, 'index.html'))
});
// init route
app.use('/api', routes)
// if no route matches
app.get('*', function(req, res) {
    res.redirect('/')
});

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
