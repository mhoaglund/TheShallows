var data = {
	active: set_time,
	google : {families: ['Cardo:italic', 'Roboto:300,100', 'Cutive Mono', 'Work Sans:100,300,500', 'Montserrat:300,500']}
};

WebFont.load(data);
//Dev: dust compilation
var _gi_template = $('#gi-template').html();
var gicompiled = dust.compile(_gi_template, 'GI_ORD');

function set_time(){
	var time = moment().format();
	$("#time").html(time);
}

dust.loadSource(gicompiled);
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
	$('.glossary-item').addClass('closed');
}

function expand(element){
	close_all();
	if(element.hasClass('closed')){
		element.removeClass('closed');
	}
}

var oallht;
var oallwth;
var oallctr;
var useOverlay = true;
var lightnessmod = 1.2;
var datamain = {};

function setOalls(){
	 oallht = $(window).height();
	 oallwth = $(window).width(); 
	 oallctr = {x: (oallwth/2), y: (oallht/2) };
}

var data_location = 'https://s3.amazonaws.com/shallows/glossary1.json';
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
			datamain = data;
			displayAll(datamain, '#list_host', 'GI_ORD', function(){
				console.log("done");
			});
		},
		error: function(data){
			alert("problem");
			console.log(data);
		}
	});
	return result;
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
});

getProjectData(data_location);

