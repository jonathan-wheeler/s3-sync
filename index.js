// adapted from http://docs.aws.amazon.com/lambda/latest/dg/with-s3-example-deployment-pkg.html

// dependencies
var async = require('async');
var AWS = require('aws-sdk');

// set environment vars
var DESTINATION_BUCKET = process.env.DESTINATION_BUCKET

// get reference to S3 client
var s3 = new AWS.S3();

exports.handler = function(event, context, callback) {

    if (event.Records == null) {
        context.fail('Error', "Event has no records.");
        return;
    }

    // Process all records in the event asynchronously.
    async.each(event.Records, processRecord, function (err) {
        if (err) {
            context.fail('Error', "One or more objects could not be copied.");
        } else {
            context.succeed();
        }
    });

    console.log("done")
};
function processRecord(record, callback) {
    // Read options from the event.
    var srcBucket = record.s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    var srcKey    =
    decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    var dstBucket = DESTINATION_BUCKET;
    var dstKey    = srcKey;
    // Sanity check: validate that source and destination are different buckets.
    if (srcBucket == dstBucket) {
        callback("Source and destination buckets are the same.");
        return;
    }
    s3.copyObject({
            Bucket: dstBucket,
            CopySource: `${srcBucket}/${srcKey}`,
            Key: dstKey,
        }, function (err) {
            if (err) {
                console.error(
                    'Unable to Copy ' + srcBucket + '/' + srcKey +
                    ' and upload to ' + dstBucket + '/' + dstKey +
                    ' due to an error: ' + err
                );
                callback(err);
            } else {
                console.log(
                    'Successfully copied ' + srcBucket + '/' + srcKey +
                    ' and uploaded to ' + dstBucket + '/' + dstKey
                );
            callback();
            }
    })
}
