'use strict';
const puppeteer = require('puppeteer');
//TODO deprecate this sample data
let output = {
    "Title": "Change Order",
    "LeftSN": "SN 000000 ID: 00000",
    "ID": "12345",
    "COsteps" : "Steps Here!",
    "Top": "Change Order Directive",
    "OverallInstructions": "If you'd like to perform this Change Order, follow the steps below. Bring this sheet with you. You'll be moving objects in the grid in front of you from position to position. If for any reason you are unable to move one of the objects in this instruction set, you are encouraged to ask for assistance from other gallery visitors or staff.",
    "Disclaimer": "If you need to move an object to a position within the grid which is already occupied, you may choose between moving the existing object to the position which originally contained the object you are carrying, effectively swapping the two. Alternately, if the object you are carrying can be placed alongside the existing object, they can be left together.",
    "LeftDate" : "9/21/2018",
    "SigLabel" : "Performer Signature",
    "SigningInstructions" : "In the large box below, please make a unique identifying mark using the pen on the kiosk you retrieved this sheet from. It can be your initials, a drawing, or a simpler mark. Thank You!",
    "ComposedBy": "Order Composed By: Nobody"
};
let instance = null;

function toparams(_input){
    return Object.keys(_input).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(_input[key]);
    }).join('&');
}

const getBrowserInstance = async function() {
    if (!instance)
        instance = await puppeteer.launch();
    return instance;
  }

//TODO: optimize the launch and close calls

function chromeGeneratePDF(filename, _input, cb){
    (async() => {
        try{
            console.log(toparams(_input));
            const browser = await getBrowserInstance();
            const page = await browser.newPage();
            await page.goto('http://ec2-52-205-31-232.compute-1.amazonaws.com:3000/formfill.html?'+toparams(_input), {waitUntil: 'networkidle2', timeout: 0});
            await page.pdf({
              path: _input.ID + '.pdf',
              format: 'letter'
            });
            await browser.close(); //TODO optimize the close routine
            cb(null);
        }
        catch(err){
            cb(err)
        }
      })();
}

/**
 * Close currently-running chrome instance.
 */
function cleanUp(){
    (async() =>{
        const browser = await getBrowserInstance();
        await browser.close();
    })();
}

//chromeGeneratePDF("filename", output, function(droppedfile, sn){var self = this;});
module.exports.chromeGeneratePDF = chromeGeneratePDF
module.exports.cleanUp = cleanUp
