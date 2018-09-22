var pdfFiller = require('pdffiller')
var pdfStream = require('pdffiller-stream')
var nconf = require('nconf')
var fs = require('fs')
const path = require('path')
const uuidv4 = require('uuid/v4')
const moment = require('moment-timezone')
var AWS = require('aws-sdk')
var _ = require('underscore')
var s3 = new AWS.S3();
const { spawn } = require('child_process');

// Then load configuration from a designated file.
nconf.file({ file: 'config.json' });

// Provide default values for settings not provided above.
nconf.defaults({
    'sourcepdf': "C:/Dev/PDF_testing/AOV_CO_form_test.pdf",
    'destpdf': "C:/Dev/PDF_testing/",
    'printer': "Brother HL-L2300D series",
    'scanner': "",
    'timezone': "America/Chicago",
    'datestring': "MM-DD-YYYY-h-mm-a"
});

var sourcePDF = "C:/Dev/PDF_testing/AOV_CO_form_test.pdf";
var destinationPDF =  "C:/Dev/PDF_testing/";
var id = uuidv4();

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
    var filename = 'COscan-' + prettyDate() + '.jpg'
    var scan_params_inline = "OutFile: " + filename + " Proc: DocScan Version: 1 Init: ADF 0 AF 0 AS 0 GRAY DPI 200 OutFmt: 100"
    var scanjob = spawn('cmdtwain', ['-q', filename]);
    //var scanjob = spawn('cmdtwain', ['-q', '-f', 'scanparams.txt']);
    scanjob.on('exit', function (code, signal) {
        fs.readFile(filename, function(err,data){
            if(err) {throw err;}
            var base64data = new Buffer(data, 'binary')
            uploadScan(filename, base64data, function(msg, err){
                callback(msg)
            })
        })
    });
}

function uploadScan(key, _file, cb){
    var params = {
        Bucket: 'shallows', 
        Key: 'scans/' + key, 
        Body: _file, 
        ACL: 'public-read',
        ContentType: 'jpeg'
    }
    s3.putObject(params, function(err){
        if(!err) {
            cb('Scanned and Uploaded ' + key, null)
        }
        else{
            console.log(err.stack)
            cb("Failed to put item in bucket. " + err.stack)
        } 
    });
}

function printDocument(docname, callback){
    var pathtodoc = path.resolve(__dirname, docname)
    var printjob = spawn('PDFtoPrinter', [pathtodoc, nconf.get('printer')]);
    printjob.on('exit', function(code, signal){
        callback('Printing complete.')
    })
}

//PDFkit implementation here for non-form pdfs
function generatePDF(){
    pdfutility.chromeGeneratePDF(nconf.get('destpdf') + key, _input, function(err){
        if (err) throw err;
        cb(nconf.get('destpdf') + key, _input.SNtop);
    })
}

//TODO catch the ioerror the fillform throws from time to time
function fillPDF(_input = data, key, cb){
    pdfFiller.fillForm( nconf.get('sourcepdf'), nconf.get('destpdf') + key, _input, function(err) {
        if (err) throw err;
        cb(nconf.get('destpdf') + key, _input.SNtop);
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

//TODO verify serial number arrival
function formatData(input){
    var output = {
        "Title": "Change Order",
        "LeftSN": "SN " + input.SN + " ID:" + input.id,
        "ID": input.id,
        "COsteps" : makeEnglishSteps(JSON.parse(input.moves)),
        "Top": "Change Order Directive",
        "OverallInstructions": "If you'd like to perform this Change Order, follow the steps below. Bring this sheet with you. You'll be moving objects in the grid in front of you from position to position. If for any reason you are unable to move one of the objects in this instruction set, you are encouraged to ask for assistance from other gallery visitors or staff.",
        "Disclaimer": "If you need to move an object to a position within the grid which is already occupied, you may choose between moving the existing object to the position which originally contained the object you are carrying, effectively swapping the two. Alternately, if the object you are carrying can be placed alongside the existing object, they can be left together.",
        "LeftDate" : prettyDate(),
        "SigLabel" : "Performer Signature",
        "SigningInstructions" : "In the large box below, please make a unique identifying mark using the pen on the kiosk you retrieved this sheet from. It can be your initials, a drawing, or a simpler mark. Thank You!",
        "ComposedBy": "Order Composed By: " + input.author
    }
    _.each(JSON.parse(input.moves), function(step){
        output[step.to.toUpperCase()] = "✔"
    })
    return output;
}

function prettyDate(){
    return moment().tz(nconf.get('timezone')).format(nconf.get('datestring'));
}

function makeEnglishSteps(input){
    var output = ""
    var stepno = 1
    _.each(input, function(step) {
        var this_step = stepno + ":Locate the " + step.itemname + ". Carefully pick it up, and move it to space " + step.to + "." + step.special + "\n"
        output += this_step
        stepno++
    })
    return output;
}

function makeSpanishSteps(input){
    var output = ""
    var stepno = 1
    _.each(input, function(step) {
        var this_step = stepno + ": Mueva al " + step.itemname + " desde espacio " + step.from + " hasta espacio " + step.to + "\n"
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