function do_post(url, payload, callback){
    $.ajax({
        method: "POST",
        url: url,
        data: payload
    })
    .done(function( data ) {
        console.log(data);
        callback(data)
    });
}

function do_get(url, callback){
    $.ajax({
        method: "GET",
        url: url,
    })
    .done(function( data ) {
        console.log(data);
        callback(data)
    });
}

function do_get_until(url, iterations, callback){
    //do gets in order until iterations are exhausted
    //check if iterations is an int or an array
}


module.exports.do_post = do_post
module.exports.do_get = do_get
module.exports.do_get_until = do_get_until