const express = require('express')
const router = express.Router()
const cabinetsRouter = require('./cabinets.routes')

router.use('/cabinets', cabinetsRouter)

module.exports = router