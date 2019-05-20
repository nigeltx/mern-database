let DatabaseServer = require('../modules/DatabaseServer');

async function newVehicle(document) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!document) {
            reject(new Error('Failed to create vehicle because no data was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to create because database is not yet started'));
        } else {
            DatabaseServer.vehicles.insertOne(document, function (err, result) {
                if (!err) {
                    let document = result.ops[0];
                    document.id = result.ops[0]._id;
                    delete document._id;
                    resolve(document);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function getVehicle(id) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!id) {
            reject(new Error('Failed to get vehicle because no id was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to get vehicle because database is not yet started'));
        } else {

            DatabaseServer.vehicles.findOne({_id: DatabaseServer.objectId(id)}, function (err, document) {
                if (!err) {

                    document.id = document._id;
                    delete document._id;
                    resolve(document);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function findVehicle(query) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!DatabaseServer.connected) {
            reject(new Error('Failed to find vehicles because database is not yet started'));
        } else {
            let result = [];
            if (!query) {
                query = {}
            } else if (query.id) {
                query._id = DatabaseServer.objectId(query.id);
                delete query.id;
            }
            DatabaseServer.vehicles.find(query).forEach(function (document) {
                // Replace _id with id
                document.id = document._id;
                delete document._id;
                result.push(document);
            }, function (err) {
                // done or error
                if (!err) {
                    resolve(result);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function saveVehicle(document) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!document) {
            reject(new Error('Failed to save vehicle because no data was provided'));
        } else if (!document.id) {
            reject(new Error('Failed to save vehicle because no id was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to save because database is not yet started'));
        } else {
            DatabaseServer.vehicles.findOneAndUpdate(
                {_id: DatabaseServer.objectId(document.id)},
                {
                    $set: {
                        name: document.name,
                        year: document.year,
                        make: document.make,
                        model: document.model,
                        licensePlate: document.licensePlate,
                        vin: document.vin,
                        insuranceName: document.insuranceName,
                        insurancePolicy: document.insurancePolicy,
                        locationName: document.locationName,
                        locationCoordinates: document.locationCoordinates,
                        locationAddress: document.locationAddress,
                        locationPhone: document.locationPhone,
                        dateCreated: document.dateCreated,
                        dateModified: Date.now()
                    }
                },
                {returnOriginal: false}
                , function (err, result) {
                if (!err) {
                    let document = result.value;
                    document.id = document._id;
                    delete document._id;
                    resolve(document);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function deleteVehicle(id) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!id) {
            reject(new Error('Failed to find vehicle because no id was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to read because database is not yet started'));
        } else {

            DatabaseServer.vehicles.deleteOne({_id: DatabaseServer.objectId(id)}, function (err, document) {
                if (!err) {

                    document.id = document._id;
                    delete document._id;
                    resolve({id: id});
                } else {
                    reject(err);
                }
            })
        }
    })
}

module.exports = {getVehicle, newVehicle, findVehicle, saveVehicle, deleteVehicle};
