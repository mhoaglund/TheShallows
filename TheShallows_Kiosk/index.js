const path = require('path');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const { spawn } = require('child_process');
const program = require('commander');
var inquirer = require('inquirer');
var _ = require('underscore');
var docs = require('./docmanager.js')
var serverbinding = require('./serverbinding.js')
var appDir = path.dirname(require.main.filename);

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

  isPrinterConnected = true; //TODO actual check
  var subsystem_busy = false;
  //TODO: regular polling of server endpoint to check for new change orders. Automated printing of new arrivals.
function pollForNew(){
    if(subsystem_busy) return;
    serverbinding.getLatest(function(newest){
        if(!newest) return;
        newest.ID = newest.ID.split('_')[1]
        var matched = _.find(printed.records, function(_doc){
            return _doc.ID == newest.ID
        })
        if(!matched){
            subsystem_busy = true;
            var _key = newest.ID + '.pdf'
            var docinput = newest
            docs.generatePDF(docinput, _key, function(destinationfile, serialno){
                 if(isPrinterConnected){
                    docs.printDocument(destinationfile, function(){
                        subsystem_busy = false;
                        var _record = {"key":destinationfile, "ID":newest.ID}; 
                        printed.records.push(_record)
                        managePrintedCache(_record)
                    })
                }
            })
        }
    })
}

function managePrintedCache(toAdd = null){
    var printedcache = JSON.parse(fs.readFileSync(appDir + '/printed.json', 'utf8'));
    if(toAdd){
        printedcache.records.push(toAdd);
    }
    else{
        printed = printedcache;
        return;
    }
    var _string = JSON.stringify(printedcache);
    fs.writeFile(appDir + '/printed.json', _string, 'utf8',function(){});
}

setInterval(pollForNew, 7*1000);
managePrintedCache();

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