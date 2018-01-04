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
                    var location = reverseString($(this).attr('id').split('_')[0]).toLowerCase()
                    console.log(location);
                    $('#'+location).append($(this))
				});
			});
		},
		error: function(data){
			alert("problem");
		}
	});
	return result;
}

function adjustTileSize(){
    var cols = 100/(datamain.board[0]);
    $('.tile').css('width', cols+'%').css('width', '-=24px');
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


$(function(){
    
    getObjectData(data_location);
    $( window ).resize(function() {
		adjustTileSize();
	});

    interact('.draggable')
    .draggable({
        inertia: false,
        restrict: {
        restriction: "parent",
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },
        autoScroll: false,
        onmove: dragMoveListener,
        onend: function (event) {}
    });

    function dragMoveListener (event) {
        var target = event.target,
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        target.style.webkitTransform =
        target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }
    window.dragMoveListener = dragMoveListener;
    interact('.dropzone').dropzone({
        accept: '.draggable',
        overlap: 0.75,
        ondropactivate: function (event) {
            event.target.classList.add('drop-active');
        },
        ondragenter: function (event) {
            var draggableElement = event.relatedTarget,
                dropzoneElement = event.target;
            dropzoneElement.classList.add('drop-target');
            draggableElement.classList.add('can-drop');
            draggableElement.textContent = 'Dragged in';
        },
        ondragleave: function (event) {
            event.target.classList.remove('drop-target');
            event.relatedTarget.classList.remove('can-drop');
            event.relatedTarget.textContent = 'Dragged out';
        },
        ondrop: function (event) {
            event.relatedTarget.textContent = 'Dropped';
        },
        ondropdeactivate: function (event) {
            event.target.classList.remove('drop-active');
            event.target.classList.remove('drop-target');
        }
  });
})
