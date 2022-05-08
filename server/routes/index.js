const express = require('express')
const router = express.Router()
const cabinetsRouter = require('./cabinets.routes')
const groupsRouter = require('./groups.routes')
const employeesRouter = require('./employees.routes')

router.use('/cabinets', cabinetsRouter)
router.use('/groups', groupsRouter)
router.use('/employees', employeesRouter)

module.exports = router