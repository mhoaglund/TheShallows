var data = {
	active: set_time,
	google : {families: ['Cardo:italic', 'Roboto:300,100', 'Cutive Mono', 'Work Sans:100,300,500', 'Montserrat:300,500']}
};

WebFont.load(data);
//Dev: dust compilation
var _co_template = $('#co-template').html();
var cocompiled = dust.compile(_co_template, 'CH_ORD');

function set_time(){
	var time = moment().format();
	$("#time").html(time);
}

dust.loadSource(cocompiled);
dust.helpers.loop = function(chunk, context, bodies, params) {
	var from = parseInt(dust.helpers.tap(params.from, chunk, context), 10) || 1,
		  to = parseInt(dust.helpers.tap(params.to, chunk, context), 10) || 1,
		  len = Math.abs(to - from) + 1,
		  increment = (to - from) / (len - 1) || 1;
  
	while(from !== to) {
		chunk = bodies.block(chunk, context.push(from, from, len));
		from += increment;
	}
  
	return chunk.render(bodies.block, context.push(from, from, len));
}

function close_all(){
	$('.change-order').addClass('closed');
	$('.change-order').removeClass('drowsy');
	$('.vector').removeClass('animate');
}

function expand(element){
	close_all();
	if(element.hasClass('closed')){
		element.removeClass('closed');
		element.find('.tile, .vector, .marker').addClass('animate');
	}
	element.prev(".change-order").addClass('drowsy');
	element.prev(".change-order").removeClass('closed');
	element.next(".change-order").addClass('drowsy');
	element.next(".change-order").removeClass('closed');
}

var oallht, oallwth, oallctr;
var useOverlay = true;
var lightnessmod = 1.2;
var datamain = {};

function setOalls(){
	 oallht = $(window).height();
	 oallwth = $(window).width(); 
	 oallctr = {x: (oallwth/2), y: (oallht/2) };
}

var data_location = 'https://s3.amazonaws.com/shallows/order1.json';
function getProjectData(myUrl){
	var result = null;
	$.ajax( { url: myUrl, 
		type: 'GET', 
		dataType: 'json',
        crossDomain: true,
		contentType: 'application/json',
		async: true,
		cache: false,
		data: '',
		success: function(data) { 
			datamain = clean_and_supplement(data);
			displayAll(datamain, '#list_host', 'CH_ORD', function(){
				console.log("done");
			});
		},
		error: function(data){
			alert("problem");
		}
	});
	return result;
}

function clean_and_supplement(data){
	data['alpha_board'] = letter_of_alphabet(data['board'][0], true);

	data['results'].forEach(function(element) {
		var moves = element['order']['moves'];
		if(moves.length > 0){
			moves.forEach(function(_move){
				_move["alphabetized"] = [];
				_move["alphabetized"][0] = letter_of_alphabet(_move.from[0]-1, false) + _move.from[1].toString();
				_move["alphabetized"][1] = letter_of_alphabet(_move.to[0]-1, false) + _move.to[1].toString();
			});
		}
	});
	return data;
}

function letter_of_alphabet(num, shouldSlice){
	var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
	if(shouldSlice){
		if(num.constructor === Array){
			num = num.length;
		}
		return alphabet.slice(0, num);
	}
	else{
		return alphabet[num];
	}
}

function displayAll(_data, _target, _template = 'CH_ORD', _cb = null){
	dust.render(_template, _data, function(err, out) {
        $(_target).html(out);
		if(_cb )_cb();
	});
}


$(function(){	
	$( window ).resize(function() {
		setOalls();
	});

	$(document).on('scroll', function() {
		set_time();
	});

	$(document).on('click', '.change-order', function(){
		expand($(this));
	});

	$('.change-order').on('appear', function(event, ){

	});
});

getProjectData(data_location);

