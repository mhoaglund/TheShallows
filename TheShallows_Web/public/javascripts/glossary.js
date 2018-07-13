var data = {
	active: set_time,
	google : {families: ['Cardo:italic', 'Roboto:300,100', 'Cutive Mono', 'Work Sans:100,300,500', 'Montserrat:300,500']}
};

WebFont.load(data);
//Dev: dust compilation
var _co_template = $('#gi-template').html();
var cocompiled = dust.compile(_co_template, 'GL_ITEM');

var _host = 'http://ec2-54-174-44-232.compute-1.amazonaws.com:3000'
//var _host = ''
//var _host = 'http://localhost:3000'

function set_time(){
	var time = moment().format();
	$("#time").html(time);
}

//user has scrolled down to the bottom. get change orders from the past and populate.
function get_before_oldest(){

}

//user has scrolled to the top, get newer change orders if there are any.
function check_and_get_newest(){
	//GET etc
	//add
	$('html, body').animate({scrollTop: '0px'}, 300);
}

var current_focus = ''
function set_focus(){
	var locs = [];
	var isAtTop = ($(window).scrollTop() == 0) ? true : false;
	var isAtBottom = ($(window).scrollTop() >= $(document).height() - window.innerHeight) ? true : false;
	if(isAtTop){
		return;
	}
	if(isAtBottom){
		return;
	}
	view_data.forEach(function(id){
		var location = $('#'+id).offset().top - $(window).scrollTop();
		locs.push({'id':id,'loc':location});
	});

	var h = (Math.max(document.documentElement.clientHeight, window.innerHeight || 0)/2)-100;
	var center = closest(locs,h);
	if(current_focus != '#'+center['id']){
		close_all();
		$('#'+center['id']).addClass('highlighted');
	    $('#overlay').html($('#'+center['id']).html())
	    current_focus = '#'+center['id']
	}
}

function closest(array,num){
    var i=0;
    var minDiff=1000;
    var ans;
    for(i in array){
         var m=Math.abs(num-array[i]['loc']);
         if(m<minDiff){ 
                minDiff=m; 
                ans=array[i]; 
            }
      }
    return ans;
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
	$('.glossary-item').removeClass('drowsy');
	$('.glossary-item').removeClass('highlighted');
}

var oallht, oallwth, oallctr;
var useOverlay = true;
var lightnessmod = 1.2;
var datamain = {};
var view_data = [];

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
			datamain = clean_and_supplement(data);
			displayAll(datamain, '#list_host', 'GL_ITEM', function(){
				console.log("done");
				$('.change-order').each(function(){
					var waypoints = new Waypoint.Inview({
						element: this,
						entered: function(direction) {
							if(view_data.indexOf(this.element.id) == -1){
								view_data.push(this.element.id);
							} 
						},
						exited: function(direction) {
							view_data = view_data.filter(val => val !== this.element.id);
						}
					});
				});
				
			});
		},
		error: function(data){
			alert("problem");
		}
	});
	return result;
}

function clean_and_supplement(data){
	//TODO what do we need to do to clean up glossary data?
	return data;
}

function displayAll(_data, _target, _template = 'GL_ITEM', _cb = null){
	dust.render(_template, _data, function(err, out) {
        $(_target).html(out);
		if(_cb )_cb();
	});
}


$(function(){	
	$("body").niceScroll({
		scrollspeed: 5,
		mousescrollstep: 5
	});
	$( window ).resize(function() {
		setOalls();
	});

	$(document).on('scroll', function() {
		set_time();
		set_focus();
	});

	if(document.body.requestFullscreen){
		document.body.requestFullscreen();
	}
});

getProjectData(data_location);

