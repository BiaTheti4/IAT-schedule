const GroupService = require('../services/groups.service')

class GroupsController {
    async getGroups(req, res) {
        return res.json(
            await GroupService.getGroups()
        )
    }
}

module.exports = new GroupsController()