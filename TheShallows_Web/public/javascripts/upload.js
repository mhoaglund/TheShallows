var data_location = 'https://s3.amazonaws.com/shallows/current_array.json';
var data = {
	active: set_time,
	google : {families: ['Cardo:italic', 'Roboto:300,100', 'Cutive Mono', 'Work Sans:100,300,500', 'Montserrat:300,500', 'Quattrocento']}
};

WebFont.load(data);
//Dev: dust compilation
var _obj_template = $('#obj-template').html();
var cocompiled = dust.compile(_obj_template, 'ARR_OBJ');
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
		},
		error: function(data){
			alert("problem");
		}
	});
	return result;
}

var moves = []
function recordMove(dropped_on){
	var item_info = dragging.attr('id').split('_')
	var move = {
		'item': item_info[1],
		'from': item_info[0],
		'to':dropped_on.attr('id')
	}
	var to_remove = null
	move.id = move.item + '_from_' + move.from + '_to_' + move.to;
	for(x = 0; x<moves.length; x++){
		var _existing = moves[x]
		if(_existing.item === move.item){
			to_remove = x
		}
	}
	moves.push(move)
	if(to_remove != null){
		moves.splice(to_remove, 1)
		repaintMoves();
	} else	paintMove(move);
	//TODO reduncancy check


	dragging.detach();
	dragging.css({'position':'relative','top':'0px', 'left':'0px'})
	dropped_on.append(dragging);
}

function paintMove(move){
	var _startpt = centerpoint($('#' +move.from))
	var _endpt = centerpoint($('#' +move.to))
	console.log(_startpt)
	console.log(_endpt)
	var _svg = '<svg class="vector animate" id="'+move.id+'"><line stroke-linecap="round" y1="'+_startpt[1]+'" x1="'+_startpt[0]+'" y2="'+_endpt[1]+'" x2="'+_endpt[0]+'" stroke="#FFCCFF"></line></svg>'
	//$('.overlay .gridhost').append(_svg);
	$('#objecthost').append(_svg);
}

function repaintMoves(){
	$('.vector.animate').detach();
	moves.forEach(function(move){
		var _startpt = centerpoint($('#' +move.from))
		var _endpt = centerpoint($('#' +move.to))
		console.log(_startpt)
		console.log(_endpt)
		var _svg = '<svg class="vector animate" id="'+move.id+'"><line stroke-linecap="round" y1="'+_startpt[1]+'" x1="'+_startpt[0]+'" y2="'+_endpt[1]+'" x2="'+_endpt[0]+'" stroke="#FFCCFF"></line></svg>'
		//$('.overlay .gridhost').append(_svg);
		$('#objecthost').append(_svg);
	})
}

function centerpoint(element){
	var offset = element.offset();
	var width = element.width();
	var height = element.height();

	var centerX = offset.left + width / 2;
	var centerY = offset.top + height / 2;
	return [centerX, centerY]
}

function adjustTileSize(){
    var cols = 100/(datamain.board[0]+2);
    $('.tile').css('width', 'auto');
    $('.tile').css('width', cols+'%');
    $('.tile').each(function(){
        $(this).css('height', $(this).width())
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
	data['alpha_board'] = letter_of_alphabet(data['board'][0], true);
	data['objects'].forEach(function(element) {
		element['current'] = element['current'].toLowerCase();
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

function raiseDetailPopup(){
	alert('detail')
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
	setOalls();
	//TODO localstorage cookie here and check to skip intro
	playIntro();
    getObjectData(data_location);
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
			raiseDetailPopup();
		}
	})
	//skipbtn
	$(document.body).on('click', '.skipbtn', function(e){
		clearIntro();
	})
})

var introcycle;
function playIntro(){
	setText();
	introcycle = setInterval(function(){ 
		if(current_text < introtexts.length){
			current_text++;
			cycleContent('.text-column', 400);
			
		}
		else {
			//clearInterval(introcycle);
			clearIntro();
		}
	}, 4000);
}

function clearIntro(){
	clearInterval(introcycle);
	stopAnimation('#introcontainer');
	$('#introcontainer').animate({
		'opacity':'0.0'
	}, 500, function(){
		$('#introcontainer').detach();
	})
}

function showForm(){

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

function cycleContent(element, rate, _callback){
	stopAnimation(element);
	$(element).animate({
		'opacity':'0.0'
	}, rate, function(callback){
		setText();
		$(element).animate({
			'opacity':'1.0'
		}, rate)
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
			$('.'+property).html(textpacket[property]);
		}
	}
	console.log(current_text);
}

var current_text = 0;
var introtexts = [
	{
		'en':'Welcome to <em>The Shallows</em>',
		'es':'Bienvenido a <em>The Shallows</em>',
		'hm':'TODO localization three'
	},
	{
		'en':'<em>The Shallows</em> is a project about substitution, proximity, and control.',
		'es':'<em>The Shallows</em> es un proyecto sobre sustitución, proximidad y control.',
		'hm':'TODO localization three'
	},
	{
		'en':'You can contribute by changing the location of an object.',
		'es':'Puede contribuir cambiando la ubicación de un objeto.',
		'hm':'TODO localization three'
	},
	{
		'en':'Drag objects between stalls in the grid, and tap "send" when youre done.',
		'es':'Arrastre objetos entre puestos en la grilla, y toque "send" cuando haya terminado.',
		'hm':'TODO localization three'
	}
]
