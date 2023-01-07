const AuthService = require('../services/auth.service')

class AuthController {
    async login(req, res) {
        const username = req.body.username || '';
        const password = req.body.password || '';
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Authentication failed! Please check the request'
            })
        }
        let result = await AuthService.login(req.body.username, req.body.password)
        return res.status(result.code || 200).json(result)
    }

    async logout(req, res) {
    }
}

module.exports = new AuthController()