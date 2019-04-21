//
// homeNews.js: A Node.js Module for for home news story management.
//
//

"use strict";

let express = require('express');
let router = express.Router();

let DatabaseServer = require('../classes/DatabaseServer');
let Helper = require('../classes/Helper');
let Environment = require('../classes/Environment');
let async = require('async');

router.post('/', function (req, res, next) {

    // todo add joi validation
    let record = req.body;
    if (Helper.isEmpty(record)) {
        console.error('Failed to read because no data was provided');
        res.status(400).json({"Error": "Failed to read because no data was provided"});
    } else if ( record === undefined ) {
        console.error('Failed to read because no record was provided');
        res.status(400).json({"Error": "Failed to read because no record was provided"});
    } else if (!DatabaseServer.connected) {
        console.error('Failed to read because database is not yet started');
        res.status(500).json({"Error": "Failed to read because database is not yet started"});
    } else {
        if ( record.id !== undefined ) {

        }
        DatabaseServer.users.insertOne(record, function (err, result) {
            if (err) {
                console.error('Failed to create record');
                let message = "Failed to create record with error " + err;
                res.status(400).json({"Error": message});
            } else {
                let body = result.ops[0];
                body.id = result.ops[0]._id;
                delete body._id;
                res.status(200).json(body);
            }
        })
    }
});


// Add a news story to the user
router.post('/:id/savedstories', function (req, res, next) {

    // todo add joi validation
    let id = req.params.id;
    let record = req.body;
    if (Helper.isEmpty(id)) {
        console.error('Failed to update because no id was provided');
        res.status(400).json({"Error": "Failed to update because no id was provided"});
    } else if (Helper.isEmpty(record)) {
        console.error('Failed to update because no record was provided');
        res.status(400).json({"Error": "Failed to update because no record was provided"});
    } else if (!DatabaseServer.connected) {
        console.error('Failed to update because database is not yet started');
        res.status(500).json({"Error": "Failed to update because database is not yet started"});
    } else {

        DatabaseServer.users.findOneAndUpdate(
            {_id: DatabaseServer.objectId(id)},
            { $addToSet: { savedStories: record } },
            {returnOriginal: false}
            , function (err, result) {
                if (err) {
                    let message = 'Failed to update record with error ' + err;
                    console.error(message);
                    res.status(400).json({"Error": message});
                } else if (result.ok !== 1) {
                    console.error('Failed to update record, result not ok ', result.ok);
                } else {
                    res.status(200).json(result);
                }
            })
    }
});

//
// Return all the Home Page news stories. Call the middleware first to verify we have a logged in user.
//
router.get('/', function (req, res, next) {

    // todo add joi validation
    let queryType = 'all';
    let queryId;
    let queryFilter;
    if ( !Helper.isEmpty(req.query.id )) {
        queryType = 'id';
        queryId = req.query.id;
    }
    if (queryType === 'all') {
        if (!Helper.isEmpty(req.body)) {
            queryType = 'filter';
            queryFilter = req.body;
        }
    }
    if ( queryType === 'id' && queryId === undefined ) {
        console.error('Failed to read because no id was provided');
        res.status(400).json({"Error": "Failed to read because no query was provided"});
    } else if (!DatabaseServer.connected) {
        console.error('Failed to read because database is not yet started');
        res.status(500).json({"Error": "Failed to read because database is not yet started"});
    } else {
        if (queryType === 'id') {
            DatabaseServer.users.findOne({_id: DatabaseServer.objectId(queryId)}, function (err, result) {
                if (err) {
                    console.error('Failed to find record');
                    res.status(404).json({"Error": "Record not found"});
                } else {
                    // Replace _id with id
                    result.id = result._id;
                    delete result._id;
                    res.status(200).json(result);
                }
            })
        } else if (queryType === 'filter') {
            let result = [];
            DatabaseServer.users.find(queryFilter).forEach(function(doc) {
                // Replace _id with id
                doc.id = doc._id;
                delete doc._id;
                result.push(doc);
            }, function(err) {
                // done or error
                if (err) {
                    console.error('Failed with error', err);
                    let message = "Failed with error " + err;
                    res.status(500).json({"status": 500, "message": message});
                } else {
                    if (Helper.isEmpty(result[0])) {
                        res.status(200).json();
                    } else {
                        res.status(200).json(result);
                    }
                }
            })
        } else {
            let result = [];
            DatabaseServer.users.find().forEach(function(doc) {
                // Replace _id with id
                doc.id = doc._id;
                delete doc._id;
                result.push(doc);
            }, function(err) {
                // done or error
                if (err) {
                    console.error('Failed to find record');
                    let message = "Failed to find record with error " + err;
                    res.status(400).json({"Error": message});
                } else {
                    res.status(200).json(result);
                }
            })
        }
    }
});

router.put('/:id', function (req, res, next) {


    // todo add joi validation
    let id = req.params.id;
    let record = req.body;
    if (Helper.isEmpty(id)) {
        console.error('Failed to update because no id was provided');
        res.status(400).json({"Error": "Failed to update because no id was provided"});
    } else if (Helper.isEmpty(record)) {
        console.error('Failed to update because no record was provided');
        res.status(400).json({"Error": "Failed to update because no record was provided"});
    } else if (Helper.isEmpty(record.newsFilters)) {
        console.error('Failed to update because no data was provided');
        res.status(400).json({"Error": "Failed to update because no data was provided"});
    } else if (!DatabaseServer.connected) {
        console.error('Failed to update because database is not yet started');
        res.status(500).json({"Error": "Failed to update because database is not yet started"});
    } else {

        DatabaseServer.users.findOneAndUpdate(
            {_id: DatabaseServer.objectId(id)},
            { $set: { settings: { requireWIFI: record.requireWIFI, enableAlerts: record.enableAlerts }, newsFilters: record.newsFilters } },
            {returnOriginal: false}
            , function (err, result) {
                if (err) {
                    let message = 'Failed to update record with error ' + err;
                    console.error(message);
                    res.status(400).json({"Error": message});
                } else if (result.ok !== 1) {
                    console.error('Failed to update record, result not ok ', result.ok);
                } else {
                    let body = result.value;
                    body.id = body._id;
                    delete body._id;
                    res.status(200).json(body);
                }
            })
    }
});


//
// Return all the Home Page news stories. Call the middleware first to verify we have a logged in user.
//
router.delete('/:id', function (req, res, next) {

    // todo add joi validation
    console.log(req.params);
    let id = req.params.id;
    if (Helper.isEmpty(id)) {
        console.error('Failed to delete because no query was provided');
        res.status(400).json({"Error": "Failed to delete because no query was provided"});
    } else if ( id === undefined ) {
        console.error('Failed to delete because no query was provided');
        res.status(400).json({"Error": "Failed to delete because no query was provided"});
    } else if (!DatabaseServer.connected) {
        console.error('Failed to delete because database is not yet started');
        res.status(500).json({"Error": "Failed to delete because database is not yet started"});
    } else {
        DatabaseServer.users.findOneAndDelete({_id: DatabaseServer.objectId(id)}, function (err, result) {
            if (err) {
                let message = 'Failed to delete record with error ' + err;
                console.error(message);
                res.status(400).json({"Error": message});
            } else {
                res.status(200).json(result);
            }
        })
    }
});

// Delete a news story from the user
router.delete('/:id/savedstories/:sid', function (req, res, next) {

    // todo add joi validation
    let id = req.params.id;
    let sid = req.params.sid;
    if (Helper.isEmpty(id) || Helper.isEmpty(sid)) {
        console.error('Failed to update because no id was provided');
        res.status(400).json({"Error": "Failed to update because no id was provided"});
    } else if (!DatabaseServer.connected) {
        console.error('Failed to update because database is not yet started');
        res.status(500).json({"Error": "Failed to update because database is not yet started"});
    } else {

        DatabaseServer.users.findOneAndUpdate(
            {_id: DatabaseServer.objectId(id)},
            { $pull: { savedStories: { storyID: sid } } },
            {returnOriginal: false}
            , function (err, result) {
                if (err) {
                    let message = 'Failed to update record with error ' + err;
                    console.error(message);
                    res.status(400).json({"Error": message});
                } else if (result.ok !== 1) {
                    console.error('Failed to update record, result not ok ', result.ok);
                    res.status(400).json({"Error": message});
                } else {
                    res.status(200).json(result);
                }
            })
    }
});


module.exports = router;