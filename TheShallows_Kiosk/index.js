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
var idtoprint = {
    type: 'input',
    name: 'printid',
    message: 'Enter a Change Order id to reprint. The ID can be found in the bottom left corner of the page.'
}
var base_q = {
    type: 'list',
    name: 'base',
    message: "What needs to be done?",
    choices: [
        'Scan a Change Order',
        'Reprint a Change Order',
        'Reset the System'
    ]
  }

  //TODO: regular polling of server endpoint to check for new change orders. Automated printing of new arrivals.
function pollForNew(){
    serverbinding.getLatest(function(newest){
        if(!newest) return;
        newest.id = newest.id.split('_')[1]
        var matched = _.find(printed, function(_id){
            return _id == newest.id
        })
        if(!matched){
            var _key = newest.id + '.pdf'
            var docinput = docs.formatData(newest)
            docs.fillPDF(docinput, _key, function(destinationfile){
                docs.printDocument(destinationfile, function(){
                    printed.push(newest.id)
                    console.log('####')
                    promptBaseAction();
                })
            })
        }
    })
}
//pollForNew();
//setInterval(pollForNew, 10*1000);

function promptBaseAction(){
    inquirer.prompt([base_q]).then(answers => {
        if(answers.base == 'Scan a Change Order'){
            docs.scanDocument(function(msg){
                console.log(msg)
                console.log('####')
                promptBaseAction();
            });
        }
        if(answers.base == 'Reprint a Change Order'){
            promptforID();
        }
        console.log(answers)
    })
}

function promptforID(){
    inquirer.prompt([idtoprint]).then(answers => {
        console.log('Reprinting Change Order ID# ', answers)
        docs.printDocument(answers.base + '.pdf', function(){
            console.log('####')
            promptBaseAction();
        })
    })
}

docs.scanDocument(function(msg){
    console.log(msg)
    console.log('####')
    promptBaseAction();
});
//promptBaseAction();