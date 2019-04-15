//
// homeNews.js: A Node.js Module for for home news story management.
//
//

"use strict";

let express = require('express');
let router = express.Router();

let DatabaseServer = require('../classes/DatabaseServer');
var ObjectId = require('mongodb').ObjectID;
let Helper = require('../classes/Helper');
let async = require('async');

//
// Return all the Home Page news stories. Call the middleware first to verify we have a logged in user.
//
router.post('/:id', function (req, res, next) {

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
        DatabaseServer.collection.insertOne(record, function (err, result) {
            if (err) {
                console.error('Failed to create record');
                let message = "Failed to create record with error " + err;
                res.status(400).json({"Error": message});
            } else {
                res.status(200).json({id: result.insertedId});
            }
        })
    }
});
//
// Return all the Home Page news stories. Call the middleware first to verify we have a logged in user.
//
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
        DatabaseServer.collection.insertOne(record, function (err, result) {
            if (err) {
                console.error('Failed to create record');
                let message = "Failed to create record with error " + err;
                res.status(400).json({"Error": message});
            } else {
                res.status(200).json({id: result.insertedId});
            }
        })
    }
});

//
// Return all the Home Page news stories. Call the middleware first to verify we have a logged in user.
//
router.get('/', function (req, res, next) {

    // todo add joi validation
    let query = req.body;
    if ( query === undefined ) {
        console.error('Failed to read because no query was provided');
        res.status(400).json({"Error": "Failed to read because no query was provided"});
    } else if (!DatabaseServer.connected) {
        console.error('Failed to read because database is not yet started');
        res.status(500).json({"Error": "Failed to read because database is not yet started"});
    } else {
        let result = [];
        DatabaseServer.collection.find().forEach(function(doc) {
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
});

//
// Return all the Home Page news stories. Call the middleware first to verify we have a logged in user.
//
router.get('/:id', function (req, res, next) {

    // todo add joi validation
    console.log(req.params);
    let id = req.params.id;
    if (Helper.isEmpty(id)) {
        console.error('Failed to read because no query was provided');
        res.status(400).json({"Error": "Failed to read because no query was provided"});
    } else if ( id === undefined ) {
        console.error('Failed to read because no id was provided');
        res.status(400).json({"Error": "Failed to read because no query was provided"});
    } else if (!DatabaseServer.connected) {
        console.error('Failed to read because database is not yet started');
        res.status(500).json({"Error": "Failed to read because database is not yet started"});
    } else {
        DatabaseServer.collection.findOne({_id: ObjectId(id)}, function (err, result) {
            if (err) {
                console.error('Failed to find record');
                res.status(400).json({"Error": "Record not found"});
            } else {
                res.status(200).json(result);
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
        DatabaseServer.collection.findOneAndDelete({_id: ObjectId(id)}, function (err, result) {
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

module.exports = router;