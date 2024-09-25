let jwt = require('jsonwebtoken');
const config = require('./config/auth.js');

let checkToken = (req, res, next) => {
    if (+process.env.DEBUG_MODE === 1) {
        next();
        return;
    }

    const isPublic = req.headers['is-public'] === 'true';

    // Если маршрут публичный, пропускаем проверку токена
    if (isPublic) {
        next();
        return;
    }

    let token = req.headers['x-access-token'] || req.headers['authorization'] || ''; // Express headers are auto converted to lowercase
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    auth: true,
                    message: 'Token is not valid'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.json({
            success: false,
            message: 'Auth token is not supplied'
        });
    }
};

module.exports = {
    checkToken: checkToken
}