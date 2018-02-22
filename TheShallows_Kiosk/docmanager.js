var pdfFiller = require('pdffiller');
const path = require('path')
const uuidv4 = require('uuid/v4');
const { spawn } = require('child_process');

var sourcePDF = "C:/Dev/PDF_testing/AOV_CO_form_test.pdf";
var destinationPDF =  "C:/Dev/PDF_testing/AOV_CO_filled.pdf";
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
    var scanjob = spawn('cmdtwain', ['-q', '-f', 'scanparams.txt']);
    scanjob.on('exit', function (code, signal) {
        //TODO: adjust message based on child proc's output signal
        // console.log('child process exited with ' +
        //             `code ${code} and signal ${signal}`);
        callback('Scan Complete.')
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

function fillPDF(_input = data){
    pdfFiller.fillForm( sourcePDF, destinationPDF, _input, function(err) {
        if (err) throw err;
        console.log("In callback (we're done).");
    });
}

function writeSteps(_input){
    //TODO: string formatting for steps
}

function toLower(v) {
    return v.toLowerCase();
}

module.exports.printDocument = printDocument
module.exports.scanDocument = scanDocument
module.exports.fillPDF = fillPDF