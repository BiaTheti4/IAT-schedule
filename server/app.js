const express = require('express'),
    app = express(),
    routes = require('./routes/index.js')

const host = '127.0.0.1'
const port = 7000

app.use(express.json())
app.use(express.urlencoded({extended: true}))
// init db
app.use('/api', routes)

app.listen(port, host, () =>
    console.log(`Server listens http://${host}:${port}`)
)