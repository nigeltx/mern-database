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
let userRecordId;
let newsRecordId;

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

describe('api testing', function () {
    // Wait until the database is up and connected to.
    before(function (done) {
        setTimeout(function () {
            done();
        }, 5000);
    });

    // Shut everything down gracefully
    after(function (done) {
        if (selfLaunch) {
            DatabaseServer.database.close();
            app.close(done);
        } else {
            done()
        }
    });

    describe('user api testing', function () {

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
                    keyWords: ['Apple', 'Microsoft'],
                    enableAlert: false,
                    alertFrequency: 0,
                    enableAutoDelete: false,
                    deleteTime: 0,
                    timeOfLastScan: 0,
                    newsStories: []
                }],
                savedStories: []
            };

            request.post("/users").send(record)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    userRecordId = res.body.id;
                    done();
                });
        });

        it("should not insert a duplicate record", function (done) {
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
                    keyWords: ['Apple', 'Microsoft'],
                    enableAlert: false,
                    alertFrequency: 0,
                    enableAutoDelete: false,
                    deleteTime: 0,
                    timeOfLastScan: 0,
                    newsStories: []
                }],
                savedStories: []
            };

            request.post("/users").send(record)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 400);
                    done();
                });
        });

        it("should read the record with id", function (done) {
            request.get('/users?id=' + userRecordId).send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    done();
                });
        });

        it("should read the record with email", function (done) {
            var query = {
                email: 'user@test.com'
            };

            request.get('/users').send(query)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body[0].email, 'user@test.com');
                    done();
                });
        });

        it("should not find the record with bad email", function (done) {
            var query = {
                email: 'baduser@test.com'
            };

            request.get('/users').send(query)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body, "");
                    done();
                });
        });

        it("should read the record with no id", function (done) {
            request.get('/users').send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    done();
                });
        });

        it("should update the record", function (done) {

            let expectedNewsFilter = 'Microsoft';
            let record = {
                id: newsRecordId,
                newsFilters: [{
                    name: 'Technology Companies',
                    keyWords: [expectedNewsFilter],
                    enableAlert: false,
                    alertFrequency: 0,
                    enableAutoDelete: false,
                    deleteTime: 0,
                    timeOfLastScan: 0,
                    newsStories: []
                }],
            };

            request.put("/users/" + userRecordId).send(record)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.newsFilters[0].keyWords[0], expectedNewsFilter);
                    done();
                });
        });


        it("should delete the record", function (done) {
            request.delete('/users/' + userRecordId).send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    done();
                });
        });
    });

    describe('news api test', function () {

        it("should insert the record", function (done) {
            newsRecordId = 'MASTER_STORIES_DO_NOT_DELETE';
            var record = {
                id: newsRecordId,
                newsStories: [],
                homeNewsStories: []
            };

            request.post("/news").send(record)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    userRecordId = res.body.id;
                    done();
                });
        });

        it("should read the record with no id", function (done) {
            request.get('/news').send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    done();
                });
        });

        it("should update the record", function (done) {
            let expectedTitle = "Read Barr’s News Conference Remarks Ahead of the Mueller Report Release";
            let record = {
                id: newsRecordId,
                newsStories: [
                    {
                        "link": "https://www.nytimes.com/2019/04/18/us/politics/barr-conference-transcript.html",
                        "title": expectedTitle,
                        "contentSnippet": "Attorney General William P. Barr addressed journalists on Thursday ahead of the release the report by the special counsel, Robert S. Mueller III.",
                        "source": "U.S.",
                        "date": 1555596053000,
                        "imageUrl": "https://static01.nyt.com/images/2019/04/18/us/politics/18dc-barrtranscript/18dc-barrtranscript-thumbStandard.jpg",
                        "storyID": "$2a$10$oeU5wDmEZjJxkfN6ym.ThepKYSNibxnh6sm9EmoFsM_0VE6IQHaVS"
                    },
                    {
                        "link": "https://www.nytimes.com/2019/04/17/us/politics/trump-mueller-report.html",
                        "title": "White House and Justice Dept. Officials Discussed Mueller Report Before Release",
                        "contentSnippet": "Some of President Trump’s advisers are concerned about whether he will retaliate against them if the report reveals them as sources of damaging details.",
                        "source": "U.S.",
                        "date": 1555582308000,
                        "imageUrl": "https://static01.nyt.com/images/2019/05/17/us/17dc-mueller-promo/17dc-mueller-promo-thumbStandard.jpg",
                        "storyID": "$2a$10$NdRq32QH9Dxmg1KgQjSNXusEwOJh3yFCuIziN1BxRz_yqaODHUGwq"
                    }
                ],
                homeNewsStories: [
                    {
                        "link": "https://www.nytimes.com/2019/04/18/us/politics/barr-conference-transcript.html",
                        "title": "Read Barr’s News Conference Remarks Ahead of the Mueller Report Release",
                        "contentSnippet": "Attorney General William P. Barr addressed journalists on Thursday ahead of the release the report by the special counsel, Robert S. Mueller III.",
                        "source": "U.S.",
                        "date": 1555596053000,
                        "imageUrl": "https://static01.nyt.com/images/2019/04/18/us/politics/18dc-barrtranscript/18dc-barrtranscript-thumbStandard.jpg",
                        "storyID": "$2a$10$oeU5wDmEZjJxkfN6ym.ThepKYSNibxnh6sm9EmoFsM_0VE6IQHaVS"
                    },
                    {
                        "link": "https://www.nytimes.com/2019/04/17/us/politics/trump-mueller-report.html",
                        "title": "White House and Justice Dept. Officials Discussed Mueller Report Before Release",
                        "contentSnippet": "Some of President Trump’s advisers are concerned about whether he will retaliate against them if the report reveals them as sources of damaging details.",
                        "source": "U.S.",
                        "date": 1555582308000,
                        "imageUrl": "https://static01.nyt.com/images/2019/05/17/us/17dc-mueller-promo/17dc-mueller-promo-thumbStandard.jpg",
                        "storyID": "$2a$10$NdRq32QH9Dxmg1KgQjSNXusEwOJh3yFCuIziN1BxRz_yqaODHUGwq"
                    }
                ]
            };

            request.put("/news/" + newsRecordId).send(record)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.value.newsStories[0].title, expectedTitle);
                    done();
                });
        });

        it("should delete the record", function (done) {
            request.delete('/news/' + newsRecordId).send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    done();
                });
        });
    });
});

