const request = require("request");

const url = "http://ec2-54-174-44-232.compute-1.amazonaws.com:3000/"

function getLatest(cb){
    request(url + 'retrieve?latest=true', { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        else cb(body[0])
    });
}

module.exports.getLatest = getLatest