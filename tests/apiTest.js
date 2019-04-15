// This will be used by the mocha test framework to be digested and run and provide functional testing.
// We want to exercise as much of our web service API as possible..
// First, start up the node.js application locally, or have it deployed to point to.
// node server.js
// Then you can run mocha from the local project install.
// ./node_modules/.bin/mocha --timeout 30000 test/functional_api_crud.js
//

// Validate environment before anything
const Environment = require('../classes/Environment');
Environment.get();

//var bcrypt = require('bcryptjs');
var assert = require('assert');
let selfLaunch = false;
let testRecordId;

// // To hit production AWS!
// var request = require('supertest')('https://worker.augustinetech.com/');

//// run locally, like in vscode debugger and test against that
//var request = require('supertest')('http://localhost:3000');

// To self launch app and test against it
selfLaunch = true;
var app = require('../app.js');
app.testrun = true;
var request = require('supertest')(app);
var DatabaseServer = require('../classes/DatabaseServer.js');

describe('API endpoint exercising integration tests', function () {
    // Wait until the database is up and connected to.
    before(function (done) {
        setTimeout(function () {
            done();
        }, 5000);
    });

    // Shut everything down gracefully
    after(function (done) {
        if ( selfLaunch ) {
            DatabaseServer.database.close();
            app.close(done);
        } else {
            done()
        }
    });

    it("should insert the record", function (done) {
        var record = {
            type: 'USER_TYPE',
            displayName: 'Test User',
            email: 'user@test.com',
            passwordHash: null,
            date: Date.now(),
            completed: false,
            settings: {
                requireWIFI: true,
                enableAlerts: false
            },
            newsFilters: [{
                name: 'Technology Companies',
                keyWords: ['Apple', 'Microsoft', 'IBM', 'Amazon', 'Google', 'Intel'],
                enableAlert: false,
                alertFrequency: 0,
                enableAutoDelete: false,
                deleteTime: 0,
                timeOfLastScan: 0,
                newsStories: []
            }],
            savedStories: []
        };

        request.post("/").send(record)
            .end(function (err, res) {
                assert.strictEqual(res.status, 200);
                testRecordId = res.body.id;
                done();
            });
    });

    it("should read the record with id", function (done) {
        request.get('/' + testRecordId).send()
            .end(function (err, res) {
                assert.strictEqual(res.status, 200);
                done();
            });
    });

    it("should read the record with no id", function (done) {
        request.get('/').send()
            .end(function (err, res) {
                assert.strictEqual(res.status, 200);
                done();
            });
    });

    it("should delete the record", function (done) {
        request.delete('/' + testRecordId).send()
            .end(function (err, res) {
                assert.strictEqual(res.status, 200);
                done();
            });
    });
});
