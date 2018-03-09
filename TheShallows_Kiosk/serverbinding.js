const fetch = require("node-fetch");

const url = "http://ec2-54-174-44-232.compute-1.amazonaws.com:3000/"

function getLatest(){
    fetch(url + "/retrieve?latest=true")
    .then(response => {
        response.json().then(json => {
            return json.results[0]
        //  console.log(
        //      `co_id: ${json.results[0].id} -`
        //  );
        });
    })
    .catch(error => {
        console.log(error);
    });
}

module.exports.getLatest = getLatest