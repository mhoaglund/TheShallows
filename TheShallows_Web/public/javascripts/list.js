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

var current_focus = ''
///Determine offset of all visible orders, apply open, drowsy, closed css classes
function set_focus(){
	var locs = [];
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
	$('.change-order').removeClass('drowsy');
	$('.change-order').removeClass('highlighted');
}

function expand(element){
	close_all();
	if(element.hasClass('closed')){
		element.removeClass('closed');
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
var view_data = [];

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
		set_focus();
	});

	$(document).on('click', '.change-order', function(){
		expand($(this));
	});
});

getProjectData(data_location);

