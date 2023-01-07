const express = require('express')
const router = express.Router()
const authRouter = require('./auth.routes')
const cabinetsRouter = require('./cabinets.routes')
const groupsRouter = require('./groups.routes')
const employeesRouter = require('./employees.routes')
const ktpRouter = require('./ktp.routes')
const scheduleRouter = require('./schedule.routes')


router.use('/auth', authRouter)
router.use('/cabinets', cabinetsRouter)
router.use('/groups', groupsRouter)
router.use('/employees', employeesRouter)
router.use('/ktp', ktpRouter)
router.use('/schedule', scheduleRouter)

module.exports = router