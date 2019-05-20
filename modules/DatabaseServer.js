// Class HttpServer
'use strict';

// Includes

// Validate environment before anything
const Environment = require('./Environment');

let databaseClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
let assert = require('assert');

class DatabaseServer {

    static start() {
        return new Promise(function (resolve, reject) {

            //Use connect method to connect to the Server
            databaseClient.connect(Environment.databaseConnectUrl, {useNewUrlParser: true}, function (err, client) {
                if (err) {
                    reject(err);
                } else {
                    DatabaseServer.database = client;
                    DatabaseServer.vehicles = client.db(Environment.databaseName).collection(Environment.databaseVehiclesCollectionName);
                    DatabaseServer.connected = true;

                    resolve(client);
                }
            });
        })
    }
}

DatabaseServer.database = {};
DatabaseServer.objectId = ObjectId;
DatabaseServer.users = {};
DatabaseServer.connected = false;
module.exports = DatabaseServer;