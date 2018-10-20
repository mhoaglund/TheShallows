var _host = 'http://ec2-52-205-31-232.compute-1.amazonaws.com:3000'
//var _host = ''
//Dev: dust compilation
var _obj_template = $('#obj-template').html();
var _detail_template = $('#detail-template').html();
var obj_compiled = dust.compile(_obj_template, 'ARR_OBJ');
var detail_compiled = dust.compile(_detail_template, 'DET_OBJ');
dust.loadSource(obj_compiled);
dust.loadSource(detail_compiled);
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

function getObjectData(myUrl){
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
			displayAll(datamain, '#objecthost', 'ARR_OBJ', function(){
				$('.gridhost').css('max-width', oallht-50);
                adjustTileSize();
				$('.object-main').each(function(){
                    var location = $(this).attr('id').split('_')[0].toLowerCase()
                    //console.log(location);
                    $('#'+location).append($(this))
				});
                $( ".draggable" ).draggable({ 
					revert: true,
					start: function(){
						dragging = $(this)
						clickbuffer = false;
					}
                });
                $('.tile.invisible').droppable({
                    drop: function(event, ui){
						recordMove($(this))
                    }
                })
			});
		}
	});
	return result;
}

function resetLocations(){
	moves_clean = []
	displayAll(datamain, '#objecthost', 'ARR_OBJ', function(){
		$('.gridhost').css('max-width', oallht-50);
		adjustTileSize();
		$('.object-main').each(function(){
			var location = $(this).attr('id').split('_')[0].toLowerCase()
			//console.log(location);
			$('#'+location).append($(this))
		});
		$( ".draggable" ).draggable({ 
			revert: true,
			start: function(){
				dragging = $(this)
				clickbuffer = false;
			}
		});
		$('.tile.invisible').droppable({
			drop: function(event, ui){
				recordMove($(this))
			}
		})
	});
}

var moves = []
var shadowmoves = {}
var moved = {}
function recordMove(dropped_on){
	var item_info = dragging.attr('id').split('_')
	var move = {
		'item': item_info[1],
		'itemname':dragging.find('.object-name').html(),
		'from': item_info[0],
		'to':dropped_on.attr('id')
	}
	move.id = move.item + '_from_' + move.from + '_to_' + move.to;
	dragging.addClass('settled');

	var _mover = $('.overlay #'+move.from).find('.draggable');
	var _movee = $('.overlay #'+move.to).find('.draggable');
	_mover.detach().css({'position':'relative','top':'0px', 'left':'0px'});
	_movee.detach().css({'position':'relative','top':'0px', 'left':'0px'});
	$('.overlay #'+move.from).html(_movee);
	$('.overlay #'+move.to).html(_mover);
	_mover.css('z-index','9999')

	track();
	get_delta(starting_config, newconfig);
	repaintMoves();
}

function replaceTiles(){
	$('.object-main').each(function(){
		$(this).css({
			'top':'0px',
			'left':'0px'
		})
		var location = $(this).attr('id').split('_')[0].toLowerCase()
		$('#'+location).append($(this))
	});
}

function repaintMoves(){
	$('.vector.animate').detach();
	var markup = ""
	moves_clean.forEach(function(move){
		var _startpt = centerpoint($('#' +move.from))
		var _endpt = centerpoint($('#' +move.to))
		var _svg = '<svg class="vector animate" id="'+move.id+'"><line stroke-linecap="round" y1="'+_startpt[1]+'" x1="'+_startpt[0]+'" y2="'+_endpt[1]+'" x2="'+_endpt[0]+'" stroke-dasharray="5,10" stroke="#888"></line></svg>'
		markup += _svg;
	})
	$('#objecthost').append(markup);
	if(moves_clean.length < 1){
		$("#submit-all").removeClass('enabled');
	} else {
		$("#submit-all").addClass('enabled');
	}
}

var starting_config = {}
var newconfig = {}

function track(){
	//TODO assemble a final map of objects so we don't lose any.
	$('.overlay .gridhost .tile').each(function(index, element){
		var stallid = $(this).attr('id');
		var occupant = $(this).find('.object-main');
		if(occupant.length > 0){
			var itemid = occupant.attr('id').split('_')[1]
			newconfig[itemid] = stallid;
		}
	})
}

var moves_clean = []

function get_delta(begin, end){
	moves_clean = []
	for (var property in begin) {
		if (begin.hasOwnProperty(property)) {
			if(begin[property] != end[property]){
				//indicates a move has occurred
				var move = {
					'item': property,
					'from': begin[property],
					'to':end[property] 
				}
				move.id = move.item + '_from_' + move.from + '_to_' + move.to;
				moves_clean.push(move)
			}
		}
	}
}

function centerpoint(element){
	var offset = element.offset();
	var width = element.width();
	var height = element.height();

	var centerX = offset.left + width / 2;
	var centerY = offset.top + height / 2;
	return [centerX, centerY]
}

//TODO redo this with css grid
function adjustTileSize(){
    var cols = (100-(datamain.board[0]*2))/(datamain.board[0]); //leaving 1% for margins
    $('.tile').css('width', 'auto');
    $('.tile').css('width', cols+'%');
    $('.tile').each(function(){
        $(this).css('height', $(this).width()*1.5)
    })
}

function displayAll(_data, _target, _template = 'CH_ORD', _cb = null){
	dust.render(_template, _data, function(err, out) {
        $(_target).html(out);
		if(_cb )_cb();
	});
}

function set_time(){
	var time = moment().format();
	$("#time").html(time);
}

function clean_and_supplement(data){
	data['alpha_board'] = letter_of_alphabet(data['board'][1], true);
	data['objects'].forEach(function(element) {
		element['current'] = element['current'].toLowerCase();
		starting_config[element['id']] = element['current']
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

function reverseString(str) {
    return str.split("").reverse().join("");
}

function raiseDetailPopup(sender, _cb = null){
	var sender_id = sender.attr('id').split('_')[1]
	var valid_object = null;
	if(sender_id){
		datamain['objects'].forEach(function(element) {
			if(element['id'] == sender_id){
				valid_object = element
			}
		});
		if(valid_object){
			dust.render('DET_OBJ', valid_object, function(err, out) {
				$('#detailhost').html(out);
				$('#detailhost').css('pointer-events', 'auto').css('opacity', '1').css('z-index', 9999);
				if(_cb )_cb();
			});
		} else alert('Missing object info.')

	}
}

function raiseNameInputPopup(){
	$('#inputshade').css('pointer-events', 'auto').css('opacity', '1').css('z-index', 9998);
	$('#inputhost').css('pointer-events', 'auto').css('opacity', '1').css('z-index', 9999);
}

function clearInputPopup(){
	$('#inputshade').css('pointer-events', 'none').css('opacity', '0');
	$('#inputhost').css('pointer-events', 'none').css('opacity', '0');
}
var oallht;
var oallwth;
var oallctr;

function setOalls(){
	 oallht = $(window).height();
	 oallwth = $(document).width(); 
	 winht = $(window).height();
	 oallctr = {x: (oallwth/2), y: (oallht/2) };
}

var dragging;
var clickbuffer = false;
var dropzone;
$(function(){
	setText();
	playIntro();
	
    getObjectData(_host + '/upload/latest');
    $( window ).resize(function() {
		adjustTileSize();
		cycleMovementLines(400);
		setOalls();
	});
	$(document.body).on('mousedown', '.object-main', function(e){
		clickbuffer = true;
	})
	$(document.body).on('mouseup', '.object-main', function(e){
		if(clickbuffer){
			raiseDetailPopup($(this));
		}
	})
	$(document.body).on('input', '#authorentry', function(){
		if($('#authorentry').val() != ''){
			ppt_name = $('#authorentry').val()
			$("#refresh-author").removeClass('disabled');
		} else {
			$("#refresh-author").addClass('disabled');
		}
	})
	$(document.body).on('input', '#addendaentry', function(){
		if($('#addendaentry').val() != ''){
			$("#refresh-addenda").removeClass('disabled');
		} else {
			$("#refresh-addenda").addClass('disabled');
		}
	})
	$(document.body).on('click', '.skipbtn', function(e){
		skipIntro();
	})
	$(document.body).on('click', '#refresh-addenda', function(e){
		$('#addendaentry').val('');
		$("#refresh-addenda").addClass('disabled');
	})
	$(document.body).on('click', '#refresh-author', function(e){
		$('#authorentry').val('');
		$("#refresh-author").addClass('disabled');
	})
	$(document.body).on('click', '#refresh-all', function(e){
		resetLocations();
	})
	$(document.body).on('click', '#rerun-instructions .rerun', function(e){
		current_text = 0;
		returnToIntro();
		playIntro();
	})
	//This click may be deprecated.
	$(document.body).on('click', '.beginbtn', function(e){
		if(can_proceed){
			clearIntro();
			storeItem('pptname', ppt_name);
			$(this).css({'animation': 'btnpulse 0.3s'})
		}
	})
	$(document.body).on('click', '.detailpane', function(e){
		clearElement($('#detailhost'), 200, false);
	})
	$(document.body).on('click', '#submit-all.enabled', function(e){
		raiseNameInputPopup();
	})
	$(document.body).on('click', '#submit-final', function(e){
		if(!hassubmitted){
			clearInputPopup();

			var locations = {
				'a1':'',
				'a2':'',
				'a3':'',
				'a4':'',
				'a5':'',
				'b1':'',
				'b2':'',
				'b3':'',
				'b4':'',
				'b5':'',
				'c1':'',
				'c2':'',
				'c3':'',
				'c4':'',
				'c5':'',
				'd1':'',
				'd2':'',
				'd3':'',
				'd4':'',
				'd5':''
			}
			//building an inverted copy for the server here
			for (var property in newconfig) {
				if (newconfig.hasOwnProperty(property)) {
					locations[newconfig[property]] = property;
				}
			}
			console.log("Final objects: ", newconfig);
			console.log("Final location packet: ", locations)
			console.log("New Final moves: ", moves_clean)
			hassubmitted = true;
			submitOrder(_host + '/upload', {
				'moves':moves,
				'locations':locations,
				'author':ppt_name,
				'thesis':$('#addendaentry').val()
			})
		}
	})
	$(document.body).on('click', '#cancel', function(e){
		clearInputPopup();
	})
	$("#inputshade").css({'height':document.documentElement.clientHeight+'px'});
})


var hassubmitted = false;
var ppt_name = '';
var can_proceed = false;
var introcycle;
function playIntro(){
	setText();
	introcycle = setInterval(function(){ 
		if(current_text < introtexts.length-1){
			current_text++;
			console.log(current_text);
			cycleContent('#messages', 400);
		}
	}, 4000);
}

function storeItem(keyname, storagevar){
	localStorage.setItem(keyname, storagevar);
}

function checkName(keyname){
	var tryname = localStorage.getItem(keyname);
	if(tryname){
		ppt_name = tryname;
		console.log(tryname +' username applied')
		return true;
	}
	else{
		console.log('this is a new user.')
		return false;
	}
}

function clearIntro(){
	clearInterval(introcycle);
	stopAnimation('#introcontainer');
	$('#introcontainer').animate({
		'opacity':'0.0'
	}, 500, function(){
		$('#introcontainer').css('z-index','2');
		$('#shade').animate({
			'opacity':'0.0'
		}, 600, function(){
			$('#shade').detach();
		})
	})
}

function returnToIntro(){
	$('#messages p, #messages div.bottom-form div').html('');
	
	$('#introcontainer').css('z-index','9999');
	$('#introcontainer').animate({
		'opacity':'1.0'
	}, 100, function(){
		addAnimation('#introcontainer','colorchange 15s');
	})
}

function skipIntro(){
	if(current_text != introtexts.length-1){
		current_text = introtexts.length-1
	} else clearIntro();

	clearInterval(introcycle);
	cycleContent('#messages', 400);
}

function submitOrder(url, payload){
	$.ajax({
        method: "POST",
		url: url,
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify(payload),
		processData: false
    })
    .done(function( data ) {
        console.log(data);
	})
	.always(function(){
		showOverlay($('#alertcontainer'), 1600, function(){
			$('#alertcontainer .text-column').animate({
				'opacity':'0.0'
			}, 200, function(){
				location.reload();
			})
		});

	});
}

function clearElement(element, rate, remove = false){
	element.animate({
		'opacity':'0.0'
	}, 200, function(){
		element.css('z-index',0)
		if(remove){
			element.detach();
		}
	})
}


function stopAnimation(element)
{
    $(element).css("-webkit-animation", "none");
    $(element).css("-moz-animation", "none");
    $(element).css("-ms-animation", "none");
    $(element).css("animation", "none");
}

function addAnimation(element, animation)
{
    $(element).css("-webkit-animation", animation);
    $(element).css("-moz-animation", animation);
    $(element).css("-ms-animation", animation);
    $(element).css("animation", animation);
}

function cycleContent(element, rate){
	stopAnimation(element);
	$(element).animate({
		'opacity':'0.0'
	}, rate, function(){
		setText();
		$(element).animate({
			'opacity':'1.0'
		}, rate)
	})
}

function showOverlay(element, rate, cb = null){
	stopAnimation(element);
	element.show();
	$(element).animate({
		'opacity':'1.0'
	}, rate, function(){
		window.setTimeout(function(){
			if(cb) cb();
		}, rate*3)
	})
}

function cycleMovementLines(rate){
	stopAnimation('.vector.animate');
	$('.vector.animate').animate({
		'opacity':'0.0'
	}, rate, function(callback){
		repaintMoves();
		$('.vector.animate').animate({
			'opacity':'1.0'
		}, rate)
	})
}

function setText(){
	var textpacket = introtexts[current_text];
	for(var property in textpacket){
		if(textpacket.hasOwnProperty(property)){
			$('#introcontainer '+'.'+property).html(textpacket[property]);
		}
	}
	//fuckin a
	if(textpacket['form-field'] && ppt_name != ''){
		can_proceed = true;
		$('.beginbtn').removeClass('disabled')
		$('#authorentry').val(ppt_name);
	}
}

var current_text = 0;
var introtexts = [
	{
		'en':'Tap an object to view detailed information about it. </br> Touch and drag an object to have it moved. The objects shown in this app may not entirely match the order of those present in the gallery.',
		'es':'',
		'go-button':'<a class="skipbtn">Begin</a>'
	}
]
