const DatabaseServer = require('../modules/DatabaseServer');
const uuid = require('uuid/v1');

async function newReminder(vehicleId, reminderData) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!vehicleId) {
            reject(new Error('Failed to create reminder because no vehicle id was provided'));
        } if (!reminderData) {
            reject(new Error('Failed to create reminder because no data was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to create reminder because database is not yet started'));
        } else {
            reminderData.id = uuid();
            DatabaseServer.vehicles.findOneAndUpdate(
                {_id: DatabaseServer.objectId(vehicleId)},
                { $addToSet: { reminders: reminderData } },
                {returnOriginal: false}, function (err, result) {
                if (!err) {
                    let reminder;
                    for (let reminderItem of result.value.reminders) {
                        if ( reminderItem.id === reminderData.id) {
                            reminder = reminderItem
                        }
                    }
                    resolve(reminder);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function getReminder(vehicleId, reminderId) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!vehicleId || !reminderId) {
            reject(new Error('Failed to get vehicle because no id was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to get vehicle because database is not yet started'));
        } else {

            DatabaseServer.vehicles.findOne({ _id: DatabaseServer.objectId(vehicleId) }, function (err, result) {
                if (!err) {
                    let reminder = {};
                    for (let reminderItem of result.reminders) {
                        if ( reminderItem.id === reminderId) {
                            reminder = reminderItem
                        }
                    }
                    resolve(reminder);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function findReminder(vehicleId) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!DatabaseServer.connected) {
            reject(new Error('Failed to find vehicles because database is not yet started'));
        } else {
            DatabaseServer.vehicles.findOne({ _id: DatabaseServer.objectId(vehicleId) }, function (err, result) {
                if (!err) {
                    let reminders = [];
                    for (let reminderItem of result.reminders) {
                        reminders.push(reminderItem)
                    }
                    resolve(reminders);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function saveReminder(vehicleId, reminder) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!vehicleId || !reminder) {
            reject(new Error('Failed to save vehicle because no data was provided'));
        } else if (!reminder.id) {
            reject(new Error('Failed to save vehicle because no id was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to save because database is not yet started'));
        } else {
            DatabaseServer.vehicles.updateOne(
                {_id: DatabaseServer.objectId(vehicleId), "reminders.id": reminder.id},
                {
                    $set: {
                        "reminders.$.date": reminder.date,
                        "reminders.$.mileage": reminder.mileage,
                        "reminders.$.serviceName": reminder.serviceName
                    }
                },
                {returnOriginal: false}
                , function (err, result) {
                if (!err) {
                    resolve(reminder);
                } else {
                    reject(err);
                }
            })
        }
    })
}

async function deleteReminder(vehicleId, id) {

    return new Promise((resolve, reject) => {

        // todo add joi validation
        if (!vehicleId || !id) {
            reject(new Error('Failed to delete vehicle because no id was provided'));
        } else if (!DatabaseServer.connected) {
            reject(new Error('Failed to delete vehicle because database is not yet started'));
        } else {

            DatabaseServer.vehicles.findOneAndUpdate(
                {_id: DatabaseServer.objectId(vehicleId)},
                { $pull: { reminder: { id: id } } },
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

module.exports = {newReminder, getReminder, findReminder, saveReminder, deleteReminder};
