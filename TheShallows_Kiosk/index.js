var pdfFiller = require('pdffiller');
const path = require('path')
const uuidv4 = require('uuid/v4');
const { spawn } = require('child_process');
const program = require('commander');
var inquirer = require('inquirer');
var docs = require('./docmanager.js')

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

promptBaseAction();