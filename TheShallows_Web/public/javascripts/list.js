var data = {
	active: set_time,
	google : {families: ['Cardo:italic', 'Roboto:300,100', 'Cutive Mono', 'Work Sans:100,300,500', 'Montserrat:300,500']}
};

//var _host = 'http://ec2-52-205-31-232.compute-1.amazonaws.com:3000'
var _host = ''
var _latestid = 0;
WebFont.load(data);
//Dev: dust compilation
var _co_template = $('#co-template').html();
var cocompiled = dust.compile(_co_template, 'CH_ORD');

function set_time(){
	var time = moment().format();
	$("#time").html(time);
}

//user has scrolled down to the bottom. get change orders from the past and populate.
function get_before_oldest(){

}

function refresh_content(){
	do_get(_host + '/upload/latestdelta', function(data){
		if(data.id == _latestid) return;
		else {
			$('#list_host').empty();
			$('#overlay').empty();
			getProjectData(data_location);
		}
   })
}
var stale = true;
var current_focus = ''
var center = null
var recent_refresh = false;
var refresh_debouncer;
function set_focus(){
	var locs = [];
	var isAtTop = ($(window).scrollTop() == 0) ? true : false;
	var isAtBottom = ($(window).scrollTop() >= $(document).height() - window.innerHeight) ? true : false;
	if(isAtTop){
		//trigger refresh of latest item/
		//TODO: retrieve latest endpoint should support a max item age parameter
		if(!recent_refresh){
			console.log('At top, refreshing...')
			recent_refresh = true;
			refresh_content();
		}
		if(!refresh_debouncer){
			window.setTimeout(function(){
				console.log('Clearing timeout')
				recent_refresh = false;
				refresh_debouncer = null;
			}, 2000)
		}
	}
	if(isAtBottom){
		//TODO: retrieve items from the past? what's the workflow here?
		return;
	}
	view_data.forEach(function(id){
		var location = $('#'+id).offset().top - $(window).scrollTop();
		locs.push({'id':id,'loc':location});
	});

	var h = (Math.max(document.documentElement.clientHeight, window.innerHeight || 0)/2)-100;
	center = closest(locs,h);
	if(current_focus != '#'+center['id']){
		close_all();
		$('#'+center['id']).addClass('highlighted');
		$('#overlay').html($('#'+center['id']).html())
		if(stale){
			adjustTileSize();
			updateGridUnit();
			stale = false;
		}
		var centerdata = datamain.find(matchesID, center['id'])
		if(centerdata){
			repaintMoves(centerdata);
			current_focus = '#'+center['id']
		}

	}
}

var hasunitsize = false;
function adjustTileSize(){
    var cols = (100-(datamain.board[0]*2))/(datamain.board[0]); //leaving 1% for margins
	var colwidth = cols+'%';
	if(!hasunitsize) updateGridUnit(); //rem unit for this 85px guy?
	$('<style>.tile { width:'+colwidth+' !important; height: '+85+'px;  }</style>').appendTo('head'); 
}

function repaintMoves(packet){
	$('.vector').detach();
	var temp = "";
	packet.moves.forEach(function(move){
		var _startpt = translateUnit(move.from)
		var _endpt = translateUnit(move.to)
		var _svg = '<svg class="vector" style="margin-top: -'+grid_unit.h/2+'px; '+'margin-left: -'+grid_unit.w/2+'px; '+'" id="from_'
		_svg += reverseString(move.alphabetized[0])
		_svg += '_to_'
		_svg += reverseString(move.alphabetized[1])
		_svg += '_'+packet.id+'"><line stroke-linecap="round" y1="'
		_svg += _startpt[0]
		_svg += '" x1="'
		_svg += _startpt[1]
		_svg += '" y2="'
		_svg += _endpt[0]
		_svg += '" x2="'+_endpt[1]
		_svg += '" stroke="'
		_svg += packet.idcolor+'"></line></svg>'
		var _marker = '<div class="marker" style="top:'+_endpt[0]+'px; left:'+_endpt[1]+'px;background:'+packet.idcolor+'; margin-top: -'+(14+grid_unit.h)/2+'px; '+'margin-left: -'+(14+grid_unit.w)/2+'px; "></div>'
		_svg += _marker;
		temp += _svg
	})
	$('#overlay .gridhost').append(temp);
	$('#overlay').css({filter: 'none'})

}

var grid_unit = {'h':0, 'w':0};
function updateGridUnit(){
	hasunitsize = true;
	grid_unit.h = $('#overlay #1a').outerHeight(true);
	grid_unit.w = $('#overlay #1a').outerWidth(true);
}

function translateUnit(coords, xpad = false, ypad = false){
	var xpadding = (xpad) ? grid_unit.w*0.5 : 0;
	return [serialized_letter(coords[0])*grid_unit.h + xpadding,coords[1]*grid_unit.w]
}

function centerpoint(element){
	var offset = element.offset();
	var width = element.width();
	var height = element.height();

	var centerX = (element.position().left + 6.5) + width / 2;
	var centerY = (element.position().top + 6.5) + height / 2;
	return [centerX, centerY]
}

function reverseString(str) {
    return str.split("").reverse().join("");
}

function matchesID(element) {
	return element.id == center.id;
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

var data_location = _host + '/upload/recent';
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
			datamain.forEach(function(element) {
				displayAll(element, '#list_host', 'CH_ORD', function(){
				});
			});
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
		},
		error: function(data){
			alert("problem");
		}
	});
	return result;
}

function clean_and_supplement(data){
	_newdata = []
	_latestid = data[0].id;
	data.forEach(function(_element) {
		//_element = JSON.parse(element)
		_element['alpha_board'] = letter_of_alphabet(_element['board'][1], true);
		var moves = _element['moves'];
		if(moves.length > 0){
			moves.forEach(function(_move){
				_move["alphabetized"] = [];
				_move["alphabetized"][0] = _move.from;
				_move["alphabetized"][1] = _move.to;
			});
		}
		_newdata.push(_element)
	});
	_newdata.board = data[0].board;
	return _newdata;
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

function serialized_letter(letter){
	var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
	if(alphabet.indexOf(letter) != -1){
		return alphabet.indexOf(letter)+1;
	}
}

function displayAll(_data, _target, _template = 'CH_ORD', _cb = null){
	dust.render(_template, _data, function(err, out) {
        $(_target).append(out);
		if(_cb )_cb();
	});
}

function showSuccessOverlay(){
	
}

$(function(){	
	$('#await').hide();
	$("body").niceScroll({
		scrollspeed: 1,
		mousescrollstep: 2
	});
	$(document).on("keypress", function (e) {
		// use e.which
		if(e.originalEvent.which == 107){
			location.reload();
		}
	});
	$( window ).resize(function() {
		setOalls();
		updateGridUnit();
		stale = true;
	});

	$(document).on('scroll', function() {
		set_focus();
	});

	$(document).on('click', '.change-order', function(){

	});
	
	adjustTileSize();
	updateGridUnit();
});

getProjectData(data_location);

