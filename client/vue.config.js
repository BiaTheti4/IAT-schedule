require('dotenv').config()
module.exports = {
    devServer: {
        proxy: 'https://127.0.0.1:7000/api'
    }
}