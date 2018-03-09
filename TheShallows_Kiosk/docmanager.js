var pdfFiller = require('pdffiller');
var pdfStream = require('pdffiller-stream')
const path = require('path')
const uuidv4 = require('uuid/v4')
const moment = require('moment')
var AWS = require('aws-sdk')
var _ = require('underscore')
var s3 = new AWS.S3();
const { spawn } = require('child_process');

var sourcePDF = "C:/Dev/PDF_testing/AOV_CO_form_test.pdf";
var destinationPDF =  "C:/Dev/PDF_testing/";
var id = uuidv4();
//test data
var data = {
    "UIDtop": id,
    "UIDbtm": id,
    "EngSteps" : "English Steps here! Test new info blah blah. Test lorem ipsum. Spanish Steps here! Please fill out the box below with your name or another identifier.  Spanish Steps here! Please fill out the box below with your name or another identifier.  Spanish Steps here! Please fill out the box below with your name or another identifier. ",
    "SpSteps" : "Spanish Steps here! Please fill out the box below with your name or another identifier. Please fill out the box below with your name or another identifier. Please fill out the box below with your name or another identifier. Please fill out the box below with your name or another identifier.",
    "DateTop" : "Feb 19, 2018 8:37 PM",
    "DateBottom" : "Feb 19, 2018 8:37 PM",
    "IdentifierEntry" : "Please fill out the box below with your name or another identifier."
};

//TODO: unique scan naming and upload to s3.
function scanDocument(callback){
    //TODO: try to pass in params string instead so we can easily control
    var filename = 'COscan' + moment().tz('America/Chicago').format('MM/DD/YYYY h:mm a')
    var scanjob = spawn('cmdtwain', ['-q', '-f', 'scanparams.txt']);
    scanjob.on('exit', function (code, signal) {
        //TODO: adjust message based on child proc's output signal
        // console.log('child process exited with ' +
        //             `code ${code} and signal ${signal}`);
        callback('Scan Complete. File name: ' + filename)
    });
}

function uploadScan(key){
    var _file = null //TODO get file that was scanned, or pass in buffer?
    var params = {
        Bucket: 'shallows', 
        Key: key, 
        Body: _file, 
        ACL: 'public-read',
        ContentType: 'jpeg'
    }
    s3.putObject(params, function(err){
        if(!err) {
            cb("Successfully added item to bucket.")
        }
        else{
            console.log(err.stack)
            cb("Failed to put item in bucket. " + err.stack)
        } 
    });
}

//TODO: pass in doc name, printer name in env variable or config.json
function printDocument(docname, callback){
    var pathtodoc = path.resolve(__dirname, docname)
    var printjob = spawn('PDFtoPrinter', [pathtodoc, "Brother HL-L2300D series"]);
    printjob.on('exit', function(code, signal){
        callback('Printing complete.')
    })
}

function fillPDF(_input = data, key, cb){
    pdfFiller.fillForm( sourcePDF, destinationPDF + key, _input, function(err) {
        if (err) throw err;
        console.log("In callback (we're done).");
        cb(destinationPDF + key);
    });
}

function streamFilledPDF(_input = data, key){
    pdfFiller.fillForm( sourcePDF, data)
    .then((outputStream) => {
        // use the outputStream here; 
        // will be instance of stream.Readable 
    }).catch((err) => {
        console.log(err);
    });
}

function formatData(input){
    var output = {
        "UIDtop": input.id,
        "UIDbtm": input.id,
        "EngSteps" : makeEnglishSteps(JSON.parse(input.moves)),
        "SpSteps" : makeEnglishSteps(JSON.parse(input.moves)),
        "DateTop" : input.timestamp,
        "DateBottom" : input.timestamp,
        "IdentifierEntry" : "Please fill out the box below with your name or another identifier."
    }
    return output;
}

function makeEnglishSteps(input){
    //TODO take in array of steps, narrate them, return string
    var output = ""
    var stepno = 1
    _.each(input, function(step) {
        var this_step = stepno + ": Move the " + step.itemname + " to space " + step.to + "\n"
        output += this_step
        stepno++
    })
    return output;
}

function makeSpanishSteps(input){
    var output = ""
    var stepno = 1
    _.each(input, function(step) {
        var this_step = stepno + ": Mueva al " + step.itemname + " hasta espacio " + step.to + "\n"
        output += this_step
        stepno++
    })
    return output;
}

function toLower(v) {
    return v.toLowerCase();
}

module.exports.printDocument = printDocument
module.exports.scanDocument = scanDocument
module.exports.fillPDF = fillPDF
module.exports.formatData = formatData