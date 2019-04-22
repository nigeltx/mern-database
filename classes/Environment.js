// Class Environment
'use strict';

// Imports
const assert = require('assert');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Class definition
class Environment {

    static get() {
        assert.notStrictEqual(process.env.APPLICATION_NAME, undefined, 'APPLICATION_NAME environment variable undefined');
        Environment.applicationName = process.env.APPLICATION_NAME;
        assert.notStrictEqual(process.env.DATABASE_CONNECT_URL, undefined, 'DATABASE_CONNECT_URL environment variable undefined');
        Environment.databaseConnectUrl = process.env.DATABASE_CONNECT_URL;
        assert.notStrictEqual(process.env.DATABASE_NAME, undefined, 'DATABASE_NAME environment variable undefined');
        Environment.databaseName = process.env.DATABASE_NAME;
        assert.notStrictEqual(process.env.DATABASE_NEWS_COLLECTION_NAME, undefined, 'DATABASE_NEWS_COLLECTION_NAME environment variable undefined');
        Environment.databaseNewsCollectionName = process.env.DATABASE_NEWS_COLLECTION_NAME;
        assert.notStrictEqual(process.env.DATABASE_USERS_COLLECTION_NAME, undefined, 'DATABASE_USERS_COLLECTION_NAME environment variable undefined');
        Environment.databaseUsersCollectionName = process.env.DATABASE_USERS_COLLECTION_NAME;
        assert.notStrictEqual(process.env.DATABASE_SHARED_STORIES_COLLECTION_NAME, undefined, 'DATABASE_SHARED_STORIES_COLLECTION_NAME environment variable undefined');
        Environment.databaseSharedStoriesCollectionName = process.env.DATABASE_SHARED_STORIES_COLLECTION_NAME;
        assert.notStrictEqual(process.env.NODE_ENV, undefined, 'NODE_ENV environment variable undefined');
        Environment.runtimeEnvironment = process.env.NODE_ENV;
        assert.notStrictEqual(process.env.PORT, undefined, 'PORT environment variable undefined');
        Environment.port = process.env.PORT;

        Environment.production = 'production';
        Environment.development = 'development';
    }
}

// Static properties
// Environment.runtimeEnvironment = '';
// Environment.applicationName = '';
// Environment.databaseConnectUrl = '';
// Environment.messageQueueRegion = '';
// Environment.messageQueueUrl = '';
// Environment.newsApiKey = '';
// Environment.newsMasterDocumentId = '';
// Environment.newsRefreshIntervalMinutes = 0;
// Environment.newsMaxSharedStories = 0;
// Environment.newsMaxComments = 0;
// Environment.newsMaxFilters = 0;
// Environment.newsMaxFilterStories = 0;
module.exports = Environment;