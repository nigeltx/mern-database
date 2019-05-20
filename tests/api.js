
// Validate environment before anything
const Environment = require('../modules/Environment');
Environment.setVariables();

const assert = require('assert');
const jsonfile = require('jsonfile');
let selfLaunch = false;

// // To hit production AWS!
// var request = require('supertest')('Mern-database-env.gk2u8m3dja.us-east-1.elasticbeanstalk.com');

//// run locally, like in vscode debugger and test against that
//var request = require('supertest')('http://localhost:3000');

// To self launch app and test against it
selfLaunch = true;
var app = require('../app.js');
app.testrun = true;
var request = require('supertest')(app);
var DatabaseServer = require('../modules/DatabaseServer.js');

// Testing globals
let testVehicles;
let testVehicle;
let testMileages;
let testMileage;
let testServiceRecords;
let testServiceRecord;
let testReminders;
let testReminder;

describe('api', function() {

    // Read in the test data and wait for the database to start.
    before(function (done) {

        loadTestData();

        setTimeout(function () {
            done();
        }, 5000);
    });

    async function loadTestData() {
        testVehicles = await jsonfile.readFile('/Users/nigelsmith/Projects/augustine/augustine-database/tests/vehicles.json')
        testVehicle = testVehicles[0];
        testMileages = await jsonfile.readFile('/Users/nigelsmith/Projects/augustine/augustine-database/tests/mileages.json')
        testMileage = testMileages[0];
        testServiceRecords = await jsonfile.readFile('/Users/nigelsmith/Projects/augustine/augustine-database/tests/serviceRecords.json')
        testServiceRecord = testServiceRecords[0];
        testReminders = await jsonfile.readFile('/Users/nigelsmith/Projects/augustine/augustine-database/tests/reminders.json')
        testReminder = testReminders[0];
    }

    // Shut everything down gracefully
    after(function (done) {
        if (selfLaunch) {
            DatabaseServer.database.close();
            app.close(done);
        } else {
            done()
        }

    });

    describe('vehicles', function() {

        let testVehicleId;

        it("should new the vehicle", function (done) {

            request.post("/vehicles").send(testVehicle)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.notStrictEqual(res.body.json.id, undefined);
                    testVehicle = res.body.json;
                    testVehicleId = res.body.json.id;
                    done();
                });
        });

        it("should find all vehicles", function (done) {
            request.get('/vehicles').send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.notStrictEqual(res.body.json.length, 0);
                    done();
                });
        });

        it("should find the vehicle with name", function (done) {
            request.get('/vehicles').send({"name": testVehicle.name})
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.strictEqual(res.body.json[0].name, testVehicle.name);
                    done();
                });
        });

        it("should save the vehicle", function (done) {
            testVehicle.model = 'test';
            request.put("/vehicles").send(testVehicle)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    request.get('/vehicles/' + testVehicleId).send()
                        .end(function (err, res) {
                            assert.strictEqual(res.body.json.model, testVehicle.model);
                            done();
                        });
                });
        });

        it("should delete the vehicle with id", function (done) {
            request.delete('/vehicles/' + testVehicleId).send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.strictEqual(res.body.json.id, testVehicleId);
                    done()
                });
        });

    });

    describe('mileages', function() {

        let testVehicleId;
        let testMileageId;

        before(function(done) {
            request.post("/vehicles").send(testVehicle)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.notStrictEqual(res.body.json.id, undefined);
                    testVehicle = res.body.json;
                    testVehicleId = res.body.json.id;
                    done();
                });
        });

        after(function(done) {
            request.delete('/vehicles/' + testVehicleId).send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.strictEqual(res.body.json.id, testVehicleId);
                    done();
                });
        });

        it("should add mileage to the vehicle", function (done) {
            request.post("/vehicles/" + testVehicleId + "/mileage").send(testMileage)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.notStrictEqual(res.body.json.id, undefined);
                    testMileage = res.body.json;
                    testMileageId = res.body.json.id;
                    done();
                });
        });

        it("should get the mileage with id", function (done) {
            request.get("/vehicles/" + testVehicleId + "/mileage/" + testMileageId).send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.strictEqual(res.body.json.id, testMileageId);
                    done();
                });
        });

        it("should get all mileages", function (done) {
            request.get("/vehicles/" + testVehicleId + "/mileage").send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.strictEqual(res.body.json.length, 3);
                    done();
                });
        });

        it("should update the mileage", function (done) {
            testMileage.mileage = 90000;
            request.put("/vehicles/" + testVehicleId + "/mileage").send(testMileage)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    request.get("/vehicles/" + testVehicleId + "/mileage/" + testMileageId).send()
                        .end(function (err, res) {
                            assert.strictEqual(res.body.json.mileage, testMileage.mileage);
                            done();
                        });
                });
        });

        it("should delete the mileage", function (done) {
            request.delete("/vehicles/" + testVehicleId + "/mileage/" + testMileageId).send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.strictEqual(res.body.json.id, testMileageId);
                    done();
                });
        });
    });

    describe('serviceRecords', function() {

        let testVehicleId;
        let testServiceRecordId;

        before(function(done) {
            request.post("/vehicles").send(testVehicle)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.notStrictEqual(res.body.json.id, undefined);
                    testVehicle = res.body.json;
                    testVehicleId = res.body.json.id;
                    done();
                });
        });

        after(function(done) {
            request.delete('/vehicles/' + testVehicleId).send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.strictEqual(res.body.json.id, testVehicleId);
                    done();
                });
        });

        it("should add serviceRecord to the vehicle", function (done) {
            request.post("/vehicles/" + testVehicleId + "/serviceRecord").send(testServiceRecord)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.notStrictEqual(res.body.json.id, undefined);
                    testServiceRecord = res.body.json;
                    testServiceRecordId = res.body.json.id;
                    done();
                });
        });

        it("should get the serviceRecord with id", function (done) {
            request.get("/vehicles/" + testVehicleId + "/serviceRecord/" + testServiceRecordId).send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.strictEqual(res.body.json.id, testServiceRecordId);
                    done();
                });
        });

        it("should get all serviceRecords", function (done) {
            request.get("/vehicles/" + testVehicleId + "/serviceRecord").send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.strictEqual(res.body.json.length, 2);
                    done();
                });
        });

        it("should update the serviceRecord", function (done) {
            testServiceRecord.estimatedCost = 9000;
            request.put("/vehicles/" + testVehicleId + "/serviceRecord").send(testServiceRecord)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    request.get("/vehicles/" + testVehicleId + "/serviceRecord/" + testServiceRecordId).send()
                        .end(function (err, res) {
                            assert.strictEqual(res.body.json.estimatedCost, testServiceRecord.estimatedCost);
                            done();
                        });
                });
        });

        it("should delete the serviceRecord", function (done) {
            request.delete("/vehicles/" + testVehicleId + "/serviceRecord/" + testServiceRecordId).send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.strictEqual(res.body.json.id, testServiceRecordId);
                    done();
                });
        });
    });

    describe('reminders', function() {

        let testVehicleId;
        let testReminderId;

        before(function(done) {
            request.post("/vehicles").send(testVehicle)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.notStrictEqual(res.body.json.id, undefined);
                    testVehicle = res.body.json;
                    testVehicleId = res.body.json.id;
                    done();
                });
        });

        after(function(done) {
            request.delete('/vehicles/' + testVehicleId).send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.strictEqual(res.body.json.id, testVehicleId);
                    done();
                });
        });

        it("should add reminder to the vehicle", function (done) {
            request.post("/vehicles/" + testVehicleId + "/reminder").send(testReminder)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.notStrictEqual(res.body.json.id, undefined);
                    testReminder = res.body.json;
                    testReminderId = res.body.json.id;
                    done();
                });
        });

        it("should get the reminder with id", function (done) {
            request.get("/vehicles/" + testVehicleId + "/reminder/" + testReminderId).send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.strictEqual(res.body.json.id, testReminderId);
                    done();
                });
        });

        it("should get all reminders", function (done) {
            request.get("/vehicles/" + testVehicleId + "/reminder").send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.strictEqual(res.body.json.length, 3);
                    done();
                });
        });

        it("should update the reminder", function (done) {
            testReminder.serviceName = 'Battery Replacement';
            request.put("/vehicles/" + testVehicleId + "/reminder").send(testReminder)
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    request.get("/vehicles/" + testVehicleId + "/reminder/" + testReminderId).send()
                        .end(function (err, res) {
                            assert.strictEqual(res.body.json.serviceName, testReminder.serviceName);
                            done();
                        });
                });
        });

        it("should delete the reminder", function (done) {
            request.delete("/vehicles/" + testVehicleId + "/reminder/" + testReminderId).send()
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.status, 200);
                    assert.strictEqual(res.body.json.id, testReminderId);
                    done();
                });
        });
    });
});

