const GroupService = require('../services/groups.service')

class GroupsController {
    async getGroups(req, res) {
        return res.json(
            await GroupService.getGroups()
        )
    }
    async getSpecs(req, res) {
        return res.json(
            await GroupService.getSpecs()
        )
    }
}

module.exports = new GroupsController()