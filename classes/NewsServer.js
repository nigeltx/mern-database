// Class HttpServer
'use strict';

// Includes
const Environment = require('../classes/Environment');
let DatabaseServer = require('../classes/DatabaseServer');
let async = require('async');
let https = require("https");
let bcrypt = require('bcryptjs');


// To allow setTimeout to use promises
// const util = require('util');
// const setTimeoutPromise = util.promisify(setTimeout);

let EventEmitter = require('events').EventEmitter;
// let newsEmitter = new EventEmitter();
// newsEmitter.on('connected', (database, collection, connected) => {
//     // If needed
// });

class NewsServer {

    constructor() {
    }

    static start() {
        if (!NewsServer.started) {
            NewsServer.started = true;
            console.log("INFO: News service started");
            NewsServer.getNewsFromCloud();
            NewsServer.cleanupNewsFromShared();
            setInterval(function () {
                NewsServer.getNewsFromCloud();
                NewsServer.cleanupNewsFromShared();
            }, Environment.newsRefreshIntervalMinutes * 60 * 1000);
        }
    }

    static getNewsFromCloud() {
        // return new Promise(function (resolve, reject) {
        //     resolve('good');
        let count = 0;
        // newsPullBackgroundTimer = setInterval(function () {
        // The New York Times news service states that we should not call more than five times a second
        // We have to call it over and over again, because there are multiple news categoris, so space each out by half a second
        // It will error if the size of this Document exceeds the maximum size (512KB). To fix this, split it up into as many as necessary.
        let date = new Date();
        console.log("INFO: Getting news from the cloud: " + date.toUTCString());
        async.timesSeries(NewsServer.categories.length, function (n, next) {
            setTimeout(function () {
                console.log('INFO: Getting news stories from NYT. Pass #', n);
                try {
                    https.get({
                        host: 'api.nytimes.com',
                        path: '/svc/topstories/v2/' + NewsServer.categories[n] + '.json?api-key=' + Environment.newsApiKey
                        // headers: { 'api-key': Environment.newsApiKey }
                    }, function (res) {
                        let body = '';
                        res.on('data', function (d) {
                            body += d;
                        });
                        res.on('end', function () {
                            next(null, body);
                        });
                    }).on('error', function (err) {
                        // handle errors with the request itself
                        console.log({msg: 'FORK_ERROR', Error: 'Error with the request: ' + err.message});
                    });
                } catch (err) {
                    count++;
                    if (count === 3) {
                        console.log('app_FORK.js: shuting down timer...too many errors: err:' + err);
                        // clearInterval(newsPullBackgroundTimer);
                        // clearInterval(staleStoryDeleteBackgroundTimer);
                        process.disconnect();
                    } else {
                        console.log('app_FORK.js error. err:' + err);
                    }
                }
            }, 500);
        }, function (err, result) {
            if (err) {
                console.log('Error: Failed to get news from the cloud ' + err);
                // thisNewsEmitter.emit('retrieve', false);
            } else {
                console.log('INFO: Successfully got news from the cloud');
                NewsServer.saveNewsToMasterDocument(result)
                // thisNewsEmitter.emit('retrieve', result);
            }
        })
        // })
    }

    static saveNewsToMasterDocument(newsJson) {

        // Do the replacement of the news stories in the single master Document
        // let thisNewsEmitter = this.newsEmitter;
        console.log('INFO: Saving news to master document');
        DatabaseServer.collection.findOne({_id: Environment.newsMasterDocumentId}, function (err, masterNewsDocument) {
            if (err) {
                console.log({
                    msg: 'FORK_ERROR',
                    Error: 'Error with the global news doc read request: ' + JSON.stringify(err.body, null, 4)
                });
            } else {
                masterNewsDocument.newsStories = [];
                masterNewsDocument.homeNewsStories = [];
                let allNews = [];
                let newsObject = {};
                for (let i = 0; i < newsJson.length; i++) {
                    // JSON.parse is syncronous and it will throw an exception on invalid JSON, so we need to catch it
                    try {
                        newsObject = JSON.parse(newsJson[i]);
                    } catch (e) {
                        console.error(e);
                        return;
                    }
                    for (let j = 0; j < newsObject.results.length; j++) {
                        let xferNewsStory = {
                            link: newsObject.results[j].url,
                            title: newsObject.results[j].title,
                            contentSnippet: newsObject.results[j].abstract,
                            source: newsObject.results[j].section,
                            date: new Date(newsObject.results[j].updated_date).getTime()
                        };
                        // Only take stories with images
                        if (newsObject.results[j].multimedia.length > 0) {
                            xferNewsStory.imageUrl = newsObject.results[j].multimedia[0].url;
                            allNews.push(xferNewsStory);
                            // Populate the home page stories
                            if (i === 0) {
                                masterNewsDocument.homeNewsStories.push(xferNewsStory);
                            }
                        }
                    }
                }

                async.eachSeries(allNews, function (story, innercallback) {
                    bcrypt.hash(story.link, 10, function getHash(err, hash) {
                        if (err)
                            innercallback(err);

                        // Only add the story if it is not in there already.
                        // The problem is that stories on NYT can be shared between categories
                        story.storyID = hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
                        if (masterNewsDocument.newsStories.findIndex(function (o) {
                            return (o.storyID === story.storyID || o.title === story.title);
                        }) === -1) {
                            masterNewsDocument.newsStories.push(story);
                        }
                        innercallback();
                    });
                }, function (err) {
                    if (err) {
                        console.log('Error: Failed to save news to master');
                        // thisNewsEmitter.emit('save', false);
                    } else {
                        NewsServer.masterDocument = masterNewsDocument;
                        NewsServer.updateNewsInAllUserDocuments();
                        console.log('INFO: Successfully saved news to master');
                        // thisNewsEmitter.emit('save', newsDocument);
                    }
                });
            }
        });
    }

    static updateNewsInAllUserDocuments() {

        console.log('INFO: Updating news in all user documents');
        DatabaseServer.collection.findOneAndUpdate({_id: NewsServer.masterDocument._id},
            {
                $set: {
                    newsStories: NewsServer.masterDocument.newsStories,
                    homeNewsStories: NewsServer.masterDocument.homeNewsStories
                }
            },
            function (err, result) {
                if (err) {
                    console.log('ERROR: Failed to update news stories for all users ', err);
                } else if (result.ok !== 1) {
                    console.log('ERROR: Failed to update news stories for all users ', result);
                } else {
                    // For each NewsWatcher user, do news matching on their newsFilters
                    let cursor = DatabaseServer.collection.find({type: 'USER_TYPE'});
                    let keepProcessing = true;
                    async.doWhilst(
                        function (callback) {
                            cursor.next(function (err, userDocument) {
                                if (userDocument) {
                                    NewsServer.updateNewsInUserDocument(userDocument)
                                        .then(message => {
                                            callback(null);
                                        })
                                        .catch(error => {
                                            callback(null);
                                        });
                                    //
                                    // NewsServer.updateNewsInUserDocument(userDocument, function (err) {
                                    //     callback(null);
                                    // });
                                } else {
                                    keepProcessing = false;
                                    callback(null);
                                }
                            });
                        },
                        function () {
                            return keepProcessing;
                        },
                        function (err) {
                            console.log('Timer: News stories refreshed and user newsFilters matched. err:', err);
                        });
                }
            });
    }

    static updateNewsInUserDocument(userDocument) {

        return new Promise(function (resolve, reject) {
            // Loop through all newsFilters and seek matches for all returned stories
            console.log('INFO: Updating news for user ', userDocument.displayName);
            for (let filterIdx = 0; filterIdx < userDocument.newsFilters.length; filterIdx++) {
                userDocument.newsFilters[filterIdx].newsStories = [];
                for (let i = 0; i < NewsServer.masterDocument.newsStories.length; i++) {
                    NewsServer.masterDocument.newsStories[i].keep = false;
                }

                // If there are keyWords, then filter by them
                if ("keyWords" in userDocument.newsFilters[filterIdx] && userDocument.newsFilters[filterIdx].keyWords[0] !== "") {
                    let storiesMatched = 0;
                    for (let i = 0; i < userDocument.newsFilters[filterIdx].keyWords.length; i++) {
                        for (let j = 0; j < NewsServer.masterDocument.newsStories.length; j++) {
                            if (NewsServer.masterDocument.newsStories[j].keep === false) {
                                let s1 = NewsServer.masterDocument.newsStories[j].title.toLowerCase();
                                let s2 = NewsServer.masterDocument.newsStories[j].contentSnippet.toLowerCase();
                                let keyword = userDocument.newsFilters[filterIdx].keyWords[i].toLowerCase();
                                if (s1.indexOf(keyword) >= 0 || s2.indexOf(keyword) >= 0) {
                                    NewsServer.masterDocument.newsStories[j].keep = true;
                                    storiesMatched++;
                                }
                            }
                            if (storiesMatched === Environment.newsMaxFilterStories)
                                break;
                        }
                        if (storiesMatched === Environment.newsMaxFilterStories)
                            break;
                    }

                    for (let k = 0; k < NewsServer.masterDocument.newsStories.length; k++) {
                        if (NewsServer.masterDocument.newsStories[k].keep === true) {
                            userDocument.newsFilters[filterIdx].newsStories.push(NewsServer.masterDocument.newsStories[k]);
                        }
                    }
                }
            }

            // Do the replacement of the news stories
            DatabaseServer.collection.findOneAndUpdate({_id: DatabaseServer.objectId(userDocument._id)}, {$set: {"newsFilters": userDocument.newsFilters}}, function (err, result) {
                if (err) {
                    console.log('ERROR: Failed to update news for user document: ', userDocument._id, err);
                    reject(err);
                } else if (result.ok !== 1) {
                    console.log('ERROR: Failed to update news for user document: ', userDocument._id, result);
                    reject(err);
                } else {
                    let message = 'INFO: Successfully updated news for user document = ' + userDocument.newsFilters[0].newsStories.length;
                    console.log('INFO: ', message);
                    resolve(message)
                }
            });
        })
    }

    //
    // Delete shared news stories that are over three days old.
    // Use node-schedule or cron npm modules if want to actually do something like run every morning at 1AM
    //
    static cleanupNewsFromShared() {
        console.log('INFO: Cleaning up old news stories');

        DatabaseServer.collection.find({type: 'SHAREDSTORY_TYPE'}).toArray(function (err, docs) {
            if (err) {
                console.log('Fork could not get shared stories. err:', err);
                return;
            }

            async.eachSeries(docs, function (story, innercallback) {
                // Go off the date of the time the story was shared
                var d1 = story.comments[0].dateTime;
                var d2 = Date.now();
                var diff = Math.floor((d2 - d1) / 3600000);
                if (diff > 72) {
                    DatabaseServer.collection.findOneAndDelete({
                        type: 'SHAREDSTORY_TYPE',
                        _id: story._id
                    }, function (err, result) { // eslint-disable-line no-unused-vars
                        innercallback(err);
                    });
                } else {
                    innercallback();
                }
            }, function (err) {
                if (err) {
                    console.log('ERROR: Failed to clean up old news');
                } else {
                    console.log('INFO: Successfully cleaned up old news');
                }
            });
        });
    }

}

NewsServer.started = false;
NewsServer.categories = ["home", "world", "national", "business", "technology"];
NewsServer.masterDocument = {};
module.exports = NewsServer;