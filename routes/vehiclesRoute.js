"use strict";

let express = require('express');
let router = express.Router();
let vehicles = require('../modules/vehicles');
let vehicleMileages = require('../modules/vehicleMileages');
let vehicleServiceRecords = require('../modules/vehicleServiceRecords');
let vehicleReminders = require('../modules/vehicleReminders');

// Vehicles
router.post('/', async function (req, res, next) {

    try {
        let document = await vehicles.newVehicle(req.body);
        res.status(200).json({"status": 200, "message": "Successfully created vehicle", "json": document});
    } catch(err) {
        next(err);
    }
});

router.get('/', async function (req, res, next) {

    try {
        let documents = await vehicles.findVehicle();
        res.status(200).json({"status": 200, "message": "Successfully got vehicles", "json": documents});
    } catch(err) {
        next(err);
    }
});

router.get('/:vehicleId', async function (req, res, next) {

    try {
        if (req.params.vehicleId) {
            let document = await vehicles.getVehicle(req.params.vehicleId);
            res.status(200).json({"status": 200, "message": "Successfully got vehicle", "json": document});
        } else {
            next(new Error('Failed to get vehicle because no vehicleId provided'));
        }
    } catch(err) {
        next(err);
    }
});

router.put('/', async function (req, res, next) {

    try {
        let document = await vehicles.saveVehicle(req.body);
        res.status(200).json({"status": 200, "message": "Successfully saved vehicle", "json": document});
    } catch(err) {
        next(err);
    }
});

router.delete('/:vehicleId', async function (req, res, next) {

    try {
        if (req.params.vehicleId) {
            let document = await vehicles.deleteVehicle(req.params.vehicleId);
            res.status(200).json({"status": 200, "message": "Successfully deleted vehicle", "json": document});
        } else {
            next(new Error('Failed to delete vehicle because no vehicleId provided'));
        }
    } catch(err) {
        next(err);
    }
});

// Mileages
router.post('/:vehicleId/mileage', async function (req, res, next) {

    try {
        let document = await vehicleMileages.newMileage(req.params.vehicleId, req.body);
        res.status(200).json({"status": 200, "message": "Successfully created mileage", "json": document});
    } catch(err) {
        next(err);
    }
});

router.get('/:vehicleId/mileage', async function (req, res, next) {

    try {
        if (req.params.vehicleId) {
            let document = await vehicleMileages.findMileage(req.params.vehicleId);
            res.status(200).json({"status": 200, "message": "Successfully got mileage", "json": document});
        } else {
            next(new Error('Failed to get mileage because vehicleId not provided'));
        }
    } catch(err) {
        next(err);
    }
});

router.get('/:vehicleId/mileage/:mileageId', async function (req, res, next) {

    try {
        if (req.params.vehicleId && req.params.mileageId) {
            let document = await vehicleMileages.getMileage(req.params.vehicleId, req.params.mileageId);
            res.status(200).json({"status": 200, "message": "Successfully got mileage", "json": document});
        } else {
            next(new Error('Failed to get mileage because ids not provided'));
        }
    } catch(err) {
        next(err);
    }
});

router.put('/:vehicleId/mileage', async function (req, res, next) {

    try {
        if (req.params.vehicleId) {
            let document = await vehicleMileages.saveMileage(req.params.vehicleId, req.body);
            res.status(200).json({"status": 200, "message": "Successfully saved mileage", "json": document});
        } else {
            next(new Error('Failed to save mileage because vehicleId not provided'));
        }
    } catch(err) {
        next(err);
    }
});

router.delete('/:vehicleId/mileage/:mileageId', async function (req, res, next) {

    try {
        if (req.params.vehicleId && req.params.mileageId) {
            let document = await vehicleMileages.deleteMileage(req.params.vehicleId, req.params.mileageId);
            res.status(200).json({"status": 200, "message": "Successfully got mileage", "json": document});
        } else {
            next(new Error('Failed to delete mileage because ids not provided'));
        }
    } catch(err) {
        next(err);
    }
});

// ServiceRecords
router.post('/:vehicleId/serviceRecord', async function (req, res, next) {

    try {
        let document = await vehicleServiceRecords.newServiceRecord(req.params.vehicleId, req.body);
        res.status(200).json({"status": 200, "message": "Successfully created serviceRecord", "json": document});
    } catch(err) {
        next(err);
    }
});

router.get('/:vehicleId/serviceRecord', async function (req, res, next) {

    try {
        if (req.params.vehicleId) {
            let document = await vehicleServiceRecords.findServiceRecord(req.params.vehicleId);
            res.status(200).json({"status": 200, "message": "Successfully got serviceRecord", "json": document});
        } else {
            next(new Error('Failed to get serviceRecord because vehicleId not provided'));
        }
    } catch(err) {
        next(err);
    }
});

router.get('/:vehicleId/serviceRecord/:serviceRecordId', async function (req, res, next) {

    try {
        if (req.params.vehicleId && req.params.serviceRecordId) {
            let document = await vehicleServiceRecords.getServiceRecord(req.params.vehicleId, req.params.serviceRecordId);
            res.status(200).json({"status": 200, "message": "Successfully got serviceRecord", "json": document});
        } else {
            next(new Error('Failed to get serviceRecord because ids not provided'));
        }
    } catch(err) {
        next(err);
    }
});

router.put('/:vehicleId/serviceRecord', async function (req, res, next) {

    try {
        if (req.params.vehicleId) {
            let document = await vehicleServiceRecords.saveServiceRecord(req.params.vehicleId, req.body);
            res.status(200).json({"status": 200, "message": "Successfully saved serviceRecord", "json": document});
        } else {
            next(new Error('Failed to save serviceRecord because vehicleId not provided'));
        }
    } catch(err) {
        next(err);
    }
});

router.delete('/:vehicleId/serviceRecord/:serviceRecordId', async function (req, res, next) {

    try {
        if (req.params.vehicleId && req.params.serviceRecordId) {
            let document = await vehicleServiceRecords.deleteServiceRecord(req.params.vehicleId, req.params.serviceRecordId);
            res.status(200).json({"status": 200, "message": "Successfully got serviceRecord", "json": document});
        } else {
            next(new Error('Failed to delete serviceRecord because ids not provided'));
        }
    } catch(err) {
        next(err);
    }
});

// Reminders
router.post('/:vehicleId/reminder', async function (req, res, next) {

    try {
        let document = await vehicleReminders.newReminder(req.params.vehicleId, req.body);
        res.status(200).json({"status": 200, "message": "Successfully created reminder", "json": document});
    } catch(err) {
        next(err);
    }
});

router.get('/:vehicleId/reminder', async function (req, res, next) {

    try {
        if (req.params.vehicleId) {
            let document = await vehicleReminders.findReminder(req.params.vehicleId);
            res.status(200).json({"status": 200, "message": "Successfully got reminder", "json": document});
        } else {
            next(new Error('Failed to get reminder because vehicleId not provided'));
        }
    } catch(err) {
        next(err);
    }
});

router.get('/:vehicleId/reminder/:reminderId', async function (req, res, next) {

    try {
        if (req.params.vehicleId && req.params.reminderId) {
            let document = await vehicleReminders.getReminder(req.params.vehicleId, req.params.reminderId);
            res.status(200).json({"status": 200, "message": "Successfully got reminder", "json": document});
        } else {
            next(new Error('Failed to get reminder because ids not provided'));
        }
    } catch(err) {
        next(err);
    }
});

router.put('/:vehicleId/reminder', async function (req, res, next) {

    try {
        if (req.params.vehicleId) {
            let document = await vehicleReminders.saveReminder(req.params.vehicleId, req.body);
            res.status(200).json({"status": 200, "message": "Successfully saved reminder", "json": document});
        } else {
            next(new Error('Failed to save reminder because vehicleId not provided'));
        }
    } catch(err) {
        next(err);
    }
});

router.delete('/:vehicleId/reminder/:reminderId', async function (req, res, next) {

    try {
        if (req.params.vehicleId && req.params.reminderId) {
            let document = await vehicleReminders.deleteReminder(req.params.vehicleId, req.params.reminderId);
            res.status(200).json({"status": 200, "message": "Successfully got reminder", "json": document});
        } else {
            next(new Error('Failed to delete reminder because ids not provided'));
        }
    } catch(err) {
        next(err);
    }
});

module.exports = router;