// Class Environment
'use strict';

// Imports
const assert = require('assert');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Class definition
class Environment {

    static setVariables() {
        assert.notStrictEqual(process.env.APPLICATION_NAME, undefined, 'APPLICATION_NAME environment variable undefined');
        Environment.applicationName = process.env.APPLICATION_NAME;
        assert.notStrictEqual(process.env.DATABASE_CONNECT_URL, undefined, 'DATABASE_CONNECT_URL environment variable undefined');
        Environment.databaseConnectUrl = process.env.DATABASE_CONNECT_URL;
        assert.notStrictEqual(process.env.DATABASE_NAME, undefined, 'DATABASE_NAME environment variable undefined');
        Environment.databaseName = process.env.DATABASE_NAME;
        assert.notStrictEqual(process.env.DATABASE_VEHICLES_COLLECTION_NAME, undefined, 'DATABASE_VEHICLES_COLLECTION_NAME environment variable undefined');
        Environment.databaseVehiclesCollectionName = process.env.DATABASE_VEHICLES_COLLECTION_NAME;
        assert.notStrictEqual(process.env.NODE_ENV, undefined, 'NODE_ENV environment variable undefined');
        Environment.runtimeEnvironment = process.env.NODE_ENV;
        assert.notStrictEqual(process.env.PORT, undefined, 'PORT environment variable undefined');
        Environment.port = process.env.PORT;

        Environment.production = 'production';
        Environment.development = 'development';

    }
}

module.exports = Environment;