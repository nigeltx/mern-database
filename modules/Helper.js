// Class Helper
'use strict';

class Helper {

    static isEmpty(object) {
        return  (typeof object === 'undefined' || Object.keys(object).length === 0);
    }

    static normalizePort(port) {
        let normalizedPort = parseInt(port, 10);
        if (isNaN(normalizedPort)) {
            // named pipe
            return port;
        }
        if (normalizedPort >= 0) {
            // port number
            return normalizedPort;
        }
        return false;
    }
}
module.exports = Helper;