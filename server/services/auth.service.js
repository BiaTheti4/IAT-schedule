const {models} = require("../models/index");
const {authenticate} = require('ldap-authentication')
const config = require('../config/auth')
const jwt = require('jsonwebtoken')
const _ = require('lodash')

class CabinetsService {
//получение списка кабинетов
    async login(username, password) {
        // auth with admin
        const BASE_DN = process.env.LDAP_BIND || 'dc=iat,dc=iat';
        const USER_SUFFIX = process.env.LDAP_USER_SUFFIX || '@iat.iat';

        let options = {
            ldapOpts: {
                url: process.env.LDAP_SERVER,
            },
            userDn: `${username}${USER_SUFFIX}`,
            userPassword: password,
            userSearchBase: BASE_DN,
            usernameAttribute: 'samaccountname',
            username: username,
            attributes: ['memberOf', 'displayName', 'cn']
            // starttls: false
        }
        try {
            let user = await authenticate(options);
            if (user.displayName) {
                if (!_.find(user.memberOf, (row) => {
                    return row.indexOf('Управление расписанием') !== -1
                })) {
                    return {
                        code: 403,
                        success: false,
                        message: 'Вам не разрешен вход.'
                    };
                }

                let token = jwt.sign({username: user.displayName},
                    config.secret,
                    {
                        expiresIn: '24h' // expires in 24 hours
                    }
                );
                // return the JWT token for the future API calls
                return {
                    success: true,
                    message: 'Authentication successful!',
                    token: token
                };
            } else {
                return {
                    code: 403,
                    success: false,
                    message: 'Неверное имя пользователя или пароль'
                };
            }

        } catch (e) {

        }
        return {
            code: 400,
            success: false,
            message: 'Ошибка авторизации. Попробуйте позже'
        }
    }
}

module.exports = new CabinetsService()