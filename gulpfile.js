const { series } = require('gulp');

const exec = require('child_process').exec;
// const setenv = exec('ping localhost');
let environmentVariables = [
    {"key": "APPLICATION_NAME", "value": "mern"},
    {"key": "DATABASE_CONNECT_URL", "value": "mongodb+srv://mern:Godis4us@cluster0-taai7.mongodb.net/test?retryWrites=true"}
];

function setEnv(cb) {
    for (let environmentVariable of environmentVariables) {
        let command = 'eb setenv' + environmentVariable.key + '=' + environmentVariable.value;
        console.log('Processing: ', command);
        // let command = 'ping localhost';
        exec(command).stdout.pipe(process.stdout);
    }
    cb()
}

exports.deploy = series(setEnv);