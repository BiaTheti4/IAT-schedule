const express = require('express')
const router = express.Router()
const cabinetsRouter = require('./cabinets.routes')
const groupsRouter = require('./groups.routes')
const employeesRouter = require('./employees.routes')
const ktpRouter = require('./ktp.routes')
router.use('/cabinets', cabinetsRouter)
router.use('/groups', groupsRouter)
router.use('/employees', employeesRouter)
router.use('/ktp', ktpRouter)

module.exports = router