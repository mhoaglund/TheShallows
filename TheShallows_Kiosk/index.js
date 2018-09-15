var pdfFiller = require('pdffiller');
const path = require('path')
const uuidv4 = require('uuid/v4');
const { spawn } = require('child_process');
const program = require('commander');
var inquirer = require('inquirer');
var _ = require('underscore');
var docs = require('./docmanager.js')
var serverbinding = require('./serverbinding.js')

var printed = []

//inquirer terminal interaction scripts
var sntoprint = {
    type: 'input',
    name: 'printid',
    message: 'Enter a Change Order Serial Number to reprint. The Serial Number can be found in the bottom right corner of the page.'
}
var base_q = {
    type: 'list',
    name: 'base',
    message: "What needs to be done?",
    choices: [
        'Scan a Change Order',
        'Reprint a Change Order by Serial #',
        'Reset the System'
    ]
  }

  isPrinterConnected = false; //TODO actual check

  //TODO: regular polling of server endpoint to check for new change orders. Automated printing of new arrivals.
function pollForNew(){
    serverbinding.getLatest(function(newest){
        if(!newest) return;
        newest.id = newest.id.split('_')[1]
        var matched = _.find(printed, function(_doc){
            return _doc.id == newest.id
        })
        if(!matched){
            var _key = newest.id + '.pdf'
            var docinput = docs.formatData(newest)
            docs.fillPDF(docinput, _key, function(destinationfile, serialno){
                if(isPrinterConnected){
                    docs.printDocument(destinationfile, function(){
                        printed.push({"sn":serialno, "key":destinationfile, "id":newest.id})
                    })
                }
            })
        }
    })
}

setInterval(pollForNew, 3*1000);

function promptBaseAction(){
    inquirer.prompt([base_q]).then(answers => {
        if(answers.base == 'Scan a Change Order'){
            docs.scanDocument(function(msg){
                console.log(msg)
                console.log('####')
                promptBaseAction();
            });
        }
        if(answers.base == 'Reprint a Change Order by Serial #'){
            promptforSN();
        }
        console.log(answers)
    })
}

function promptforSN(){
    inquirer.prompt([sntoprint]).then(answers => {
        var doc = serialNumberLookup(answers.base);
        if(doc){
            console.log('Reprinting Change Order SN# ', answers)
            if(isPrinterConnected){
                docs.printDocument(answers.base + '.pdf', function(){
                    console.log('####')
                    promptBaseAction();
                })
            }
        }
        else console.log('Serial Number not found.')
        console.log('####')
        promptBaseAction();
    })
}

//Add server lookup here?
function serialNumberLookup(_sn){
    var match = _.find(printed, function(doc){
        return doc.sn == _sn;
    })
    if(match) return match;
    else return null;
}

promptBaseAction();