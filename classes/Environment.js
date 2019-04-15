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
        assert.notStrictEqual(process.env.DATABASE_COLLECTION_NAME, undefined, 'DATABASE_COLLECTION_NAME environment variable undefined');
        Environment.databaseCollectionName = process.env.DATABASE_COLLECTION_NAME;
        assert.notStrictEqual(process.env.JWT_SECRET, undefined, 'JWT_SECRET environment variable undefined');
        Environment.jwtSecret = process.env.JWT_SECRET;
        assert.notStrictEqual(process.env.NEWS_MASTER_DOCUMENT_ID, undefined, 'NEWS_MASTER_DOCUMENT_ID environment variable undefined');
        Environment.newsMasterDocumentId = process.env.NEWS_MASTER_DOCUMENT_ID;
        assert.notStrictEqual(process.env.NEWS_API_KEY, undefined, 'NEWS_API_KEY environment variable undefined');
        Environment.newsApiKey = process.env.NEWS_API_KEY;
        assert.notStrictEqual(process.env.NEWS_REFRESH_INTERVAL_MINUTES, undefined, 'NEWS_REFRESH_INTERVAL_MINUTES environment variable undefined');
        Environment.newsRefreshIntervalMinutes = process.env.NEWS_REFRESH_INTERVAL_MINUTES;
        assert.notStrictEqual(process.env.NEWS_MAX_SHARED_STORIES, undefined, 'NEWS_MAX_SHARED_STORIES environment variable undefined');
        Environment.newsMaxSharedStories = process.env.NEWS_MAX_SHARED_STORIES;
        assert.notStrictEqual(process.env.NEWS_MAX_COMMENTS, undefined, 'NEWS_MAX_COMMENTS environment variable undefined');
        Environment.newsMaxComments = process.env.NEWS_MAX_COMMENTS;
        assert.notStrictEqual(process.env.NEWS_MAX_FILTERS, undefined, 'NEWS_MAX_FILTERS environment variable undefined');
        Environment.newsMaxFilters = process.env.NEWS_MAX_FILTERS;
        assert.notStrictEqual(process.env.NEWS_MAX_FILTER_STORIES, undefined, 'NEWS_MAX_FILTER_STORIES environment variable undefined');
        Environment.newsMaxFilterStories = process.env.NEWS_MAX_FILTER_STORIES;
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