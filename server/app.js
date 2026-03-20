const express = require('express')
const sequelize = require('./models')
const path = require('path')
const routes = require('./routes/index.js')
const cors = require('cors')
require('dotenv').config()
const middleware = require('./middleware')

const host = process.env.SERVER_HOST || 'localhost'
const port = process.env.SERVER_PORT || 7000

const app = express()

const root = path.join(__dirname, '../client/dist')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS: корректно обрабатываем как один origin, так и список (через запятую/пробелы).
// Если SERVER_DOMAIN не задан, разрешаем запросы без ограничений (удобно для dev).
const serverDomainRaw = process.env.SERVER_DOMAIN || ''
const allowedOrigins = serverDomainRaw
    .split(/[,\s]+/)
    .map(s => s.trim())
    .filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        // запросы без origin (например, same-origin fetch, curl) обычно должны проходить
        if (!origin) return callback(null, true)

        if (allowedOrigins.length === 0) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)

        return callback(null, false)
    }
}))

app.use(express.static(root))

// API
app.use('/api', routes)

// SPA entry
app.get('/', (req, res) => {
    res.sendFile(path.join(root, 'index.html'))
})

// SPA fallback for deep links
app.get('*', (req, res) => {
    res.sendFile(path.join(root, 'index.html'))
})

// 404 for other methods/routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not found' })
})

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error' })
})

const start = async () => {
    try {
        await sequelize.authenticate()
        // await sequelize.sync()
        app.listen(port, host, () => {
            console.log(`Server started on port : http://${host}:${port}`)
        })
    } catch (e) {
        console.log(e)
    }
}

start()