//
// homeNews.js: A Node.js Module for for home news story management.
//
//

"use strict";

let express = require('express');
let router = express.Router();
let joi = require('joi'); // For data validation

let DatabaseServer = require('../classes/DatabaseServer');
let Helper = require('../classes/Helper');
let Environment = require('../classes/Environment');
let async = require('async');

// //
// // Return all the Home Page news stories. Call the middleware first to verify we have a logged in user.
// //
// router.post('/users/:id', function (req, res, next) {
//
//     // todo add joi validation
//     let record = req.body;
//     if (Helper.isEmpty(record)) {
//         console.error('Failed to read because no data was provided');
//         res.status(400).json({"Error": "Failed to read because no data was provided"});
//     } else if ( record === undefined ) {
//         console.error('Failed to read because no record was provided');
//         res.status(400).json({"Error": "Failed to read because no record was provided"});
//     } else if (!DatabaseServer.connected) {
//         console.error('Failed to read because database is not yet started');
//         res.status(500).json({"Error": "Failed to read because database is not yet started"});
//     } else {
//         if ( record.id !== undefined ) {
//
//         }
//         DatabaseServer.collection.insertOne(record, function (err, result) {
//             if (err) {
//                 console.error('Failed to create record');
//                 let message = "Failed to create record with error " + err;
//                 res.status(400).json({"Error": message});
//             } else {
//                 res.status(200).json({id: result.insertedId});
//             }
//         })
//     }
// });
//
// Return all the Home Page news stories. Call the middleware first to verify we have a logged in user.
//
router.post('/', function (req, res, next) {

    // Validate the body
    let schema = {
        contentSnippet: joi.string().max(200).required(),
        date: joi.date().required(),
        hours: joi.string().max(20),
        imageUrl: joi.string().max(300).required(),
        keep: joi.boolean().required(),
        link: joi.string().max(300).required(),
        source: joi.string().max(50).required(),
        storyID: joi.string().max(100).required(),
        title: joi.string().max(200).required()
    };

    let story = req.body;
    delete story.displayName;
    delete story.userId;
    delete story.dateTime;
    delete story.comment;
    console.log('Req.body: ', req.body);
    joi.validate(story, schema, function (err) {
        if (err)
            return next(err);

        // We first make sure we are not at the 100 count limit.
        DatabaseServer.sharedStories.countDocuments({ type: 'SHAREDSTORY_TYPE' }, function (err, count) {
            if (err)
                return next(err);

            if (count > Environment.newsMaxSharedStories)
                return next(new Error('Shared story limit reached'));

            // Make sure the story was not already shared
            DatabaseServer.sharedStories.countDocuments({ type: 'SHAREDSTORY_TYPE', _id: story.storyID }, function (err, count) {
                if (err)
                    return next(err);
                if (count > 0)
                    return next(new Error('Story was already shared.'));

                // Now we can create this as a shared news story Document.
                // Note that we don't need to worry about simultaneous post requests creating the same story
                // as the id uniqueness will force that and fail other requests.
                var xferStory = {
                    _id: story.storyID,
                    type: 'SHAREDSTORY_TYPE',
                    story: story,
                    comments: [{
                        displayName: req.body.displayName,
                        userId: req.body.userId,
                        dateTime: req.body.dateTime,
                        comment: req.body.displayName + " thought everyone might enjoy this!"
                    }]
                };

                DatabaseServer.sharedStories.insertOne(xferStory, function createUser(err, result) {
                    if (err)
                        return next(err);

                    res.status(201).json(result.ops[0]);
                });
            });
        });
    });
});

// //
// // Return all the Home Page news stories. Call the middleware first to verify we have a logged in user.
// //
// router.get('/', function (req, res, next) {
//
//     // todo add joi validation
//     let query = req.body;
//     if ( query === undefined ) {
//         console.error('Failed to read because no query was provided');
//         res.status(400).json({"Error": "Failed to read because no query was provided"});
//     } else if (!DatabaseServer.connected) {
//         console.error('Failed to read because database is not yet started');
//         res.status(500).json({"Error": "Failed to read because database is not yet started"});
//     } else {
//         let result = [];
//         DatabaseServer.collection.find().forEach(function(doc) {
//             result.push(doc);
//         }, function(err) {
//             // done or error
//             if (err) {
//                 console.error('Failed to find record');
//                 let message = "Failed to find record with error " + err;
//                 res.status(400).json({"Error": message});
//             } else {
//                 res.status(200).json(result);
//             }
//         })
//     }
// });

//
// Return all the Home Page news stories. Call the middleware first to verify we have a logged in user.
//
router.get('/', function (req, res, next) {

    // todo add joi validation
    let queryType = 'all';
    let queryId;
    if ( !Helper.isEmpty(req.query.id )) {
        queryType = 'id';
        queryId = req.query.id;
    }
    if ( queryType === 'id' && queryId === undefined ) {
        console.error('Failed to read because no id was provided');
        res.status(400).json({"Error": "Failed to read because no query was provided"});
    } else if (!DatabaseServer.connected) {
        console.error('Failed to read because database is not yet started');
        res.status(500).json({"Error": "Failed to read because database is not yet started"});
    } else {
        if (queryType === 'id') {
            DatabaseServer.sharedStories.findOne({_id: DatabaseServer.objectId(queryId)}, function (err, result) {
                if (err) {
                    console.error('Failed to find record');
                    res.status(400).json({"Error": "Record not found"});
                } else {
                    // Replace _id with id
                    result.id = result._id;
                    delete result._id;
                    res.status(200).json(result);
                }
            })
        } else {
            let result = [];
            DatabaseServer.sharedStories.find().forEach(function(doc) {
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
                    // Replace _id with id
                    result.id = result._id;
                    delete result._id;
                    console.log(result);
                    res.status(200).json(result);
                }
            })
        }
    }
});


router.post('/:id/comments', function (req, res, next) {


    // todo add joi validation
    let id = req.params.id;
    let record = req.body;
    if (Helper.isEmpty(id)) {
        console.error('Failed to update because no id was provided');
        res.status(400).json({"Error": "Failed to update because no id was provided"});
    } else if (Helper.isEmpty(record)) {
        console.error('Failed to update because no record was provided');
        res.status(400).json({"Error": "Failed to update because no record was provided"});
    }  else if (!DatabaseServer.connected) {
        console.error('Failed to update because database is not yet started');
        res.status(500).json({"Error": "Failed to update because database is not yet started"});
    } else {

        DatabaseServer.sharedStories.findOneAndUpdate(
            {_id: id},
            { $push: { comments: req.body } },
            {returnOriginal: false}
            , function (err, result) {
                if (err) {
                    let message = 'Failed to update record with error ' + err;
                    console.error(message);
                    res.status(400).json({"Error": message});
                } else if (result.ok !== 1) {
                    let message = 'Failed to update record, result not ok ' + result.ok;
                    res.status(400).json({"Error": message});
                } else {
                    if (result.value === null) {
                        res.status(200).json();
                    } else {
                        let body = result.value;
                        body.id = body._id;
                        delete body._id;
                        res.status(200).json(body);
                    }
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
    } else if (!DatabaseServer.connected) {
        console.error('Failed to delete because database is not yet started');
        res.status(500).json({"Error": "Failed to delete because database is not yet started"});
    } else {
        DatabaseServer.sharedStories.findOneAndDelete({_id: id}, function (err, result) {
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