// app.js

// Validate environment before anything
const Environment = require('./modules/Environment');
Environment.setVariables();

// Import modules
let express = require('express');
let httpBodyParser = require('body-parser'); // Easy access to the HTTP request body
let http = require('http');
let viewPath = require('path');
let HttpRateLimiter = require('express-rate-limit'); // IP based rate limiter
let httpHeaderFilter = require('helmet'); // Helmet module for HTTP header hack mitigations
let httpContentFilter = require('helmet-csp');
let httpLogger = require('morgan'); // HTTP request logging
let httpResponseTime = require('response-time'); // For code timing checks for performance logging
if (Environment.runtimeEnvironment !== Environment.production) {
    require('dotenv').config();
}
let createError = require('http-errors');
let assert = require('assert');

// Import classes
let DatabaseServer = require('./modules/DatabaseServer');
let Helper = require('./modules/Helper');

// Routers
let vehicleRoute = require('./routes/vehiclesRoute');

// Start Express app
let app = express();

// Configure Express
let httpPort = Helper.normalizePort(Environment.port || '80');
app.enable('trust proxy'); // Since we are behind Nginx load balancing with Elastic Beanstalk
app.set('port', httpPort);
app.set('views', viewPath.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(httpBodyParser.json({limit: '100kb'}));
app.use(httpBodyParser.json({limit: '100kb'}));
app.use(httpLogger('dev'));
app.use(httpResponseTime());
let httpRateLimiter = new HttpRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    delayMs: 0 // disable delaying - full speed until the max limit is reached
});
app.use(httpRateLimiter);
app.use(httpHeaderFilter());
app.use(httpContentFilter({
    // Specify directives for content sources
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'ajax.googleapis.com', 'maxcdn.bootstrapcdn.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'maxcdn.bootstrapcdn.com'],
        fontSrc: ["'self'", 'maxcdn.bootstrapcdn.com'],
        imgSrc: ['*']
        // reportUri: '/report-violation',
    }
}));

// Start the mongo db server
DatabaseServer.start()
    .then(database => {
        console.info("INFO: Successfully connected to database\n");
    })
    .catch(error => {
        assert.strictEqual(null, error);
    });

app.use('/vehicles', vehicleRoute);

//
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});
//
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// development error handler that will add in a stacktrace
if (Environment.runtimeEnvironment === Environment.development) {
    app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
        res.status(err.status || 500).json({message: err.toString(), error: err});
        console.log(err);
    });
}

// production error handler with no stacktraces exposed to users
app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
    // if (Environment.runtimeEnvironment === Environment.production) {
    //   var segment = AWSXRay.getSegment();
    //   segment.addAnnotation("errorHandler", err.toString());
    //   segment.addMetadata("errorHandler", err.toString());
    //   // segment.addError(err);
    // }
    console.log(err);
    res.status(err.status || 500).json({message: err.toString(), error: {}});
    // if (Environment.runtimeEnvironment === Environment.production) {
    //   AWSXRay.express.closeSegment()
    // }
});

//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // return the error message
//   res.status(err.status || 500);
//   res.render('error')
// });

// Start the http server to listen on the port
let httpServer = http.createServer(app);
httpServer.listen(httpPort);
httpServer.on('error', onError);
httpServer.on('listening', onListening);

function onListening() {
    let addr = httpServer.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof httpServer.port === 'string'
        ? 'Pipe ' + httpServer.port
        : 'Port ' + httpServer.port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

// For ES6 promises, even caught promises can be missed.
// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});

// If our process is shut down, close out the database connections gracefully
process.on('SIGINT', function () {
    console.log("Connected: " + DatabaseServer.connected);
    console.log('MongoDB connection close on app termination');
    DatabaseServer.database.close();
    process.exit(0);
});

process.on('SIGUSR2', function () {
    console.log('MongoDB connection close on app restart');
    DatabaseServer.database.close();
    process.kill(process.pid, 'SIGUSR2');
});

// Must export for Mocha testing
module.exports = httpServer;


