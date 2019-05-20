const DatabaseServer = require('../modules/DatabaseServer');
const uuid = require('uuid/v1');

async function newMileage(vehicleId, document) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!vehicleId) {
            reject(new Error('Failed to create mileage because no vehicle id was provided'));
        } if (!document) {
            reject(new Error('Failed to create mileage because no data was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to create mileage because database is not yet started'));
        } else {
            document.id = uuid();
            DatabaseServer.vehicles.findOneAndUpdate(
                {_id: DatabaseServer.objectId(vehicleId)},
                { $addToSet: { mileages: document } },
                {returnOriginal: false}, function (err, result) {
                if (!err) {
                    let mileage;
                    for (let mileageItem of result.value.mileages) {
                        if ( mileageItem.id === document.id) {
                            mileage = mileageItem
                        }
                    }
                    resolve(mileage);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function getMileage(vehicleId, id) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!vehicleId || !id) {
            reject(new Error('Failed to get vehicle because no id was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to get vehicle because database is not yet started'));
        } else {

            DatabaseServer.vehicles.findOne({ _id: DatabaseServer.objectId(vehicleId) }, function (err, result) {
                if (!err) {
                    let mileage = {};
                    for (let mileageItem of result.mileages) {
                        if ( mileageItem.id === id) {
                            mileage = mileageItem
                        }
                    }
                    resolve(mileage);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function findMileage(vehicleId) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!DatabaseServer.connected) {
            reject(new Error('Failed to find vehicles because database is not yet started'));
        } else {
            DatabaseServer.vehicles.findOne({ _id: DatabaseServer.objectId(vehicleId) }, function (err, result) {
                if (!err) {
                    let mileages = [];
                    for (let mileageItem of result.mileages) {
                        mileages.push(mileageItem)
                    }
                    resolve(mileages);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function saveMileage(vehicleId, document) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!vehicleId || !document) {
            reject(new Error('Failed to save vehicle because no data was provided'));
        } else if (!document.id) {
            reject(new Error('Failed to save vehicle because no id was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to save because database is not yet started'));
        } else {
            DatabaseServer.vehicles.updateOne(
                {_id: DatabaseServer.objectId(vehicleId), "mileages.id": document.id},
                {
                    $set: {
                        "mileages.$.date": document.date,
                        "mileages.$.mileage": document.mileage
                    }
                },
                {returnOriginal: false}
                , function (err, result) {
                if (!err) {
                    resolve(document);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function deleteMileage(vehicleId, id) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!vehicleId || !id) {
            reject(new Error('Failed to delete vehicle because no id was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to delete vehicle because database is not yet started'));
        } else {

            DatabaseServer.vehicles.findOneAndUpdate(
                {_id: DatabaseServer.objectId(vehicleId)},
                { $pull: { mileages: { id: id } } },
                {returnOriginal: false}, function (err, result) {
                    if (!err) {
                        resolve({id: id});
                    } else {
                        reject(err);
                    }
                })
        }
    })
}

module.exports = {newMileage, getMileage, findMileage, saveMileage, deleteMileage};
