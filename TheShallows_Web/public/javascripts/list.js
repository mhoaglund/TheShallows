var data = {
	google : {families: ['Cardo:italic', 'Roboto:300,100', 'Cutive Mono', 'Work Sans:100,300,500', 'Montserrat:300,500']}
};

WebFont.load(data);
//Dev: dust compilation
var _co_template = $('#co-template').html();
var cocompiled = dust.compile(_co_template, 'CH_ORD');

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

$( window ).resize(function() {
    setOalls();
});

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
			datamain = data;
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

function displayAll(_data, _target, _template = 'CH_ORD', _cb = null){
	dust.render(_template, _data, function(err, out) {
        $(_target).html(out);
		if(_cb )_cb();
	});
}

getProjectData(data_location);
