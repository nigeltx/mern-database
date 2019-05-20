const DatabaseServer = require('../modules/DatabaseServer');
const uuid = require('uuid/v1');

async function newServiceRecord(vehicleId, document) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!vehicleId) {
            reject(new Error('Failed to create serviceRecord because no vehicle id was provided'));
        } if (!document) {
            reject(new Error('Failed to create serviceRecord because no data was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to create serviceRecord because database is not yet started'));
        } else {
            document.id = uuid();
            DatabaseServer.vehicles.findOneAndUpdate(
                {_id: DatabaseServer.objectId(vehicleId)},
                { $addToSet: { serviceRecords: document } },
                {returnOriginal: false}, function (err, result) {
                if (!err) {
                    let serviceRecord;
                    for (let serviceRecordItem of result.value.serviceRecords) {
                        if ( serviceRecordItem.id === document.id) {
                            serviceRecord = serviceRecordItem
                        }
                    }
                    resolve(serviceRecord);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function getServiceRecord(vehicleId, id) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!vehicleId || !id) {
            reject(new Error('Failed to get vehicle because no id was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to get vehicle because database is not yet started'));
        } else {

            DatabaseServer.vehicles.findOne({ _id: DatabaseServer.objectId(vehicleId) }, function (err, result) {
                if (!err) {
                    let serviceRecord = {};
                    for (let serviceRecordItem of result.serviceRecords) {
                        if ( serviceRecordItem.id === id) {
                            serviceRecord = serviceRecordItem
                        }
                    }
                    resolve(serviceRecord);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function findServiceRecord(vehicleId) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!DatabaseServer.connected) {
            reject(new Error('Failed to find vehicles because database is not yet started'));
        } else {
            DatabaseServer.vehicles.findOne({ _id: DatabaseServer.objectId(vehicleId) }, function (err, result) {
                if (!err) {
                    let serviceRecord = [];
                    for (let serviceRecordItem of result.serviceRecords) {
                        serviceRecord.push(serviceRecordItem)
                    }
                    resolve(serviceRecord);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function saveServiceRecord(vehicleId, document) {

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
                {_id: DatabaseServer.objectId(vehicleId), "serviceRecords.id": document.id},
                {
                    $set: {
                        "serviceRecords.$.date": document.date,
                        "serviceRecords.$.mileage": document.mileage,
                        "serviceRecords.$.serviceNames": document.serviceNames,
                        "serviceRecords.$.locationName": document.locationName,
                        "serviceRecords.$.locationCoordinates": document.locationCoordinates,
                        "serviceRecords.$.locationAddress": document.locationAddress,
                        "serviceRecords.$.locationPhone": document.phone,
                        "serviceRecords.$.contactName": document.contactName,
                        "serviceRecords.$.contactPhone": document.contactPhone,
                        "serviceRecords.$.insuranceName": document.insuranceName,
                        "serviceRecords.$.insurancePolicy": document.insurancePolicy,
                        "serviceRecords.$.estimatedCost": document.estimatedCost,
                        "serviceRecords.$.actualCost": document.actualCost,
                        "serviceRecords.$.notes": document.notes
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

async function deleteServiceRecord(vehicleId, id) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!vehicleId || !id) {
            reject(new Error('Failed to delete vehicle because no id was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to delete vehicle because database is not yet started'));
        } else {

            DatabaseServer.vehicles.findOneAndUpdate(
                {_id: DatabaseServer.objectId(vehicleId)},
                { $pull: { serviceRecord: { id: id } } },
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

module.exports = {newServiceRecord, getServiceRecord, findServiceRecord, saveServiceRecord, deleteServiceRecord};
