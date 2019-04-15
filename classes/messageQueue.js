// MessageQueue class

// Imports
const Environment = require('../classes/Environment');
var AWS = require('aws-sdk');
AWS.config.update({region: Environment.messageQueueRegion});


// Class definition
class MessageQueue {

    constructor() {
        // Instance initialization here

    }

    static start() {
        MessageQueue.queue = new AWS.SQS();
    }

    static send(message, description, delaySeconds) {
        return new Promise(function (resolve, reject) {

            let params = {
                DelaySeconds: delaySeconds,
                MessageAttributes: message,
                MessageBody: description,
                QueueUrl: Environment.messageQueueUrl
            };

            MessageQueue.queue.sendMessage(params, function (err, data) {
                if (err) {
                    console.log("ERROR: Failed to queue message with SQS ", err);
                    reject(err)
                } else {
                    console.log("INFO: Successfully queued message with SQS with id ", data.MessageId);
                    resolve(data.MessageId);
                }
            });
        });
    }

    static receive(queueProperties, maxMessages = 10, messageProperties, timeoutSeconds = 20, waitSeconds = 0) {
        return new Promise(function (resolve, reject) {

            let params = {
                AttributeNames: queueProperties,
                MaxNumberOfMessages: maxMessages,
                MessageAttributeNames: messageProperties,
                QueueUrl: Environment.messageQueueUrl,
                VisibilityTimeout: timeoutSeconds,
                WaitTimeSeconds: waitSeconds
            };

            MessageQueue.queue.receiveMessage(params, function(err, data) {
                if (err) {
                    console.log("ERROR: Failed to received messages from SQS ", err);
                    reject(err);
                } else if (data.Messages) {
                    console.log("INFO: Successfully received messages from SQS ", data.Messages.length);
                    resolve(data.Messages);
                }
            });
        });
    }

    static remove(message) {
        return new Promise(function (resolve, reject) {

            let params = {
                QueueUrl: Environment.messageQueueUrl,
                ReceiptHandle: message.ReceiptHandle
            };
            MessageQueue.queue.deleteMessage(params, function(err, data) {
                if (err) {
                    console.log("ERROR: Failed to delete message from SQS ", err);
                    reject(err);
                } else {
                    console.log("INFO: Successfully deleted message from SQS ", data);
                    resolve(data);
                }
            });
        });
    }
}

// Static properties and export
MessageQueue.queue = false;
module.exports = MessageQueue;