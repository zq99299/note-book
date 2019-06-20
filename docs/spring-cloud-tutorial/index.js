const config = require('./config');
module.exports = () => {
    return [
        '',
        config('config/')[0],
        'hystrix/'
    ]
}
