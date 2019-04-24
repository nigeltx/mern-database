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
let Environment = require('../classes/Environment');
let async = require('async');


// Create a news item
router.post('/', function (req, res, next) {

    // todo add joi validation
    let record = req.body;
    if (Helper.isEmpty(record)) {
        console.error('Failed to read because no data was provided');
        res.status(400).json({"Error": "Failed to read because no data was provided"});
    } else if (record === undefined) {
        console.error('Failed to read because no record was provided');
        res.status(400).json({"Error": "Failed to read because no record was provided"});
    } else if (!DatabaseServer.connected) {
        console.error('Failed to read because database is not yet started');
        res.status(500).json({"Error": "Failed to read because database is not yet started"});
    } else {
        if (record.id !== undefined) {
            record._id = record.id;
            delete record.id;
        }
        DatabaseServer.news.insertOne(record, function (err, result) {
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

// Return all the Home Page news stories. Call the middleware first to verify we have a logged in user.
//
router.get('/', function (req, res, next) {

    // todo add joi validation
    let id = req.query.id;
    if (!id) {
        console.error('Failed to update because no id was provided');
        res.status(400).json({"Error": "Failed to update because no id was provided"});
    } else if (!DatabaseServer.connected) {
        console.error('Failed to read because database is not yet started');
        res.status(500).json({"Error": "Failed to read because database is not yet started"});
    } else {
        DatabaseServer.news.findOne({_id: id}, function (err, result) {
            if (err) {
                console.error('Failed to find record');
                res.status(500).json({"Error": "Record not found"});
            } else {

                if (!result) {
                    res.status(200).json();
                } else {
                    let body = result;
                    body.id = body._id;
                    delete body._id;
                    res.status(200).json(body);
                }
            }
        })
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
    } else if (Helper.isEmpty(record.newsStories) || Helper.isEmpty(record.homeNewsStories)) {
        console.error('Failed to update because no data was provided');
        res.status(400).json({"Error": "Failed to update because no data was provided"});
    } else if (!DatabaseServer.connected) {
        console.error('Failed to update because database is not yet started');
        res.status(500).json({"Error": "Failed to update because database is not yet started"});
    } else {

        DatabaseServer.news.findOneAndUpdate(
            {_id: id},
            {$set: {newsStories: record.newsStories, homeNewsStories: record.homeNewsStories}},
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

router.delete('/:id', function (req, res, next) {

    // todo add joi validation
    let id = req.params.id;
    if (Helper.isEmpty(id)) {
        console.error('Failed to delete because no query was provided');
        res.status(400).json({"Error": "Failed to delete because no query was provided"});
    } else if (id === undefined) {
        console.error('Failed to delete because no query was provided');
        res.status(400).json({"Error": "Failed to delete because no query was provided"});
    } else if (!DatabaseServer.connected) {
        console.error('Failed to delete because database is not yet started');
        res.status(500).json({"Error": "Failed to delete because database is not yet started"});
    } else {
        DatabaseServer.news.findOneAndDelete({_id: id}, function (err, result) {
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