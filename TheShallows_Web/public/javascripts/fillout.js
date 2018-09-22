var inputs = null
dust.debugLevel = "DEBUG";


$(function(){
    var template = $('#fill-template').html();
    var compiled_template = dust.compile(template, 'ALL');
    dust.loadSource(compiled_template);
    inputs = QueryStringToJSON();
    dust.render('ALL', inputs, function(err, out) {
        $('body').append(out);
	});
});

function QueryStringToJSON() {            
    var pairs = location.search.slice(1).split('&');
    
    var result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });

    return JSON.parse(JSON.stringify(result));
}
//example packet
// var output = {
//     "Title": "Change Order",
//     "LeftSN": "SN " + input.SN + " ID:" + input.id,
//     "ID": input.id,
//     "COsteps" : makeEnglishSteps(JSON.parse(input.moves)),
//     "Top": "Change Order Directive",
//     "OverallInstructions": "If you'd like to perform this Change Order, follow the steps below. Bring this sheet with you. You'll be moving objects in the grid in front of you from position to position. If for any reason you are unable to move one of the objects in this instruction set, you are encouraged to ask for assistance from other gallery visitors or staff.",
//     "Disclaimer": "If you need to move an object to a position within the grid which is already occupied, you may choose between moving the existing object to the position which originally contained the object you are carrying, effectively swapping the two. Alternately, if the object you are carrying can be placed alongside the existing object, they can be left together.",
//     "LeftDate" : prettyDate(),
//     "SigLabel" : "Performer Signature",
//     "SigningInstructions" : "In the large box below, please make a unique identifying mark using the pen on the kiosk you retrieved this sheet from. It can be your initials, a drawing, or a simpler mark. Thank You!",
//     "ComposedBy": "Order Composed By: " + input.author
// }
